CREATE TABLE group_trip_details (
  trip_id BIGINT UNSIGNED NOT NULL,
  required_participants INT UNSIGNED NOT NULL,
  organizer_id BIGINT UNSIGNED NOT NULL,
  join_deadline DATE NULL,
  notes TEXT NULL,
  created_at TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(0) NULL,
  PRIMARY KEY (trip_id),
  INDEX idx_group_organizer (organizer_id),
  CONSTRAINT fk_group_trip_organizer
    FOREIGN KEY (organizer_id) REFERENCES users(id),
  CONSTRAINT fk_group_trip_trip
    FOREIGN KEY (trip_id) REFERENCES trips(id)
    ON DELETE CASCADE
);
