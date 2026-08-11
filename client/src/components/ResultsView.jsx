import React from 'react';
import { Target, Users, AlertCircle, ArrowRight, Zap, CheckCircle2, ChevronRight } from 'lucide-react';

const ResultsView = ({ result }) => {
  if (!result) return null;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Analysis Section */}
      <section className="glass-panel p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-6 text-blue-400 flex items-center gap-2">
          <Target className="text-blue-500" /> Prompt Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
              <h4 className="text-sm font-semibold text-gray-400 mb-1">Objective</h4>
              <p className="text-gray-200">{result.analysis?.objective}</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
              <h4 className="text-sm font-semibold text-gray-400 mb-1 flex items-center gap-2">
                <Users size={16} /> Audience & Tone
              </h4>
              <p className="text-gray-200">{result.analysis?.audience} • {result.analysis?.tone}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-red-900/20 p-4 rounded-lg border border-red-900/50">
              <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                <AlertCircle size={16} /> Weaknesses Identified
              </h4>
              <ul className="list-disc pl-5 text-gray-300 text-sm space-y-1">
                {result.analysis?.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {result.improvements && result.improvements.length > 0 && (
          <div className="mt-4 bg-green-900/20 p-4 rounded-lg border border-green-900/50">
            <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
              <CheckCircle2 size={16} /> Key Improvements Made
            </h4>
            <ul className="list-disc pl-5 text-gray-300 text-sm space-y-1">
              {result.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
            </ul>
          </div>
        )}
      </section>

      {/* Prompts Comparison */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 border-t-4 border-t-gray-600">
          <h3 className="text-lg font-bold mb-4 text-gray-300 flex justify-between items-center">
            Original Prompt
            <span className="text-2xl font-black text-gray-500">{result.promptScores?.original}/100</span>
          </h3>
          <div className="bg-gray-900/80 p-4 rounded-lg text-gray-300 font-mono text-sm whitespace-pre-wrap min-h-[150px]">
            {result.originalPrompt}
          </div>
        </div>

        <div className="glass-panel p-6 border-t-4 border-t-blue-500 relative">
          <div className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-blue-600 rounded-full p-1 shadow-lg shadow-blue-500/50 text-white">
            <ArrowRight size={20} />
          </div>
          <h3 className="text-lg font-bold mb-4 text-blue-400 flex justify-between items-center">
            Optimized Prompt
            <span className="text-2xl font-black text-green-400 flex items-center gap-2">
              {result.promptScores?.optimized}/100
              <span className="text-sm font-normal text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                +{result.promptScores?.improvement} pts
              </span>
            </span>
          </h3>
          <div className="bg-gray-900/80 p-4 rounded-lg text-blue-100 font-mono text-sm whitespace-pre-wrap min-h-[150px] border border-blue-500/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]">
            {result.optimizedPrompt}
          </div>
        </div>
      </section>

      {/* Responses Comparison */}
      <section className="glass-panel p-6 shadow-xl border border-gray-700/50">
        <h3 className="text-xl font-bold mb-6 text-purple-400 flex items-center gap-2">
          <Zap className="text-purple-500" /> Response Comparison
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-400 flex justify-between">
              Original Response
            </h4>
            <div className="bg-gray-900 p-5 rounded-lg text-gray-300 text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto border border-gray-800 custom-scrollbar">
              {result.originalResponse}
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-purple-400 flex justify-between items-center">
              Optimized Response
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Score: {result.responseComparison?.optimizedScore || 'N/A'}</span>
            </h4>
            <div className="bg-gray-900 p-5 rounded-lg text-gray-200 text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto border border-purple-500/30 custom-scrollbar relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500 rounded-l-lg"></div>
              {result.optimizedResponse}
            </div>
          </div>
        </div>

        {/* Evaluation Summary */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">AI Evaluation Summary</h4>
          <p className="text-gray-300 mb-6 italic border-l-2 border-purple-500 pl-4">{result.responseComparison?.overall}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            {[
              { label: 'Relevance', val: result.responseComparison?.relevance },
              { label: 'Completeness', val: result.responseComparison?.completeness },
              { label: 'Structure', val: result.responseComparison?.structure },
              { label: 'Instructions', val: result.responseComparison?.instructionFollowing },
              { label: 'Coverage', val: result.responseComparison?.requirementCoverage }
            ].map((metric, i) => (
              <div key={i} className="bg-gray-800 p-3 rounded text-center border border-gray-700 hover:border-gray-500 transition-colors">
                <span className="block text-gray-400 text-xs mb-1 uppercase tracking-wider">{metric.label}</span>
                <span className="text-gray-200 font-medium truncate block" title={metric.val}>{metric.val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default ResultsView;
