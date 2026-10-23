"""Idempotent compatibility updates for databases created by older releases.

New schema changes should be recorded as Alembic revisions. Keeping this
small compatibility pass lets existing deployments continue to start while
they adopt the migration workflow.
"""

from sqlalchemy import Connection, Engine, inspect, text

from app.database import Base, engine


def ensure_database_schema(bind: Engine | Connection | None = None) -> None:
    database = bind if bind is not None else engine
    Base.metadata.create_all(bind=database)
    inspector = inspect(database)
    tables = set(inspector.get_table_names())

    def execute_ddl(statement: str) -> None:
        if isinstance(database, Connection):
            database.execute(text(statement))
        else:
            with database.begin() as connection:
                connection.execute(text(statement))

    if "site_content" in tables:
        columns = {column["name"] for column in inspector.get_columns("site_content")}
        if "page" not in columns:
            execute_ddl(
                "ALTER TABLE site_content ADD COLUMN page "
                "VARCHAR(60) NOT NULL DEFAULT 'Home'"
            )

    if "image_slots" in tables:
        columns = {column["name"] for column in inspector.get_columns("image_slots")}
        additions = {
            "category": "VARCHAR(24) NULL",
            "deleted_at": "DATETIME NULL",
        }
        for name, definition in additions.items():
            if name not in columns:
                execute_ddl(f"ALTER TABLE image_slots ADD COLUMN {name} {definition}")

    if "donations" not in tables:
        return

    donation_columns = {
        column["name"] for column in inspector.get_columns("donations")
    }
    donation_additions = {
        "donor_name": "VARCHAR(150) NOT NULL DEFAULT ''",
        "donor_email": "VARCHAR(254) NOT NULL DEFAULT ''",
        "donor_phone": "VARCHAR(40) NOT NULL DEFAULT ''",
        "donor_address": "VARCHAR(500) NOT NULL DEFAULT ''",
        "cause": "VARCHAR(160) NOT NULL DEFAULT ''",
        "receipt_email_sent_at": "DATETIME NULL",
        "refund_amount_paise": "INTEGER NOT NULL DEFAULT 0",
        "refunded_at": "DATETIME NULL",
        "razorpay_subscription_id": "VARCHAR(100) NULL",
    }
    for name, definition in donation_additions.items():
        if name not in donation_columns:
            execute_ddl(f"ALTER TABLE donations ADD COLUMN {name} {definition}")

    donation_indexes = {
        index["name"] for index in inspect(database).get_indexes("donations")
    }
    if "ix_donations_razorpay_subscription_id" not in donation_indexes:
        execute_ddl(
            "CREATE INDEX ix_donations_razorpay_subscription_id "
            "ON donations (razorpay_subscription_id)"
        )
