import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, Info } from 'lucide-react';
import { parseNaturalLanguageToQR } from '../services/geminiService';
import { AIResponse } from '../types';

interface AIPanelProps {
  onSuccess: (result: AIResponse) => void;
}

const AIPanel: React.FC<AIPanelProps> = ({ onSuccess }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await parseNaturalLanguageToQR(prompt);
      onSuccess(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "WiFi for GuestNetwork password secret123",
    "Contact card for Jane Doe, CEO at TechCorp, 555-0123",
    "Calendar event for Birthday Party next Saturday at 8pm",
    "Email support@myapp.com subject Help body App is crashing"
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
        <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white mt-1">
                <Sparkles size={20} />
            </div>
            <div>
                <h3 className="font-semibold text-indigo-900">AI Magic Mode</h3>
                <p className="text-sm text-indigo-700 mt-1">
                    Don't know the format? Just describe what you want. Gemini will figure out the technical details (WiFi, vCard, iCal, etc.) for you.
                </p>
            </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Create a wifi code for my home network named Linksys with password 123456'"
          className="w-full h-32 p-4 pr-12 text-slate-700 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all shadow-sm"
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="absolute bottom-4 right-4 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
        </button>
      </form>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <Info size={16} /> {error}
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Try asking for:</p>
        <div className="flex flex-col gap-2">
            {suggestions.map((s, i) => (
                <button 
                    key={i}
                    onClick={() => setPrompt(s)}
                    className="text-left text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-100"
                >
                    "{s}"
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
