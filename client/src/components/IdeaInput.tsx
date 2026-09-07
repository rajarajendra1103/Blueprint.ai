import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lightbulb, AlertCircle } from 'lucide-react';
import { useSession } from '../context/SessionContext';

const PRESET_IDEAS = [
  {
    title: 'Uber for Pet Grooming',
    desc: 'On-demand mobile pet grooming service with live GPS technician tracking, service tier selection, automated dispatch, and Stripe billing.',
  },
  {
    title: 'Freelance Escrow Marketplace',
    desc: 'B2B freelance platform with cryptographic milestone escrow, dispute arbitration state machine, and multi-currency payouts.',
  },
  {
    title: 'AI Agent Observability SaaS',
    desc: 'Developer telemetry platform monitoring multi-agent LLM systems with token cost attribution, latency traces, and hallucination alerts.',
  },
  {
    title: 'Multi-Tenant Clinic EHR',
    desc: 'HIPAA-compliant patient record system with encrypted telemedicine notes, HL7/FHIR integration, and immutable role audit logs.',
  },
];

interface IdeaInputProps {
  onOpenKeyModal: () => void;
}

export const IdeaInput: React.FC<IdeaInputProps> = ({ onOpenKeyModal }) => {
  const { idea, setIdea, runPipeline, isGenerating, generationStage, error, providerConfig } = useSession();
  const [localIdea, setLocalIdea] = useState<string>(idea);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localIdea.trim()) return;
    setIdea(localIdea);
    runPipeline(localIdea);
  };

  const handleSelectPreset = (presetDesc: string) => {
    setLocalIdea(presetDesc);
    setIdea(presetDesc);
  };

  const hasKey = Boolean(providerConfig.apiKey);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#EAE5DC] text-terracotta border border-border-warm shadow-nm-inset-sm mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Autonomous Spec & Design Engine
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-extrabold text-charcoal tracking-tight leading-[1.15]">
          Turn Raw Ideas into <span className="text-terracotta italic">Production Specs</span>
        </h1>
        <p className="mt-3 text-base text-subtle max-w-xl mx-auto font-normal">
          Provide your software concept. Blueprint.ai autonomously builds your architecture, data model, named algorithms, API contracts, folder tree, and design system.
        </p>
      </div>

      {/* Main Input Card */}
      <form onSubmit={handleSubmit} className="card-nm p-6 sm:p-8 rounded-3xl relative">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-terracotta" />
            Software Concept / Elevator Pitch
          </label>
          <span className="text-xs font-mono text-subtle">
            {localIdea.length} characters
          </span>
        </div>

        <div className="relative">
          <textarea
            value={localIdea}
            onChange={(e) => setLocalIdea(e.target.value)}
            disabled={isGenerating}
            placeholder="Describe your web app, mobile service, developer tool, or game concept in plain English. For example: A collaborative task management platform with real-time markdown docs and automated weekly sprint digests..."
            rows={5}
            className="w-full bg-[#EFECE6] border border-border-warm rounded-2xl p-4 text-sm text-charcoal placeholder:text-stone-400 font-sans shadow-nm-inset-sm focus:ring-2 focus:ring-terracotta outline-none transition-all resize-y"
          />
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Generation Stopped:</span> {error}
            </div>
            {!hasKey && (
              <button
                type="button"
                onClick={onOpenKeyModal}
                className="px-2.5 py-1 bg-white rounded-lg border border-red-300 font-semibold text-red-700 hover:bg-red-50 transition-colors"
              >
                Configure Key
              </button>
            )}
          </div>
        )}

        {/* Action Row */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-subtle">
            <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            <span>
              Engine: <strong className="text-charcoal font-mono">{providerConfig.provider}</strong>
            </span>
            {!hasKey ? (
              <button
                type="button"
                onClick={onOpenKeyModal}
                className="text-terracotta underline font-semibold ml-1 hover:text-terracotta-hover transition-colors"
              >
                (Key Required)
              </button>
            ) : (
              <span className="text-emerald-700 font-semibold ml-1">
                ✓ Ready
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isGenerating || localIdea.trim().length < 5}
            className="w-full sm:w-auto px-7 py-3 rounded-2xl text-sm font-semibold btn-terracotta text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>{generationStage || 'Synthesizing Architecture...'}</span>
              </>
            ) : (
              <>
                <span>Generate Blueprint Specification</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preset Ideas Section */}
      <div className="mt-8">
        <p className="text-xs font-semibold text-subtle uppercase tracking-wider mb-3 text-center sm:text-left">
          Or test with curated domain concepts:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_IDEAS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => handleSelectPreset(preset.desc)}
              className="p-4 rounded-2xl bg-[#F4F1EC] border border-border-warm hover:border-terracotta/50 shadow-nm-sm text-left transition-all group"
            >
              <h4 className="text-xs font-bold text-charcoal group-hover:text-terracotta flex items-center justify-between">
                <span>{preset.title}</span>
                <span className="text-[11px] font-mono text-terracotta opacity-0 group-hover:opacity-100 transition-opacity">
                  Use Preset →
                </span>
              </h4>
              <p className="mt-1 text-xs text-subtle line-clamp-2">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
