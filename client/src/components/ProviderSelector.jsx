import React, { useState, useEffect, useCallback } from 'react';
import { X, RefreshCw, Zap, CheckCircle2, Clock, AlertCircle, ChevronDown, Globe, Settings2 } from 'lucide-react';
import { api } from '../services/api';

// ─── Provider brand colours & icons ──────────────────────────────────────────
const PROVIDER_META = {
  gemini:      { label: 'Google Gemini',  color: '#4285F4', bg: 'rgba(66,133,244,0.12)',  icon: '✦' },
  openrouter:  { label: 'OpenRouter',     color: '#6C47FF', bg: 'rgba(108,71,255,0.12)',  icon: '⟁' },
  groq:        { label: 'Groq',           color: '#F55036', bg: 'rgba(245,80,54,0.12)',   icon: '⚡' },
  mistral:     { label: 'Mistral AI',     color: '#FF7000', bg: 'rgba(255,112,0,0.12)',   icon: '◈' },
  cohere:      { label: 'Cohere',         color: '#39D5AA', bg: 'rgba(57,213,170,0.12)',  icon: '◎' },
};

const STATUS_CONFIG = {
  active:        { icon: CheckCircle2, label: 'Active',        color: '#22d3ee',  dot: '#22d3ee' },
  cooling:       { icon: Clock,        label: 'Cooling Down',  color: '#f59e0b',  dot: '#f59e0b' },
  unconfigured:  { icon: AlertCircle,  label: 'Not Configured',color: '#6b7280',  dot: '#6b7280' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusDot({ status, pulse }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unconfigured;
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 10, height: 10 }}>
      {pulse && status === 'active' && (
        <span style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: cfg.dot, opacity: 0.4,
          animation: 'ps-ping 1.5s ease-out infinite',
        }} />
      )}
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.dot, display: 'block' }} />
    </span>
  );
}

function ModelDropdown({ models, value, onChange, disabled }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: '100%', padding: '6px 28px 6px 10px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, color: disabled ? '#6b7280' : '#e5e7eb',
          fontSize: 12, appearance: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
        }}
      >
        {models.map(m => (
          <option key={m.id} value={m.id} style={{ background: '#1a1a2e' }}>{m.label}</option>
        ))}
      </select>
      <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
    </div>
  );
}

function ProviderCard({ provider, isSelected, selectedModel, onSelect, onModelChange }) {
  const meta = PROVIDER_META[provider.name] || { label: provider.name, color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: '◯' };
  const statusCfg = STATUS_CONFIG[provider.status] || STATUS_CONFIG.unconfigured;
  const StatusIcon = statusCfg.icon;
  const isActive = provider.status === 'active';

  return (
    <div
      onClick={() => isActive && onSelect(provider.name)}
      style={{
        borderRadius: 14,
        border: `1.5px solid ${isSelected ? meta.color : 'rgba(255,255,255,0.08)'}`,
        background: isSelected ? meta.bg : 'rgba(255,255,255,0.03)',
        padding: '14px 16px',
        cursor: isActive ? 'pointer' : 'default',
        opacity: provider.status === 'unconfigured' ? 0.5 : 1,
        transition: 'all 0.2s ease',
        boxShadow: isSelected ? `0 0 16px ${meta.color}30` : 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${meta.color}30, ${meta.color}10)`,
          border: `1px solid ${meta.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: meta.color, fontWeight: 700, flexShrink: 0,
        }}>{meta.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#f3f4f6', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            {meta.label}
            {isSelected && <span style={{ fontSize: 10, background: meta.color, color: '#000', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>PRIMARY</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <StatusIcon size={11} style={{ color: statusCfg.color }} />
            <span style={{ fontSize: 11, color: statusCfg.color }}>
              {statusCfg.label}
              {provider.status === 'cooling' && provider.resetsIn != null ? ` — ${provider.resetsIn}s` : ''}
            </span>
          </div>
        </div>
        <StatusDot status={provider.status} pulse={true} />
      </div>

      {/* Model selector */}
      {provider.models?.length > 0 && (
        <div onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Model</div>
          <ModelDropdown
            models={provider.models}
            value={selectedModel || provider.defaultModel}
            onChange={val => onModelChange(provider.name, val)}
            disabled={provider.status === 'unconfigured'}
          />
        </div>
      )}

      {/* Last error */}
      {provider.lastError && (
        <div style={{ marginTop: 8, padding: '6px 8px', background: 'rgba(239,68,68,0.08)', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ fontSize: 10, color: '#f87171', wordBreak: 'break-word' }}>
            ⚠ {provider.lastError.slice(0, 120)}{provider.lastError.length > 120 ? '…' : ''}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function ProviderSelector({ isOpen, onClose, selectedProvider, selectedModel, onProviderChange, onModelChange, autoFallback, onAutoFallbackChange }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProviderStatus();
      setProviders(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch provider status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on open; auto-refresh every 30 s
  useEffect(() => {
    if (!isOpen) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [isOpen, fetchStatus]);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await api.testConnection();
      setTestResult({ ok: true, msg: `✅ ${result.provider} / ${result.model} — "${result.response}"` });
    } catch (err) {
      setTestResult({ ok: false, msg: `❌ ${err.response?.data?.details || err.message}` });
    } finally {
      setTesting(false);
    }
  };

  const activeCount = providers.filter(p => p.status === 'active').length;
  const coolingCount = providers.filter(p => p.status === 'cooling').length;

  if (!isOpen) return null;

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes ps-ping { 0%{transform:scale(1);opacity:.4} 70%{transform:scale(2.5);opacity:0} 100%{transform:scale(2.5);opacity:0} }
        @keyframes ps-slide-in { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
        .ps-panel::-webkit-scrollbar{width:4px} .ps-panel::-webkit-scrollbar-track{background:transparent} .ps-panel::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 999 }}
      />

      {/* Panel */}
      <div
        className="ps-panel"
        style={{
          position: 'fixed', top: 0, right: 0, height: '100vh', width: 400,
          background: 'linear-gradient(180deg, #0f0f1a 0%, #0a0a14 100%)',
          border: '1px solid rgba(255,255,255,0.08)', borderRight: 'none',
          zIndex: 1000, overflowY: 'auto',
          animation: 'ps-slide-in 0.25s ease',
          boxShadow: '-16px 0 48px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: '#0f0f1a', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: 'linear-gradient(135deg,#6c47ff,#4285f4)', borderRadius: 10, padding: 8 }}>
                <Settings2 size={18} color="#fff" />
              </div>
              <div>
                <div style={{ color: '#f3f4f6', fontWeight: 700, fontSize: 16 }}>AI Provider Settings</div>
                <div style={{ color: '#6b7280', fontSize: 12 }}>
                  {activeCount} active · {coolingCount} cooling
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>

          {/* Auto-fallback toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(108,71,255,0.08)', borderRadius: 10, border: '1px solid rgba(108,71,255,0.2)' }}>
            <div>
              <div style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 600 }}>🔄 Auto-Fallback</div>
              <div style={{ color: '#9ca3af', fontSize: 11 }}>Try next provider if one fails</div>
            </div>
            <button
              onClick={() => onAutoFallbackChange(!autoFallback)}
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: autoFallback ? '#6c47ff' : 'rgba(255,255,255,0.1)',
                border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute', top: 2, left: autoFallback ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', display: 'block',
              }} />
            </button>
          </div>
        </div>

        {/* Provider cards */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Providers — Priority Order
            </div>
            <button
              onClick={fetchStatus}
              disabled={loading}
              style={{ background: 'none', border: 'none', cursor: loading ? 'default' : 'pointer', color: '#6b7280', padding: 4, display: 'flex' }}
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>

          {providers.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280', fontSize: 13 }}>
              Could not reach server. Make sure it's running.
            </div>
          )}

          {providers.map(provider => (
            <ProviderCard
              key={provider.name}
              provider={provider}
              isSelected={!autoFallback && selectedProvider === provider.name}
              selectedModel={selectedModel[provider.name] || provider.defaultModel}
              onSelect={(name) => {
                onAutoFallbackChange(false);
                onProviderChange(name);
              }}
              onModelChange={onModelChange}
            />
          ))}
        </div>

        {/* Free API Guide */}
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ padding: '14px', background: 'rgba(57,213,170,0.06)', borderRadius: 12, border: '1px solid rgba(57,213,170,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Globe size={14} color="#39d5aa" />
              <span style={{ color: '#39d5aa', fontSize: 12, fontWeight: 700 }}>Get Free API Keys</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { name: 'Gemini', url: 'https://aistudio.google.com/', note: '1.5k req/day' },
                { name: 'OpenRouter', url: 'https://openrouter.ai/', note: '300+ free models' },
                { name: 'Groq', url: 'https://console.groq.com/', note: '1k req/day, ultra-fast' },
                { name: 'Mistral', url: 'https://console.mistral.ai/', note: 'Experiment plan' },
                { name: 'Cohere', url: 'https://dashboard.cohere.com/', note: '1k calls/month' },
              ].map(item => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', textDecoration: 'none', fontSize: 12, padding: '3px 0' }}
                >
                  <span style={{ color: '#d1d5db' }}>→ {item.name}</span>
                  <span style={{ color: '#6b7280' }}>{item.note}</span>
                </a>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#6b7280' }}>
              Add keys to <code style={{ color: '#9ca3af', background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: 3 }}>server/.env</code> and restart the server.
            </div>
          </div>
        </div>

        {/* Test button + result */}
        <div style={{ padding: '0 20px 24px' }}>
          <button
            onClick={handleTest}
            disabled={testing}
            style={{
              width: '100%', padding: '11px', borderRadius: 10, border: 'none',
              background: testing ? 'rgba(108,71,255,0.3)' : 'linear-gradient(135deg,#6c47ff,#4285f4)',
              color: '#fff', fontWeight: 600, fontSize: 14, cursor: testing ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'opacity 0.2s',
            }}
          >
            <Zap size={16} />
            {testing ? 'Testing connection…' : 'Test Active Provider'}
          </button>

          {testResult && (
            <div style={{
              marginTop: 10, padding: '10px 12px', borderRadius: 8,
              background: testResult.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${testResult.ok ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
              fontSize: 12, color: testResult.ok ? '#86efac' : '#fca5a5',
              wordBreak: 'break-word',
            }}>
              {testResult.msg}
            </div>
          )}

          {lastRefresh && (
            <div style={{ marginTop: 8, textAlign: 'center', color: '#374151', fontSize: 11 }}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Spin keyframe for refresh icon */}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
