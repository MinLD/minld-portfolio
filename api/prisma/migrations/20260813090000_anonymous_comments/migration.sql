ALTER TABLE "ProjectComment" DROP CONSTRAINT "ProjectComment_userId_fkey";
ALTER TABLE "MomentComment" DROP CONSTRAINT "MomentComment_userId_fkey";

ALTER TABLE "ProjectComment" ADD COLUMN "authorName" TEXT;
ALTER TABLE "ProjectComment" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "MomentComment" ADD COLUMN "authorName" TEXT;
ALTER TABLE "MomentComment" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MomentComment" ADD CONSTRAINT "MomentComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
