# Security & Privacy — AI Digital Safety

## This is a defensive-only project

The system NEVER:
- Executes submitted URLs, files, or attachments
- Downloads malware or visits phishing pages
- Collects OTPs, passwords, PINs, or CVVs
- Performs unauthorized scanning or attacks against real targets
- Claims to identify a private individual, domain owner, or attacker's
  physical location

## Privacy

- `STORE_ANALYSIS=false` by default (`.env.example`) — no raw SMS/URL
  content is persisted anywhere.
- When enabled for research purposes, only a SHA-256 hash of the
  normalized content is stored (`backend/security/privacy.py::hash_content`)
  — this is one-way and cannot be reversed to recover the original text.
- Sensitive substrings (OTP/password/PIN/CVV patterns) are redacted
  before anything reaches logs (`backend/security/privacy.py::redact_sensitive`),
  as defense-in-depth even though callers should never be logging raw
  content in the first place.
- Structured logs (`backend/logging_config/logger.py`) contain only
  metadata (event name, analysis ID, risk score, type) — never message
  or URL content.

## API Security

- **Input validation**: size limits, blank-input rejection, hostname
  presence check for URLs (`backend/security/validators.py`)
- **Rate limiting**: in-memory sliding window, 60 req/min default,
  configurable via `RATE_LIMIT_PER_MINUTE` (`backend/security/middleware.py`)
  — swap for Redis-backed limiting before running multiple workers in production
- **Request size limits**: 20KB default, configurable via `MAX_REQUEST_SIZE_BYTES`
- **Security headers**: `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `X-Permitted-Cross-Domain-Policies`
- **CORS**: environment-driven allow-list; production fails closed (empty
  list) if `CORS_ALLOWED_ORIGINS` isn't set — `allow_origins=["*"]` is
  never used in `config/config.prod.yaml`
- **Error handling**: unhandled exceptions are logged with full detail
  server-side but return a generic message to the client — no internal
  tracebacks are ever exposed
- **Auth**: scaffolded but disabled by default in Phase 1
  (`backend/security/auth.py`) — enable via `AUTH_ENABLED=true` + `API_KEY`
  when you're ready to require it

## Threat Intelligence

- API keys are read from environment variables only
  (`URLHAUS_ENABLED`, `GOOGLE_SAFE_BROWSING_API_KEY`, `PHISHTANK_ENABLED`,
  `PHISHTANK_API_KEY`) — never hard-coded anywhere in this codebase.
- Every client fails closed and explicitly: a network error, timeout, or
  disabled config produces `query_status: UNAVAILABLE` or `DISABLED`,
  never a silent `known_malicious: false`. See `backend/risk/risk_engine.py`
  for how the risk engine handles this (it excludes unavailable sources
  from the score rather than treating them as confirmation of safety).

## Dependency Management

`requirements.txt` pins exact versions. Review and update deliberately —
don't blindly `pip install -U` in a security-sensitive project.

## Reporting a Vulnerability

This is a defensive research project, not a maintained production
service. If you find a security issue in this codebase, review it
yourself against the principles above before deploying — there is no
external security contact for this repository.
