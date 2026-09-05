#!/usr/bin/env python3
"""
Menu-driven CLI for testing the AI Digital Safety analyzers without
needing the FastAPI server running.

Usage:
    python scripts/cli_test.py
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ml.inference.inference_engine import InferenceEngine

MENU = """
==================================================
  AI DIGITAL SAFETY — CLI
  "Analyze Before You Trust."
==================================================
  1. Analyze SMS
  2. Analyze URL
  3. Show model information
  4. Show system health
  5. Exit
--------------------------------------------------
"""


def print_report(report) -> None:
    print()
    print("THREAT ASSESSMENT")
    print(f"  Verdict:          {report.verdict.value}")
    print(f"  Risk Score:       {report.risk_score}/100")
    print(f"  Confidence:       {report.confidence}%")
    print(f"  Category:         {report.category.value}")
    if report.reason:
        print(f"  Reason:           {report.reason}")
    print()
    print("WHY WAS IT FLAGGED?")
    if report.evidence:
        for e in report.evidence:
            print(f"  [{e.severity.value}] {e.type}: {e.description}")
    else:
        print("  No specific rule-based indicators fired.")
    print()
    print("SCAM DNA")
    for field, value in report.scam_dna.model_dump().items():
        if value > 0:
            print(f"  {field}: {value}")
    print()
    print("POTENTIAL ATTACK PATH")
    print("  " + " -> ".join(step.stage for step in report.attack_chain))
    print()
    print("RECOMMENDED ACTIONS")
    for rec in report.recommended_actions:
        print(f"  - {rec}")
    print()
    print("MODEL / VERSIONING")
    print(f"  Model: {report.model.name} ({report.model.type}), version={report.model.version}")
    print(f"  Feature version: {report.feature_version} | Risk engine: {report.risk_engine_version}")
    if report.threat_intelligence:
        print()
        print("THREAT INTELLIGENCE")
        for ti in report.threat_intelligence:
            print(f"  {ti.source}: {ti.query_status.value}"
                  + (f" (known_malicious={ti.known_malicious})" if ti.known_malicious is not None else ""))
    if report.limitations:
        print()
        print("LIMITATIONS")
        for lim in report.limitations:
            print(f"  - {lim}")
    print("==================================================")


def main() -> None:
    print("Loading models...")
    engine = InferenceEngine()
    print("Ready.\n")

    while True:
        print(MENU)
        choice = input("Select an option (1-5): ").strip()

        if choice == "1":
            message = input("Enter SMS text: ").strip()
            if not message:
                print("Message cannot be empty.")
                continue
            report = engine.analyze_sms(message)
            print_report(report)

        elif choice == "2":
            url = input("Enter URL: ").strip()
            if not url:
                print("URL cannot be empty.")
                continue
            report = engine.analyze_url(url)
            print_report(report)

        elif choice == "3":
            from backend.services.model_service import get_model_info
            info = get_model_info()
            print()
            print("MODEL INFORMATION")
            print(f"  SMS model: {info.sms_model.name} ({info.sms_model.type}), version={info.sms_model.version}")
            print(f"  URL model: {info.url_model.name} ({info.url_model.type}), version={info.url_model.version}")
            print(f"  Risk engine version: {info.risk_engine_version}")
            print(f"  Feature versions: {info.feature_versions}")

        elif choice == "4":
            print()
            print("SYSTEM HEALTH")
            print(f"  SMS analyzer model loaded: {engine.sms_analyzer._model is not None}")
            print(f"  URL analyzer model loaded: {engine.url_analyzer._model is not None}")

        elif choice == "5":
            print("Goodbye.")
            break

        else:
            print("Invalid option, please choose 1-5.")


if __name__ == "__main__":
    main()
