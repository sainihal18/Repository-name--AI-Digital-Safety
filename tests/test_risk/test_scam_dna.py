from backend.risk.scam_dna import compute_sms_scam_dna
from backend.rules.sms_rules import run_sms_rules


def test_scam_dna_reflects_fired_rules(sample_scam_sms):
    raw_results = run_sms_rules(sample_scam_sms)
    dna = compute_sms_scam_dna(raw_results)
    assert dna.urgency > 0
    assert dna.credential_harvesting > 0 or dna.otp_targeting > 0


def test_scam_dna_all_zero_for_safe_message(sample_safe_sms):
    raw_results = run_sms_rules(sample_safe_sms)
    dna = compute_sms_scam_dna(raw_results)
    assert sum(dna.model_dump().values()) == 0
