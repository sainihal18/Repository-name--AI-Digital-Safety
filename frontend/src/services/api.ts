import axios from 'axios';
import type { AnalysisReport, HealthResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : 'http://localhost:8000/api/v1';
const ROOT_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.response?.data?.error || error.message || 'Network error';
    console.error('[API Error]', message);
    return Promise.reject(new Error(message));
  }
);

export const api = {
  health: async (): Promise<HealthResponse> => {
    const res = await axios.get(`${ROOT_URL}/health`, { timeout: 5000 });
    return res.data;
  },

  analyzeSms: async (message: string, sender?: string): Promise<AnalysisReport> => {
    const res = await apiClient.post<AnalysisReport>('/analyze/sms', { message, sender });
    return res.data;
  },

  analyzeUrl: async (url: string): Promise<AnalysisReport> => {
    const res = await apiClient.post<AnalysisReport>('/analyze/url', { url });
    return res.data;
  },

  analyzeImage: async (file: File): Promise<AnalysisReport> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<AnalysisReport>('/analyze/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getSystemStats: async () => {
    const res = await apiClient.get('/statistics');
    return res.data;
  },

  getModelInfo: async () => {
    const res = await apiClient.get('/model-info');
    return res.data;
  },

  getThreatIntelStatus: async () => {
    const res = await apiClient.get('/threat-intelligence/status');
    return res.data;
  },

  getHistory: async (): Promise<AnalysisReport[]> => {
    const res = await apiClient.get<AnalysisReport[]>('/analysis');
    return res.data;
  },

  getAnalysis: async (analysisId: string): Promise<AnalysisReport> => {
    const res = await apiClient.get<AnalysisReport>(`/analysis/${analysisId}`);
    return res.data;
  },

  submitFeedback: async (data: { analysis_id: string; label: string; comment?: string }) => {
    const res = await apiClient.post('/feedback', data);
    return res.data;
  },

  // ── Phase 9: Advanced Sub-Systems ─────────────────────────────────────────

  analyzePassword: async (password: string) => {
    const res = await apiClient.post('/analyze/password', { password });
    return res.data;
  },

  scanPorts: async (target: string = '127.0.0.1', ports?: number[]) => {
    const body: any = { target };
    if (ports) body.ports = ports;
    const res = await apiClient.post('/scan/ports', body);
    return res.data;
  },

  vaultStore: async (data: { ciphertext: string; iv: string; salt: string; label: string }) => {
    const res = await apiClient.post('/vault/store', data);
    return res.data;
  },

  vaultRetrieve: async (id: string) => {
    const res = await apiClient.get(`/vault/retrieve/${id}`);
    return res.data;
  },

  vaultList: async () => {
    const res = await apiClient.get('/vault/list');
    return res.data;
  },

  vaultDelete: async (id: string) => {
    const res = await apiClient.delete(`/vault/${id}`);
    return res.data;
  },

  // ── Phase 11: God-Tier Pro Modules ──────────────────────────────────────

  analyzeEmail: async (raw_email: string) => {
    const res = await apiClient.post('/analyze/email', { raw_email });
    return res.data;
  },

  analyzeQR: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/analyze/qr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  monitorDarkWeb: async (email: string) => {
    const res = await apiClient.post('/monitor/darkweb', { email });
    return res.data;
  },

  copilotChat: async (message: string, history: any[], context?: string) => {
    const res = await apiClient.post('/copilot/chat', { message, history, context });
    return res.data;
  },
};
