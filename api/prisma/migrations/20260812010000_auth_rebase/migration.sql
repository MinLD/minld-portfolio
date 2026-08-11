-- CreateEnum
CREATE TYPE "AccountTokenPurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- User fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);

-- Credentials split
CREATE TABLE IF NOT EXISTS "UserCredential" (
    "userId" UUID NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserCredential_pkey" PRIMARY KEY ("userId")
);

INSERT INTO "UserCredential" ("userId", "passwordHash", "passwordUpdatedAt", "createdAt", "updatedAt")
SELECT "id", "passwordHash", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "User"
WHERE EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'User' AND column_name = 'passwordHash'
)
ON CONFLICT ("userId") DO NOTHING;

ALTER TABLE "UserCredential" DROP CONSTRAINT IF EXISTS "UserCredential_userId_fkey";
ALTER TABLE "UserCredential" ADD CONSTRAINT "UserCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordHash";

-- Session rotation fields
ALTER TABLE "AuthSession" ADD COLUMN IF NOT EXISTS "familyId" UUID;
UPDATE "AuthSession" SET "familyId" = "id" WHERE "familyId" IS NULL;
ALTER TABLE "AuthSession" ALTER COLUMN "familyId" SET NOT NULL;
ALTER TABLE "AuthSession" ADD COLUMN IF NOT EXISTS "rotatedFromSessionId" UUID;
ALTER TABLE "AuthSession" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
ALTER TABLE "AuthSession" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AuthSession_refreshTokenHash_key'
  ) THEN
    CREATE UNIQUE INDEX "AuthSession_refreshTokenHash_key" ON "AuthSession"("refreshTokenHash");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "AuthSession_familyId_idx" ON "AuthSession"("familyId");

-- Account tokens
CREATE TABLE IF NOT EXISTS "AccountToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "purpose" "AccountTokenPurpose" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AccountToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AccountToken_tokenHash_key" ON "AccountToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "AccountToken_userId_purpose_idx" ON "AccountToken"("userId", "purpose");

ALTER TABLE "AccountToken" DROP CONSTRAINT IF EXISTS "AccountToken_userId_fkey";
ALTER TABLE "AccountToken" ADD CONSTRAINT "AccountToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
