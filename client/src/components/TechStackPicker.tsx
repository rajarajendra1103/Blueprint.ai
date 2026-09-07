import React, { useState, useEffect } from 'react';
import { Cpu, Check, ArrowRight, ArrowLeft, Sparkles, Layers, Database, Palette, Cloud } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { TechStackSelection } from '@blueprint/shared';

export const TechStackPicker: React.FC = () => {
  const {
    classification,
    selectedTechStack,
    setSelectedTechStack,
    proceedToDesign,
    isGenerating,
    generationStage,
    setActiveStep,
  } = useSession();

  const suggested = classification?.suggestedTechStacks;

  const [customizing, setCustomizing] = useState<boolean>(false);
  const [formState, setFormState] = useState<TechStackSelection>(() => {
    return (
      selectedTechStack || {
        frontend: suggested?.recommended.frontend || 'Next.js 15 (React 19)',
        backend: suggested?.recommended.backend || 'Node.js + Express with TypeScript',
        database: suggested?.recommended.database || 'PostgreSQL 16 + Redis',
        styling: suggested?.recommended.styling || 'Tailwind CSS + shadcn/ui',
        deployment: suggested?.recommended.deployment || 'Vercel (Frontend) + Fly.io / AWS ECS (Backend)',
        notes: '',
      }
    );
  });

  // Auto-select the recommended stack on first mount if nothing selected yet
  useEffect(() => {
    if (!selectedTechStack && suggested?.recommended) {
      const rec: TechStackSelection = {
        frontend: suggested.recommended.frontend,
        backend: suggested.recommended.backend,
        database: suggested.recommended.database,
        styling: suggested.recommended.styling,
        deployment: suggested.recommended.deployment,
        notes: suggested.recommended.rationale || '',
      };
      setSelectedTechStack(rec);
      setFormState(rec);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!classification || !suggested) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <p className="text-sm text-subtle">No classification found. Please complete the idea phase.</p>
      </div>
    );
  }

  const handleSelectStack = (stack: any) => {
    const newStack: TechStackSelection = {
      frontend: stack.frontend,
      backend: stack.backend,
      database: stack.database,
      styling: stack.styling,
      deployment: stack.deployment,
      notes: stack.rationale,
    };
    setSelectedTechStack(newStack);
    setFormState(newStack);
  };

  const handleCustomChange = (field: keyof TechStackSelection, value: string) => {
    const updated = { ...formState, [field]: value };
    setFormState(updated);
    setSelectedTechStack(updated);
  };

  const isRecommendedSelected =
    selectedTechStack?.frontend === suggested.recommended.frontend &&
    selectedTechStack?.backend === suggested.recommended.backend;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#EAE5DC] text-terracotta border border-border-warm shadow-nm-inset-sm mb-3">
          <Cpu className="w-3.5 h-3.5" />
          Checkpoint 1
        </span>
        <h2 className="font-editorial text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
          Select Your Production Tech Stack
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-subtle font-normal">
          Pick one of the architect-curated foundations or customize each tier for your development team.
        </p>
      </div>

      {/* Context Banner — links spec back to this step */}
      <div className="p-4 rounded-2xl bg-[#EAE5DC] border border-border-warm shadow-nm-inset-sm flex items-start gap-3 text-xs">
        <div className="w-5 h-5 rounded-lg bg-terracotta/15 text-terracotta flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div>
          <p className="font-semibold text-charcoal mb-0.5">Your Spec was generated using the Recommended Stack below</p>
          <p className="text-subtle leading-relaxed">
            The 12 specification sections (Architecture, Data Model, APIs, etc.) already reference this stack.
            You can switch stacks — the spec will still be valid. The Recommended Stack is pre-selected for consistency.
          </p>
        </div>
      </div>

      {/* Recommended vs Alternative Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommended Stack */}
        <div
          onClick={() => { handleSelectStack(suggested.recommended); setCustomizing(false); }}
          className={`card-nm p-6 sm:p-7 rounded-3xl cursor-pointer border-2 transition-all relative ${
            isRecommendedSelected && !customizing
              ? 'border-terracotta bg-white/70 ring-2 ring-terracotta/20 shadow-nm-terracotta'
              : 'border-transparent hover:border-border-warm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-terracotta/15 text-terracotta border border-terracotta/30">
              ✓ Recommended Stack
            </span>
            {isRecommendedSelected && !customizing && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Pre-selected
              </span>
            )}
          </div>

          <h3 className="font-editorial text-xl font-bold text-charcoal">
            {suggested.recommended.name}
          </h3>
          <p className="text-xs text-subtle mt-1 mb-5">
            {suggested.recommended.rationale}
          </p>

          <div className="space-y-2.5 text-xs text-charcoal">
            <div className="flex items-start gap-2">
              <Layers className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
              <div><strong>Frontend:</strong> {suggested.recommended.frontend}</div>
            </div>
            <div className="flex items-start gap-2">
              <Cpu className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
              <div><strong>Backend:</strong> {suggested.recommended.backend}</div>
            </div>
            <div className="flex items-start gap-2">
              <Database className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
              <div><strong>Database:</strong> {suggested.recommended.database}</div>
            </div>
            <div className="flex items-start gap-2">
              <Palette className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
              <div><strong>Styling:</strong> {suggested.recommended.styling}</div>
            </div>
            <div className="flex items-start gap-2">
              <Cloud className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
              <div><strong>Deploy:</strong> {suggested.recommended.deployment}</div>
            </div>
          </div>
        </div>

        {/* Alternative Stack */}
        <div
          onClick={() => { handleSelectStack(suggested.alternative); setCustomizing(false); }}
          className={`card-nm p-6 sm:p-7 rounded-3xl cursor-pointer border-2 transition-all relative ${
            !isRecommendedSelected && !customizing
              ? 'border-terracotta bg-white/70 ring-2 ring-terracotta/20 shadow-nm-terracotta'
              : 'border-transparent hover:border-border-warm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-sage/20 text-sage-dark border border-sage/40">
              Alternative Architecture
            </span>
            {!isRecommendedSelected && !customizing && (
              <span className="w-6 h-6 rounded-full bg-terracotta text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
          </div>

          <h3 className="font-editorial text-xl font-bold text-charcoal">
            {suggested.alternative.name}
          </h3>
          <p className="text-xs text-subtle mt-1 mb-5">
            {suggested.alternative.rationale}
          </p>

          <div className="space-y-2.5 text-xs text-charcoal">
            <div className="flex items-start gap-2">
              <Layers className="w-4 h-4 text-sage shrink-0 mt-0.5" />
              <div><strong>Frontend:</strong> {suggested.alternative.frontend}</div>
            </div>
            <div className="flex items-start gap-2">
              <Cpu className="w-4 h-4 text-sage shrink-0 mt-0.5" />
              <div><strong>Backend:</strong> {suggested.alternative.backend}</div>
            </div>
            <div className="flex items-start gap-2">
              <Database className="w-4 h-4 text-sage shrink-0 mt-0.5" />
              <div><strong>Database:</strong> {suggested.alternative.database}</div>
            </div>
            <div className="flex items-start gap-2">
              <Palette className="w-4 h-4 text-sage shrink-0 mt-0.5" />
              <div><strong>Styling:</strong> {suggested.alternative.styling}</div>
            </div>
            <div className="flex items-start gap-2">
              <Cloud className="w-4 h-4 text-sage shrink-0 mt-0.5" />
              <div><strong>Deploy:</strong> {suggested.alternative.deployment}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Customize Tiers Toggle */}
      <div className="card-nm p-6 rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-charcoal">Custom Technology Overrides</h4>
            <p className="text-xs text-subtle">Fine-tune individual frameworks or database layers.</p>
          </div>
          <button
            type="button"
            onClick={() => setCustomizing(!customizing)}
            className="px-4 py-2 rounded-xl text-xs font-semibold btn-nm text-charcoal"
          >
            {customizing ? 'Lock Choices' : 'Customize Tiers'}
          </button>
        </div>

        {customizing && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-border-warm animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Frontend Layer</label>
              <input
                type="text"
                value={formState.frontend}
                onChange={(e) => handleCustomChange('frontend', e.target.value)}
                className="w-full bg-[#EFECE6] border border-border-warm rounded-xl px-3 py-2 text-xs font-mono text-charcoal shadow-nm-inset-sm focus:ring-2 focus:ring-terracotta outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Backend Layer</label>
              <input
                type="text"
                value={formState.backend}
                onChange={(e) => handleCustomChange('backend', e.target.value)}
                className="w-full bg-[#EFECE6] border border-border-warm rounded-xl px-3 py-2 text-xs font-mono text-charcoal shadow-nm-inset-sm focus:ring-2 focus:ring-terracotta outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Database & Storage</label>
              <input
                type="text"
                value={formState.database}
                onChange={(e) => handleCustomChange('database', e.target.value)}
                className="w-full bg-[#EFECE6] border border-border-warm rounded-xl px-3 py-2 text-xs font-mono text-charcoal shadow-nm-inset-sm focus:ring-2 focus:ring-terracotta outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Styling / UI Library</label>
              <input
                type="text"
                value={formState.styling}
                onChange={(e) => handleCustomChange('styling', e.target.value)}
                className="w-full bg-[#EFECE6] border border-border-warm rounded-xl px-3 py-2 text-xs font-mono text-charcoal shadow-nm-inset-sm focus:ring-2 focus:ring-terracotta outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-charcoal mb-1">Cloud Hosting & CI/CD</label>
              <input
                type="text"
                value={formState.deployment}
                onChange={(e) => handleCustomChange('deployment', e.target.value)}
                className="w-full bg-[#EFECE6] border border-border-warm rounded-xl px-3 py-2 text-xs font-mono text-charcoal shadow-nm-inset-sm focus:ring-2 focus:ring-terracotta outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border-warm">
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className="px-5 py-2.5 rounded-2xl text-xs font-semibold btn-nm text-charcoal flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Spec Sections</span>
        </button>

        <button
          type="button"
          onClick={proceedToDesign}
          disabled={isGenerating}
          className="px-6 py-3 rounded-2xl text-xs font-semibold btn-terracotta text-white flex items-center gap-2 shadow-nm-terracotta disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>{generationStage || 'Synthesizing Design Bundles...'}</span>
            </>
          ) : (
            <>
              <span>Lock Stack & Generate Stage 2 Design</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
