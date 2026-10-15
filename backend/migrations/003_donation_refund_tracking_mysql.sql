-- Additive refund tracking. Preserve donation and payment history.
ALTER TABLE donations
    ADD COLUMN refund_amount_paise INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN refunded_at DATETIME NULL;
