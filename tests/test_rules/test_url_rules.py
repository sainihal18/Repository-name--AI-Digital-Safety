from backend.rules.rule_engine import evaluate_url
from backend.rules.url_rules import check_brand_impersonation


def test_typosquat_url_flagged(sample_phishing_url):
    result = evaluate_url(sample_phishing_url)
    assert result["fired_count"] >= 1
    fired_types = {e["type"] for e in result["evidence"]}
    assert "brand_impersonation" in fired_types


def test_safe_url_not_flagged(sample_safe_url):
    result = evaluate_url(sample_safe_url)
    assert result["fired_count"] == 0


def test_real_brand_domain_does_not_false_positive():
    check = check_brand_impersonation("paypal.com")
    assert check["fired"] is False


def test_leetspeak_typosquat_detected():
    check = check_brand_impersonation("paypa1-login.com")
    assert check["fired"] is True
    assert "paypal" in check["matched_terms"]


def test_ip_address_host_flagged():
    result = evaluate_url("http://192.168.1.1/login")
    fired_types = {e["type"] for e in result["evidence"]}
    assert "ip_address_host" in fired_types


def test_invalid_url_does_not_crash():
    result = evaluate_url("not a url at all")
    assert isinstance(result["rule_score"], int)


def test_very_long_url_does_not_crash():
    long_url = "http://example.com/" + "a" * 3000
    result = evaluate_url(long_url)
    assert isinstance(result["rule_score"], int)
