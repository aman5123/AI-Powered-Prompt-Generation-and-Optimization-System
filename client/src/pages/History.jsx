import React, { useState, useEffect } from 'react';
import { Trash2, Search, Calendar, ChevronRight, Cpu } from 'lucide-react';
import { api } from '../services/api';

const PROVIDER_COLORS = {
  gemini:     { color: '#4285F4', icon: '✦' },
  openrouter: { color: '#6C47FF', icon: '⟁' },
  groq:       { color: '#F55036', icon: '⚡' },
  mistral:    { color: '#FF7000', icon: '◈' },
  cohere:     { color: '#39D5AA', icon: '◎' },
  auto:       { color: '#6b7280', icon: '🔄' },
};

function ProviderChip({ provider }) {
  if (!provider) return null;
  const meta = PROVIDER_COLORS[provider] || PROVIDER_COLORS.auto;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 10,
      background: `${meta.color}18`, border: `1px solid ${meta.color}35`,
      fontSize: 10, fontWeight: 600, color: meta.color,
    }}>
      {meta.icon} {provider}
    </span>
  );
}

const History = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const data = await api.getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this record?')) {
      try {
        await api.deleteHistoryItem(id);
        setHistory(history.filter(item => item._id !== id));
        if (selectedItem?._id === id) setSelectedItem(null);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const filteredHistory = history.filter(item =>
    item.originalPrompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Optimization History</h1>
          <p className="text-gray-400">
            {history.length} optimization{history.length !== 1 ? 's' : ''} saved this session.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search prompts…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List pane */}
        <div className="lg:col-span-1 glass-panel overflow-hidden h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading history…</div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No matches found.' : 'No history yet. Optimize a prompt to get started!'}
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filteredHistory.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 cursor-pointer hover:bg-gray-800/50 transition-colors ${
                    selectedItem?._id === item._id
                      ? 'bg-blue-900/20 border-l-4 border-blue-500'
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  <p className="text-sm text-gray-300 line-clamp-2 mb-2 font-medium">
                    {item.originalPrompt}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      {item.aiProvider && <ProviderChip provider={item.aiProvider} />}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-green-400">+{item.promptScores?.improvement || 0} pts</span>
                      <button
                        onClick={(e) => handleDelete(e, item._id)}
                        className="text-gray-600 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail pane */}
        <div className="lg:col-span-2">
          {selectedItem ? (
            <div className="glass-panel p-6 h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar">
              {/* Header with provider info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <h3 className="text-xl font-bold text-white">Optimization Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {selectedItem.aiProvider && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Cpu size={12} style={{ color: '#6b7280' }} />
                      <span style={{ fontSize: 11, color: '#6b7280' }}>via</span>
                      <ProviderChip provider={selectedItem.aiProvider} />
                    </div>
                  )}
                  {selectedItem.aiModel && selectedItem.aiModel !== 'auto' && (
                    <span style={{ fontSize: 10, color: '#4b5563' }}>{selectedItem.aiModel}</span>
                  )}
                  <span style={{ fontSize: 11, color: '#4b5563' }}>
                    {new Date(selectedItem.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {/* Scores */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Original Score', val: selectedItem.promptScores?.original, color: '#6b7280' },
                    { label: 'Optimized Score', val: selectedItem.promptScores?.optimized, color: '#22d3ee' },
                    { label: 'Improvement', val: `+${selectedItem.promptScores?.improvement || 0}`, color: '#4ade80' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ color: s.color, fontSize: 24, fontWeight: 800 }}>{s.val}</div>
                      <div style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Original Prompt</h4>
                  <div className="bg-gray-900 p-4 rounded-lg text-gray-300 font-mono text-sm whitespace-pre-wrap">
                    {selectedItem.originalPrompt}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-blue-400 mb-2">Optimized Prompt</h4>
                  <div className="bg-gray-900 p-4 rounded-lg text-blue-100 font-mono text-sm whitespace-pre-wrap border border-blue-900">
                    {selectedItem.optimizedPrompt}
                  </div>
                </div>

                {selectedItem.improvements?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-green-400 mb-2">Key Improvements</h4>
                    <ul className="list-disc pl-5 text-gray-300 text-sm space-y-1">
                      {selectedItem.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                    </ul>
                  </div>
                )}

                {selectedItem.responseComparison?.overall && (
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-semibold text-purple-400 mb-2">AI Evaluation</h4>
                    <p className="text-gray-300 text-sm italic border-l-2 border-purple-500 pl-3">
                      {selectedItem.responseComparison.overall}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 h-[calc(100vh-16rem)] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <ChevronRight size={48} className="mx-auto mb-4 opacity-20" />
                <p>Select a history item to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
