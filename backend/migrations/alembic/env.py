from logging.config import fileConfig

from alembic import context

from app.database import Base, engine
from app import models  # noqa: F401: register model metadata


config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    raise RuntimeError(
        "This project's compatibility migration inspects the live schema; "
        "run Alembic with a configured database connection."
    )


def run_migrations_online() -> None:
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            transaction_per_migration=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
