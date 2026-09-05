"""
Enumerations shared across the AI Digital Safety platform.
Centralising these avoids "magic strings" scattered through the codebase
and keeps the API contract stable as new phases are added.
"""
from enum import Enum


class InputType(str, Enum):
    SMS = "SMS"
    URL = "URL"
    # Future phases (not active in Phase 1, kept here so schemas never
    # need to change shape when they are switched on):
    SCREENSHOT = "SCREENSHOT"
    QR_CODE = "QR_CODE"
    EMAIL = "EMAIL"
    PHONE_NUMBER = "PHONE_NUMBER"
    FILE = "FILE"


class Verdict(str, Enum):
    LOW_RISK = "LOW RISK"
    UNKNOWN = "UNKNOWN"
    SUSPICIOUS = "SUSPICIOUS"
    HIGH_RISK = "HIGH RISK"


class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class ScamCategory(str, Enum):
    BANKING_KYC_PHISHING = "BANKING_KYC_PHISHING"
    OTP_CREDENTIAL_PHISHING = "OTP_CREDENTIAL_PHISHING"
    PRIZE_REWARD_SCAM = "PRIZE_REWARD_SCAM"
    IMPERSONATION = "IMPERSONATION"
    DELIVERY_SCAM = "DELIVERY_SCAM"
    JOB_SCAM = "JOB_SCAM"
    INVESTMENT_SCAM = "INVESTMENT_SCAM"
    PAYMENT_SCAM = "PAYMENT_SCAM"
    ACCOUNT_SUSPENSION_SCAM = "ACCOUNT_SUSPENSION_SCAM"
    GENERAL_SPAM = "GENERAL_SPAM"
    UNKNOWN = "UNKNOWN"


class ThreatIntelStatus(str, Enum):
    OK = "OK"
    UNAVAILABLE = "UNAVAILABLE"
    DISABLED = "DISABLED"
    ERROR = "ERROR"


class FeedbackLabel(str, Enum):
    FALSE_POSITIVE = "FALSE_POSITIVE"   # user says it was actually safe
    FALSE_NEGATIVE = "FALSE_NEGATIVE"   # user says it was actually a scam
    CONFIRMED_CORRECT = "CONFIRMED_CORRECT"
