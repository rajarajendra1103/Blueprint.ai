import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Key,
  Download,
  GitFork,
  Printer,
  FileText,
  FileCode,
  ShieldCheck,
  Zap,
  ExternalLink,
  ChevronRight,
  Maximize2,
  FileDown,
  Cpu,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useSession } from '../context/SessionContext';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenKeyModal?: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
  onOpenKeyModal,
}) => {
  const [activeTab, setActiveTab] = useState<'byok' | 'flowcharts' | 'export'>('byok');
  const { providerConfig, clearApiKey } = useSession();
  const [clearedKeyFeedback, setClearedKeyFeedback] = useState(false);

  const handleClearKeyNow = () => {
    clearApiKey();
    setClearedKeyFeedback(true);
    setTimeout(() => setClearedKeyFeedback(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#F4F1EC] border border-border-warm rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-warm bg-[#EFECE6]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-terracotta text-white flex items-center justify-center shadow-nm-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-charcoal">
                Blueprint.ai User & BYOK Guide
              </h2>
              <p className="text-xs text-subtle">
                API Recommendations · Flowchart Downloads · Export Formats
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-subtle hover:text-charcoal hover:bg-black/5 transition-colors"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-border-warm bg-[#F4F1EC]">
          <button
            type="button"
            onClick={() => setActiveTab('byok')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'byok'
                ? 'border-terracotta text-terracotta'
                : 'border-transparent text-subtle hover:text-charcoal'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>1. BYOK & Recommended APIs</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('flowcharts')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'flowcharts'
                ? 'border-terracotta text-terracotta'
                : 'border-transparent text-subtle hover:text-charcoal'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>2. Flowcharts & PNG Export</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'export'
                ? 'border-terracotta text-terracotta'
                : 'border-transparent text-subtle hover:text-charcoal'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>3. Export (PDF Recommended)</span>
          </button>
        </div>

        {/* Tab Content with visible custom scrollbar */}
        <div className="flex-1 overflow-y-scroll custom-scrollbar p-6 space-y-6 text-charcoal">
          {/* TAB 1: BYOK & RECOMMENDED APIS */}
          {activeTab === 'byok' && (
            <div className="space-y-6 animate-fade-in">
              {/* Privacy Notice */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">100% Stateless BYOK Architecture:</strong>
                  Your API keys live strictly in your browser’s temporary <code className="bg-emerald-100/70 px-1 py-0.5 rounded font-mono text-[11px]">sessionStorage</code>. Keys are never written to a database or saved on the server. They are passed strictly to LLM provider endpoints to generate your project.
                </div>
              </div>

              {/* Crucial Setup Step Callout */}
              <div className="p-4 rounded-2xl bg-terracotta/10 border-2 border-terracotta/40 text-xs text-charcoal flex items-start gap-3 shadow-nm-sm">
                <div className="w-6 h-6 rounded-xl bg-terracotta text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-sm text-charcoal">
                    Important: Two-Step Key Activation Process
                  </div>
                  <p className="text-subtle text-[11.5px] leading-relaxed">
                    Whenever you paste or change an API key in the Provider dialog:
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 font-semibold text-charcoal text-[11.5px] pt-1">
                    <li>
                      <span className="text-emerald-700">First click</span> <strong>"Test Connection"</strong> to ping and verify your API key with the provider.
                    </li>
                    <li>
                      <span className="text-terracotta">Next click</span> <strong>"Save Configuration"</strong> to store it in your session and begin generating blueprints.
                    </li>
                  </ol>
                </div>
              </div>

              {/* Top Recommendation: Google Gemini */}
              <div className="p-5 rounded-3xl bg-white border-2 border-terracotta/40 shadow-nm-sm space-y-3 relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-terracotta text-white shadow-sm">
                    ★ Highly Recommended
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-terracotta/15 text-terracotta flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-lg font-bold text-charcoal">
                      Google Gemini API (Best Performance & Free Tier)
                    </h3>
                    <p className="text-xs text-subtle">Recommended Model: <code>gemini-3.5-flash</code> or <code>gemini-2.5-flash</code></p>
                  </div>
                </div>

                <p className="text-xs text-charcoal/90 leading-relaxed">
                  Google Gemini is the <strong>best and fastest engine</strong> for Blueprint.ai. It offers generous free-tier limits, rapid generation (~3–5 seconds), and a massive context window that easily accommodates complex architectures, ERD data models, and complete 13-slide decks.
                </p>

                <div className="p-3.5 bg-[#F4F1EC] rounded-xl text-xs space-y-2 border border-border-warm font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-terracotta text-white text-[10px] flex items-center justify-center shrink-0">1</span>
                    <span>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-terracotta underline font-semibold inline-flex items-center gap-0.5">Google AI Studio <ExternalLink className="w-2.5 h-2.5" /></a></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-terracotta text-white text-[10px] flex items-center justify-center shrink-0">2</span>
                    <span>Click <strong>"Create API Key"</strong> (Free with standard Google account)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-terracotta text-white text-[10px] flex items-center justify-center shrink-0">3</span>
                    <span>Paste key into Blueprint.ai under <strong>"Connect Key"</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-charcoal">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center shrink-0">4</span>
                    <span><strong>First, click "Test Connection"</strong> to verify valid API access</span>
                  </div>
                  <div className="flex items-center gap-2 text-charcoal">
                    <span className="w-4 h-4 rounded-full bg-terracotta text-white text-[10px] flex items-center justify-center shrink-0">5</span>
                    <span><strong>Next, click "Save Configuration"</strong> to activate and start building</span>
                  </div>
                </div>
              </div>

              {/* OpenRouter (Free models + GPT/Claude access) */}
              <div className="p-5 rounded-3xl bg-white border border-border-warm shadow-nm-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-700 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-base font-bold text-charcoal">
                      OpenRouter: Free Models (:free) & All Major Models
                    </h3>
                    <p className="text-xs text-subtle">Access free models with $0 balance, or GPT-4o & Claude via single key</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-charcoal/90 leading-relaxed">
                  <p>
                    <strong>100% Free Models (No Credits Needed):</strong> In OpenRouter, select any model marked with <code className="bg-[#EFECE6] px-1.5 py-0.5 rounded font-mono text-[11px] font-bold text-emerald-800">:free</code> (e.g. <code>openrouter/free</code>, <code>google/gemma-4-31b-it:free</code>, <code>nvidia/nemotron-3-super-120b-a12b:free</code>). These require <strong>$0 balance</strong>.
                  </p>
                  <p>
                    <strong>Access GPT & Claude:</strong> If you have credits on OpenRouter, you can choose <code>openai/gpt-4o</code>, <code>openai/o3-mini</code>, <code>anthropic/claude-3.5-sonnet</code>, or <code>deepseek/deepseek-r1</code>.
                  </p>
                  <p className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    💡 <strong>Rate Limit Tip:</strong> If an OpenRouter free model hits its hourly limit, simply open Provider Settings and pick another <code>:free</code> model or switch to Google Gemini!
                  </p>
                </div>
              </div>

              {/* Direct Claude API */}
              <div className="p-5 rounded-3xl bg-white border border-border-warm shadow-nm-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-700 flex items-center justify-center font-bold">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-base font-bold text-charcoal">
                      Anthropic Claude (Official Direct API)
                    </h3>
                    <p className="text-xs text-subtle">Flagship model: <code>claude-3-7-sonnet-20250219</code></p>
                  </div>
                </div>

                <p className="text-xs text-charcoal/90 leading-relaxed">
                  Use your direct Anthropic API key from <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-terracotta underline font-semibold inline-flex items-center gap-0.5">console.anthropic.com <ExternalLink className="w-2.5 h-2.5" /></a>. Claude provides exceptional markdown formatting, clean entity relationship models, and architectural rigor.
                </p>
              </div>

              {/* Security Best Practice: Clear Key Before Leaving */}
              <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-300 shadow-nm-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-base font-bold text-amber-950">
                      Security Best Practice: Clear Your API Key Before Leaving
                    </h3>
                    <p className="text-xs text-amber-900/80">
                      Protect your credentials on shared, public, or office computers
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-amber-950 leading-relaxed">
                  <p>
                    While your key is never saved on our server, it remains in your browser's temporary session storage while the tab is open.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-amber-900 text-[11.5px] font-medium pl-1">
                    <li>
                      <strong>Before closing or leaving this website</strong>, click the <strong>"Disconnect / Clear Key"</strong> button to purge it from browser memory immediately.
                    </li>
                    <li>
                      Alternatively, click the red <strong>Trash icon</strong> inside the Provider Key Settings modal.
                    </li>
                    <li>
                      Closing all browser windows also terminates the session storage automatically.
                    </li>
                  </ul>
                </div>

                {providerConfig.apiKey && (
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleClearKeyNow}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear Active API Key Now
                    </button>
                    {clearedKeyFeedback && (
                      <span className="text-xs text-emerald-700 font-bold animate-fade-in flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Key purged from browser memory!
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Troubleshooting & Common Issues */}
              <div className="p-5 rounded-3xl bg-white border border-border-warm shadow-nm-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-stone-200 text-charcoal flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4 text-terracotta" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-base font-bold text-charcoal">
                      Troubleshooting & FAQ
                    </h3>
                    <p className="text-xs text-subtle">Solutions for common API errors and generation questions</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-charcoal leading-relaxed pt-1">
                  <div className="p-3 rounded-xl bg-[#F4F1EC] border border-border-warm space-y-1">
                    <p className="font-semibold text-charcoal">❓ "Invalid API Key" or Authentication Error:</p>
                    <p className="text-subtle text-[11.5px]">
                      Make sure you didn't accidentally copy leading or trailing spaces. You can click <strong>"Test Key"</strong> in the Provider Settings dialog before generating to verify it immediately.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F4F1EC] border border-border-warm space-y-1">
                    <p className="font-semibold text-charcoal">❓ Rate limit exceeded or 429 Error:</p>
                    <p className="text-subtle text-[11.5px]">
                      Free tiers have requests-per-minute limits. If hit, wait 30 seconds, switch to another model, or switch between <strong>Google Gemini</strong> and <strong>OpenRouter</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F4F1EC] border border-border-warm space-y-1">
                    <p className="font-semibold text-charcoal">❓ How does Regenerating a single Section work?</p>
                    <p className="text-subtle text-[11.5px]">
                      Once the 13 slides are generated, you don't need to rebuild the entire project to refine something. Simply click the circular <strong>Regenerate</strong> icon on that specific section to prompt the AI to rewrite only that section.
                    </p>
                  </div>
                </div>
              </div>

              {onOpenKeyModal && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenKeyModal(); }}
                    className="px-6 py-2.5 rounded-2xl btn-terracotta text-white text-xs font-semibold shadow-nm-sm"
                  >
                    Open Provider Key Settings →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FLOWCHARTS & PNG DOWNLOAD */}
          {activeTab === 'flowcharts' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-3xl bg-white border border-border-warm shadow-nm-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-terracotta/15 text-terracotta flex items-center justify-center">
                    <GitFork className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-lg font-bold text-charcoal">
                      Viewing & Downloading Flowcharts
                    </h3>
                    <p className="text-xs text-subtle">
                      Top-Down System Topologies in Slide 01 and Data Model ERDs in Slide 03
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* PNG Card */}
                  <div className="p-4 rounded-2xl bg-[#F4F1EC] border border-border-warm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-charcoal flex items-center gap-1.5">
                        <Download className="w-4 h-4 text-terracotta" />
                        Download PNG (Recommended)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-terracotta/15 text-terracotta font-semibold">
                        Raster Image
                      </span>
                    </div>
                    <p className="text-xs text-subtle leading-relaxed">
                      Converts the vector flowchart at <strong>2x retina scale</strong> onto an offscreen canvas with a clean white background. Perfect for:
                    </p>
                    <ul className="text-xs text-charcoal space-y-1 list-disc list-inside">
                      <li>PowerPoint, Keynote & Google Slides</li>
                      <li>Pitch decks and investor presentations</li>
                      <li>Jira tickets, PRDs, and Notion docs</li>
                    </ul>
                  </div>

                  {/* SVG Card */}
                  <div className="p-4 rounded-2xl bg-[#F4F1EC] border border-border-warm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-charcoal flex items-center gap-1.5">
                        <Download className="w-4 h-4 text-indigo-600" />
                        Download SVG
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 font-semibold">
                        Vector Graphic
                      </span>
                    </div>
                    <p className="text-xs text-subtle leading-relaxed">
                      Downloads the raw vector markup (<code className="text-[11px]">.svg</code>). Infinitely scalable with zero pixelation. Best for:
                    </p>
                    <ul className="text-xs text-charcoal space-y-1 list-disc list-inside">
                      <li>Importing into <strong>Figma</strong> or Illustrator</li>
                      <li>Embedding in web pages or READMEs</li>
                      <li>High-resolution print posters</li>
                    </ul>
                  </div>
                </div>

                {/* Separate Fullscreen View */}
                <div className="p-4 rounded-2xl bg-[#EFECE6] border border-border-warm space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-charcoal">
                    <Maximize2 className="w-4 h-4 text-terracotta" />
                    <span>How to View the Flowchart Separately in Fullscreen</span>
                  </div>
                  <p className="text-xs text-subtle leading-relaxed">
                    Every flowchart card has a <strong>"Zoom"</strong> button in its header. Clicking it opens a focused, distraction-free modal where you can:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono font-medium text-charcoal pt-1">
                    <div className="p-2 rounded-lg bg-white border border-border-warm text-center">+ / − to Zoom</div>
                    <div className="p-2 rounded-lg bg-white border border-border-warm text-center">R to Rotate 90°</div>
                    <div className="p-2 rounded-lg bg-white border border-border-warm text-center">0 to Reset Scale</div>
                    <div className="p-2 rounded-lg bg-white border border-border-warm text-center">Esc to Exit</div>
                  </div>
                </div>

                <div className="text-xs bg-amber-50/90 border border-amber-200 p-3 rounded-xl text-amber-900">
                  ℹ️ <strong>Note on Sections 10–13:</strong> Per design guidelines, Sections 10 (Cost Projections), 11 (Integrations), 12 (Testing Strategy), and 13 (Risk Register) strictly output structured tables rather than flowcharts so data is immediately readable.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXPORT & DOWNLOAD GUIDE */}
          {activeTab === 'export' && (
            <div className="space-y-6 animate-fade-in">
              {/* PDF Top Recommendation */}
              <div className="p-5 rounded-3xl bg-white border-2 border-terracotta/40 shadow-nm-sm space-y-3 relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-terracotta text-white shadow-sm">
                    ★ Recommended Export
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-terracotta/15 text-terracotta flex items-center justify-center font-bold">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-lg font-bold text-charcoal">
                      PDF Export (Print-Ready Clean Document)
                    </h3>
                    <p className="text-xs text-subtle">
                      Opens an optimized print-ready preview with pre-rendered diagrams
                    </p>
                  </div>
                </div>

                <p className="text-xs text-charcoal/90 leading-relaxed">
                  PDF is the <strong>gold standard format</strong> for sharing software blueprints with clients, CTOs, and investors. It preserves all rendered Mermaid flowcharts, database schemas, color palettes, and typography cleanly across all devices.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-[#F4F1EC] border border-border-warm text-xs space-y-1">
                    <div className="font-bold text-charcoal flex items-center gap-1.5">
                      <FileDown className="w-3.5 h-3.5 text-terracotta" />
                      Full Blueprint PDF
                    </div>
                    <p className="text-subtle text-[11px]">
                      Contains all 13 sections, complete system topology, data model, APIs, deployment, and custom design tokens.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F4F1EC] border border-border-warm text-xs space-y-1">
                    <div className="font-bold text-charcoal flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-700" />
                      PRD vs Architecture PDF
                    </div>
                    <p className="text-subtle text-[11px]">
                      Split exports: <strong>PRD</strong> for product managers (requirements & scope), or <strong>Technical Architecture</strong> for engineers.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-stone-100 rounded-xl text-xs text-charcoal/80 space-y-1">
                  <div className="font-semibold text-charcoal">Printing Tip for Best Results:</div>
                  <div className="text-[11px] text-subtle">
                    When the print dialog opens, ensure <strong>Destination: Save as PDF</strong> is selected, and in More Settings, verify <strong>Background graphics</strong> is checked so table styles and diagram colors print perfectly.
                  </div>
                </div>
              </div>

              {/* Other Export Formats */}
              <div className="p-5 rounded-3xl bg-white border border-border-warm shadow-nm-sm space-y-4">
                <h3 className="font-editorial text-base font-bold text-charcoal">
                  Alternative Export Formats
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Word */}
                  <div className="p-3.5 rounded-2xl bg-[#F4F1EC] border border-border-warm space-y-1 text-xs">
                    <div className="font-bold text-blue-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Word Document (.doc)
                    </div>
                    <p className="text-subtle text-[11px]">
                      Formatted for Microsoft Word and Google Docs with editable text and embedded vector SVGs. Ideal for team redlining.
                    </p>
                  </div>

                  {/* Markdown */}
                  <div className="p-3.5 rounded-2xl bg-[#F4F1EC] border border-border-warm space-y-1 text-xs">
                    <div className="font-bold text-terracotta flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5" />
                      Markdown (.md)
                    </div>
                    <p className="text-subtle text-[11px]">
                      Universal GitHub-Flavored Markdown. Drop straight into GitHub repositories, Notion, Obsidian, or internal wikis.
                    </p>
                  </div>

                  {/* JSON */}
                  <div className="p-3.5 rounded-2xl bg-[#F4F1EC] border border-border-warm space-y-1 text-xs">
                    <div className="font-bold text-indigo-700 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      JSON State Bundle
                    </div>
                    <p className="text-subtle text-[11px]">
                      Raw structured metadata containing the complete classification, all 13 sections, and chosen design system for developer pipelines.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border-warm bg-[#EFECE6]/80 flex items-center justify-between">
          <div className="text-xs text-subtle flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sage" />
            <span>Zero server storage · Fully client-side</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold btn-nm text-charcoal hover:bg-white"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
