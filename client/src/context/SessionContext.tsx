import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ClassificationResult,
  DesignDirection,
  SpecDoc,
  SpecSection,
  SpecSectionId,
  TechStackSelection,
  UserProviderConfig,
} from '@blueprint/shared';
import {
  loadProviderConfig,
  saveProviderConfig,
  clearStoredApiKey,
  DEFAULT_PROVIDER_CONFIG,
  loadProjectState,
  saveProjectState,
  clearAllSession,
} from '../lib/storage';
import * as api from '../lib/api';

interface SessionContextType {
  idea: string;
  setIdea: (idea: string) => void;
  providerConfig: UserProviderConfig;
  updateProviderConfig: (config: UserProviderConfig) => void;
  clearApiKey: () => void;
  classification: ClassificationResult | null;
  specDoc: SpecDoc | null;
  selectedTechStack: TechStackSelection | null;
  setSelectedTechStack: (techStack: TechStackSelection | null) => void;
  designDirections: [DesignDirection, DesignDirection] | null;
  selectedDesignDirectionId: 'direction-1' | 'direction-2';
  setSelectedDesignDirectionId: (id: 'direction-1' | 'direction-2') => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
  isGenerating: boolean;
  generationStage: string;
  error: string | null;
  setError: (err: string | null) => void;

  // Primary Actions
  runPipeline: (customIdea?: string) => Promise<void>;
  regenerateSection: (sectionId: SpecSectionId, customInstructions?: string) => Promise<void>;
  updateSectionContent: (sectionId: SpecSectionId, newContent: string) => void;
  proceedToDesign: () => Promise<void>;
  resetAll: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [providerConfig, setProviderConfigState] = useState<UserProviderConfig>(() => loadProviderConfig());
  const [idea, setIdeaState] = useState<string>('');
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [specDoc, setSpecDoc] = useState<SpecDoc | null>(null);
  const [selectedTechStack, setSelectedTechStack] = useState<TechStackSelection | null>(null);
  const [designDirections, setDesignDirections] = useState<[DesignDirection, DesignDirection] | null>(null);
  const [selectedDesignDirectionId, setSelectedDesignDirectionId] = useState<'direction-1' | 'direction-2'>('direction-1');
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStage, setGenerationStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Hydrate project state from sessionStorage or shareable link on mount
  useEffect(() => {
    try {
      if (window.location.hash.startsWith('#share=')) {
        const rawHash = window.location.hash.replace('#share=', '');
        const decodedJson = decodeURIComponent(escape(atob(decodeURIComponent(rawHash))));
        const parsed = JSON.parse(decodedJson);
        if (parsed.idea) setIdeaState(parsed.idea);
        if (parsed.classification) setClassification(parsed.classification);
        if (parsed.specDoc) setSpecDoc(parsed.specDoc);
        if (parsed.selectedTechStack) setSelectedTechStack(parsed.selectedTechStack);
        if (parsed.designDirections) setDesignDirections(parsed.designDirections);
        if (parsed.selectedDesignDirectionId) setSelectedDesignDirectionId(parsed.selectedDesignDirectionId);
        setActiveStep(4); // jump straight to preview/export for shared pitch link
        return;
      }
    } catch (err) {
      console.warn('Could not hydrate shared link from URL hash:', err);
    }

    const saved = loadProjectState();
    if (saved) {
      if (saved.idea) setIdeaState(saved.idea);
      if (saved.classification) setClassification(saved.classification);
      if (saved.specDoc) setSpecDoc(saved.specDoc as SpecDoc);
      if (saved.selectedTechStack) setSelectedTechStack(saved.selectedTechStack);
      if (saved.designDirections) setDesignDirections(saved.designDirections);
      if (saved.selectedDesignDirectionId) setSelectedDesignDirectionId(saved.selectedDesignDirectionId);
      if (typeof saved.activeStep === 'number') setActiveStep(saved.activeStep);
    }
  }, []);

  // Sync state to sessionStorage
  useEffect(() => {
    saveProjectState({
      idea,
      classification,
      specDoc: specDoc as any,
      selectedTechStack,
      designDirections,
      selectedDesignDirectionId,
      activeStep,
    });
  }, [idea, classification, specDoc, selectedTechStack, designDirections, selectedDesignDirectionId, activeStep]);

  const updateProviderConfig = (newConfig: UserProviderConfig) => {
    setProviderConfigState(newConfig);
    saveProviderConfig(newConfig);
  };

  const clearApiKey = () => {
    clearStoredApiKey();
    setProviderConfigState((prev) => ({ ...prev, apiKey: '' }));
  };

  const setIdea = (newIdea: string) => {
    setIdeaState(newIdea);
  };

  const runPipeline = async (customIdea?: string) => {
    const targetIdea = customIdea || idea;
    if (!targetIdea || targetIdea.trim().length < 5) {
      setError('Please provide a descriptive software idea (at least 5 characters).');
      return;
    }

    if (!providerConfig.apiKey) {
      setError(`Please configure your ${providerConfig.provider.toUpperCase()} API key in the provider settings before starting.`);
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGenerationStage('Stage 1: Classifying concept & architecture boundaries...');
    setActiveStep(1);

    try {
      // 1. Classification
      const classResult = await api.classifyIdea(targetIdea, providerConfig);
      setClassification(classResult);
      if (classResult.suggestedTechStacks?.recommended) {
        setSelectedTechStack(classResult.suggestedTechStacks.recommended);
      }

      // 2. Full Spec Generation
      setGenerationStage('Stage 2: Synthesizing complete 12-section technical specification...');
      const fullSpec = await api.generateFullSpec(targetIdea, classResult, providerConfig);
      setSpecDoc(fullSpec);

      // Checkpoint 1 reached
      setGenerationStage('');
      setActiveStep(2);
    } catch (err: any) {
      console.error('Pipeline error:', err);
      setError(err.message || 'An unexpected error occurred during generation.');
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
    }
  };

  const regenerateSection = async (sectionId: SpecSectionId, customInstructions?: string) => {
    if (!classification || !specDoc) return;

    setError(null);
    setIsGenerating(true);
    setGenerationStage(`Regenerating ${specDoc.sections[sectionId]?.title || sectionId}...`);

    try {
      const result = await api.regenerateSection({
        idea,
        classification,
        sectionId,
        allSections: specDoc.sections,
        customInstructions,
        config: providerConfig,
      });

      setSpecDoc((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: {
            ...prev.sections,
            [sectionId]: result.section,
          },
          warnings: result.warnings,
        };
      });
    } catch (err: any) {
      console.error('Section regeneration error:', err);
      setError(err.message || 'Failed to regenerate section.');
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
    }
  };

  const updateSectionContent = (sectionId: SpecSectionId, newContent: string) => {
    if (!specDoc) return;
    setSpecDoc((prev) => {
      if (!prev) return prev;
      const current = prev.sections[sectionId];
      return {
        ...prev,
        sections: {
          ...prev.sections,
          [sectionId]: {
            ...current,
            originalContent: current.originalContent || current.content,
            content: newContent,
            hasBeenEdited: true,
            lastUpdated: new Date().toISOString(),
          },
        },
      };
    });
  };

  const proceedToDesign = async () => {
    if (!classification) return;

    setError(null);
    setIsGenerating(true);
    setGenerationStage('Stage 3: Generating coherent design system bundles...');
    setActiveStep(3);

    try {
      const designResult = await api.generateDesign(idea, classification, providerConfig);
      setDesignDirections(designResult.directions);
      setSelectedDesignDirectionId('direction-1');
      setActiveStep(3); // Checkpoint 2 - design selection
    } catch (err: any) {
      console.error('Design generation error:', err);
      setError(err.message || 'Failed to generate design directions.');
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
    }
  };

  const resetAll = () => {
    clearAllSession();
    setIdeaState('');
    setClassification(null);
    setSpecDoc(null);
    setSelectedTechStack(null);
    setDesignDirections(null);
    setSelectedDesignDirectionId('direction-1');
    setActiveStep(0);
    setError(null);
    setProviderConfigState(loadProviderConfig());
  };

  return (
    <SessionContext.Provider
      value={{
        idea,
        setIdea,
        providerConfig,
        updateProviderConfig,
        clearApiKey,
        classification,
        specDoc,
        selectedTechStack,
        setSelectedTechStack,
        designDirections,
        selectedDesignDirectionId,
        setSelectedDesignDirectionId,
        activeStep,
        setActiveStep,
        isGenerating,
        generationStage,
        error,
        setError,
        runPipeline,
        regenerateSection,
        updateSectionContent,
        proceedToDesign,
        resetAll,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
