-- CreateTable
CREATE TABLE "StaffInvite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffInvite_tokenHash_key" ON "StaffInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "StaffInvite_email_createdAt_idx" ON "StaffInvite"("email", "createdAt");

-- CreateIndex
CREATE INDEX "StaffInvite_expiresAt_idx" ON "StaffInvite"("expiresAt");

-- Only one unaccepted, unrevoked invitation per email may exist. Expired
-- invitations are refreshed in place rather than duplicated.
CREATE UNIQUE INDEX "StaffInvite_one_pending_email_key"
ON "StaffInvite"("email")
WHERE "acceptedAt" IS NULL AND "revokedAt" IS NULL;

-- AddForeignKey
ALTER TABLE "StaffInvite"
ADD CONSTRAINT "StaffInvite_invitedById_fkey"
FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
