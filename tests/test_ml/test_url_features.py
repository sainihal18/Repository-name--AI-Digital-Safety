from ml.url.feature_extraction import extract_url_features


def test_https_detected():
    f = extract_url_features("https://example.com")
    assert f.has_https == 1


def test_http_not_https():
    f = extract_url_features("http://example.com")
    assert f.has_https == 0


def test_ip_address_detected():
    f = extract_url_features("http://192.168.1.1/login")
    assert f.has_ip_address == 1


def test_domain_name_not_flagged_as_ip():
    f = extract_url_features("https://example.com")
    assert f.has_ip_address == 0


def test_at_symbol_detected():
    f = extract_url_features("http://example.com@evil.com/login")
    assert f.has_at_symbol == 1


def test_shortener_detected():
    f = extract_url_features("http://bit.ly/abc123")
    assert f.is_url_shortener == 1


def test_risky_extension_detected():
    f = extract_url_features("http://example.com/file.exe")
    assert f.has_risky_extension == 1


def test_feature_count_matches_spec_minimum():
    from ml.url.feature_extraction import URLFeatures
    assert len(URLFeatures.feature_names()) >= 36


def test_url_without_scheme_still_parses():
    f = extract_url_features("example.com/page")
    assert f.hostname_length > 0


def test_empty_string_does_not_crash():
    f = extract_url_features("")
    assert f.url_length >= 0
