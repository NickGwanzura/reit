ALTER TABLE "User" ADD COLUMN "lastLeadAssignedAt" TIMESTAMP(3);

ALTER TABLE "Contact" ADD COLUMN "doNotContactAt" TIMESTAMP(3);
ALTER TABLE "Contact" ADD COLUMN "doNotContactReason" TEXT;
ALTER TABLE "Contact" ADD COLUMN "doNotContactClearedAt" TIMESTAMP(3);
ALTER TABLE "Contact" ADD COLUMN "doNotContactClearReason" TEXT;

ALTER TABLE "Lead" ADD COLUMN "firstContactAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN "firstContactReminderSentAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN "firstContactReminderClaimedAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN "retentionReviewAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN "retentionReviewNote" TEXT;

-- Existing last-contact timestamps are the closest available legacy indicator.
UPDATE "Lead" SET "firstContactAt" = "lastContactAt" WHERE "lastContactAt" IS NOT NULL;

CREATE INDEX "Lead_status_firstContactAt_createdAt_idx" ON "Lead"("status", "firstContactAt", "createdAt");
CREATE INDEX "Lead_status_firstContactReminderSentAt_createdAt_idx" ON "Lead"("status", "firstContactReminderSentAt", "createdAt");
CREATE INDEX "Lead_retentionReviewAt_idx" ON "Lead"("retentionReviewAt");
CREATE INDEX "Contact_duplicateReviewNameCountry_idx" ON "Contact"(lower(btrim("firstName")), lower(btrim("lastName")), lower(btrim("country")));
