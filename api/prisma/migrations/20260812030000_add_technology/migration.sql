CREATE TYPE "TechnologyType" AS ENUM ('LANGUAGE', 'FRAMEWORK', 'LIBRARY', 'DATABASE', 'TOOL', 'OTHER');

CREATE TABLE "Technology" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "TechnologyType" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Technology_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Technology_name_key" ON "Technology"("name");
CREATE UNIQUE INDEX "Technology_slug_key" ON "Technology"("slug");
