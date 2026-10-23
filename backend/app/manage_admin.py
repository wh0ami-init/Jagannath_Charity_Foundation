"""Create the first administrator or rotate the existing administrator credentials."""

from getpass import getpass

from sqlalchemy import select

from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app.models import AdminUser


def main() -> None:
    username = input("Administrator username: ").strip()
    if not username or len(username) > 80:
        raise SystemExit("Username must contain 1 to 80 characters.")

    password = getpass("New password (at least 12 characters): ")
    confirmation = getpass("Confirm password: ")
    if len(password) < 12:
        raise SystemExit("Password must be at least 12 characters.")
    if len(password.encode("utf-8")) > 72:
        raise SystemExit("Password must be at most 72 UTF-8 bytes (bcrypt limit).")
    if password != confirmation:
        raise SystemExit("Passwords do not match.")

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admins = db.scalars(select(AdminUser).order_by(AdminUser.id)).all()
        matching_admin = next((admin for admin in admins if admin.username == username), None)
        if len(admins) > 1:
            if matching_admin is None:
                names = ", ".join(admin.username for admin in admins)
                retained_username = input(f"Existing admin accounts: {names}\nUsername of account to keep: ").strip()
                matching_admin = next((admin for admin in admins if admin.username == retained_username), None)
                if matching_admin is None:
                    raise SystemExit("That account does not exist. No changes made.")
            confirm = input(
                f"Rename '{matching_admin.username}' to '{username}' and permanently remove the other "
                f"{len(admins) - 1} admin accounts? "
                "Type DELETE to confirm: "
            )
            if confirm != "DELETE":
                raise SystemExit("No changes made.")
            for other_admin in admins:
                if other_admin.id != matching_admin.id:
                    db.delete(other_admin)
            admin = matching_admin
            admin.username = username
            admin.password_hash = hash_password(password)
            action = "Updated the selected administrator and removed duplicate admin accounts"
        elif admins:
            admin = admins[0]
            admin.username = username
            admin.password_hash = hash_password(password)
            action = "Updated"
        else:
            db.add(AdminUser(username=username, password_hash=hash_password(password)))
            action = "Created"
        db.commit()
        print(f"{action} in the configured database.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
