-- CreateEnum
CREATE TYPE "RoomCategory" AS ENUM ('PRESIDENTIAL_SUITE', 'SINGLE_OCCUPANCY', 'DOUBLE_OCCUPANCY');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "HotelBooking" (
    "id" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "serviceNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "roomCategory" "RoomCategory" NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HotelBooking_roomCategory_status_checkIn_checkOut_idx"
ON "HotelBooking"("roomCategory", "status", "checkIn", "checkOut");
