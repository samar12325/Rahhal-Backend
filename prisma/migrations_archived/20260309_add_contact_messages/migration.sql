CREATE TABLE contact_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  type ENUM('suggestion', 'complaint', 'inquiry', 'partnership') NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'sent', 'failed') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP(0) NULL,
  error_message TEXT NULL,
  PRIMARY KEY (id),
  INDEX idx_contact_status (status),
  INDEX idx_contact_created_at (created_at),
  INDEX idx_contact_email (email)
);
