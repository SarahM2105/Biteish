-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "reserveable" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
