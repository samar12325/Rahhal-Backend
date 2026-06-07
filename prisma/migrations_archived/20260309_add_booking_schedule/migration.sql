ALTER TABLE bookings
  ADD COLUMN scheduled_date DATE NULL,
  ADD COLUMN scheduled_time VARCHAR(5) NULL;
