CREATE TABLE "MomentCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MomentCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "_MomentToMomentCategory" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

CREATE UNIQUE INDEX "MomentCategory_name_key" ON "MomentCategory"("name");
CREATE UNIQUE INDEX "MomentCategory_slug_key" ON "MomentCategory"("slug");
CREATE UNIQUE INDEX "_MomentToMomentCategory_AB_unique" ON "_MomentToMomentCategory"("A", "B");
CREATE INDEX "_MomentToMomentCategory_B_index" ON "_MomentToMomentCategory"("B");

ALTER TABLE "_MomentToMomentCategory" ADD CONSTRAINT "_MomentToMomentCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Moment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_MomentToMomentCategory" ADD CONSTRAINT "_MomentToMomentCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "MomentCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
