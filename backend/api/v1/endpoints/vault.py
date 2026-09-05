"""Zero-knowledge E2EE vault — server stores ciphertext only, never sees plaintext."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

# In-memory storage (demo). In production → database with TTL.
_vault: dict[str, dict] = {}


class VaultStoreRequest(BaseModel):
    ciphertext: str = Field(..., description="Base64-encoded ciphertext from client-side encryption")
    iv: str = Field(..., description="Base64-encoded initialization vector")
    salt: str = Field(default="", description="Optional salt used for key derivation")
    label: str = Field(default="Untitled", max_length=128, description="User-facing label")


class VaultStoreResponse(BaseModel):
    id: str
    stored_at: str
    label: str
    message: str


class VaultEntry(BaseModel):
    id: str
    ciphertext: str
    iv: str
    salt: str
    label: str
    stored_at: str


class VaultListEntry(BaseModel):
    id: str
    label: str
    stored_at: str


@router.post("/vault/store", tags=["Vault"])
async def vault_store(req: VaultStoreRequest) -> VaultStoreResponse:
    entry_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    _vault[entry_id] = {
        "ciphertext": req.ciphertext,
        "iv": req.iv,
        "salt": req.salt,
        "label": req.label,
        "stored_at": now,
    }
    return VaultStoreResponse(
        id=entry_id,
        stored_at=now,
        label=req.label,
        message="Encrypted data stored. The server never sees your plaintext.",
    )


@router.get("/vault/retrieve/{entry_id}", tags=["Vault"])
async def vault_retrieve(entry_id: str) -> VaultEntry:
    if entry_id not in _vault:
        raise HTTPException(status_code=404, detail="Vault entry not found.")
    entry = _vault[entry_id]
    return VaultEntry(id=entry_id, **entry)


@router.get("/vault/list", tags=["Vault"])
async def vault_list() -> list[VaultListEntry]:
    return [
        VaultListEntry(id=eid, label=e["label"], stored_at=e["stored_at"])
        for eid, e in sorted(_vault.items(), key=lambda x: x[1]["stored_at"], reverse=True)
    ]


@router.delete("/vault/{entry_id}", tags=["Vault"])
async def vault_delete(entry_id: str) -> dict:
    if entry_id not in _vault:
        raise HTTPException(status_code=404, detail="Vault entry not found.")
    del _vault[entry_id]
    return {"deleted": True, "id": entry_id}
