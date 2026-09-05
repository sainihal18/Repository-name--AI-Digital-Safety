#!/usr/bin/env python3
"""
Downloads real, legitimately-licensed datasets into data/raw/.

Requires internet access and, for Kaggle sources, a configured Kaggle API
token (~/.kaggle/kaggle.json) — see https://www.kaggle.com/docs/api.

This script does NOT run in fully offline/sandboxed environments. It is
provided so that on your actual development machine (per the spec's
Windows/PyCharm/VS Code setup) you can pull the real datasets referenced
in data/docs/dataset_cards/ with one command instead of manual downloads.

Usage:
    python scripts/download_datasets.py --dataset sms
    python scripts/download_datasets.py --dataset url
    python scripts/download_datasets.py --dataset all
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
_RAW_DIR = _ROOT / "data" / "raw"

_SOURCES = {
    "sms": {
        "name": "UCI SMS Spam Collection",
        "kaggle_dataset": "uciml/sms-spam-collection-dataset",
        "uci_url": "https://archive.ics.uci.edu/dataset/228/sms+spam+collection",
        "target_file": "sms_spam_collection_real.csv",
        "expected_columns": "v1 (label), v2 (message)",
        "license": "Available for research purposes — see UCI page for full terms.",
    },
    "url": {
        "name": "PhiUSIIL Phishing URL Dataset",
        "kaggle_dataset": None,
        "uci_url": "https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset",
        "target_file": "phiusiil_phishing_url_real.csv",
        "expected_columns": "URL, label (0=legitimate, 1=phishing)",
        "license": "CC BY 4.0 — see UCI page for full terms.",
    },
}


def _try_kaggle_download(dataset_slug: str, dest_dir: Path) -> bool:
    try:
        import kaggle  # noqa: F401
    except ImportError:
        print("  [skip] `kaggle` package not installed. Run: pip install kaggle")
        return False
    try:
        import subprocess
        subprocess.run(
            ["kaggle", "datasets", "download", "-d", dataset_slug, "-p", str(dest_dir), "--unzip"],
            check=True,
        )
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"  [failed] Kaggle download failed: {exc}")
        return False


def download(dataset_key: str) -> None:
    info = _SOURCES[dataset_key]
    print(f"\n=== {info['name']} ===")
    print(f"UCI page: {info['uci_url']}")
    print(f"License: {info['license']}")
    print(f"Expected columns: {info['expected_columns']}")

    _RAW_DIR.mkdir(parents=True, exist_ok=True)

    if info["kaggle_dataset"]:
        print(f"Attempting Kaggle download: {info['kaggle_dataset']} ...")
        ok = _try_kaggle_download(info["kaggle_dataset"], _RAW_DIR)
        if ok:
            print(f"  Downloaded to {_RAW_DIR}")
            return

    print(
        "  Automated download not available for this source in this environment.\n"
        f"  Please manually download from {info['uci_url']} and place the CSV at:\n"
        f"  {_RAW_DIR / info['target_file']}\n"
        "  Then update ml/sms/datasets.py or ml/url/datasets.py --data argument accordingly,\n"
        "  and fill in data/docs/dataset_cards/ with the ACTUAL sample count and class distribution\n"
        "  once loaded — never estimate or fabricate these numbers."
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Download real public datasets for AI Digital Safety.")
    parser.add_argument("--dataset", choices=["sms", "url", "all"], default="all")
    args = parser.parse_args()

    keys = list(_SOURCES.keys()) if args.dataset == "all" else [args.dataset]
    for key in keys:
        download(key)


if __name__ == "__main__":
    main()
