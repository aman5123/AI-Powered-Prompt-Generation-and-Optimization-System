import React, { useState } from 'react';
import { Play, Eraser, Loader2 } from 'lucide-react';

const PromptInput = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
    }
  };

  return (
    <div className="glass-panel p-6 mb-8 w-full max-w-4xl mx-auto shadow-xl">
      <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Improve your prompts and compare AI results
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your original prompt here..."
          className="w-full h-40 p-4 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
          disabled={isLoading}
        />
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
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Play size={18} />
            )}
            {isLoading ? 'Processing...' : 'Optimize & Run'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromptInput;
