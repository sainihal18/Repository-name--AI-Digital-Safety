from backend.analyzers.sms_analyzer import SMSAnalyzer

msg = " We are from sbi bank your account was blocked please open below link and fix"
analyzer = SMSAnalyzer()
report = analyzer.analyze(msg)

print(f"VERDICT: {report.verdict.value}")
print(f"RISK SCORE: {report.risk_score}")
print("\nATTACK CHAIN:")
for step in report.attack_chain:
    print(f"[{step.stage}] -> {step.description}")

print("\nWHY FLAGGED:")
for reason in report.explainability.flagged_reasons:
    print(f"- {reason}")

print("\nSCAM DNA:")
for k, v in report.scam_dna.model_dump().items():
    if v > 0:
        print(f"- {k}: {v}")
