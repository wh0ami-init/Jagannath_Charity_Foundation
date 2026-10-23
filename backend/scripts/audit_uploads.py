"""Audit duplicate-looking uploads; optional safe quarantine for proven orphans.

Run from ``backend`` with ``python -m scripts.audit_uploads``. Add
``--check-database`` to read references from the configured database. The
optional ``--quarantine-unused`` mode moves only unreferenced same-name or
byte-identical copies with an active counterpart into a temporary backup.
"""

import argparse
from collections import defaultdict
from hashlib import sha256
from itertools import combinations
from pathlib import Path
import shutil
import tempfile

from PIL import Image, UnidentifiedImageError

from app.database import SessionLocal
from app.models import ImageSlot


UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_HASH_DISTANCE = 2


def image_hash(path: Path) -> int | None:
    """Return a compact difference hash, or None when the file is not readable."""
    try:
        with Image.open(path) as image:
            image.seek(0)  # Use the first frame for animated formats.
            pixels = image.convert("L").resize((9, 8), Image.Resampling.LANCZOS)
            values = list(pixels.tobytes())
    except (OSError, ValueError, UnidentifiedImageError):
        return None

    result = 0
    for row in range(8):
        start = row * 9
        for column in range(8):
            result = (result << 1) | (values[start + column] > values[start + column + 1])
    return result


def safe_orphans(
    groups: dict[Path, list[Path]],
    referenced: set[str],
    file_hashes: dict[Path, str],
    visual_hashes: dict[Path, int | None],
) -> set[Path]:
    """Files not referenced by any slot with a referenced same-name/hash peer."""
    result: set[Path] = set()
    for members in groups.values():
        active = [
            path for path in members
            if path.relative_to(UPLOAD_DIR).as_posix() in referenced
        ]
        for path in members:
            if path.relative_to(UPLOAD_DIR).as_posix() in referenced:
                continue
            if any(
                (
                    file_hashes.get(path) is not None
                    and file_hashes.get(path) == file_hashes.get(used_path)
                )
                or (
                    path.stem.casefold() == used_path.stem.casefold()
                    and visual_hashes[path] is not None
                    and visual_hashes[used_path] is not None
                    and (visual_hashes[path] ^ visual_hashes[used_path]).bit_count() <= MAX_HASH_DISTANCE
                )
                for used_path in active
            ):
                result.add(path)
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check-database",
        action="store_true",
        help="read image file references from the database configured in the environment",
    )
    parser.add_argument(
        "--summary",
        action="store_true",
        help="show group counts without listing file names",
    )
    parser.add_argument(
        "--quarantine-unused",
        action="store_true",
        help="move proven unreferenced duplicates to a temporary, restorable backup",
    )
    args = parser.parse_args()
    if args.quarantine_unused and not args.check_database:
        parser.error("--quarantine-unused requires --check-database")
    if args.quarantine_unused and args.summary:
        parser.error("--quarantine-unused cannot be combined with --summary")

    if not UPLOAD_DIR.is_dir():
        print(f"Upload directory not found: {UPLOAD_DIR}")
        return

    files = sorted(
        path for path in UPLOAD_DIR.iterdir()
        if path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES
    )
    referenced: set[str] | None = None
    if args.check_database:
        session = SessionLocal()
        try:
            referenced = {
                row.file_path.replace("\\", "/")
                for row in session.query(ImageSlot.file_path).all()
                if row.file_path
            }
        finally:
            session.close()

    parent = {path: path for path in files}

    def find(path: Path) -> Path:
        if parent[path] != path:
            parent[path] = find(parent[path])
        return parent[path]

    def union(left: Path, right: Path) -> None:
        left_root, right_root = find(left), find(right)
        if left_root != right_root:
            parent[right_root] = left_root

    candidate_count = 0
    hashes = {path: image_hash(path) for path in files}
    for left, right in combinations(files, 2):
        same_name_variants = left.stem.casefold() == right.stem.casefold()
        left_hash, right_hash = hashes[left], hashes[right]
        looks_same = (
            left_hash is not None
            and right_hash is not None
            and (left_hash ^ right_hash).bit_count() <= MAX_HASH_DISTANCE
        )
        if same_name_variants or looks_same:
            union(left, right)
            candidate_count += 1

    groups: dict[Path, list[Path]] = defaultdict(list)
    for path in files:
        groups[find(path)].append(path)
    groups = {root: members for root, members in groups.items() if len(members) > 1}

    print(f"Scanned {len(files)} images in {UPLOAD_DIR}")
    print("Similarity check: same filename stem or 64-bit visual hash distance <= 2")
    if not groups:
        print("No duplicate candidates found.")
        return

    print(f"Found {len(groups)} candidate group(s) across {candidate_count} matching pairs.")
    if args.summary:
        sizes = sorted((len(members) for members in groups.values()), reverse=True)
        candidate_files = {path for members in groups.values() for path in members}
        exact_hashes: dict[str, int] = defaultdict(int)
        file_hashes: dict[Path, str] = {}
        total_size = 0
        for path in files:
            try:
                digest = sha256(path.read_bytes()).hexdigest()
                exact_hashes[digest] += 1
                file_hashes[path] = digest
                total_size += path.stat().st_size
            except OSError:
                continue
        exact_groups = sum(count > 1 for count in exact_hashes.values())
        print(f"Exact byte-identical groups: {exact_groups}")
        print(f"Images represented: {sum(sizes)}; largest candidate group: {sizes[0]} files")
        print(f"Total upload image size: {total_size:,} bytes")
        if referenced is None:
            print("Database references were not checked.")
        else:
            used = sum(path.relative_to(UPLOAD_DIR).as_posix() in referenced for path in candidate_files)
            print(f"Candidate files referenced by configured database: {used}/{len(candidate_files)}")
            print(f"Unreferenced candidate files: {len(candidate_files) - used}")
            safe_unreferenced = safe_orphans(groups, referenced, file_hashes, hashes)
            print(
                "Unreferenced files with an active visually matching or byte-identical counterpart: "
                f"{len(safe_unreferenced)}"
            )
        return

    if args.quarantine_unused:
        assert referenced is not None
        file_hashes = {path: sha256(path.read_bytes()).hexdigest() for path in files}
        safe_unreferenced = safe_orphans(groups, referenced, file_hashes, hashes)
        if not safe_unreferenced:
            print("No safe unreferenced duplicates to quarantine.")
            return
        upload_root = UPLOAD_DIR.resolve()
        quarantine = Path(tempfile.mkdtemp(prefix="jf-upload-duplicates-"))
        backups: dict[Path, Path] = {}
        for path in sorted(safe_unreferenced):
            if path.is_symlink() or path.resolve().parent != upload_root:
                raise RuntimeError(f"Refusing to move a file outside the upload root: {path.name}")
            backup = quarantine / path.name
            shutil.copy2(path, backup)
            if sha256(path.read_bytes()).digest() != sha256(backup.read_bytes()).digest():
                raise RuntimeError(f"Backup verification failed for {path.name}; source was kept")
            backups[path] = backup
        removed: list[Path] = []
        try:
            for path in backups:
                path.unlink()
                removed.append(path)
        except OSError:
            for path in removed:
                shutil.copy2(backups[path], path)
            raise
        print(f"Quarantined {len(removed)} unused duplicate files outside the upload directory.")
        print(f"Restorable file backups: {quarantine}")
        return

    for candidates in sorted(groups.values(), key=lambda group: str(group[0])):
        print("\nCandidate group:")
        for path in candidates:
            relative = path.relative_to(UPLOAD_DIR).as_posix()
            try:
                content_hash = sha256(path.read_bytes()).hexdigest()[:12]
            except OSError:
                content_hash = "unreadable"
            marker = (
                ("referenced by configured database" if relative in referenced else "not referenced by configured database")
                if referenced is not None
                else "database references not checked"
            )
            print(f"  {relative} · {path.stat().st_size:,} bytes · sha256 {content_hash} · {marker}")


if __name__ == "__main__":
    main()
