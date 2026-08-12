CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "thumbnailPublicId" TEXT,
    "demoUrl" TEXT,
    "githubUrl" TEXT,
    "sourceUrl" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "year" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "_CategoryToProject" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

CREATE TABLE "_ProjectToTechnology" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE INDEX "Project_status_idx" ON "Project"("status");
CREATE INDEX "Project_featured_idx" ON "Project"("featured");
CREATE INDEX "Project_year_idx" ON "Project"("year");
CREATE UNIQUE INDEX "_CategoryToProject_AB_unique" ON "_CategoryToProject"("A", "B");
CREATE INDEX "_CategoryToProject_B_index" ON "_CategoryToProject"("B");
CREATE UNIQUE INDEX "_ProjectToTechnology_AB_unique" ON "_ProjectToTechnology"("A", "B");
CREATE INDEX "_ProjectToTechnology_B_index" ON "_ProjectToTechnology"("B");

ALTER TABLE "_CategoryToProject" ADD CONSTRAINT "_CategoryToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CategoryToProject" ADD CONSTRAINT "_CategoryToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ProjectToTechnology" ADD CONSTRAINT "_ProjectToTechnology_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ProjectToTechnology" ADD CONSTRAINT "_ProjectToTechnology_B_fkey" FOREIGN KEY ("B") REFERENCES "Technology"("id") ON DELETE CASCADE ON UPDATE CASCADE;
