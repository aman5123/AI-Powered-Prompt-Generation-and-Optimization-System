import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, History, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="glass-panel border-b-0 border-x-0 rounded-none sticky top-0 z-50 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">PromptOptimizer</span>
          </div>
          
          <div className="flex gap-4">
            <Link 
              to="/" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'bg-blue-600/20 text-blue-400' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link 
              to="/history" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                location.pathname === '/history' 
                  ? 'bg-blue-600/20 text-blue-400' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <History size={18} />
              History
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
