"""Simulated honeypot SSH attack log WebSocket stream."""
from __future__ import annotations

import asyncio
import json
import random
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

# ── Fake data pools ──────────────────────────────────────────────────────────

_IP_POOLS = [
    ("185.220.101.", 1, 254),   # Tor exit nodes (Germany)
    ("45.33.32.", 1, 254),      # Linode (US)
    ("103.252.114.", 1, 254),   # Asia-Pacific
    ("91.240.118.", 1, 254),    # Eastern Europe
    ("177.54.150.", 1, 254),    # South America
    ("41.77.209.", 1, 254),     # Africa
    ("5.188.210.", 1, 254),     # Russia
    ("218.92.", 1, 254),        # China
]

_USERNAMES = [
    "root", "admin", "ubuntu", "test", "user", "guest", "oracle", "postgres",
    "mysql", "ftp", "pi", "www-data", "deploy", "git", "jenkins", "ansible",
    "nagios", "tomcat", "ec2-user", "centos", "vagrant", "docker",
]

_GEO = {
    "185.220.101.": {"country": "Germany", "city": "Frankfurt", "isp": "Tor Exit Node"},
    "45.33.32.": {"country": "United States", "city": "Fremont", "isp": "Linode LLC"},
    "103.252.114.": {"country": "Vietnam", "city": "Hanoi", "isp": "VNPT Corp"},
    "91.240.118.": {"country": "Ukraine", "city": "Kyiv", "isp": "Private Layer"},
    "177.54.150.": {"country": "Brazil", "city": "São Paulo", "isp": "HostDime"},
    "41.77.209.": {"country": "South Africa", "city": "Johannesburg", "isp": "MWEB"},
    "5.188.210.": {"country": "Russia", "city": "St. Petersburg", "isp": "PIN-DC"},
    "218.92.": {"country": "China", "city": "Nanjing", "isp": "Chinanet"},
}

_PROTOCOLS = ["SSH", "SSH", "SSH", "Telnet", "FTP"]  # SSH weighted heavily
_AUTH_METHODS = ["password", "keyboard-interactive", "publickey"]

_SEVERITY_MAP = {"SSH": "HIGH", "Telnet": "CRITICAL", "FTP": "MEDIUM"}


def _random_ip() -> tuple[str, dict]:
    prefix, lo, hi = random.choice(_IP_POOLS)
    ip = f"{prefix}{random.randint(lo, hi)}"
    geo = _GEO.get(prefix, {"country": "Unknown", "city": "Unknown", "isp": "Unknown"})
    return ip, geo


def _generate_log() -> dict:
    ip, geo = _random_ip()
    protocol = random.choice(_PROTOCOLS)
    username = random.choice(_USERNAMES)
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source_ip": ip,
        "source_port": random.randint(1024, 65535),
        "protocol": protocol,
        "username": username,
        "auth_method": random.choice(_AUTH_METHODS),
        "success": False,  # Honeypot always rejects
        "severity": _SEVERITY_MAP.get(protocol, "LOW"),
        "geo": geo,
    }


# ── WebSocket endpoint ───────────────────────────────────────────────────────

@router.websocket("/honeypot/stream")
async def honeypot_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            log_entry = _generate_log()
            await websocket.send_text(json.dumps(log_entry))
            # Random delay between 0.5 and 3 seconds
            await asyncio.sleep(random.uniform(0.5, 3.0))
    except WebSocketDisconnect:
        pass
    except Exception:
        try:
            await websocket.close()
        except Exception:
            pass
