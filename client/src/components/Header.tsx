import React from 'react';
import { Layers, Key, ShieldCheck, Trash2, RefreshCw, BookOpen } from 'lucide-react';
import { useSession } from '../context/SessionContext';

interface HeaderProps {
  onOpenKeyModal: () => void;
  onOpenInstructions?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenKeyModal, onOpenInstructions }) => {
  const { providerConfig, clearApiKey, resetAll, activeStep } = useSession();

  const hasKey = Boolean(providerConfig.apiKey);

  const getProviderLabel = () => {
    switch (providerConfig.provider) {
      case 'gemini': return 'Google Gemini';
      case 'claude':
      case 'anthropic': return 'Anthropic Claude';
      case 'openrouter': return 'OpenRouter';
      case 'grok': return 'xAI Grok';
      case 'nvidia': return 'NVIDIA NIM';
      default: return providerConfig.provider;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F4F1EC]/90 backdrop-blur-md border-b border-border-warm px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-terracotta text-white flex items-center justify-center shadow-nm-sm font-editorial text-xl font-bold tracking-tight">
            <Layers className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-editorial text-2xl font-bold text-charcoal tracking-tight">
                Blueprint<span className="text-terracotta">.ai</span>
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium tracking-wide bg-[#EFECE6] text-subtle border border-border-warm shadow-nm-inset-sm">
                BYOK • Stateless
              </span>
            </div>
            <p className="hidden md:block text-xs text-subtle font-medium">
              Autonomous Software Spec, Architecture & Design Generator
            </p>
          </div>
        </div>

        {/* Action Controls & Provider Status */}
        <div className="flex items-center gap-2.5">
          {/* Instructions Guide Button */}
          {onOpenInstructions && (
            <button
              type="button"
              onClick={onOpenInstructions}
              title="BYOK & Usage Guide (Recommended Gemini API, Free OpenRouter, Flowcharts & PDF Export)"
              className="px-3 py-1.5 rounded-2xl text-xs font-semibold text-charcoal bg-[#EFECE6] hover:bg-white border border-border-warm shadow-nm-sm transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-terracotta" />
              <span className="hidden sm:inline">Guide & Instructions</span>
            </button>
          )}

          {/* Provider Status Pill */}
          <div className="flex items-center gap-2 bg-[#EFECE6] border border-border-warm rounded-2xl p-1.5 pl-3 shadow-nm-inset-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-charcoal">
              <span
                className={`w-2 h-2 rounded-full ${
                  hasKey ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              />
              <span className="hidden sm:inline font-mono font-semibold">{getProviderLabel()}</span>
              <span className="sm:hidden font-mono font-semibold">{providerConfig.provider}</span>
            </div>

            {/* Clear Key Button (Per user request!) */}
            {hasKey && (
              <button
                type="button"
                onClick={clearApiKey}
                title="Clear API Key from session"
                className="px-2 py-1 rounded-xl text-[11px] font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1 border border-red-200"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden md:inline">Clear Key</span>
              </button>
            )}

            {/* Provider Settings Button */}
            <button
              type="button"
              onClick={onOpenKeyModal}
              className="px-3 py-1 rounded-xl text-xs font-medium text-terracotta hover:text-terracotta-hover bg-white/70 hover:bg-white transition-all shadow-nm-sm flex items-center gap-1.5 border border-border-warm"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{hasKey ? 'Configured' : 'Connect Key'}</span>
            </button>
          </div>

          {/* Reset / Start Over */}
          {activeStep > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset this specification session and start with a fresh idea?')) {
                  resetAll();
                }
              }}
              title="Reset project session"
              className="p-2 rounded-xl text-subtle hover:text-charcoal bg-[#F4F1EC] hover:bg-[#EFECE6] border border-border-warm shadow-nm-sm transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
