# Payment database rollout and recovery

Status: donations table created in production MySQL on 2026-10-09 (Asia/Kolkata). Columns and unique order/payment constraints verified; existing tables preserved. A consistent database backup was exported and checksummed before creation; a restore has not been tested. Payment backend deployment and end-to-end production Test Mode verification remain pending.

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
   secret. Configure /api/payments/webhook for payment.captured and order.paid.
8. Complete a test payment and verify pending -> paid once; test duplicate webhook.
   Track these test payment IDs separately from real donations. Live keys are
   intentionally rejected by the current backend.

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
