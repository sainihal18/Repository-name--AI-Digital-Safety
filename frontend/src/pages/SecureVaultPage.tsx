import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, KeyRound, Database, Copy, Check, Trash2, Download, Upload } from 'lucide-react';
import { api } from '@/services/api';

// ── Web Crypto helpers ──────────────────────────────────────────────────────

async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

async function importKey(base64: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
}

async function encrypt(plaintext: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...new Uint8Array(iv))),
  };
}

async function decrypt(ciphertextB64: string, ivB64: string, key: CryptoKey): Promise<string> {
  const ciphertext = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

// ── Types ───────────────────────────────────────────────────────────────────

interface VaultListEntry {
  id: string;
  label: string;
  stored_at: string;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function SecureVaultPage() {
  const [keyB64, setKeyB64] = useState('');
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [plaintext, setPlaintext] = useState('');
  const [label, setLabel] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [vaultItems, setVaultItems] = useState<VaultListEntry[]>([]);
  const [status, setStatus] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [encrypting, setEncrypting] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [selectedId, setSelectedId] = useState('');

  // Load vault list
  const loadVault = useCallback(async () => {
    try {
      const items = await api.vaultList();
      setVaultItems(items);
    } catch { /* server offline */ }
  }, []);

  useEffect(() => { loadVault(); }, [loadVault]);

  // Generate key
  const handleGenKey = async () => {
    const key = await generateKey();
    const b64 = await exportKey(key);
    setCryptoKey(key);
    setKeyB64(b64);
    setStatus('🔑 New 256-bit AES-GCM key generated (client-side only)');
  };

  // Import key
  const handleImportKey = async () => {
    if (!keyB64) return;
    try {
      const key = await importKey(keyB64);
      setCryptoKey(key);
      setStatus('🔑 Key imported successfully');
    } catch {
      setStatus('❌ Invalid key format');
    }
  };

  // Encrypt & Store
  const handleEncryptStore = async () => {
    if (!cryptoKey || !plaintext) return;
    setEncrypting(true);
    try {
      const { ciphertext, iv } = await encrypt(plaintext, cryptoKey);
      await api.vaultStore({ ciphertext, iv, salt: '', label: label || 'Untitled' });
      setStatus('✅ Encrypted and stored securely. Server never saw your plaintext.');
      setPlaintext('');
      setLabel('');
      loadVault();
    } catch {
      setStatus('❌ Failed to store');
    } finally {
      setEncrypting(false);
    }
  };

  // Retrieve & Decrypt
  const handleRetrieveDecrypt = async (id: string) => {
    if (!cryptoKey) {
      setStatus('⚠️ Import or generate a key first');
      return;
    }
    setDecrypting(true);
    setSelectedId(id);
    try {
      const entry = await api.vaultRetrieve(id);
      const plain = await decrypt(entry.ciphertext, entry.iv, cryptoKey);
      setDecryptedText(plain);
      setStatus(`🔓 Decrypted "${entry.label}" successfully`);
    } catch {
      setDecryptedText('');
      setStatus('❌ Decryption failed — wrong key or corrupted data');
    } finally {
      setDecrypting(false);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    try {
      await api.vaultDelete(id);
      loadVault();
      setStatus('🗑️ Entry deleted');
      if (selectedId === id) {
        setDecryptedText('');
        setSelectedId('');
      }
    } catch {
      setStatus('❌ Delete failed');
    }
  };

  // Copy key
  const copyKey = () => {
    navigator.clipboard.writeText(keyB64);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FF9D] to-[#00F0FF] flex items-center justify-center">
            <Lock className="w-5 h-5 text-background" />
          </div>
          Secure E2EE Vault
        </h1>
        <p className="text-sm text-slate-500 mt-1">Zero-knowledge encryption — your keys never leave the browser</p>
      </div>

      {/* Status */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card px-4 py-2.5 text-sm text-slate-300 border-primary/20"
          >
            {status}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Key Management & Encrypt */}
        <div className="space-y-4">
          {/* Key Management */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" /> Encryption Key
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={keyB64}
                onChange={(e) => setKeyB64(e.target.value)}
                placeholder="Base64 key (generate or paste)"
                className="flex-1 bg-surface-alt/80 border border-border rounded-lg px-3 py-2 text-xs font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-primary/40"
              />
              {keyB64 && (
                <button onClick={copyKey} className="p-2 rounded-lg border border-border hover:border-primary/30 text-slate-500 hover:text-primary transition-colors">
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGenKey}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary to-secondary text-background"
              >
                <KeyRound className="w-3.5 h-3.5" /> Generate New Key
              </button>
              <button
                onClick={handleImportKey}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border text-slate-400 hover:border-primary/30 hover:text-primary transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> Import Key
              </button>
            </div>
            <p className="text-[10px] text-slate-600">
              ⚠️ Save your key! Without it, stored data cannot be decrypted.
            </p>
          </div>

          {/* Encrypt & Store */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-success" /> Encrypt & Store
            </h3>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (e.g., API Key, Password)"
              className="w-full bg-surface-alt/80 border border-border rounded-lg px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-primary/40"
            />
            <textarea
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="Enter plaintext to encrypt..."
              rows={4}
              className="w-full bg-surface-alt/80 border border-border rounded-xl px-4 py-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-primary/40 resize-none font-mono"
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEncryptStore}
              disabled={!cryptoKey || !plaintext || encrypting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-success to-primary text-background disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {encrypting ? 'Encrypting...' : <><Lock className="w-4 h-4" /> Encrypt & Store</>}
            </motion.button>
          </div>
        </div>

        {/* Right: Vault & Decrypt */}
        <div className="space-y-4">
          {/* Vault Items */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-accent" /> Stored Entries ({vaultItems.length})
            </h3>
            <div className="max-h-[200px] overflow-y-auto space-y-2">
              {vaultItems.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-4">No entries yet. Encrypt something to get started.</p>
              ) : (
                vaultItems.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${selectedId === item.id ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/20 hover:bg-surface-hover/30'}`}
                    onClick={() => handleRetrieveDecrypt(item.id)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-slate-300 font-medium truncate">{item.label}</p>
                      <p className="text-[10px] text-slate-600 font-mono">{new Date(item.stored_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRetrieveDecrypt(item.id); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Decrypt"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-danger hover:bg-danger/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Decrypted Output */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Unlock className="w-4 h-4 text-warning" /> Decrypted Output
            </h3>
            {decrypting ? (
              <div className="p-4 rounded-xl bg-surface-alt/60 text-center">
                <motion.div
                  className="text-sm font-mono text-primary"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  Decrypting...
                </motion.div>
              </div>
            ) : decryptedText ? (
              <div className="relative">
                <pre className="p-4 rounded-xl bg-surface-alt/60 text-sm font-mono text-success whitespace-pre-wrap break-all max-h-[200px] overflow-y-auto">
                  {decryptedText}
                </pre>
                <button
                  onClick={() => { navigator.clipboard.writeText(decryptedText); }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-surface-alt/40 text-center text-xs text-slate-600">
                Click an entry above to decrypt it with your key
              </div>
            )}
          </div>

          {/* Architecture Note */}
          <div className="glass-card p-4 border-success/20">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <div className="text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-400">Zero-Knowledge Architecture</p>
                <p>All encryption/decryption happens in your browser using the Web Crypto API (AES-GCM 256-bit). The server only stores ciphertext — your key and plaintext never leave this page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
