-- Add donor fields to the existing donations table without replacing records.
ALTER TABLE donations
    ADD COLUMN donor_name VARCHAR(150) NOT NULL DEFAULT '',
    ADD COLUMN donor_email VARCHAR(254) NOT NULL DEFAULT '',
    ADD COLUMN donor_phone VARCHAR(40) NOT NULL DEFAULT '',
    ADD COLUMN donor_address VARCHAR(500) NOT NULL DEFAULT '',
    ADD COLUMN cause VARCHAR(160) NOT NULL DEFAULT '',
    ADD COLUMN receipt_email_sent_at DATETIME NULL;

-- The legacy donation_email_codes table, if present, is unused and left intact.
