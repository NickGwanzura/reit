/** Contact SLA: first contact within eight business hours, Monday-Friday, 08:00-17:00 Harare. */
const HARARE_OFFSET_MINUTES = 120;
const BUSINESS_START_HOUR = 8;
const BUSINESS_END_HOUR = 17;
const MINUTE = 60_000;

export function addHarareBusinessMinutes(start: Date, minutes = 8 * 60): Date {
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(minutes) || minutes < 0) {
    throw new RangeError("A valid start date and non-negative business duration are required.");
  }

  // Zimbabwe observes CAT (UTC+2) without seasonal clock changes.
  const local = new Date(start.getTime() + HARARE_OFFSET_MINUTES * MINUTE);
  let remaining = minutes * MINUTE;

  while (remaining > 0) {
    const day = local.getUTCDay();
    if (day === 0 || day === 6) {
      local.setUTCDate(local.getUTCDate() + (day === 6 ? 2 : 1));
      local.setUTCHours(BUSINESS_START_HOUR, 0, 0, 0);
      continue;
    }

    const hour = local.getUTCHours();
    if (hour < BUSINESS_START_HOUR) {
      local.setUTCHours(BUSINESS_START_HOUR, 0, 0, 0);
      continue;
    }
    if (hour >= BUSINESS_END_HOUR) {
      local.setUTCDate(local.getUTCDate() + 1);
      local.setUTCHours(BUSINESS_START_HOUR, 0, 0, 0);
      continue;
    }

    const endOfBusiness = new Date(local);
    endOfBusiness.setUTCHours(BUSINESS_END_HOUR, 0, 0, 0);
    const available = endOfBusiness.getTime() - local.getTime();
    const consumed = Math.min(remaining, available);
    local.setTime(local.getTime() + consumed);
    remaining -= consumed;
  }

  return new Date(local.getTime() - HARARE_OFFSET_MINUTES * MINUTE);
}

export function isFirstContactOverdue(createdAt: Date, firstContactAt: Date | null, now = new Date()) {
  return firstContactAt === null && addHarareBusinessMinutes(createdAt).getTime() < now.getTime();
}
