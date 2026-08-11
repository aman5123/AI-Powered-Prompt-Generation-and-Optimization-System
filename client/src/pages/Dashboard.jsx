import React, { useState } from 'react';
import PromptInput from '../components/PromptInput';
import ResultsView from '../components/ResultsView';
import { api } from '../services/api';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleOptimize = async (prompt) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.processPrompt(prompt);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'An error occurred while processing the prompt.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-6rem)] pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="text-center mb-12 relative z-10">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium tracking-wide">
          Next-Gen Prompt Engineering
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
          AI-Powered <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent animate-gradient-x">Optimization</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
          Elevate your interactions with AI. Enter a basic prompt and let our system analyze, optimize, and evaluate the results side-by-side to dramatically improve AI outputs.
        </p>
      </div>

      <div className="relative z-10">
        <PromptInput onSubmit={handleOptimize} isLoading={isLoading} />
      </div>

      {error && (
        <div className="max-w-4xl mx-auto mb-8 bg-red-900/40 border-l-4 border-red-500 text-red-200 px-6 py-4 rounded-r-lg shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-semibold tracking-wide">Error: {error}</p>
          </div>
          <p className="text-sm mt-2 text-red-300 ml-9">Please make sure the backend server is running and your Gemini API key is valid.</p>
        </div>
      )}

      {result && <ResultsView result={result} />}
    </div>
  );
};

export default Dashboard;
