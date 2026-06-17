from __future__ import annotations

from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]

PUBLIC_BLOCKED_PATHS = [
    ROOT / "frontend" / "public" / "documents",
    ROOT / "frontend" / "public" / "private",
]

TRACKED_BLOCKED_PREFIXES = (
    "Daten/",
    "private-data/",
    "backend/private-data/",
    "backend/content/private/",
    "uploads/private/",
    "frontend/public/documents/",
    "frontend/public/private/",
)


def has_files(path: Path) -> bool:
    return path.exists() and any(item.is_file() for item in path.rglob("*"))


def tracked_sensitive_files() -> list[str]:
    result = subprocess.run(
        ["git", "ls-files"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    tracked_files = result.stdout.splitlines()
    return [path for path in tracked_files if path.startswith(TRACKED_BLOCKED_PREFIXES)]


def main() -> int:
    blocked_public_paths = [path.relative_to(ROOT) for path in PUBLIC_BLOCKED_PATHS if has_files(path)]
    blocked_tracked_files = tracked_sensitive_files()

    if blocked_public_paths or blocked_tracked_files:
        print("Sensible Dateien wurden in blockierten Pfaden gefunden:")
        for path in blocked_public_paths:
            print(f"- {path}")
        for path in blocked_tracked_files:
            print(f"- {path}")
        print("Diese Dateien dürfen nicht ins Repository oder nach GitHub.")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
