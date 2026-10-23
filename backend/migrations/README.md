# Payment database rollout and recovery

Status: donations table created in production MySQL on 2026-10-09 (Asia/Kolkata). Columns and unique order/payment constraints verified; existing tables preserved. A consistent database backup was exported and checksummed before creation; a restore has not been tested. Payment backend deployment and end-to-end production Test Mode verification remain pending.

## Alembic schema tracking

The application now has an Alembic baseline at `migrations/alembic/versions/20261023_01_adopt_existing_schema.py`. It adopts existing tables, creates tables missing from a fresh database, and applies the legacy additive columns without dropping data. The baseline has a no-op downgrade by design.

Run from `backend/` after reviewing a database backup:

```bash
alembic upgrade head
alembic current
```

The URL and credentials come from the environment's `DATABASE_URL`; the committed `alembic.ini` URL is only a local placeholder. Run the command once per release before starting multiple API replicas. Do not use `alembic downgrade` to remove the adopted schema. Future schema changes should use a new revision and a reviewed backup/rollout plan. Existing startup compatibility checks remain in place during this adoption period.

Keep local DATABASE_URL pointing to SQLite. Production uses the existing MySQL
service with SQLAlchemy URL mysql+mysqlconnector://USER:PASSWORD@HOST:PORT/DATABASE.
URL-encode special characters in credentials. Store secrets only in service
variables; never put them in SQL, Git, logs, or chat.

Before rollout:
1. Confirm the production project, backend service, database and MySQL version.
2. Take a provider snapshot or consistent database dump and verify restore on an
   isolated database. Record the previous backend deployment and variables securely.
3. Inspect whether donations already exists (the application currently calls
   create_all at startup). If it exists, compare SHOW CREATE TABLE donations with
   001_donations_mysql.sql; do not drop or recreate it.
4. Test migration and payment tests against an isolated MySQL instance first.
5. Apply 001_donations_mysql.sql only when the table does not exist. This creates
   only donations and imports no SQLite data. ORM supplies timestamps/status/currency.
6. Verify SHOW CREATE TABLE donations, unique keys, and existing website tables.
7. Deploy reviewed backend with test keys, existing MySQL URL and a separate webhook
   secret. Configure `/api/payments/webhook` for `payment.captured`, `order.paid`,
   `refund.processed`, and Razorpay subscription events `subscription.authenticated`,
   `subscription.activated`, `subscription.charged`, `subscription.pending`,
   `subscription.halted`, `subscription.cancelled`, `subscription.paused`,
   `subscription.resumed`, and `subscription.completed`.
8. Complete a test payment and verify pending -> paid once; test duplicate webhook.
   Track these test payment IDs separately from real donations. Live keys are
   accepted only after explicitly setting `RAZORPAY_MODE=live` and supplying an
   `rzp_live_` key pair. Donor email is collected for the payment and receipt record;
   it is not separately verified by the website.
9. Apply `002_donation_receipts_mysql.sql` to add the donor fields to an existing
   donations table. The backend also applies these additive columns at startup.
   Back up first and inspect the live schema before applying manually.
10. Apply `003_donation_refund_tracking_mysql.sql` only if either refund column is
    missing; this production schema has both already. The backend also adds these
    columns at startup. Enable Razorpay `refund.processed` (and optionally
    `payment.refunded`) so refunds are recorded after server verification.
11. Apply `004_recurring_donations_mysql.sql` to an existing production database
    before enabling AutoPay. The application also creates the recurring table and
    adds the subscription reference/index at startup; inspect the live schema first.

Recovery:
- Stop accepting payment requests and disable webhook delivery while investigating.
- Revert the backend deployment to the recorded previous version. Keep donations
  intact: this additive table is harmless to the previous application.
- MySQL CREATE TABLE is not undone by transaction ROLLBACK.
- Do NOT drop donations after payment records exist. Preserve/export records and
  reconcile payments with Razorpay before any database restoration.
- Restoring a whole database backup can lose newer gallery/form/payment data;
  validate recovery in isolation and obtain explicit approval before a restore.
- Removing an empty newly created table is optional, only after confirming it was
  created by this migration and payment writers are stopped. No automatic down
  script is provided to avoid accidental deletion of payment history.

Local changes can be reverted selectively without discarding unrelated work.
Never use git reset --hard or git clean as a payment rollback procedure.
