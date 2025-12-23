-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "OpeningHour" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "opensAt" TEXT NOT NULL,
    "closesAt" TEXT NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OpeningHour_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OpeningHour" ADD CONSTRAINT "OpeningHour_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
