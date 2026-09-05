export type Verdict = 'SAFE' | 'LOW RISK' | 'UNKNOWN' | 'SUSPICIOUS' | 'HIGH RISK' | 'CRITICAL';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ScamCategory = 'PHISHING' | 'FINANCIAL_SCAM' | 'MALWARE' | 'SPAM' | 'SAFE' | 'UNCATEGORIZED';

export interface Evidence {
  type: string;
  severity: Severity;
  description: string;
}

export interface ScamDNA {
  urgency: number;
  fear_intimidation: number;
  financial_pressure: number;
  reward_manipulation: number;
  credential_harvesting: number;
  otp_targeting: number;
  impersonation: number;
  authority_abuse: number;
  social_engineering: number;
  external_link_usage: number;
  call_to_action_pressure: number;
  brand_impersonation: number;
}

export interface AttackChainStep {
  stage: string;
  description: string;
}

export interface Explainability {
  flagged_reasons: string[];
  top_ml_features: string[];
  rule_score: number;
  ml_score: number;
  fusion_method: string;
  threat_intel_contributed: boolean;
}

export interface ModelInfo {
  name: string;
  version: string;
  type: string;
  device?: string;
}

export interface ThreatIntelResult {
  source: string;
  query_status: string;
  known_malicious?: boolean;
  threat_type?: string;
  reputation?: string;
  timestamp?: string;
  error_status?: string;
}

export interface AnalysisReport {
  analysis_id: string;
  timestamp: string;
  input_type: 'SMS' | 'URL' | 'IMAGE';
  verdict: Verdict;
  risk_score: number;
  confidence: number;
  category: ScamCategory;
  evidence: Evidence[];
  suspicious_terms: string[];
  extracted_urls: string[];
  extracted_entities: Record<string, any>;
  scam_dna: ScamDNA;
  attack_chain: AttackChainStep[];
  recommended_actions: string[];
  explainability?: Explainability;
  model: ModelInfo;
  feature_version: string;
  risk_engine_version: string;
  dataset_version?: string;
  threat_intelligence: ThreatIntelResult[];
  limitations: string[];
  reason?: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  models_loaded: boolean;
  database_ok: boolean;
}

export interface StatisticsResponse {
  total_scans: number;
  sms_scans: number;
  url_scans: number;
  high_risk_count: number;
  suspicious_count: number;
  unknown_count: number;
  low_risk_count: number;
  average_risk_score: number;
  false_positive_feedback: number;
  false_negative_feedback: number;
  top_categories: Record<string, number>;
}

export interface ModelInfoResponse {
  sms_model: ModelInfo;
  url_model: ModelInfo;
  risk_engine_version: string;
  feature_versions: Record<string, string>;
}

export interface ThreatIntelStatusResponse {
  sources: ThreatIntelResult[];
}

// ── Phase 9: Advanced Sub-System Types ──────────────────────────────────────

export interface PasswordAnalysis {
  score: number;
  entropy: number;
  crack_time_display: string;
  character_classes: Record<string, boolean>;
  length: number;
  breach_count: number;
  suggestions: string[];
  verdict: string;
}

export interface PortResult {
  port: number;
  service: string;
  state: 'open' | 'closed';
  risk_level: string;
}

export interface PortScanResponse {
  target: string;
  scanned_at: string;
  total_scanned: number;
  open_count: number;
  results: PortResult[];
}

export interface HoneypotLog {
  timestamp: string;
  source_ip: string;
  source_port: number;
  protocol: string;
  username: string;
  auth_method: string;
  success: boolean;
  severity: string;
  geo: {
    country: string;
    city: string;
    isp: string;
  };
}

export interface VaultStoreRequest {
  ciphertext: string;
  iv: string;
  salt: string;
  label: string;
}

export interface VaultEntry {
  id: string;
  ciphertext: string;
  iv: string;
  salt: string;
  label: string;
  stored_at: string;
}

export interface VaultListEntry {
  id: string;
  label: string;
  stored_at: string;
}

// ── Phase 11: God-Tier Pro Modules ──────────────────────────────────────────

export interface EmailAnalysisResult {
  subject: string;
  sender: string;
  recipient: string;
  spf_status: string;
  dkim_status: string;
  dmarc_status: string;
  received_hops: string[];
  anomalies: string[];
  risk_score: number;
}

export interface QRAnalysisResult {
  has_qr: boolean;
  decoded_url?: string;
  risk_score: number;
  verdict: string;
  message: string;
}

export interface BreachRecord {
  title: string;
  date: string;
  compromised_data: string[];
  description: string;
}

export interface DarkWebScanResult {
  email: string;
  breach_count: number;
  breaches: BreachRecord[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CopilotResponse {
  reply: string;
}
