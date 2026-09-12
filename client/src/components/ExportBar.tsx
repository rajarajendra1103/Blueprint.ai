import React, { useState } from 'react';
import {
  Download,
  FileText,
  FileDown,
  Copy,
  Check,
  Code,
  ArrowLeft,
  ExternalLink,
  Printer,
  FileArchive,
} from 'lucide-react';
import { useSession } from '../context/SessionContext';
import {
  downloadMarkdown,
  downloadWordDoc,
  downloadHtmlDocument,
  downloadJson,
  copyToClipboard,
  openDocumentPage,
  printCleanDocument,
  downloadFullPipelinePdf,
  downloadSplitDocPdf,
  PRD_SECTION_IDS,
  ARCHITECTURE_SECTION_IDS,
} from '../lib/export-helpers';
import * as api from '../lib/api';
import { MarkdownRenderer } from './MarkdownRenderer';

export const ExportBar: React.FC = () => {
  const {
    idea,
    classification,
    specDoc,
    selectedTechStack,
    designDirections,
    selectedDesignDirectionId,
    setActiveStep,
  } = useSession();

  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isPdfExporting, setIsPdfExporting] = useState<boolean>(false);
  const [isSplitExporting, setIsSplitExporting] = useState<'prd' | 'arch' | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'json'>('preview');
  const [showDocViewer, setShowDocViewer] = useState<boolean>(false);

  if (!specDoc || !classification) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <p className="text-sm text-subtle">No specification found to export.</p>
      </div>
    );
  }

  const selectedDesign = designDirections?.find(
    (d) => d.id === selectedDesignDirectionId
  ) || designDirections?.[0];

  const handleExportMarkdown = async () => {
    setIsExporting(true);
    try {
      const result = await api.exportSpecification({
        idea,
        classification,
        specDoc,
        selectedTechStack,
        selectedDesign,
      });
      const safeSlug = (idea || 'blueprint').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 35);
      downloadMarkdown(result.markdown, `${safeSlug}-specification.md`);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWordDoc = async () => {
    setIsExporting(true);
    try {
      await downloadWordDoc({
        idea,
        classification,
        specDoc,
        selectedTechStack,
        selectedDesign,
      });
    } catch (err: any) {
      alert(`Word Doc export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintCleanPdf = async () => {
    setIsExporting(true);
    try {
      await printCleanDocument({
        idea,
        classification,
        specDoc,
        selectedTechStack,
        selectedDesign,
      });
    } catch (err: any) {
      alert(`PDF Print failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadFullPdf = async () => {
    // Open window synchronously on click event (defeats popup blockers)
    setIsPdfExporting(true);
    try {
      await downloadFullPipelinePdf({
        idea,
        classification,
        specDoc,
        selectedTechStack,
        selectedDesign,
      });
    } catch (err: any) {
      alert(`Full PDF export failed: ${err.message}`);
    } finally {
      setIsPdfExporting(false);
    }
  };

  const handlePrdPdf = async () => {
    setIsSplitExporting('prd');
    try {
      await downloadSplitDocPdf(
        { idea, classification, specDoc, selectedTechStack, selectedDesign },
        PRD_SECTION_IDS,
        'Product Requirements Document (PRD)',
        '#4F46E5',
        'prd',
      );
    } catch (err: any) {
      alert(`PRD PDF export failed: ${err.message}`);
    } finally {
      setIsSplitExporting(null);
    }
  };

  const handleArchitecturePdf = async () => {
    setIsSplitExporting('arch');
    try {
      await downloadSplitDocPdf(
        { idea, classification, specDoc, selectedTechStack, selectedDesign },
        ARCHITECTURE_SECTION_IDS,
        'Technical Architecture Document',
        '#059669',
        'architecture',
      );
    } catch (err: any) {
      alert(`Architecture PDF export failed: ${err.message}`);
    } finally {
      setIsSplitExporting(null);
    }
  };

  const handleDownloadHtml = async () => {
    setIsExporting(true);
    try {
      await downloadHtmlDocument({
        idea,
        classification,
        specDoc,
        selectedTechStack,
        selectedDesign,
      });
    } catch (err: any) {
      alert(`HTML Download failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      const result = await api.exportSpecification({
        idea,
        classification,
        specDoc,
        selectedTechStack,
        selectedDesign,
      });
      await copyToClipboard(result.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err: any) {
      alert(`Copy failed: ${err.message}`);
    }
  };

  const handleExportJson = () => {
    const safeSlug = (idea || 'blueprint').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 35);
    const fullBundle = {
      meta: {
        generator: 'Blueprint.ai',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
      },
      idea,
      classification,
      approvedTechStack: selectedTechStack,
      approvedDesignDirection: selectedDesign,
      specification: specDoc.sections,
      consistencyWarnings: specDoc.warnings,
    };
    downloadJson(fullBundle, `${safeSlug}-specification.json`);
  };

  const handleOpenDocPage = async () => {
    // Open a blank window synchronously on click to defeat popup blockers
    const win = window.open('about:blank', '_blank');
    if (win) {
      try {
        win.document.open();
        win.document.write(`
          <!DOCTYPE html><html><head><title>Blueprint Architecture Document</title>
          <style>body{background:#F4F1EC;color:#2C2825;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;}.spinner{width:36px;height:36px;border:3px solid #E2DDD3;border-top-color:#C4623A;border-radius:50%;animation:spin 0.8s linear infinite;}@keyframes spin{to{transform:rotate(360deg)}}</style>
          </head><body><div class="spinner"></div><h3 style="margin-top:16px;">Compiling Architecture Specification &amp; Diagrams...</h3><p style="color:#736B63;font-size:13px;">Rendering vector flowcharts and tables...</p></body></html>
        `);
        win.document.close();
      } catch {}
    }

    setIsExporting(true);
    try {
      const success = await openDocumentPage(
        {
          idea,
          classification,
          specDoc,
          selectedTechStack,
          selectedDesign,
        },
        win
      );
      if (!success && !win) {
        setShowDocViewer(true);
      }
    } catch (err: any) {
      console.error('Doc page failed:', err);
      setShowDocViewer(true);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto no-print">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#EAE5DC] text-terracotta border border-border-warm shadow-nm-inset-sm mb-3">
          <Download className="w-3.5 h-3.5" />
          Final Stage
        </span>
        <h2 className="font-editorial text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
          Export Production Blueprint
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-subtle font-normal">
          Your complete software specification and architectural design document are compiled. Export directly to your preferred format or view the print-ready document.
        </p>
      </div>

      {/* Main Export Action Dashboard */}
      <div className="card-nm p-6 sm:p-8 rounded-3xl space-y-6 no-print">

        {/* ── Hero PDF Download Button ───────────────────────────────────── */}
        <button
          type="button"
          onClick={handleDownloadFullPdf}
          disabled={isPdfExporting || isExporting}
          className="w-full group relative overflow-hidden flex items-center justify-center gap-3 px-6 py-4 rounded-2xl transition-all disabled:opacity-60 disabled:cursor-wait"
          style={{
            background: isPdfExporting
              ? '#9A4D2F'
              : 'linear-gradient(135deg, #C4623A 0%, #A84D2A 50%, #8B3A1C 100%)',
            boxShadow: isPdfExporting
              ? 'none'
              : '0 6px 24px rgba(196,98,58,0.35), 0 2px 6px rgba(196,98,58,0.2)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
          title="Download all specification sections as a single PDF with rendered flowchart diagrams"
        >
          {/* Animated shimmer on hover */}
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background:
                'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
              backgroundSize: '200% 100%',
            }}
          />
          <div className="relative flex items-center gap-3">
            {isPdfExporting ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FileArchive className="w-6 h-6 flex-shrink-0" />
            )}
            <div className="text-left">
              <div className="font-bold text-sm leading-tight">
                {isPdfExporting ? 'Rendering All Sections & Diagrams…' : 'Open Full Blueprint (Print & Save as PDF)'}
              </div>
              <div className="text-[11px] text-white/75 font-normal leading-tight mt-0.5">
                {isPdfExporting
                  ? 'Pre-rendering all Mermaid flowcharts to SVG…'
                  : `All ${Object.keys(specDoc.sections).length} sections · Flowcharts & ERD · Tech Stack · Design System (Print-Ready Tab)`}
              </div>
            </div>
          </div>
        </button>

        {/* ── Split Documents Row ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* PRD PDF */}
          <button
            type="button"
            onClick={handlePrdPdf}
            disabled={isPdfExporting || isExporting || isSplitExporting !== null}
            className="group flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-[#F4F1EC] border border-border-warm shadow-nm-sm hover:shadow-nm-flat transition-all disabled:opacity-60 disabled:cursor-wait"
            title="Download PRD: Requirements, Business Logic, Algorithms, Cost Estimate, Testing Strategy, Risk & Assumptions"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-500/12 text-indigo-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              {isSplitExporting === 'prd' ? (
                <div className="w-5 h-5 border-2 border-indigo-700/30 border-t-indigo-700 rounded-full animate-spin" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div className="text-left min-w-0">
              <div className="font-bold text-sm text-charcoal leading-tight">
                {isSplitExporting === 'prd' ? 'Generating PRD…' : 'PRD — Product Requirements'}
              </div>
              <div className="text-[11px] text-subtle mt-0.5 leading-tight">
                Requirements · Business Logic · Algorithms · Cost · Testing · Risk
              </div>
            </div>
            <div className="ml-auto">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex-shrink-0">PDF</span>
            </div>
          </button>

          {/* Architecture PDF */}
          <button
            type="button"
            onClick={handleArchitecturePdf}
            disabled={isPdfExporting || isExporting || isSplitExporting !== null}
            className="group flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-[#F4F1EC] border border-border-warm shadow-nm-sm hover:shadow-nm-flat transition-all disabled:opacity-60 disabled:cursor-wait"
            title="Download Architecture Doc: System Architecture, Data Model, APIs, Folder Structure, Tech Stack, Deployment, Security, Integrations"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/12 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              {isSplitExporting === 'arch' ? (
                <div className="w-5 h-5 border-2 border-emerald-700/30 border-t-emerald-700 rounded-full animate-spin" />
              ) : (
                <Code className="w-5 h-5" />
              )}
            </div>
            <div className="text-left min-w-0">
              <div className="font-bold text-sm text-charcoal leading-tight">
                {isSplitExporting === 'arch' ? 'Generating Architecture Doc…' : 'Technical Architecture Doc'}
              </div>
              <div className="text-[11px] text-subtle mt-0.5 leading-tight">
                Architecture · Data Model · APIs · Folder · Tech Stack · Deploy · Security · Integrations
              </div>
            </div>
            <div className="ml-auto">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex-shrink-0">PDF</span>
            </div>
          </button>
        </div>

        {/* ── Secondary Export Grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Download Word Document (.doc) */}
          <button
            type="button"
            onClick={handleExportWordDoc}
            disabled={isExporting || isPdfExporting}
            className="p-4 rounded-2xl bg-[#F4F1EC] border border-border-warm shadow-nm-sm hover:shadow-nm-flat flex flex-col items-center justify-center text-center group transition-all disabled:opacity-60 disabled:cursor-wait"
            title="Download formatted Word document with embedded vector diagrams"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-blue-700/30 border-t-blue-700 rounded-full animate-spin" />
              ) : (
                <FileDown className="w-5 h-5" />
              )}
            </div>
            <span className="font-bold text-xs text-charcoal">Word Document</span>
            <span className="text-[10px] text-subtle mt-0.5">{isExporting ? 'Compiling…' : '.doc File'}</span>
          </button>

          {/* Direct Print / Save as PDF (single section view) */}
          <button
            type="button"
            onClick={handlePrintCleanPdf}
            disabled={isExporting || isPdfExporting}
            className="p-4 rounded-2xl bg-[#F4F1EC] border border-border-warm shadow-nm-sm hover:shadow-nm-flat flex flex-col items-center justify-center text-center group transition-all disabled:opacity-60 disabled:cursor-wait"
            title="Print or Save as PDF with clean document layout"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-rose-700/30 border-t-rose-700 rounded-full animate-spin" />
              ) : (
                <Printer className="w-5 h-5" />
              )}
            </div>
            <span className="font-bold text-xs text-charcoal">Save as PDF</span>
            <span className="text-[10px] text-subtle mt-0.5">{isExporting ? 'Compiling…' : 'Print / PDF'}</span>
          </button>

          {/* Open Clean Document Page */}
          <button
            type="button"
            onClick={handleOpenDocPage}
            disabled={isExporting || isPdfExporting}
            className="p-4 rounded-2xl bg-[#F4F1EC] border border-border-warm shadow-nm-sm hover:shadow-nm-flat flex flex-col items-center justify-center text-center group transition-all disabled:opacity-60 disabled:cursor-wait"
            title="Open clean standalone document in a new tab"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-emerald-700/30 border-t-emerald-700 rounded-full animate-spin" />
              ) : (
                <ExternalLink className="w-5 h-5" />
              )}
            </div>
            <span className="font-bold text-xs text-charcoal">Document Tab</span>
            <span className="text-[10px] text-subtle mt-0.5">{isExporting ? 'Opening…' : 'Clean Page'}</span>
          </button>

          {/* Download Markdown */}
          <button
            type="button"
            onClick={handleExportMarkdown}
            disabled={isExporting || isPdfExporting}
            className="p-4 rounded-2xl bg-[#F4F1EC] border border-border-warm shadow-nm-sm hover:shadow-nm-flat flex flex-col items-center justify-center text-center group transition-all"
            title="Download pure GitHub-Flavored Markdown specification"
          >
            <div className="w-10 h-10 rounded-2xl bg-terracotta/15 text-terracotta flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-charcoal">Markdown Spec</span>
            <span className="text-[10px] text-subtle mt-0.5">.md File</span>
          </button>

          {/* Copy Standard Markdown */}
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="p-4 rounded-2xl bg-[#F4F1EC] border border-border-warm shadow-nm-sm hover:shadow-nm-flat flex flex-col items-center justify-center text-center group transition-all"
            title="Copy full specification markdown to clipboard"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              {copied ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Copy className="w-5 h-5" />}
            </div>
            <span className="font-bold text-xs text-charcoal">
              {copied ? 'Copied!' : 'Copy Markdown'}
            </span>
            <span className="text-[10px] text-subtle mt-0.5">To clipboard</span>
          </button>

          {/* Download JSON Bundle */}
          <button
            type="button"
            onClick={handleExportJson}
            className="p-4 rounded-2xl bg-[#F4F1EC] border border-border-warm shadow-nm-sm hover:shadow-nm-flat flex flex-col items-center justify-center text-center group transition-all"
            title="Download full project JSON metadata"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Code className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-charcoal">JSON Bundle</span>
            <span className="text-[10px] text-subtle mt-0.5">Full state</span>
          </button>
        </div>

        {/* Document Stats & Summary Strip */}
        <div className="p-4 rounded-2xl bg-[#EFECE6] border border-border-warm shadow-nm-inset-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-subtle">Sections:</span>{' '}
              <strong className="text-charcoal font-mono">
                {Object.keys(specDoc.sections).length}
              </strong>
            </div>
            <div>
              <span className="text-subtle">Tech Stack:</span>{' '}
              <strong className="text-charcoal font-mono">
                {selectedTechStack?.frontend?.split(' ')[0] || 'TypeScript'} +{' '}
                {selectedTechStack?.backend?.split(' ')[0] || 'Express'}
              </strong>
            </div>
            <div>
              <span className="text-subtle">Design:</span>{' '}
              <strong className="text-charcoal font-mono">{selectedDesign?.name}</strong>
            </div>
          </div>
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> 100% Client-Side Export
          </span>
        </div>
      </div>

      {/* Embedded Document Preview */}
      <div id="printable-document-card" className="card-nm p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-warm no-print">
          <h3 className="font-editorial text-lg font-bold text-charcoal">
            Specification Preview
          </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDocViewer(true)}
                className="px-3 py-1 rounded-xl text-xs font-semibold btn-nm text-charcoal hover:bg-white flex items-center gap-1"
                title="Open clean fullscreen document view"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fullscreen Reader</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  activeTab === 'preview'
                    ? 'bg-terracotta text-white'
                    : 'btn-nm text-charcoal hover:bg-white'
                }`}
              >
                Formatted
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  activeTab === 'json'
                    ? 'bg-terracotta text-white'
                    : 'btn-nm text-charcoal hover:bg-white'
                }`}
              >
                JSON
              </button>
            </div>
          </div>

        {activeTab === 'preview' ? (
          <div id="printable-document" className="max-h-[500px] overflow-y-auto pr-2 space-y-6 text-xs sm:text-sm font-sans text-charcoal">
            <div>
              <h1 className="font-editorial text-2xl font-bold text-charcoal">{idea}</h1>
              <p className="text-xs text-subtle mt-1">{classification.summary}</p>
            </div>

            {Object.values(specDoc.sections).map((sec) => (
              <div key={sec.id} className="pt-4 border-t border-border-warm">
                <h4 className="font-bold text-sm text-terracotta uppercase tracking-wider mb-2">
                  {sec.title}
                </h4>
                <MarkdownRenderer content={sec.content} sectionTitle={sec.title} />
              </div>
            ))}
          </div>
        ) : (
          <pre className="max-h-[500px] overflow-y-auto p-4 rounded-2xl bg-[#EFECE6] font-mono text-[11px] text-charcoal shadow-nm-inset-sm">
            {JSON.stringify(
              {
                idea,
                classification,
                selectedTechStack,
                selectedDesign,
                specDoc,
              },
              null,
              2
            )}
          </pre>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border-warm no-print">
        <button
          type="button"
          onClick={() => setActiveStep(3)}
          className="px-5 py-2.5 rounded-2xl text-xs font-semibold btn-nm text-charcoal flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Design Direction</span>
        </button>

        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="px-5 py-2.5 rounded-2xl text-xs font-semibold btn-nm text-charcoal"
        >
          Scroll to Top ↑
        </button>
      </div>

      {/* Fullscreen Document Reader Modal */}
      {showDocViewer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto p-3 sm:p-6 animate-fade-in">
          {/* Top Sticky Toolbar */}
          <div className="w-full max-w-4xl bg-[#F4F1EC] border border-border-warm rounded-2xl p-3.5 mb-5 shadow-2xl flex items-center justify-between sticky top-3 z-20 no-print">
            <div className="flex items-center gap-2">
              <span className="font-editorial text-base sm:text-lg font-bold text-charcoal">Clean Document View</span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium hidden sm:inline">
                Print & PDF Ready
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintCleanPdf}
                disabled={isExporting}
                className="px-3.5 py-1.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-nm-sm transition-all disabled:opacity-60"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Preparing PDF…' : 'Print / Save as PDF'}</span>
              </button>
              <button
                type="button"
                onClick={handleExportWordDoc}
                className="px-3.5 py-1.5 rounded-xl bg-[#EFECE6] hover:bg-[#E5E0D6] text-charcoal text-xs font-semibold flex items-center gap-1.5 border border-border-warm transition-all"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Word (.doc)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDocViewer(false)}
                className="px-3 py-1.5 rounded-xl bg-charcoal/10 hover:bg-charcoal/20 text-charcoal text-xs font-semibold transition-all"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Clean Document Sheet */}
          <div className="w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-12 shadow-2xl border border-[#ECE7DC] text-charcoal space-y-8 mb-16">
            <div>
              <h1 className="font-editorial text-3xl font-extrabold text-charcoal border-b-2 border-terracotta pb-3">
                {idea}
              </h1>
              <div className="mt-4 p-4 rounded-xl bg-[#F4F1EC] border border-[#E2DDD3] text-xs space-y-1">
                <p><strong>Executive Summary:</strong> {classification.summary}</p>
                <p><strong>Domain:</strong> {classification.domain} | <strong>Platform:</strong> {classification.platform} | <strong>Complexity:</strong> {classification.complexityTier}</p>
                <p><strong>Target Audience:</strong> {classification.targetAudience}</p>
              </div>
            </div>

            {selectedTechStack && (
              <div>
                <h3 className="font-editorial text-xl font-bold text-charcoal mb-3">1. Production Technology Stack</h3>
                <div className="overflow-x-auto border border-[#E2DDD3] rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F4F1EC] border-b border-[#E2DDD3]">
                      <tr>
                        <th className="p-3 font-semibold">Tier</th>
                        <th className="p-3 font-semibold">Selected Technology</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFECE6]">
                      <tr><td className="p-3 font-medium">Frontend</td><td className="p-3">{selectedTechStack.frontend}</td></tr>
                      <tr><td className="p-3 font-medium">Backend</td><td className="p-3">{selectedTechStack.backend}</td></tr>
                      <tr><td className="p-3 font-medium">Database</td><td className="p-3">{selectedTechStack.database}</td></tr>
                      <tr><td className="p-3 font-medium">Styling</td><td className="p-3">{selectedTechStack.styling}</td></tr>
                      <tr><td className="p-3 font-medium">Deployment</td><td className="p-3">{selectedTechStack.deployment}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedDesign && (
              <div>
                <h3 className="font-editorial text-xl font-bold text-charcoal mb-3">2. Visual Design & Layout Direction</h3>
                <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#E2DDD3] text-xs space-y-2">
                  <h4 className="font-bold text-sm text-terracotta">{selectedDesign.name} ({selectedDesign.badge})</h4>
                  <p className="italic text-subtle">{selectedDesign.philosophy}</p>
                  <p><strong>Layout Composition:</strong> {selectedDesign.layout?.style} — Density: {selectedDesign.layout?.density} — Grid: {selectedDesign.layout?.gridSystem} (Width: {selectedDesign.layout?.containerWidth})</p>
                  <p><strong>Typography:</strong> Headings: {selectedDesign.typography?.headingFont} | Body: {selectedDesign.typography?.bodyFont} | Mono: {selectedDesign.typography?.monoFont}</p>
                  <p><strong>Color Palette:</strong> Base: {selectedDesign.colors?.base} | Primary: {selectedDesign.colors?.primary} | Accent: {selectedDesign.colors?.accent}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-editorial text-xl font-bold text-charcoal mb-3">3. Architecture & PRD Specifications</h3>
              <div className="space-y-6">
                {Object.values(specDoc.sections).map((sec) => (
                  <div key={sec.id} className="pt-4 border-t border-[#EFECE6]">
                    <h4 className="font-bold text-base text-terracotta mb-1">{sec.title}</h4>
                    <p className="text-xs text-subtle italic mb-3">{sec.description}</p>
                    <MarkdownRenderer content={sec.content} sectionTitle={sec.title} />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#EFECE6] text-center text-xs text-subtle">
              Generated by Blueprint.ai — AI-Powered Architectural Specification & Design System Generator.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
