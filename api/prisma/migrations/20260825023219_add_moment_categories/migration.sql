-- AlterTable
ALTER TABLE "_CategoryToProject" ADD CONSTRAINT "_CategoryToProject_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CategoryToProject_AB_unique";

-- AlterTable
ALTER TABLE "_MomentToMomentCategory" ADD CONSTRAINT "_MomentToMomentCategory_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_MomentToMomentCategory_AB_unique";

-- AlterTable
ALTER TABLE "_MomentToMomentTag" ADD CONSTRAINT "_MomentToMomentTag_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_MomentToMomentTag_AB_unique";

-- AlterTable
ALTER TABLE "_ProjectToTechnology" ADD CONSTRAINT "_ProjectToTechnology_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProjectToTechnology_AB_unique";
