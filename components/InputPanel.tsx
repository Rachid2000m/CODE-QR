import React from 'react';
import { QRConfig, QRCodeErrorCorrectionLevel } from '../types';

interface InputPanelProps {
  config: QRConfig;
  onChange: (newConfig: QRConfig) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ config, onChange }) => {
  
  const handleChange = (key: keyof QRConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-6">
      
      {/* Content Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
            Content
        </label>
        <textarea
            value={config.value}
            onChange={(e) => handleChange('value', e.target.value)}
            placeholder="Enter text or URL here..."
            className="w-full h-32 p-3 text-slate-700 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y transition-shadow"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colors */}
        <div className="space-y-4">
             <h4 className="text-sm font-medium text-slate-900 border-b border-slate-100 pb-2">Appearance</h4>
             
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Foreground</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="color" 
                            value={config.fgColor}
                            onChange={(e) => handleChange('fgColor', e.target.value)}
                            className="h-9 w-9 p-1 rounded border border-slate-200 cursor-pointer"
                        />
                        <span className="text-xs text-slate-500 font-mono">{config.fgColor}</span>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Background</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="color" 
                            value={config.bgColor}
                            onChange={(e) => handleChange('bgColor', e.target.value)}
                            className="h-9 w-9 p-1 rounded border border-slate-200 cursor-pointer"
                        />
                        <span className="text-xs text-slate-500 font-mono">{config.bgColor}</span>
                    </div>
                </div>
             </div>
        </div>

        {/* Technical Settings */}
        <div className="space-y-4">
             <h4 className="text-sm font-medium text-slate-900 border-b border-slate-100 pb-2">Settings</h4>
             
             <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                    Error Correction Level
                </label>
                <select 
                    value={config.level}
                    onChange={(e) => handleChange('level', e.target.value)}
                    className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
                >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                </select>
             </div>

             <div className="flex items-center justify-between pt-2">
                 <label className="text-sm text-slate-600">Include Margin</label>
                 <button 
                    onClick={() => handleChange('includeMargin', !config.includeMargin)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${config.includeMargin ? 'bg-primary-600' : 'bg-slate-200'}`}
                 >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${config.includeMargin ? 'translate-x-5' : ''}`} />
                 </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default InputPanel;
