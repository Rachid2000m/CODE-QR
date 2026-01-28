import React, { useState, useEffect } from 'react';
import { QrCode, Wand2, History as HistoryIcon, Link, Trash2, X } from 'lucide-react';
import InputPanel from './components/InputPanel';
import QRPreview from './components/QRPreview';
import AIPanel from './components/AIPanel';
import { QRConfig, QRCodeErrorCorrectionLevel, HistoryItem, AIResponse } from './types';

const INITIAL_CONFIG: QRConfig = {
  value: 'https://gemini.google.com',
  size: 1024,
  fgColor: '#000000',
  bgColor: '#ffffff',
  level: QRCodeErrorCorrectionLevel.M,
  includeMargin: true,
};

function App() {
  const [activeTab, setActiveTab] = useState<'standard' | 'ai'>('standard');
  const [config, setConfig] = useState<QRConfig>(INITIAL_CONFIG);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('qr_history');
    if (saved) {
        try {
            setHistory(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to parse history");
        }
    }
  }, []);

  const addToHistory = (cfg: QRConfig, label?: string) => {
    // Avoid duplicates
    if (history.length > 0 && history[0].value === cfg.value) return;

    const newItem: HistoryItem = {
        ...cfg,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        label: label || (cfg.value.length > 30 ? cfg.value.substring(0, 30) + '...' : cfg.value)
    };
    
    const newHistory = [newItem, ...history].slice(0, 50); // Keep last 50
    setHistory(newHistory);
    localStorage.setItem('qr_history', JSON.stringify(newHistory));
  };

  // Debounced history save for manual entry
  useEffect(() => {
    const timer = setTimeout(() => {
        if (config.value) {
            addToHistory(config);
        }
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.value]);

  const handleAIResult = (result: AIResponse) => {
    setConfig(prev => ({ ...prev, value: result.formattedString }));
    addToHistory({ ...config, value: result.formattedString }, `${result.type.toUpperCase()}: ${result.explanation}`);
    // Optional: could switch to preview view if we were strictly in a wizard flow, 
    // but here we just update the preview on the right.
  };

  const loadFromHistory = (item: HistoryItem) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, timestamp, label, ...rest } = item;
    setConfig(rest);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('qr_history');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-primary-600 to-indigo-600 p-2 rounded-lg text-white">
                    <QrCode size={24} />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-indigo-700">
                    GenQR
                </h1>
            </div>
            
            <button 
                onClick={() => setShowHistory(true)}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative"
            >
                <HistoryIcon size={20} />
                {history.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-8rem)] lg:h-[800px]">
            
            {/* Left Column: Controls */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    <button 
                        onClick={() => setActiveTab('standard')}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'standard' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Link size={16} /> Standard
                    </button>
                    <button 
                        onClick={() => setActiveTab('ai')}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'ai' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Wand2 size={16} /> AI Magic
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'standard' ? (
                        <InputPanel config={config} onChange={setConfig} />
                    ) : (
                        <AIPanel onSuccess={handleAIResult} />
                    )}
                </div>
            </div>

            {/* Right Column: Preview */}
            <div className="flex-1 lg:max-w-lg">
                <QRPreview config={config} />
                
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <h3 className="text-blue-900 font-medium mb-1 text-sm">Pro Tip</h3>
                    <p className="text-blue-700 text-xs">
                        {activeTab === 'ai' 
                         ? "Try asking for a 'Contact Card' or 'Event' to see complex formats generated instantly." 
                         : "Ensure high contrast between foreground and background colors for better scannability."}
                    </p>
                </div>
            </div>
        </div>
      </main>

      {/* History Slide-over (Simulated with simple fixed div for this demo) */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
            <div className="relative bg-white w-full max-w-sm h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                        <HistoryIcon size={18} /> History
                    </h2>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={clearHistory}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Clear History"
                        >
                            <Trash2 size={18} />
                        </button>
                        <button 
                            onClick={() => setShowHistory(false)}
                            className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {history.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <HistoryIcon size={48} className="mx-auto mb-3 opacity-20" />
                            <p>No recent codes generated</p>
                        </div>
                    ) : (
                        history.map(item => (
                            <button
                                key={item.id}
                                onClick={() => loadFromHistory(item)}
                                className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-primary-200 hover:shadow-md bg-white transition-all group"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-mono text-slate-400">
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 uppercase tracking-wide">
                                        {item.level}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-slate-700 line-clamp-2 break-all group-hover:text-primary-700">
                                    {item.label || item.value}
                                </p>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;
