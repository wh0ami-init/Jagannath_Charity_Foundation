-- Recurring mandates are stored separately from their captured instalments.
ALTER TABLE donations
    ADD COLUMN razorpay_subscription_id VARCHAR(100) NULL,
    ADD INDEX ix_donations_razorpay_subscription_id (razorpay_subscription_id);

CREATE TABLE recurring_donations (
    id INT NOT NULL AUTO_INCREMENT,
    razorpay_subscription_id VARCHAR(100) NOT NULL,
    razorpay_plan_id VARCHAR(100) NOT NULL,
    authorization_payment_id VARCHAR(100) NULL,
    amount_paise INT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(24) NOT NULL DEFAULT 'created',
    donor_name VARCHAR(150) NOT NULL,
    donor_email VARCHAR(254) NOT NULL,
    donor_phone VARCHAR(40) NOT NULL,
    donor_address VARCHAR(500) NOT NULL DEFAULT '',
    cause VARCHAR(160) NOT NULL DEFAULT 'Where most needed',
    consented_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_recurring_donations_subscription (razorpay_subscription_id),
    KEY ix_recurring_donations_status (status),
    KEY ix_recurring_donations_created_at (created_at)
);
