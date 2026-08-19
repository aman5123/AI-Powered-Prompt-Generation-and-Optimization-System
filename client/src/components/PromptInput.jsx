import React, { useState, useEffect } from 'react';
import { Play, Eraser, Loader2, Sparkles, Cpu } from 'lucide-react';
import { activeProvider, activeModel } from './Navbar';

const PROVIDER_COLORS = {
  gemini:     { color: '#4285F4', icon: '✦', label: 'Gemini' },
  openrouter: { color: '#6C47FF', icon: '⟁', label: 'OpenRouter' },
  groq:       { color: '#F55036', icon: '⚡', label: 'Groq' },
  mistral:    { color: '#FF7000', icon: '◈', label: 'Mistral' },
  cohere:     { color: '#39D5AA', icon: '◎', label: 'Cohere' },
};

const PromptInput = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  // Re-render every second so the active provider chip stays in sync
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) onSubmit(prompt);
  };

  const provider = activeProvider;
  const modelMap = activeModel || {};
  const selectedModel = provider ? modelMap[provider] : null;
  const providerMeta = provider ? PROVIDER_COLORS[provider] : null;

  const charCount = prompt.length;
  const wordCount = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;

  return (
    <div className="glass-panel p-6 mb-8 w-full max-w-4xl mx-auto shadow-xl" style={{ position: 'relative' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Improve your prompts and compare AI results
        </h2>

        {/* Active provider chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 20, flexShrink: 0,
          background: providerMeta ? `${providerMeta.color}15` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${providerMeta ? `${providerMeta.color}40` : 'rgba(255,255,255,0.08)'}`,
        }}>
          <Cpu size={13} style={{ color: providerMeta?.color || '#6b7280' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: providerMeta?.color || '#6b7280' }}>
            {providerMeta
              ? `${providerMeta.icon} ${providerMeta.label}${selectedModel ? ` · ${selectedModel.split('/').pop().slice(0, 20)}` : ''}`
              : '🔄 Auto-Fallback'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div style={{ position: 'relative' }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e); }}
            placeholder="Enter your original prompt here… (Ctrl+Enter to submit)"
            className="w-full h-40 p-4 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
            disabled={isLoading}
          />
          {/* char/word counter */}
          <div style={{
            position: 'absolute', bottom: 10, right: 12,
            fontSize: 11, color: '#4b5563',
            display: 'flex', gap: 8,
          }}>
            <span>{wordCount} words</span>
            <span>·</span>
            <span>{charCount} chars</span>
          </div>
        </div>

        {/* Example prompts */}
        {!prompt && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#6b7280', alignSelf: 'center' }}>Try:</span>
            {[
              'Write a blog post about AI',
              'Summarize this article for me',
              'Help me debug my Python code',
            ].map(ex => (
              <button
                key={ex}
                type="button"
                onClick={() => setPrompt(ex)}
                style={{
                  fontSize: 12, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#9ca3af', transition: 'all 0.15s',
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setPrompt('')}
            disabled={isLoading || !prompt}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Eraser size={18} />
            Clear
          </button>
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Optimize &amp; Run
              </>
            )}
          </button>
        </div>
      </form>

      {/* Loading overlay shimmer */}
      {isLoading && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden',
          background: 'rgba(15,17,26,0.5)', backdropFilter: 'blur(2px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid rgba(59,130,246,0.15)',
            borderTopColor: '#3b82f6',
            animation: 'spin 0.8s linear infinite',
          }} />
          <div style={{ color: '#9ca3af', fontSize: 14, fontWeight: 500 }}>
            {providerMeta ? `Calling ${providerMeta.label}…` : 'Finding best provider…'}
          </div>
          <div style={{ color: '#4b5563', fontSize: 12 }}>This may take 10–30 seconds</div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default PromptInput;
