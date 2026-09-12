import React, { useState } from 'react';
import { SessionProvider, useSession } from './context/SessionContext';
import { Header } from './components/Header';
import { PipelineStepper } from './components/PipelineStepper';
import { ProviderKeyModal } from './components/ProviderKeyModal';
import { IdeaInput } from './components/IdeaInput';
import { SpecViewer } from './components/SpecViewer';
import { TechStackPicker } from './components/TechStackPicker';
import { DesignPicker } from './components/DesignPicker';
import { ExportBar } from './components/ExportBar';
import { InstructionsModal } from './components/InstructionsModal';
import { Sparkles, Shield, Cpu, ExternalLink } from 'lucide-react';

const AppContent: React.FC = () => {
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);
  const { activeStep, isGenerating, generationStage, error, setError } = useSession();

  const renderActiveStage = () => {
    switch (activeStep) {
      case 0:
        return (
          <IdeaInput
            onOpenKeyModal={() => setIsKeyModalOpen(true)}
            onOpenInstructions={() => setIsInstructionsOpen(true)}
          />
        );
      case 1:
        return <SpecViewer onOpenKeyModal={() => setIsKeyModalOpen(true)} />;
      case 2:
        return <TechStackPicker />;
      case 3:
        return <DesignPicker />;
      case 4:
        return <ExportBar />;
      default:
        return (
          <IdeaInput
            onOpenKeyModal={() => setIsKeyModalOpen(true)}
            onOpenInstructions={() => setIsInstructionsOpen(true)}
          />
        );
    }
  };

  const isFreeLimit = /free.*(?:limit|tier|trie)|rate\s*limit|quota|credit|429|402|unavailable|failed to fetch|empty_response/i.test(error || '');

  return (
    <div className="min-h-screen flex flex-col bg-base text-charcoal">
      {/* Sticky Top Header */}
      <Header
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onOpenInstructions={() => setIsInstructionsOpen(true)}
      />

      {/* 6-Stage Progress Indicator */}
      <PipelineStepper />

      {/* Global Generating Overlay / Banner */}
      {isGenerating && (
        <div className="bg-terracotta text-white py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2.5 shadow-nm-sm animate-pulse sticky top-[65px] z-30">
          <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          <span>{generationStage || 'AI Synthesis Pipeline Active...'}</span>
        </div>
      )}

      {/* Persistent Free Tier / Model Limit Notification Banner */}
      {!isGenerating && error && (
        <div className={`py-2.5 px-4 text-xs font-medium sticky top-[65px] z-30 shadow-sm transition-all border-b ${
          isFreeLimit
            ? 'bg-amber-100/95 border-amber-300 text-amber-950'
            : 'bg-red-100/95 border-red-300 text-red-950'
        }`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 flex-1">
              <span className={`w-2 h-2 rounded-full ${isFreeLimit ? 'bg-amber-600 animate-ping' : 'bg-red-600'}`} />
              <span className="font-bold">
                {isFreeLimit ? 'Free Tier / Model Limit Notice:' : 'Notice:'}
              </span>
              <span className="truncate max-w-2xl">{error}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(true)}
                className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                Change Model / Provider
              </button>
              <button
                type="button"
                onClick={() => setError(null)}
                title="Dismiss notice"
                className="px-2 py-1 text-subtle hover:text-charcoal text-xs font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {renderActiveStage()}
      </main>

      {/* Footer */}
      <footer className="border-t border-border-warm py-8 px-4 text-center bg-[#EFECE6]/50 no-print">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-subtle">
          <div className="flex items-center gap-2">
            <span className="font-editorial font-bold text-charcoal text-sm">
              Blueprint<span className="text-terracotta">.ai</span>
            </span>
            <span>— Warm Neumorphic Spec Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-sage" />
              100% Stateless BYOK
            </span>
            <span>•</span>
            <span>Zero Server Persistence</span>
          </div>
        </div>
      </footer>

      {/* Provider & BYOK Key Modal */}
      <ProviderKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onOpenInstructions={() => setIsInstructionsOpen(true)}
      />

      {/* Usage & BYOK Guide Modal */}
      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}
