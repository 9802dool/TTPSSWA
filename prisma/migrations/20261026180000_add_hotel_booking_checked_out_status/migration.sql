-- Add CHECKED_OUT status to BookingStatus enum
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'CHECKED_OUT';

-- No default changes - existing bookings remain CONFIRMED/CANCELLED/PENDING
-- Staff can now set status to CHECKED_OUT from the admin booking view
