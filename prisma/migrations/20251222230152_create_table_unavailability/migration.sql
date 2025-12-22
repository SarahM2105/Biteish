-- CreateTable
CREATE TABLE "TableUnavailability" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "TableUnavailability_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TableUnavailability" ADD CONSTRAINT "TableUnavailability_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
