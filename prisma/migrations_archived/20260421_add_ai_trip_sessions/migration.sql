CREATE TABLE ai_trip_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  city VARCHAR(120) NOT NULL,
  days TINYINT UNSIGNED NOT NULL,
  people TINYINT UNSIGNED NOT NULL,
  min_budget DECIMAL(10, 2) NULL,
  max_budget DECIMAL(10, 2) NULL,
  style VARCHAR(40) NULL,
  prefs JSON NULL,
  notes TEXT NULL,
  locale VARCHAR(5) NOT NULL DEFAULT 'ar',
  plan_json JSON NOT NULL,
  last_message_at TIMESTAMP(0) NULL,
  created_at TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(0) NULL,
  PRIMARY KEY (id),
  INDEX idx_ai_trip_sessions_user (user_id),
  INDEX idx_ai_trip_sessions_updated_at (updated_at),
  INDEX idx_ai_trip_sessions_last_message_at (last_message_at),
  CONSTRAINT fk_ai_trip_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE ai_trip_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id BIGINT UNSIGNED NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  text TEXT NOT NULL,
  plan_json JSON NULL,
  created_at TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_ai_trip_messages_session (session_id),
  INDEX idx_ai_trip_messages_created_at (created_at),
  CONSTRAINT fk_ai_trip_messages_session
    FOREIGN KEY (session_id) REFERENCES ai_trip_sessions(id)
    ON DELETE CASCADE
);
