import { useState, useRef } from 'react';
import { QrCode, Upload, Scan, AlertTriangle, ShieldCheck, ShieldAlert, Activity } from 'lucide-react';
import { api } from '@/services/api';
import type { QRAnalysisResult } from '@/types';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function QRScannerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QRAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selected: File) => {
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreview(url);
    setResult(null); // reset
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const analyzeQR = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await api.analyzeQR(file);
      setResult(res as any);
    } catch (e) {
      console.error(e);
      alert('Failed to analyze QR code. Ensure the backend is running and pyzbar dependencies are met (or mock is active).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <RevealOnScroll>
        <div className="flex items-center gap-3 mb-2">
          <QrCode className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">QR Code Threat Scanner</h1>
        </div>
        <p className="text-slate-400">Upload a QR code image to decode and analyze its embedded payload for malicious URLs and phishing vectors before scanning it with your phone.</p>
      </RevealOnScroll>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <RevealOnScroll delay={0.1}>
          <div className="glass-card p-6 flex flex-col h-full min-h-[400px]">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload QR Image
            </h2>

            <div 
              className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${preview ? 'border-primary/50 bg-primary/5' : 'border-slate-700 hover:border-primary/50'}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
              
              {preview ? (
                <div className="relative w-full h-full min-h-[200px] flex items-center justify-center">
                  <img src={preview} alt="QR Preview" className="max-h-[250px] object-contain rounded-lg shadow-lg" />
                  {loading && (
                    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
                      <Scan className="w-12 h-12 text-primary animate-pulse mb-2" />
                      <div className="text-sm font-mono text-primary animate-pulse">DECODING MATRIX...</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 py-12">
                  <QrCode className="w-16 h-16 mb-4 opacity-50" />
                  <p className="font-semibold text-slate-300">Click or Drag & Drop</p>
                  <p className="text-sm">PNG, JPG, WEBP</p>
                </div>
              )}
            </div>

            <button
              onClick={analyzeQR}
              disabled={!file || loading}
              className="mt-6 w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-secondary text-background hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Activity className="w-5 h-5 animate-spin" /> : <Scan className="w-5 h-5" />}
              Scan Payload
            </button>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2} direction="left">
          <div className="glass-card p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Scan className="w-5 h-5 text-primary" />
              Analysis Results
            </h2>

            {!result && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                <AlertTriangle className="w-12 h-12 opacity-20" />
                <p>Upload a QR code to view the extracted intelligence.</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-surface/50 border border-border">
                  <div className="text-sm text-slate-400 mb-1">Decoded Payload</div>
                  <div className="font-mono text-primary text-sm break-all bg-black/30 p-3 rounded border border-primary/20">
                    {result.decoded_url || "NONE - No URL found in QR"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-700 bg-surface/30">
                    <div className="text-sm text-slate-400">Risk Score</div>
                    <div className={`text-3xl font-bold ${result.risk_score > 70 ? 'text-danger' : (result.risk_score > 30 ? 'text-warning' : 'text-success')}`}>
                      {result.risk_score} <span className="text-sm text-slate-500 font-normal">/ 100</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-700 bg-surface/30">
                    <div className="text-sm text-slate-400">Verdict</div>
                    <div className={`text-xl font-bold ${result.verdict === 'HIGH RISK' ? 'text-danger' : (result.verdict === 'SUSPICIOUS' ? 'text-warning' : 'text-success')}`}>
                      {result.verdict}
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl flex items-start gap-3 border ${result.verdict === 'HIGH RISK' ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-success/10 border-success/20 text-success'}`}>
                  {result.verdict === 'HIGH RISK' ? <ShieldAlert className="w-6 h-6 shrink-0" /> : <ShieldCheck className="w-6 h-6 shrink-0" />}
                  <div>
                    <h3 className="font-semibold">{result.message}</h3>
                    <p className="text-sm opacity-80 mt-1">
                      {result.verdict === 'HIGH RISK' 
                        ? 'This QR code contains highly suspicious elements or known malicious patterns. Do not scan with your personal device.'
                        : 'The extracted data does not match our current threat signatures, but always exercise caution before providing credentials.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
