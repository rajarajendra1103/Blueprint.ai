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
  Database,
  Layers,
  Code2,
  Server,
  FolderTree,
  ShieldAlert,
  Coins,
  ShieldCheck,
  GitBranch,
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

export const SpecViewer: React.FC = () => {
  const {
    idea,
    classification,
    specDoc,
    regenerateSection,
    updateSectionContent,
    isGenerating,
    generationStage,
    setActiveStep,
  } = useSession();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    architecture: true,
    requirements: true,
    dataModel: true,
    apiEndpoints: true,
  });

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<string>('');
  const [regenModalId, setRegenModalId] = useState<SpecSectionId | null>(null);
  const [regenInstructions, setRegenInstructions] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!specDoc || !classification) {
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

  const sectionsList = Object.values(specDoc.sections);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-8 animate-fade-in">
      {/* Classification Summary Card */}
      <div className="card-nm p-6 sm:p-7 rounded-3xl border-l-4 border-l-terracotta">
        <div className="flex flex-wrap items-center gap-2 mb-3">
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

        <h2 className="font-editorial text-2xl font-bold text-charcoal">
          Executive Specification & System Architecture
        </h2>
        <p className="mt-2 text-sm text-charcoal/90 font-normal leading-relaxed">
          {classification.summary}
        </p>

        <div className="mt-4 pt-4 border-t border-border-warm flex flex-wrap gap-x-6 gap-y-2 text-xs text-subtle">
          <div>
            <strong className="text-charcoal font-medium">Core Problem:</strong>{' '}
            {classification.coreProblem}
          </div>
          <div>
            <strong className="text-charcoal font-medium">Target Audience:</strong>{' '}
            {classification.targetAudience}
          </div>
        </div>
      </div>

      {/* Consistency Warnings Panel (from Rule-based diffing) */}
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

      {/* Progressive 12 Sections Viewer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-editorial text-xl font-bold text-charcoal">
            Specification Blueprint ({sectionsList.length} Sections)
          </h3>
          <span className="text-xs text-subtle font-mono">
            All sections editable & regeneratable
          </span>
        </div>

        {sectionsList.map((sec, idx) => {
          const isExpanded = expandedSections[sec.id] ?? false;
          const isEditing = editingSectionId === sec.id;
          const Icon = SECTION_ICONS[sec.id] || FileText;

          return (
            <div
              key={sec.id}
              className="card-nm rounded-3xl overflow-hidden transition-all duration-200"
            >
              {/* Section Header */}
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
                      {sec.isApproved && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" /> Validated
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-subtle line-clamp-1">{sec.description}</p>
                  </div>
                </div>

                {/* Section Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
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

              {/* Section Body */}
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

      {/* Checkpoint 1 Advance CTA */}
      <div className="card-nm p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F4F1EC]">
        <div>
          <span className="text-[11px] font-mono font-bold text-terracotta uppercase tracking-wider">
            Checkpoint 1 Ready
          </span>
          <h4 className="font-editorial text-xl font-bold text-charcoal">
            Review & Finalize Technology Stack
          </h4>
          <p className="text-xs text-subtle mt-0.5">
            Proceed to select your preferred frontend, backend, and deployment topology.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-semibold btn-terracotta text-white flex items-center justify-center gap-2 shrink-0 shadow-nm-terracotta"
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
              The AI will re-synthesize this section while preserving consistency with your other approved sections.
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
