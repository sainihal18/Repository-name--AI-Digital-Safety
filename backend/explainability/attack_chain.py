"""
Attack chain generator.

Always frames output as a *potential* attack path, never a claim that the
final stage occurred — per the spec's explicit requirement.
"""
from __future__ import annotations

from typing import Dict, List

from backend.models.schemas import AttackChainStep


def build_sms_attack_chain(fired_types: List[str]) -> List[AttackChainStep]:
    chain = [AttackChainStep(stage="SMS RECEIVED", description="Message delivered to recipient.")]

    if any(t in fired_types for t in ("urgency", "fear_intimidation", "threat_punishment")):
        chain.append(AttackChainStep(
            stage="SOCIAL ENGINEERING",
            description="Message applies urgency, fear, or authority pressure.",
        ))
    if "external_link_usage" in fired_types:
        chain.append(AttackChainStep(
            stage="LINK CLICK",
            description="Recipient is urged to click an embedded link.",
        ))
        chain.append(AttackChainStep(
            stage="FAKE LOGIN",
            description="Potential landing page designed to mimic a legitimate login/verification page.",
        ))
    if any(t in fired_types for t in ("credential_request", "otp_targeting", "kyc_banking")):
        chain.append(AttackChainStep(
            stage="CREDENTIAL REQUEST",
            description="Message requests credentials, OTP, or banking/KYC details.",
        ))
        chain.append(AttackChainStep(
            stage="POTENTIAL ACCOUNT TAKEOVER",
            description="If credentials are entered, this could lead to account compromise. "
                        "This is a potential outcome, not a confirmed event.",
        ))
    return chain


def build_url_attack_chain(fired_types: List[str]) -> List[AttackChainStep]:
    chain = [AttackChainStep(stage="URL SUBMITTED", description="URL provided for analysis.")]

    if "brand_impersonation" in fired_types:
        chain.append(AttackChainStep(
            stage="BRAND IMPERSONATION",
            description="Domain resembles a trusted brand closely enough to deceive a quick glance.",
        ))
    if any(t in fired_types for t in ("suspicious_keywords", "at_symbol_obfuscation", "ip_address_host")):
        chain.append(AttackChainStep(
            stage="DECEPTIVE PAGE (POTENTIAL)",
            description="Structural indicators consistent with a fake login/verification page.",
        ))
    if "risky_download_extension" in fired_types:
        chain.append(AttackChainStep(
            stage="MALICIOUS DOWNLOAD (POTENTIAL)",
            description="URL points at an executable/installable file type.",
        ))
        chain.append(AttackChainStep(
            stage="POTENTIAL DEVICE COMPROMISE",
            description="If downloaded and run, this could compromise the device. "
                        "This is a potential outcome, not a confirmed event.",
        ))
    else:
        chain.append(AttackChainStep(
            stage="POTENTIAL CREDENTIAL THEFT",
            description="If visited and credentials are entered, this could lead to account compromise. "
                        "This is a potential outcome, not a confirmed event.",
        ))
    return chain


def to_mermaid(chain: List[AttackChainStep]) -> str:
    """Render the chain as a Mermaid flowchart definition for the future
    React frontend's attack-chain visualization."""
    lines = ["graph TD"]
    node_ids = [f"N{i}" for i in range(len(chain))]
    for node_id, step in zip(node_ids, chain):
        label = step.stage.replace('"', "'")
        lines.append(f'    {node_id}["{label}"]')
    for a, b in zip(node_ids, node_ids[1:]):
        lines.append(f"    {a} --> {b}")
    return "\n".join(lines)
