/*
  Warnings:

  - The primary key for the `Favorite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `closed` on the `OpeningHour` table. All the data in the column will be lost.
  - You are about to drop the column `reserveable` on the `Table` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,restaurantId]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[restaurantId,name]` on the table `Table` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Favorite` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name` to the `Table` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuditEntity" AS ENUM ('USER', 'RESTAURANT', 'RESERVATION', 'REVIEW', 'TABLE', 'BOOKING_RULE', 'OPENING_HOUR');

-- AlterTable
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OpeningHour" DROP COLUMN "closed",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Table" DROP COLUMN "reserveable",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "reservable" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "BookingRule" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "maxPartySize" INTEGER NOT NULL,
    "daysAhead" INTEGER NOT NULL,
    "slotMinutes" INTEGER NOT NULL,
    "cancellationCutoffMinutes" INTEGER NOT NULL,

    CONSTRAINT "BookingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "TagCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantTag" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,

    CONSTRAINT "RestaurantTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessibilityOption" (
    "id" TEXT NOT NULL,
    "optionName" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT NOT NULL,

    CONSTRAINT "AccessibilityOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantAccessibility" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "RestaurantAccessibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "entity" "AuditEntity" NOT NULL,
    "entityId" TEXT,
    "description" TEXT NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingRule_restaurantId_key" ON "BookingRule"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "TagCategory_name_key" ON "TagCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantTag_restaurantId_tagId_key" ON "RestaurantTag"("restaurantId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "AccessibilityOption_optionName_key" ON "AccessibilityOption"("optionName");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantAccessibility_restaurantId_optionId_key" ON "RestaurantAccessibility"("restaurantId", "optionId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_restaurantId_key" ON "Favorite"("userId", "restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "Table_restaurantId_name_key" ON "Table"("restaurantId", "name");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRule" ADD CONSTRAINT "BookingRule_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TagCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantTag" ADD CONSTRAINT "RestaurantTag_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantTag" ADD CONSTRAINT "RestaurantTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantAccessibility" ADD CONSTRAINT "RestaurantAccessibility_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantAccessibility" ADD CONSTRAINT "RestaurantAccessibility_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "AccessibilityOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
