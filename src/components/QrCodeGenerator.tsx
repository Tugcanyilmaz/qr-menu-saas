'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, QrCode as QrIcon, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';

interface QrCodeGeneratorProps {
  slug: string;
  businessName: string;
}

export default function QrCodeGenerator({ slug, businessName }: QrCodeGeneratorProps) {
  const [menuUrl, setMenuUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloading, setDownloading] = useState<boolean>(false);

  useEffect(() => {
    // Generate full URL based on current window location
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://qrmenu-saas.vercel.app';
    const fullUrl = `${origin}/${slug}`;
    setMenuUrl(fullUrl);

    // Draw QR code on canvas when URL changes
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        fullUrl,
        {
          width: 320,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        },
        (error) => {
          if (error) console.error('QR code generation failed:', error);
        }
      );
    }
  }, [slug]);

  const handleCopy = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    setDownloading(true);

    // Create a larger canvas for high-resolution print output (1200x1200px) with Business Name header
    const printCanvas = document.createElement('canvas');
    printCanvas.width = 1200;
    printCanvas.height = 1400;
    const ctx = printCanvas.getContext('2d');

    if (ctx) {
      // White background card
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, printCanvas.width, printCanvas.height);

      // Top Header Gradient
      const gradient = ctx.createLinearGradient(0, 0, 1200, 0);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 180);

      // Business Name on Header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(businessName, 600, 110);

      // Subtitle
      ctx.fillStyle = '#475569';
      ctx.font = '36px sans-serif';
      ctx.fillText('MENÜYÜ GÖRÜNTÜLEMEK İÇİN QR KODU OKUTUNUZ', 600, 260);

      // Draw standard QR code scaled up
      QRCode.toCanvas(
        printCanvas,
        menuUrl,
        {
          width: 800,
          margin: 2,
          color: { dark: '#0f172a', light: '#ffffff' },
          errorCorrectionLevel: 'H',
        },
        () => {
          // Footer URL
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 32px monospace';
          ctx.fillText(menuUrl, 600, 1320);

          // Download link trigger
          const link = document.createElement('a');
          link.download = `${slug}-qr-baski.png`;
          link.href = printCanvas.toDataURL('image/png');
          link.click();
          setDownloading(false);
        }
      );
    }
  };

  const handleDownloadSvg = async () => {
    try {
      const svgString = await QRCode.toString(menuUrl, {
        type: 'svg',
        width: 800,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-qr.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('SVG Export failed:', err);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 flex flex-col items-center text-center max-w-lg mx-auto shadow-2xl relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Permanent Slug Warning Banner */}
      <div className="w-full mb-6 p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center space-x-2 text-indigo-300 text-xs sm:text-sm">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span><strong>Kalıcı QR Garantisi:</strong> İşletme adı veya menünüz değişse dahi bu QR Kod hiçbir zaman değişmez.</span>
      </div>

      {/* Business Name Header */}
      <h3 className="text-2xl font-bold text-white mb-1">{businessName}</h3>
      <p className="text-xs text-slate-400 mb-6 font-mono bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
        Slug: /{slug}
      </p>

      {/* Canvas QR Container */}
      <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-slate-700/50 mb-6 hover:scale-105 transition-transform duration-300">
        <canvas ref={canvasRef} className="mx-auto block" />
      </div>

      {/* Menu Permanent URL Box */}
      <div className="w-full mb-6">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-left">
          Sabit Menü URL Adresi
        </label>
        <div className="flex items-center space-x-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
          <input
            type="text"
            readOnly
            value={menuUrl}
            className="bg-transparent flex-1 text-slate-200 text-sm font-mono focus:outline-none px-2 select-all"
          />
          <button
            onClick={handleCopy}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Kopyala</span>
              </>
            )}
          </button>
          
          <a
            href={menuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg text-xs font-medium transition-colors shrink-0"
            title="Menüyü Yeni Sekmede Aç"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Download Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        <button
          onClick={handleDownloadPng}
          disabled={downloading}
          className="gradient-btn py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-indigo-500/25"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Hazırlanıyor...' : 'Masa İçin PNG İndir'}</span>
        </button>

        <button
          onClick={handleDownloadSvg}
          className="py-3 px-4 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center space-x-2 transition-all"
        >
          <QrIcon className="w-4 h-4 text-indigo-400" />
          <span>Baskı İçin SVG İndir</span>
        </button>
      </div>

    </div>
  );
}
