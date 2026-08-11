import React, { useState, useEffect } from 'react';
import { Trash2, Search, Calendar, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

const History = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

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
    if (window.confirm('Are you sure you want to delete this record?')) {
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
          <p className="text-gray-400">View your previous prompts and their improvements.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 glass-panel overflow-hidden h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading history...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No history found.</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filteredHistory.map((item) => (
                <div 
                  key={item._id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 cursor-pointer hover:bg-gray-800/50 transition-colors ${
                    selectedItem?._id === item._id ? 'bg-blue-900/20 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                  }`}
                >
                  <p className="text-sm text-gray-300 line-clamp-2 mb-2 font-medium">
                    {item.originalPrompt}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
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

        <div className="lg:col-span-2">
          {selectedItem ? (
            <div className="glass-panel p-6 h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar">
              <h3 className="text-xl font-bold text-white mb-6">Optimization Details</h3>
              
              <div className="space-y-6">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm mb-1">Prompt Score Improvement</p>
                    <p className="text-2xl font-bold text-green-400">+{selectedItem.promptScores?.improvement || 0}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm mb-1">Response Improvement</p>
                    <p className="text-2xl font-bold text-purple-400">+{selectedItem.responseImprovement || 0}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Key Improvements</h4>
                  <ul className="list-disc pl-5 text-gray-300 text-sm space-y-1">
                    {selectedItem.improvements?.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
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
