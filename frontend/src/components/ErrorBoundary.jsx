import React from 'react';
import { FaExclamationTriangle, FaHome, FaRedo } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="max-w-md w-full glass p-8 rounded-[2.5rem] border border-white/10 text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FaExclamationTriangle size={40} />
            </div>
            
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">
              Something went wrong
            </h2>
            
            <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
              We encountered an unexpected error while rendering this page. Our team has been notified.
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-gray-200 transition-all"
              >
                <FaRedo size={12} /> Refresh Page
              </button>
              
              <a 
                href="/"
                className="w-full bg-white/5 text-white border border-white/10 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
              >
                <FaHome size={12} /> Return Home
              </a>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-red-500/5 rounded-xl border border-red-500/10 text-left overflow-auto max-h-40">
                <p className="text-red-500 font-mono text-[10px] whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
