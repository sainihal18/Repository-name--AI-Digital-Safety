"""
Shared regex patterns and keyword lists.

These lists are intentionally explicit and editable — the whole point of
a rule engine (as opposed to a pure black-box model) is that a human can
read, audit, and extend exactly what it looks for.
"""
import re

# --------------------------------------------------------------------------
# Structural extraction (SMS)
# --------------------------------------------------------------------------

URL_REGEX = re.compile(
    r"(https?://[^\s]+)|(\bwww\.[^\s]+)|(\b[a-zA-Z0-9-]+\.(?:com|net|org|info|biz|xyz|"
    r"top|link|click|shop|online|site|live|vip|win|bank|pay)\b(?:/[^\s]*)?)",
    re.IGNORECASE,
)

PHONE_REGEX = re.compile(
    r"(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?){2,4}\d{2,4}"
)

CURRENCY_REGEX = re.compile(
    r"(₹|\$|€|£|Rs\.?|INR|USD|EUR|GBP)\s?\d[\d,]*(\.\d+)?"
)

OTP_REGEX = re.compile(
    r"\b(otp|one[\s-]?time[\s-]?password|verification code|security code)\b",
    re.IGNORECASE,
)

OTP_NUMBER_REGEX = re.compile(r"\b\d{4,8}\b")

# --------------------------------------------------------------------------
# Suspicious terminology categories (SMS + URL share the vocabulary,
# weighted differently per surface)
# --------------------------------------------------------------------------

URGENCY_TERMS = [
    "urgent", "immediately", "act now", "act fast", "expires today",
    "expiring soon", "last chance", "final notice", "within 24 hours",
    "within 1 hour", "time sensitive", "respond now", "right away",
]

FEAR_INTIMIDATION_TERMS = [
    "suspended", "blocked", "terminated", "legal action", "penalty",
    "arrest", "warrant", "fine", "seized", "locked", "deactivated",
    "unauthorized access detected", "compromised",
]

FINANCIAL_PRESSURE_TERMS = [
    "pay now", "outstanding balance", "overdue", "fee required",
    "payment failed", "refund pending", "clear your dues", "fine of",
    "penalty of", "processing fee",
]

CREDENTIAL_REQUEST_TERMS = [
    "verify your account", "confirm your details", "update your password",
    "enter your pin", "provide your otp", "share your otp", "login to verify",
    "verify now", "re-verify", "confirm your identity", "enter your cvv",
]

REWARD_TERMS = [
    "you have won", "congratulations", "claim your prize", "free gift",
    "cashback", "lucky winner", "lottery", "reward points expiring",
    "redeem now", "bonus credited",
]

IMPERSONATION_TERMS = [
    "bank", "customs", "income tax", "police", "government", "courier",
    "delivery", "amazon", "paypal", "microsoft", "apple support",
    "irs", "hmrc", "social security",
]

KYC_BANKING_TERMS = [
    "kyc", "know your customer", "aadhaar", "pan card", "bank account",
    "debit card", "credit card", "net banking", "ifsc", "swift code",
    "account number", "wallet balance",
]

THREAT_PUNISHMENT_TERMS = [
    "account will be closed", "service will be discontinued",
    "legal action will be taken", "will be blacklisted",
    "will be reported", "case will be filed",
]

# --------------------------------------------------------------------------
# URL-specific suspicious keyword vocabulary
# --------------------------------------------------------------------------

URL_SUSPICIOUS_KEYWORDS = [
    "login", "verify", "verification", "secure", "account", "update",
    "confirm", "bank", "kyc", "wallet", "payment", "bonus", "prize",
    "reward", "password", "signin", "security", "unlock", "billing",
    "suspended", "recover", "support", "webscr", "authenticate",
]

DOWNLOAD_EXTENSIONS = [
    ".apk", ".exe", ".scr", ".bat", ".jar", ".msi", ".cmd", ".vbs",
]

URL_SHORTENERS = [
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd",
    "buff.ly", "rebrand.ly", "cutt.ly", "shorturl.at",
]

# A small, illustrative curated brand list for the typosquat/brand
# impersonation detector (see backend/rules/url_rules.py). In production
# this should be sourced from the organizations you actually want to
# protect users against, and kept in a config file, not hard-coded here.
PROTECTED_BRANDS = [
    "paypal", "amazon", "google", "microsoft", "apple", "netflix",
    "facebook", "instagram", "whatsapp", "chase", "wellsfargo",
    "bankofamerica", "hdfcbank", "icicibank", "sbi", "irs", "usps",
    "fedex", "dhl", "ups",
]
