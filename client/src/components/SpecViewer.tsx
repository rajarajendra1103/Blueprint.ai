import React, { useState } from 'react';
import {
  FileText,
  RefreshCw,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Edit3,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Database,
  Layers,
  Code2,
  Server,
  FolderTree,
  ShieldAlert,
  Coins,
  ShieldCheck,
  GitBranch,
  Zap,
  Layout,
  ListOrdered,
} from 'lucide-react';
import { SpecSection, SpecSectionId } from '@blueprint/shared';
import { useSession } from '../context/SessionContext';
import { copyToClipboard } from '../lib/export-helpers';
import { MarkdownRenderer } from './MarkdownRenderer';

const SECTION_ICONS: Record<string, any> = {
  architecture: Layers,
  requirements: FileText,
  algorithms: Code2,
  dataModel: Database,
  apiEndpoints: Server,
  folderStructure: FolderTree,
  businessLogic: GitBranch,
  techStack: Sparkles,
  deployment: Server,
  security: ShieldCheck,
  costEstimate: Coins,
  integrations: Sparkles,
  testingStrategy: Check,
  riskAssumptions: ShieldAlert,
};

const ALL_SPEC_SECTION_IDS: SpecSectionId[] = [
  'architecture',
  'requirements',
  'dataModel',
  'algorithms',
  'apiEndpoints',
  'folderStructure',
  'businessLogic',
  'deployment',
  'security',
  'costEstimate',
  'integrations',
  'testingStrategy',
  'riskAssumptions',
];

interface SpecViewerProps {
  onOpenKeyModal?: () => void;
}

export const SpecViewer: React.FC<SpecViewerProps> = ({ onOpenKeyModal }) => {
  const {
    idea,
    classification,
    specDoc,
    regenerateSection,
    generateSingleSection,
    generateAllRemainingSections,
    generatingSectionIds,
    isBatchGenerating,
    updateSectionContent,
    isGenerating,
    generationStage,
    error,
    setActiveStep,
  } = useSession();

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'deck' | 'scroll'>('deck');

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    architecture: true,
    requirements: true,
    dataModel: true,
  });

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<string>('');
  const [regenModalId, setRegenModalId] = useState<SpecSectionId | null>(null);
  const [regenInstructions, setRegenInstructions] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!specDoc || !classification) {
    if (isGenerating) {
      return (
        <div className="max-w-3xl mx-auto py-16 px-4 text-center animate-fade-in">
          <div className="card-nm p-8 sm:p-12 rounded-3xl space-y-6 relative overflow-hidden">
            <div className="w-16 h-16 rounded-3xl bg-terracotta/10 border border-terracotta/20 mx-auto flex items-center justify-center text-terracotta shadow-nm-sm relative">
              <Sparkles className="w-8 h-8 animate-spin text-terracotta" style={{ animationDuration: '3s' }} />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#EAE5DC] text-terracotta border border-border-warm shadow-nm-inset-sm">
                Autonomous Spec & Architecture Pipeline
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl font-extrabold text-charcoal">
                Synthesizing New Project Blueprint
              </h3>
              {idea && (
                <p className="text-xs sm:text-sm text-subtle max-w-md mx-auto line-clamp-2 italic">
                  "{idea}"
                </p>
              )}
            </div>

            {/* Current Stage Indicator */}
            <div className="p-4 rounded-2xl bg-[#EFECE6] border border-border-warm shadow-nm-inset-sm max-w-lg mx-auto text-left">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-charcoal mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-terracotta animate-ping" />
                <span className="truncate">{generationStage || 'Initializing generation pipeline...'}</span>
              </div>
              <div className="w-full bg-[#E2DDD3] h-1.5 rounded-full overflow-hidden">
                <div className="bg-terracotta h-full w-2/3 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Pipeline Stage Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left pt-2">
              <div className="p-3 rounded-xl bg-[#F4F1EC] border border-border-warm shadow-nm-sm text-xs">
                <div className="font-bold text-charcoal">1. Domain Analysis</div>
                <div className="text-[11px] text-subtle mt-0.5">Classification & stack</div>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F1EC] border border-border-warm shadow-nm-sm text-xs">
                <div className="font-bold text-charcoal">2. Architecture</div>
                <div className="text-[11px] text-subtle mt-0.5">Topology & ERD model</div>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F1EC] border border-border-warm shadow-nm-sm text-xs">
                <div className="font-bold text-charcoal">3. 13-Slide Deck</div>
                <div className="text-[11px] text-subtle mt-0.5">Drafting spec slides</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const isFreeLimit = /free.*(?:limit|tier|trie)|rate\s*limit|quota|credit|429|402|unavailable|failed to fetch|empty_response/i.test(error || '');
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#EFECE6] border border-border-warm shadow-nm-inset-sm mx-auto flex items-center justify-center text-subtle mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="font-editorial text-2xl font-bold text-charcoal">
          No Specification Generated Yet
        </h3>
        <p className="text-xs text-subtle mt-1 max-w-sm mx-auto">
          Please submit a software concept in the Idea phase to generate full architectural specifications.
        </p>
        {error && (
          <div className={`mt-4 p-3.5 rounded-2xl text-xs max-w-lg mx-auto text-left shadow-sm ${
            isFreeLimit
              ? 'bg-amber-50/90 border border-amber-300 text-amber-950'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <span className="font-bold">{isFreeLimit ? 'Free Tier / Model Limit Notice:' : 'Notice:'}</span> {error}
          </div>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setActiveStep(0)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold btn-terracotta text-white shadow-nm-sm hover:opacity-90 transition-all"
          >
            ← Return to Idea Phase
          </button>
          {onOpenKeyModal && (
            <button
              type="button"
              onClick={onOpenKeyModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-nm-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Change Model / Provider
            </button>
          )}
        </div>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = async (id: string, text: string) => {
    await copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartEdit = (sec: SpecSection) => {
    setEditingSectionId(sec.id);
    setEditBuffer(sec.content);
  };

  const handleSaveEdit = (secId: SpecSectionId) => {
    updateSectionContent(secId, editBuffer);
    setEditingSectionId(null);
  };

  const handleTriggerRegen = async () => {
    if (!regenModalId) return;
    const targetId = regenModalId;
    const instructions = regenInstructions;
    setRegenModalId(null);
    setRegenInstructions('');
    await regenerateSection(targetId, instructions);
  };

  const allSectionsList: SpecSection[] = ALL_SPEC_SECTION_IDS.map((id) => {
    return specDoc.sections[id] || {
      id,
      title: id,
      description: '',
      content: '',
      isApproved: false,
      isCustomGenerated: false,
    };
  });

  const activeSection = allSectionsList[activeSlideIndex] || allSectionsList[0];
  const activeIcon = SECTION_ICONS[activeSection.id] || FileText;
  const isCurrentlyGeneratingActive = Boolean(generatingSectionIds[activeSection.id]);

  const customGeneratedCount = allSectionsList.filter((s) => s.isCustomGenerated).length;
  const totalCount = allSectionsList.length;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6 animate-fade-in">
      {/* Top Overview & Classification Header */}
      <div className="card-nm p-6 sm:p-7 rounded-3xl border-l-4 border-l-terracotta">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-terracotta/10 text-terracotta border border-terracotta/20">
              {classification.platform}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#EAE5DC] text-charcoal border border-border-warm">
              {classification.domain}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-sage/15 text-sage-dark border border-sage/30">
              Tier: {classification.complexityTier}
            </span>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-[#EFECE6] border border-border-warm rounded-2xl">
            <button
              type="button"
              onClick={() => setViewMode('deck')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'deck'
                  ? 'bg-white text-terracotta shadow-nm-sm'
                  : 'text-subtle hover:text-charcoal'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>13-Slide Deck</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('scroll')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'scroll'
                  ? 'bg-white text-terracotta shadow-nm-sm'
                  : 'text-subtle hover:text-charcoal'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Full Scroll View</span>
            </button>
          </div>
        </div>

        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal">
          Executive Specification & System Architecture
        </h2>
        <p className="mt-2 text-sm text-charcoal/90 font-normal leading-relaxed">
          {classification.summary}
        </p>

        <div className="mt-4 pt-4 border-t border-border-warm flex flex-wrap items-center justify-between gap-4 text-xs text-subtle">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <strong className="text-charcoal font-medium">Core Problem:</strong>{' '}
              {classification.coreProblem}
            </div>
            <div>
              <strong className="text-charcoal font-medium">Target Audience:</strong>{' '}
              {classification.targetAudience}
            </div>
          </div>

          {/* Progress / Status Pill */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold text-charcoal">
              {customGeneratedCount} of {totalCount} Slides AI Synthesized
            </span>
            {customGeneratedCount < totalCount && (
              <button
                type="button"
                onClick={generateAllRemainingSections}
                disabled={isBatchGenerating || isGenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-terracotta text-white hover:opacity-90 transition-all disabled:opacity-50 shadow-nm-sm"
              >
                {isBatchGenerating ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Synthesizing Remaining...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3" />
                    <span>Generate All Remaining</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Consistency Warnings Panel */}
      {specDoc.warnings && specDoc.warnings.length > 0 && (
        <div className="card-nm p-5 rounded-3xl border border-amber-200/80 bg-amber-50/50 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Architecture Consistency Cross-Checks</span>
          </div>

          <div className="space-y-2">
            {specDoc.warnings.map((warn) => (
              <div
                key={warn.id}
                className="p-3 rounded-2xl bg-white/80 border border-amber-200 text-xs text-charcoal space-y-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-950 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-700" />
                    {warn.message}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    {warn.sourceSection} ↔ {warn.targetSection}
                  </span>
                </div>
                {warn.suggestion && (
                  <p className="text-subtle text-[11px] pl-5">
                    <strong>Suggestion:</strong> {warn.suggestion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DECK VIEW: 13-Slide List Sidebar + Active Slide Showcase */}
      {viewMode === 'deck' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 13-Slide Deck Navigator */}
          <div className="lg:col-span-4 card-nm p-4 rounded-3xl space-y-3 bg-[#F4F1EC]">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-border-warm">
              <div className="flex items-center gap-2">
                <span className="font-editorial text-base font-bold text-charcoal">
                  13-Slide Deck
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-terracotta/15 text-terracotta">
                  {customGeneratedCount}/{totalCount}
                </span>
              </div>

              {customGeneratedCount < totalCount && (
                <button
                  type="button"
                  onClick={generateAllRemainingSections}
                  disabled={isBatchGenerating}
                  className="text-[11px] font-medium text-terracotta hover:underline flex items-center gap-1 disabled:opacity-50"
                  title="Generate all remaining baseline sections"
                >
                  <Zap className="w-3 h-3" />
                  <span>Gen All</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5 max-h-[750px] overflow-y-auto pr-1">
              {allSectionsList.map((sec, idx) => {
                const Icon = SECTION_ICONS[sec.id] || FileText;
                const isSelected = idx === activeSlideIndex;
                const isGeneratingSec = Boolean(generatingSectionIds[sec.id]);
                const isCustom = sec.isCustomGenerated;

                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      setActiveSlideIndex(idx);
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                    className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'bg-white text-charcoal border-2 border-terracotta shadow-nm-sm'
                        : 'bg-[#EFECE6]/70 hover:bg-white/80 text-charcoal/80 border border-border-warm'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-[11px] font-mono font-bold w-5 text-right shrink-0 ${
                        isSelected ? 'text-terracotta' : 'text-subtle'
                      }`}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-terracotta/15 text-terracotta' : 'bg-[#EAE5DC] text-subtle'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate leading-tight">
                          {sec.title}
                        </div>
                        <div className="text-[10px] text-subtle truncate">
                          {isGeneratingSec
                            ? 'Synthesizing...'
                            : isCustom
                            ? 'Deep AI Spec'
                            : 'Domain Framework'}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isGeneratingSec ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                      ) : isCustom ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          Click to Gen
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Focused Active Slide Showcase */}
          <div className="lg:col-span-8 card-nm rounded-3xl overflow-hidden bg-white/70 border border-border-warm">
            {/* Active Slide Header Bar */}
            <div className="p-6 bg-[#F4F1EC] border-b border-border-warm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#EFECE6] border border-border-warm flex items-center justify-center text-terracotta shadow-nm-inset-sm shrink-0">
                  {React.createElement(activeIcon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-terracotta uppercase tracking-wider">
                      Slide {String(activeSlideIndex + 1).padStart(2, '0')} of 13
                    </span>
                    {activeSection.isCustomGenerated ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3 h-3" /> AI Validated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        <Sparkles className="w-3 h-3 text-amber-600" /> Baseline Ready
                      </span>
                    )}
                  </div>
                  <h3 className="font-editorial text-xl sm:text-2xl font-bold text-charcoal mt-0.5">
                    {activeSection.title}
                  </h3>
                  <p className="text-xs text-subtle mt-0.5">{activeSection.description}</p>
                </div>
              </div>

              {/* Action Buttons for Active Slide */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {!activeSection.isCustomGenerated && (
                  <button
                    type="button"
                    onClick={() => generateSingleSection(activeSection.id)}
                    disabled={isCurrentlyGeneratingActive || isGenerating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-terracotta text-white shadow-nm-sm hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isCurrentlyGeneratingActive ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Custom AI</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCopy(activeSection.id, activeSection.content)}
                  className="p-2 rounded-xl text-subtle hover:text-charcoal hover:bg-[#EFECE6] transition-colors"
                  title="Copy markdown"
                >
                  {copiedId === activeSection.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (editingSectionId === activeSection.id) {
                      handleSaveEdit(activeSection.id);
                    } else {
                      handleStartEdit(activeSection);
                    }
                  }}
                  className={`p-2 rounded-xl transition-colors ${
                    editingSectionId === activeSection.id
                      ? 'bg-terracotta text-white'
                      : 'text-subtle hover:text-charcoal hover:bg-[#EFECE6]'
                  }`}
                  title={editingSectionId === activeSection.id ? 'Save edits' : 'Edit markdown'}
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setRegenModalId(activeSection.id)}
                  disabled={isGenerating || isCurrentlyGeneratingActive}
                  className="p-2 rounded-xl text-subtle hover:text-terracotta hover:bg-[#EFECE6] transition-colors disabled:opacity-50"
                  title="Regenerate with custom prompt"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Baseline Notice Banner (If not yet synthesized) */}
            {!activeSection.isCustomGenerated && (
              <div className="p-4 bg-amber-50/70 border-b border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5 text-xs text-amber-950">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Domain Framework Active:</span>{' '}
                    This slide has an initial framework. Click to synthesize custom production-grade specifications.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => generateSingleSection(activeSection.id)}
                  disabled={isCurrentlyGeneratingActive || isGenerating}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm shrink-0 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isCurrentlyGeneratingActive ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Generate {activeSection.title} (~4s)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Active Slide Content Body */}
            <div className="p-6 min-h-[500px]">
              {editingSectionId === activeSection.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editBuffer}
                    onChange={(e) => setEditBuffer(e.target.value)}
                    rows={18}
                    className="w-full bg-[#EFECE6] border border-border-warm rounded-2xl p-4 font-mono text-xs text-charcoal shadow-nm-inset-sm focus:ring-2 focus:ring-terracotta outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingSectionId(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-subtle hover:text-charcoal"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(activeSection.id)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold btn-terracotta text-white"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <MarkdownRenderer content={activeSection.content} sectionTitle={activeSection.title} />
              )}
            </div>

            {/* Slide Footer Navigation (Previous / Next Slide) */}
            <div className="p-4 bg-[#F4F1EC] border-t border-border-warm flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (activeSlideIndex > 0) {
                    setActiveSlideIndex((prev) => prev - 1);
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }
                }}
                disabled={activeSlideIndex === 0}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#EFECE6] border border-border-warm text-charcoal hover:bg-[#EAE5DC] flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>
                  {activeSlideIndex > 0
                    ? `Previous: ${allSectionsList[activeSlideIndex - 1]?.title}`
                    : 'First Slide'}
                </span>
              </button>

              <span className="text-xs font-mono text-subtle hidden sm:inline-block">
                Slide {activeSlideIndex + 1} of {totalCount}
              </span>

              {activeSlideIndex < totalCount - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveSlideIndex((prev) => prev + 1);
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-semibold btn-terracotta text-white flex items-center gap-1.5 shadow-nm-sm hover:opacity-90 transition-all"
                >
                  <span>Next: {allSectionsList[activeSlideIndex + 1]?.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow-nm-sm transition-all"
                >
                  <span>Proceed to Tech Stack (Checkpoint 1)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* SCROLL VIEW: All 13 sections stacked with expand/collapse */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-editorial text-xl font-bold text-charcoal">
              All 13 Specification Sections
            </h3>
            <div className="flex items-center gap-2 text-xs font-mono text-subtle">
              <button
                type="button"
                onClick={() => {
                  const all: Record<string, boolean> = {};
                  ALL_SPEC_SECTION_IDS.forEach((id) => (all[id] = true));
                  setExpandedSections(all);
                }}
                className="hover:text-charcoal underline"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setExpandedSections({})}
                className="hover:text-charcoal underline"
              >
                Collapse All
              </button>
            </div>
          </div>

          {allSectionsList.map((sec, idx) => {
            const isExpanded = expandedSections[sec.id] ?? false;
            const isEditing = editingSectionId === sec.id;
            const Icon = SECTION_ICONS[sec.id] || FileText;
            const isGeneratingSec = Boolean(generatingSectionIds[sec.id]);

            return (
              <div
                key={sec.id}
                className="card-nm rounded-3xl overflow-hidden transition-all duration-200"
              >
                <div className="p-5 flex items-center justify-between gap-4 bg-[#F4F1EC] border-b border-border-warm">
                  <div
                    onClick={() => toggleExpand(sec.id)}
                    className="flex items-center gap-3.5 flex-1 cursor-pointer select-none"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-[#EFECE6] border border-border-warm flex items-center justify-center text-terracotta shadow-nm-inset-sm shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-subtle">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h4 className="text-base font-bold text-charcoal">{sec.title}</h4>
                        {sec.isCustomGenerated ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" /> Validated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            Baseline
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-subtle line-clamp-1">{sec.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!sec.isCustomGenerated && (
                      <button
                        type="button"
                        onClick={() => generateSingleSection(sec.id)}
                        disabled={isGeneratingSec}
                        className="px-3 py-1 rounded-xl text-xs font-semibold bg-terracotta text-white shadow-nm-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        {isGeneratingSec ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Zap className="w-3 h-3" />
                        )}
                        <span>Gen</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopy(sec.id, sec.content)}
                      className="p-2 rounded-xl text-subtle hover:text-charcoal hover:bg-[#EFECE6] transition-colors"
                      title="Copy section markdown"
                    >
                      {copiedId === sec.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (isEditing) {
                          handleSaveEdit(sec.id);
                        } else {
                          handleStartEdit(sec);
                          if (!isExpanded) toggleExpand(sec.id);
                        }
                      }}
                      className={`p-2 rounded-xl transition-colors ${
                        isEditing
                          ? 'bg-terracotta text-white'
                          : 'text-subtle hover:text-charcoal hover:bg-[#EFECE6]'
                      }`}
                      title={isEditing ? 'Save edits' : 'Edit markdown'}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegenModalId(sec.id)}
                      disabled={isGenerating}
                      className="p-2 rounded-xl text-subtle hover:text-terracotta hover:bg-[#EFECE6] transition-colors disabled:opacity-50"
                      title="Regenerate this section"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpand(sec.id)}
                      className="p-2 rounded-xl text-subtle hover:text-charcoal hover:bg-[#EFECE6] transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-6 bg-white/40">
                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          value={editBuffer}
                          onChange={(e) => setEditBuffer(e.target.value)}
                          rows={14}
                          className="w-full bg-[#EFECE6] border border-border-warm rounded-2xl p-4 font-mono text-xs text-charcoal shadow-nm-inset-sm focus:ring-2 focus:ring-terracotta outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingSectionId(null)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-subtle hover:text-charcoal"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(sec.id)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold btn-terracotta text-white"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <MarkdownRenderer content={sec.content} sectionTitle={sec.title} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Checkpoint 1 Advance CTA */}
      <div className="card-nm p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F4F1EC]">
        <div className="flex-1">
          <span className="text-[11px] font-mono font-bold text-terracotta uppercase tracking-wider">
            All 13 Slides Available • Checkpoint 1 Ready
          </span>
          <h4 className="font-editorial text-xl font-bold text-charcoal">
            Review & Finalize Technology Stack
          </h4>
          <p className="text-xs text-subtle mt-0.5">
            Proceed to Checkpoint 1 to select and calibrate your framework, runtime, and database topology.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-semibold btn-terracotta text-white flex items-center justify-center gap-2 shadow-nm-terracotta hover:opacity-95 transition-all"
        >
          <span>Proceed to Tech Stack (Checkpoint 1)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Regeneration Modal */}
      {regenModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
          <div className="card-nm max-w-md w-full p-6 rounded-3xl bg-[#F4F1EC] border border-border-warm shadow-nm-lg">
            <div className="flex items-center justify-between pb-3 border-b border-border-warm">
              <h4 className="font-editorial text-lg font-bold text-charcoal">
                Regenerate {specDoc.sections[regenModalId]?.title}
              </h4>
              <button
                type="button"
                onClick={() => setRegenModalId(null)}
                className="text-subtle hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-xs text-subtle">
              The AI will re-synthesize this slide while preserving consistency with your foundation architecture and data model.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Custom Instructions (Optional)
              </label>
              <textarea
                value={regenInstructions}
                onChange={(e) => setRegenInstructions(e.target.value)}
                placeholder="e.g. Focus on low-latency WebSockets, or change the primary database to PostgreSQL with pgvector..."
                rows={3}
                className="w-full bg-[#EFECE6] border border-border-warm rounded-2xl p-3 text-xs text-charcoal font-sans shadow-nm-inset-sm focus:ring-2 focus:ring-terracotta outline-none"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRegenModalId(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-subtle"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTriggerRegen}
                disabled={isGenerating}
                className="px-5 py-2 rounded-xl text-xs font-semibold btn-terracotta text-white flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-run Section</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
