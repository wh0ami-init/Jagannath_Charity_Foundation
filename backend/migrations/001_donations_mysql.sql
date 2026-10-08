-- Apply only after confirming the target database and a recoverable backup.
-- Deliberately fails if donations exists: inspect its schema instead of overwriting.
CREATE TABLE donations (
    id INTEGER NOT NULL AUTO_INCREMENT,
    amount_paise INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL,
    razorpay_order_id VARCHAR(100) COLLATE utf8mb4_bin NULL,
    razorpay_payment_id VARCHAR(100) COLLATE utf8mb4_bin NULL,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL,
    paid_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_donations_order (razorpay_order_id),
    UNIQUE KEY uq_donations_payment (razorpay_payment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
