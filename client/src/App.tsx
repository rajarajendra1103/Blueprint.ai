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
import { Sparkles, Shield, Cpu, ExternalLink } from 'lucide-react';

const AppContent: React.FC = () => {
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const { activeStep, isGenerating, generationStage } = useSession();

  const renderActiveStage = () => {
    switch (activeStep) {
      case 0:
        return <IdeaInput onOpenKeyModal={() => setIsKeyModalOpen(true)} />;
      case 1:
        return <SpecViewer />;
      case 2:
        return <TechStackPicker />;
      case 3:
        return <DesignPicker />;
      case 4:
        return <ExportBar />;
      default:
        return <IdeaInput onOpenKeyModal={() => setIsKeyModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base text-charcoal">
      {/* Sticky Top Header */}
      <Header onOpenKeyModal={() => setIsKeyModalOpen(true)} />

      {/* 6-Stage Progress Indicator */}
      <PipelineStepper />

      {/* Global Generating Overlay / Banner */}
      {isGenerating && (
        <div className="bg-terracotta text-white py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2.5 shadow-nm-sm animate-pulse sticky top-[65px] z-30">
          <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          <span>{generationStage || 'AI Synthesis Pipeline Active...'}</span>
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
