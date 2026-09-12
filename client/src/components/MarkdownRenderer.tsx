import React, { useEffect, useRef, useState, useCallback } from 'react';
import { marked } from 'marked';
import { GitFork, Copy, Check, Code, Eye, X, Maximize2, ZoomIn, ZoomOut, RotateCcw, RotateCw, Download } from 'lucide-react';

import { renderMermaidSvg, cleanSvgXml } from '../lib/mermaid-utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  sectionTitle?: string;
}

interface Segment {
  type: 'markdown' | 'mermaid';
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  sectionTitle,
}) => {
  // Pre-clean content:
  // 1. Remove redundant leading # or ## if it repeats the sectionTitle
  let cleaned = content || '';
  if (sectionTitle) {
    const escaped = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned.replace(new RegExp(`^\\s*#{1,3}\\s*${escaped}\\s*\\n+`, 'i'), '');
  }
  // 2. Remove leading raw generic # titles like "# Architecture"
  cleaned = cleaned.replace(/^\s*#\s+[^\n]+\n+/, '');

  // 3. Remove raw horizontal rule clutter like *** or standalone ---
  cleaned = cleaned.replace(/\n\s*(\*{3,}|-{3,})\s*\n/g, '\n\n');

  // 4. Auto-close truncated mermaid code blocks if output cut off mid-stream
  const mermaidFences = (cleaned.match(/```(?:mermaid)\b/gi) || []).length;
  const totalFences = (cleaned.match(/```/g) || []).length;
  if (mermaidFences > 0 && totalFences % 2 !== 0) {
    cleaned += '\n```';
  }

  // Split content by ```mermaid code blocks
  const segments: Segment[] = [];
  const mermaidRegex = /```(?:mermaid)\s*([\s\S]*?)```/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mermaidRegex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'markdown',
        content: cleaned.substring(lastIndex, match.index),
      });
    }
    segments.push({
      type: 'mermaid',
      content: match[1].trim(),
    });
    lastIndex = mermaidRegex.lastIndex;
  }

  if (lastIndex < cleaned.length) {
    segments.push({
      type: 'markdown',
      content: cleaned.substring(lastIndex),
    });
  }

  return (
    <div className={`markdown-content space-y-6 ${className}`}>
      {segments.map((seg, idx) => {
        if (seg.type === 'mermaid') {
          return <MermaidBlock key={`mermaid-${idx}`} chart={seg.content} index={idx} />;
        }
        return <HtmlMarkdownBlock key={`md-${idx}`} markdown={seg.content} />;
      })}
    </div>
  );
};

const MermaidBlock: React.FC<{ chart: string; index: number }> = ({ chart, index }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isDownloadingPng, setIsDownloadingPng] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const stableIdRef = useRef<string>(`chart-${index}-${Math.random().toString(36).substring(2, 7)}`);

  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      try {
        const renderedSvg = await renderMermaidSvg(stableIdRef.current, chart);
        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err: any) {
        console.warn('[Mermaid] Render error:', err);
        if (isMounted) {
          setError(err?.message || 'Diagram syntax could not be compiled');
        }
      }
    };

    renderDiagram();
    return () => {
      isMounted = false;
    };
  }, [chart]);

  // Close zoom modal on Escape key; reset scale on open
  useEffect(() => {
    if (!isZoomed) return;
    setZoomScale(1.0); // reset to fit when opening
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsZoomed(false);
      if (e.key === '+' || e.key === '=') setZoomScale(s => Math.min(3.0, +(s + 0.2).toFixed(1)));
      if (e.key === '-') setZoomScale(s => Math.max(0.3, +(s - 0.2).toFixed(1)));
      if (e.key === '0') { setZoomScale(1.0); setRotation(0); }
      if (e.key === 'r' || e.key === 'R') setRotation(r => (r + 90) % 360);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isZoomed]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chart);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleRotate = () => {
    setRotation(r => (r + 90) % 360);
  };

  const handleDownloadSvg = () => {
    if (!svg) return;
    // Strictly sanitize XML to prevent "Attribute style redefined" in Chromium
    const cleanXml = cleanSvgXml(svg);
    const blob = new Blob([cleanXml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowchart-${index + 1}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadPng = async () => {
    if (!svg || isDownloadingPng) return;
    setIsDownloadingPng(true);

    try {
      // 1. Sanitize XML to avoid duplicate attributes
      let cleanXml = cleanSvgXml(svg);

      // 2. Determine native dimensions from viewBox or live DOM node
      let w = 1200;
      let h = 800;

      const liveSvg = containerRef.current?.querySelector('svg');
      if (liveSvg) {
        const bbox = liveSvg.getBoundingClientRect();
        if (bbox.width > 50 && bbox.height > 50) {
          w = Math.round(bbox.width);
          h = Math.round(bbox.height);
        }
      }

      const vbMatch = cleanXml.match(/viewBox=["']([^"']+)["']/i);
      if (vbMatch) {
        const parts = vbMatch[1].trim().split(/[\s,]+/).map(Number);
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          w = Math.round(parts[2]);
          h = Math.round(parts[3]);
        }
      }

      // 3. For rasterization, set explicit width and height on root <svg>
      cleanXml = cleanXml.replace(/<svg([^>]*)>/i, (_m, attrs) => {
        const cleanedAttrs = attrs
          .replace(/\s*\bwidth=["'][^"']*["']/gi, '')
          .replace(/\s*\bheight=["'][^"']*["']/gi, '')
          .replace(/\s*\bstyle=["'][^"']*["']/gi, '');
        return `<svg${cleanedAttrs} width="${w}" height="${h}" style="background:#FFFFFF;">`;
      });

      // 4. Use data URI (never taints canvas or violates object URL CORS)
      const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanXml)}`;
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const renderCanvas = () => {
        const scale = 2; // high-dpi crispness
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsDownloadingPng(false);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        try {
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `flowchart-${index + 1}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            } else {
              const dataUrl = canvas.toDataURL('image/png');
              const a = document.createElement('a');
              a.href = dataUrl;
              a.download = `flowchart-${index + 1}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
            setIsDownloadingPng(false);
          }, 'image/png');
        } catch (e) {
          console.error('Canvas export error:', e);
          const dataUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `flowchart-${index + 1}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setIsDownloadingPng(false);
        }
      };

      img.onload = renderCanvas;
      img.onerror = (err) => {
        console.warn('Data URI image failed, attempting Blob URL fallback:', err);
        const svgBlob = new Blob([cleanXml], { type: 'image/svg+xml;charset=utf-8' });
        const blobUrl = URL.createObjectURL(svgBlob);
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          renderCanvas();
          URL.revokeObjectURL(blobUrl);
        };
        fallbackImg.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          setIsDownloadingPng(false);
          handleDownloadSvg();
        };
        fallbackImg.src = blobUrl;
      };

      img.src = dataUri;
    } catch (err) {
      console.error('Failed to export PNG:', err);
      setIsDownloadingPng(false);
      handleDownloadSvg();
    }
  };

  return (
    <>
      <div className="my-6 rounded-2xl border border-border-warm bg-white/80 shadow-nm-sm overflow-hidden transition-all">
        {/* Diagram Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#EFECE6] border-b border-border-warm text-xs">
          <div className="flex items-center gap-2 text-charcoal font-semibold">
            <div className="w-5 h-5 rounded-md bg-terracotta/15 text-terracotta flex items-center justify-center">
              <GitFork className="w-3.5 h-3.5" />
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-charcoal">
              System Topology / Flowchart
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Download SVG & PNG Buttons */}
            {svg && !showCode && (
              <div className="flex items-center gap-0.5 bg-[#E8E4DC] border border-border-warm rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="px-2 py-1 rounded text-[11px] font-mono font-medium text-charcoal hover:bg-white/90 hover:text-terracotta transition-colors flex items-center gap-1"
                  title="Download vector SVG"
                >
                  <Download className="w-3 h-3" />
                  <span>SVG</span>
                </button>
                <div className="w-px h-3 bg-border-warm" />
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={isDownloadingPng}
                  className="px-2 py-1 rounded text-[11px] font-mono font-medium text-charcoal hover:bg-white/90 hover:text-terracotta transition-colors flex items-center gap-1 disabled:opacity-50"
                  title="Download PNG image"
                >
                  <Download className={`w-3 h-3 ${isDownloadingPng ? 'animate-bounce text-terracotta' : ''}`} />
                  <span>{isDownloadingPng ? 'PNG...' : 'PNG'}</span>
                </button>
              </div>
            )}

            {/* Rotate Button */}
            {svg && !showCode && (
              <button
                type="button"
                onClick={handleRotate}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] ${
                  rotation !== 0
                    ? 'bg-terracotta/15 text-terracotta font-semibold'
                    : 'text-subtle hover:text-charcoal hover:bg-black/5'
                }`}
                title="Rotate 90° (Clockwise)"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rotate{rotation ? ` ${rotation}°` : ''}</span>
              </button>
            )}

            {/* Zoom / Fullscreen button */}
            {svg && !showCode && (
              <button
                type="button"
                onClick={() => setIsZoomed(true)}
                className="p-1.5 rounded-lg text-subtle hover:text-terracotta hover:bg-terracotta/10 transition-colors flex items-center gap-1 text-[11px]"
                title="Fullscreen Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Zoom</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-subtle hover:text-charcoal hover:bg-black/5 transition-colors flex items-center gap-1 text-[11px]"
              title="Copy Mermaid Code"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="p-1.5 rounded-lg text-subtle hover:text-charcoal hover:bg-black/5 transition-colors flex items-center gap-1 text-[11px]"
              title="Toggle Source Code"
            >
              {showCode ? <Eye className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{showCode ? 'View Diagram' : 'Source'}</span>
            </button>
          </div>
        </div>

        {/* Diagram Container */}
        <div
          className="p-4 overflow-auto flex items-center justify-center transition-all duration-200"
          style={{
            minHeight: rotation % 180 !== 0 ? '500px' : '200px',
          }}
        >
          {showCode ? (
            <pre className="w-full text-xs font-mono p-4 rounded-xl bg-[#1E1E2E] text-slate-100 overflow-x-auto">
              {chart}
            </pre>
          ) : error ? (
            <div className="text-center py-4 space-y-2">
              <p className="text-xs text-amber-700 font-medium">Flowchart Source (Visualizer Fallback)</p>
              <pre className="text-left text-xs font-mono p-3 rounded-xl bg-amber-500/10 border border-amber-300/30 text-amber-900 max-w-xl mx-auto overflow-x-auto">
                {chart}
              </pre>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="w-full flex justify-center transition-transform duration-200"
              style={{
                transform: rotation ? `rotate(${rotation}deg)` : undefined,
                transformOrigin: 'center center',
              }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
        </div>

      </div>

      {/* ── Fullscreen Zoom Modal ────────────────────────────────────────── */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setIsZoomed(false); }}
        >
          {/* Modal toolbar */}
          <div className="w-full max-w-5xl bg-[#F4F1EC] border border-border-warm rounded-2xl px-4 py-2.5 mb-3 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-terracotta/15 text-terracotta flex items-center justify-center">
                <GitFork className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-charcoal font-semibold">
                Flowchart — Fullscreen View
              </span>
              <span className="text-[10px] text-subtle ml-1 hidden sm:inline">Esc to close · +/− to zoom · R to rotate</span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Zoom & Rotate controls */}
              <div className="flex items-center gap-0.5 bg-[#E8E4DC] border border-border-warm rounded-xl px-1.5 py-1 shadow-nm-inset-sm">
                <button
                  type="button"
                  onClick={() => setZoomScale(s => Math.max(0.3, +(s - 0.2).toFixed(1)))}
                  disabled={zoomScale <= 0.3}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-charcoal hover:bg-black/10 transition-colors disabled:opacity-30"
                  title="Zoom Out (−)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="min-w-[38px] text-center font-mono text-[11px] font-bold text-charcoal select-none">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale(s => Math.min(3.0, +(s + 0.2).toFixed(1)))}
                  disabled={zoomScale >= 3.0}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-charcoal hover:bg-black/10 transition-colors disabled:opacity-30"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-3.5 bg-border-warm mx-1" />
                <button
                  type="button"
                  onClick={handleRotate}
                  className={`px-1.5 h-6 rounded-lg flex items-center gap-1 text-[11px] font-mono font-medium transition-colors ${
                    rotation !== 0
                      ? 'bg-terracotta text-white shadow-sm'
                      : 'text-charcoal hover:bg-black/10'
                  }`}
                  title="Rotate 90° (R)"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>{rotation ? `${rotation}°` : 'Rotate'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setZoomScale(1.0); setRotation(0); }}
                  disabled={zoomScale === 1.0 && rotation === 0}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-charcoal hover:bg-black/10 transition-colors disabled:opacity-30 ml-0.5"
                  title="Reset Zoom & Rotation (0)"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              {/* Download SVG & PNG in Fullscreen Modal */}
              <div className="flex items-center gap-0.5 bg-[#E8E4DC] border border-border-warm rounded-xl p-0.5 shadow-nm-inset-sm">
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium text-charcoal hover:bg-white hover:text-terracotta transition-colors flex items-center gap-1"
                  title="Download vector SVG"
                >
                  <Download className="w-3 h-3" />
                  <span>SVG</span>
                </button>
                <div className="w-px h-3 bg-border-warm" />
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={isDownloadingPng}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium text-charcoal hover:bg-white hover:text-terracotta transition-colors flex items-center gap-1 disabled:opacity-50"
                  title="Download high-res PNG"
                >
                  <Download className={`w-3 h-3 ${isDownloadingPng ? 'animate-bounce text-terracotta' : ''}`} />
                  <span>{isDownloadingPng ? 'PNG...' : 'PNG'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg text-xs text-subtle hover:text-charcoal hover:bg-black/5 transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="p-1.5 rounded-lg bg-charcoal/10 hover:bg-charcoal/20 text-charcoal transition-colors"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Zoomed SVG — scrollable container, diagram scales from center */}
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-[#ECE7DC] overflow-auto max-h-[78vh] flex items-center justify-center p-6 sm:p-10">
            <div
              style={{
                transform: `scale(${zoomScale}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 0.18s ease',
                width: '100%',
                minHeight: rotation % 180 !== 0 ? '550px' : '200px',
              }}
              className="flex justify-center w-full [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:mx-auto"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </div>
      )}
    </>
  );
};


const HtmlMarkdownBlock: React.FC<{ markdown: string }> = ({ markdown }) => {
  // Parse markdown to HTML
  const rawHtml = marked.parse(markdown, {
    gfm: true,
    breaks: true,
  }) as string;

  // Post-process HTML for attractive UI chips and modern table wrapper
  let enhancedHtml = rawHtml;

  // Enhance tables with styled overflow container
  enhancedHtml = enhancedHtml.replace(
    /<table>/g,
    '<div class="overflow-x-auto my-5 rounded-2xl border border-border-warm bg-white/70 shadow-nm-sm"><table class="w-full text-left text-xs border-collapse">'
  );
  enhancedHtml = enhancedHtml.replace(/<\/table>/g, '</table></div>');

  // Table header & cell styling
  enhancedHtml = enhancedHtml.replace(
    /<thead>/g,
    '<thead class="bg-[#EFECE6] border-b border-border-warm text-charcoal font-semibold text-[11px] uppercase tracking-wider font-mono">'
  );
  enhancedHtml = enhancedHtml.replace(
    /<th>/g,
    '<th class="py-3 px-4 text-left font-bold text-charcoal">'
  );
  enhancedHtml = enhancedHtml.replace(
    /<tr>/g,
    '<tr class="border-b border-border-warm/60 hover:bg-black/[0.02] transition-colors">'
  );
  enhancedHtml = enhancedHtml.replace(
    /<td>/g,
    '<td class="py-3 px-4 text-charcoal/90 align-top leading-relaxed text-xs">'
  );

  // Style Scope & Priority Badges
  enhancedHtml = enhancedHtml.replace(
    /\[MVP\]/gi,
    '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">MVP</span>'
  );
  enhancedHtml = enhancedHtml.replace(
    /\[Phase 2\]/gi,
    '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-100 text-amber-800 border border-amber-300">Phase 2</span>'
  );
  enhancedHtml = enhancedHtml.replace(
    /\b(P0)\b/g,
    '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800">P0</span>'
  );
  enhancedHtml = enhancedHtml.replace(
    /\b(P1)\b/g,
    '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-100 text-amber-800">P1</span>'
  );

  // Style HTTP Method tags in tables
  enhancedHtml = enhancedHtml.replace(
    /<td>\s*(GET)\s*<\/td>/g,
    '<td><span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-100 text-sky-800">GET</span></td>'
  );
  enhancedHtml = enhancedHtml.replace(
    /<td>\s*(POST)\s*<\/td>/g,
    '<td><span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">POST</span></td>'
  );
  enhancedHtml = enhancedHtml.replace(
    /<td>\s*(PUT|PATCH)\s*<\/td>/g,
    '<td><span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800">$1</span></td>'
  );
  enhancedHtml = enhancedHtml.replace(
    /<td>\s*(DELETE)\s*<\/td>/g,
    '<td><span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800">DELETE</span></td>'
  );

  // Style pre code blocks with dark modern terminal theme
  enhancedHtml = enhancedHtml.replace(
    /<pre><code>/g,
    '<pre class="my-4 p-4 rounded-2xl bg-[#1E1E2E] text-slate-100 font-mono text-xs overflow-x-auto shadow-inner"><code>'
  );

  // Style headings
  enhancedHtml = enhancedHtml.replace(
    /<h3>/g,
    '<h3 class="font-editorial text-lg font-bold text-charcoal mt-6 mb-3 pt-2 border-t border-border-warm/40 first:border-0 first:pt-0">'
  );
  enhancedHtml = enhancedHtml.replace(
    /<h4>/g,
    '<h4 class="font-sans text-xs font-bold text-terracotta uppercase tracking-wider mt-4 mb-2">'
  );

  return (
    <div
      className="prose-content text-xs sm:text-sm text-charcoal leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:space-y-1.5 [&_blockquote]:border-l-4 [&_blockquote]:border-terracotta [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-subtle"
      dangerouslySetInnerHTML={{ __html: enhancedHtml }}
    />
  );
};
