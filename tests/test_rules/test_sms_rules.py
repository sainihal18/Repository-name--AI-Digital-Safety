from backend.rules.rule_engine import evaluate_sms
from backend.rules.sms_rules import extract_entities


def test_scam_sms_fires_multiple_rules(sample_scam_sms):
    result = evaluate_sms(sample_scam_sms)
    assert result["fired_count"] >= 3
    assert result["rule_score"] > 50
    fired_types = {e["type"] for e in result["evidence"]}
    assert "urgency" in fired_types
    assert "otp_targeting" in fired_types


def test_safe_sms_fires_no_rules(sample_safe_sms):
    result = evaluate_sms(sample_safe_sms)
    assert result["fired_count"] == 0
    assert result["rule_score"] == 0


def test_empty_sms_does_not_crash():
    result = evaluate_sms("")
    assert result["rule_score"] == 0


def test_entity_extraction_finds_url():
    entities = extract_entities("Click here: http://scam.example.com/login now")
    assert any("scam.example.com" in u for u in entities["urls"])


def test_entity_extraction_finds_no_url_in_plain_text():
    entities = extract_entities("See you at the office tomorrow")
    assert entities["urls"] == []
