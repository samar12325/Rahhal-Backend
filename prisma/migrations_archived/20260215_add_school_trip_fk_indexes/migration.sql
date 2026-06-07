-- Ensure school_trip_details has FK with ON DELETE/UPDATE CASCADE
ALTER TABLE school_trip_details
  DROP FOREIGN KEY fk_school_trip_trip;

ALTER TABLE school_trip_details
  ADD CONSTRAINT fk_school_trip_trip
  FOREIGN KEY (trip_id) REFERENCES trips(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Indexes for common filters
DROP INDEX idx_trips_destination ON trips;
CREATE INDEX idx_trips_destination_id ON trips(destination_id);
CREATE INDEX idx_trips_type ON trips(type);
