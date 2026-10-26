-- AddEmailVerification
-- Add email verification fields to User table (additive, safe for existing data)

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);

-- Add comment for documentation
COMMENT ON COLUMN "User"."emailVerified" IS 'Whether the user has verified their email address';
COMMENT ON COLUMN "User"."emailVerifiedAt" IS 'Timestamp when email was verified';
