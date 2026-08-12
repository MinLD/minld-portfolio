CREATE TYPE "MomentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "MomentCommentStatus" AS ENUM ('VISIBLE', 'HIDDEN');

CREATE TABLE "Moment" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "status" "MomentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Moment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MomentImage" (
    "id" UUID NOT NULL,
    "momentId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MomentImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MomentTag" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MomentTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MomentLike" (
    "id" UUID NOT NULL,
    "momentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MomentLike_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MomentComment" (
    "id" UUID NOT NULL,
    "momentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "status" "MomentCommentStatus" NOT NULL DEFAULT 'VISIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MomentComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "_MomentToMomentTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

CREATE INDEX "Moment_status_idx" ON "Moment"("status");
CREATE INDEX "Moment_publishedAt_idx" ON "Moment"("publishedAt");
CREATE INDEX "MomentImage_momentId_sortOrder_idx" ON "MomentImage"("momentId", "sortOrder");
CREATE UNIQUE INDEX "MomentTag_name_key" ON "MomentTag"("name");
CREATE UNIQUE INDEX "MomentTag_slug_key" ON "MomentTag"("slug");
CREATE UNIQUE INDEX "MomentLike_momentId_userId_key" ON "MomentLike"("momentId", "userId");
CREATE INDEX "MomentLike_userId_idx" ON "MomentLike"("userId");
CREATE INDEX "MomentComment_momentId_status_idx" ON "MomentComment"("momentId", "status");
CREATE INDEX "MomentComment_userId_idx" ON "MomentComment"("userId");
CREATE UNIQUE INDEX "_MomentToMomentTag_AB_unique" ON "_MomentToMomentTag"("A", "B");
CREATE INDEX "_MomentToMomentTag_B_index" ON "_MomentToMomentTag"("B");

ALTER TABLE "MomentImage" ADD CONSTRAINT "MomentImage_momentId_fkey" FOREIGN KEY ("momentId") REFERENCES "Moment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MomentLike" ADD CONSTRAINT "MomentLike_momentId_fkey" FOREIGN KEY ("momentId") REFERENCES "Moment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MomentLike" ADD CONSTRAINT "MomentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MomentComment" ADD CONSTRAINT "MomentComment_momentId_fkey" FOREIGN KEY ("momentId") REFERENCES "Moment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MomentComment" ADD CONSTRAINT "MomentComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_MomentToMomentTag" ADD CONSTRAINT "_MomentToMomentTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Moment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_MomentToMomentTag" ADD CONSTRAINT "_MomentToMomentTag_B_fkey" FOREIGN KEY ("B") REFERENCES "MomentTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
