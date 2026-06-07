ALTER TABLE trips
  ADD COLUMN reviewed_by BIGINT UNSIGNED NULL,
  ADD COLUMN reviewed_at TIMESTAMP NULL,
  ADD COLUMN rejection_reason TEXT NULL;

ALTER TABLE trips
  ADD INDEX idx_trips_reviewed_by (reviewed_by),
  ADD CONSTRAINT fk_trips_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id);
