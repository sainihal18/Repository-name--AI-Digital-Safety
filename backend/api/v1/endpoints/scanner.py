"""Safe localhost-only port scanner endpoint."""
from __future__ import annotations

import asyncio
import socket
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

# ── Well-known services ──────────────────────────────────────────────────────

_SERVICES: dict[int, str] = {
    20: "FTP-Data", 21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP",
    53: "DNS", 80: "HTTP", 110: "POP3", 111: "RPCBind", 135: "MSRPC",
    139: "NetBIOS", 143: "IMAP", 443: "HTTPS", 445: "SMB", 993: "IMAPS",
    995: "POP3S", 1433: "MSSQL", 1521: "Oracle", 3306: "MySQL",
    3389: "RDP", 5432: "PostgreSQL", 5900: "VNC", 6379: "Redis",
    8000: "HTTP-Alt", 8080: "HTTP-Proxy", 8443: "HTTPS-Alt",
    8888: "HTTP-Alt", 9090: "Web-Mgmt", 27017: "MongoDB",
}

_RISK: dict[str, str] = {
    "SSH": "MEDIUM", "Telnet": "CRITICAL", "FTP": "HIGH", "FTP-Data": "HIGH",
    "SMB": "HIGH", "RDP": "HIGH", "MSRPC": "MEDIUM", "NetBIOS": "MEDIUM",
    "MySQL": "HIGH", "PostgreSQL": "HIGH", "Redis": "CRITICAL",
    "MongoDB": "HIGH", "VNC": "HIGH", "MSSQL": "HIGH",
}

DEFAULT_PORTS = [21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 445,
                 993, 995, 1433, 3306, 3389, 5432, 5900, 6379, 8000,
                 8080, 8443, 8888, 9090, 27017]


# ── Models ───────────────────────────────────────────────────────────────────

class ScanRequest(BaseModel):
    target: str = Field(default="127.0.0.1", description="Only 127.0.0.1 or localhost allowed")
    ports: list[int] = Field(default_factory=lambda: DEFAULT_PORTS, max_length=100)


class PortResult(BaseModel):
    port: int
    service: str
    state: Literal["open", "closed"]
    risk_level: str  # LOW / MEDIUM / HIGH / CRITICAL


class ScanResponse(BaseModel):
    target: str
    scanned_at: str
    total_scanned: int
    open_count: int
    results: list[PortResult]


# ── Scanner ──────────────────────────────────────────────────────────────────

_ALLOWED_TARGETS = {"127.0.0.1", "localhost", "::1"}


async def _check_port(target: str, port: int, timeout: float = 0.5) -> PortResult:
    """Non-blocking port check."""
    service = _SERVICES.get(port, f"Port-{port}")
    try:
        _, writer = await asyncio.wait_for(
            asyncio.open_connection(target, port),
            timeout=timeout,
        )
        writer.close()
        await writer.wait_closed()
        risk = _RISK.get(service, "LOW")
        return PortResult(port=port, service=service, state="open", risk_level=risk)
    except (asyncio.TimeoutError, OSError, ConnectionRefusedError):
        return PortResult(port=port, service=service, state="closed", risk_level="NONE")


@router.post("/scan/ports", tags=["Scanner"])
async def scan_ports(req: ScanRequest) -> ScanResponse:
    if req.target not in _ALLOWED_TARGETS:
        raise HTTPException(
            status_code=403,
            detail="Security policy: only localhost scanning is permitted.",
        )

    # Deduplicate & clamp
    ports = sorted(set(p for p in req.ports if 1 <= p <= 65535))[:100]

    results = await asyncio.gather(*[_check_port(req.target, p) for p in ports])
    results_list = list(results)
    open_count = sum(1 for r in results_list if r.state == "open")

    return ScanResponse(
        target=req.target,
        scanned_at=datetime.now(timezone.utc).isoformat(),
        total_scanned=len(results_list),
        open_count=open_count,
        results=results_list,
    )
