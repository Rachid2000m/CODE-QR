import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Share2, Copy, Check } from 'lucide-react';
import { QRConfig } from '../types';

interface QRPreviewProps {
  config: QRConfig;
}

const QRPreview: React.FC<QRPreviewProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate QR code whenever config changes
    const generateQR = async () => {
      if (!canvasRef.current) return;
      
      try {
        // We render to a hidden canvas first to get the data URL
        const options: QRCode.QRCodeToDataURLOptions = {
          width: config.size,
          margin: config.includeMargin ? 4 : 0,
          color: {
            dark: config.fgColor,
            light: config.bgColor,
          },
          errorCorrectionLevel: config.level,
        };

        // Render to the ref canvas directly
        await QRCode.toCanvas(canvasRef.current, config.value || ' ', options);
        
        // Also generate data URL for download buttons if needed, 
        // strictly speaking toCanvas draws it, but toDataURL gives us the PNG string easily.
        const url = await QRCode.toDataURL(config.value || ' ', options);
        setDataUrl(url);

      } catch (err) {
        console.error("Error generating QR:", err);
      }
    };

    generateQR();
  }, [config]);

  const handleDownload = (ext: 'png' | 'svg') => {
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.${ext}`;
    
    if (ext === 'png') {
        link.href = dataUrl;
        link.click();
    } else {
        // For SVG we need to regenerate as string
        QRCode.toString(config.value || ' ', {
            type: 'svg',
            width: config.size,
            margin: config.includeMargin ? 4 : 0,
            color: {
                dark: config.fgColor,
                light: config.bgColor,
            },
            errorCorrectionLevel: config.level,
        }, (err, string) => {
            if (err) return;
            const blob = new Blob([string], {type: 'image/svg+xml'});
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
    }
  };

  const copyToClipboard = async () => {
    try {
        // Convert base64 to blob to copy as image
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob
            })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    } catch (err) {
        console.error("Failed to copy", err);
        // Fallback or alert
        alert("Clipboard access denied or not supported.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 h-full min-h-[400px]">
      <div className="relative group">
        <canvas 
            ref={canvasRef} 
            className="max-w-full h-auto shadow-lg rounded-lg border border-slate-100"
            style={{ maxHeight: '400px' }}
        />
        {/* Overlay prompt if empty */}
        {!config.value && (
             <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 text-slate-500 font-medium">
                Type to generate
             </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-[300px]">
        <button 
            onClick={() => handleDownload('png')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
            <Download size={16} /> PNG
        </button>
        <button 
            onClick={() => handleDownload('svg')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
        >
            <Download size={16} /> SVG
        </button>
      </div>
      
      <button 
        onClick={copyToClipboard}
        className="mt-3 flex items-center justify-center gap-2 text-slate-500 hover:text-primary-600 transition-colors text-sm"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />} 
        {copied ? "Copied to clipboard" : "Copy Image"}
      </button>

    </div>
  );
};

export default QRPreview;
