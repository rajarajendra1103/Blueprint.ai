export type LLMProviderId = 'gemini' | 'claude' | 'anthropic' | 'openrouter' | 'grok' | 'nvidia';
export interface ProviderMeta {
    id: LLMProviderId;
    name: string;
    description: string;
    defaultModel: string;
    availableModels: string[];
    keyPlaceholder: string;
    docsUrl: string;
    requiresKey: boolean;
}
export interface UserProviderConfig {
    provider: LLMProviderId;
    apiKey: string;
    model?: string;
    customEndpoint?: string;
}
export type PlatformType = 'Web Application' | 'Mobile App (iOS/Android)' | 'Desktop App' | 'Full-Stack SaaS' | 'CLI / Developer Tool' | 'Game / Interactive';
export type ComplexityTier = 'MVP / Prototype' | 'Intermediate / Production' | 'Enterprise / Distributed';
export interface ThirdPartyIntegration {
    name: string;
    category: 'Payments' | 'Authentication' | 'Maps & Geolocation' | 'Communications (SMS/Email)' | 'AI / LLM' | 'Storage / CDN' | 'Analytics & Observability';
    reason: string;
    recommendedService: string;
}
export interface ClassificationResult {
    platform: PlatformType;
    domain: string;
    complexityTier: ComplexityTier;
    summary: string;
    coreProblem: string;
    targetAudience: string;
    suggestedTechStacks: {
        recommended: {
            name: string;
            frontend: string;
            backend: string;
            database: string;
            styling: string;
            deployment: string;
            rationale: string;
        };
        alternative: {
            name: string;
            frontend: string;
            backend: string;
            database: string;
            styling: string;
            deployment: string;
            rationale: string;
        };
    };
    keyFeatures: string[];
    detectedIntegrations?: ThirdPartyIntegration[];
}
export type SpecSectionId = 'architecture' | 'requirements' | 'algorithms' | 'dataModel' | 'apiEndpoints' | 'folderStructure' | 'businessLogic' | 'techStack' | 'deployment' | 'security' | 'costEstimate' | 'integrations' | 'testingStrategy' | 'riskAssumptions';
export interface SpecSection {
    id: SpecSectionId;
    title: string;
    description: string;
    content: string;
    originalContent?: string;
    hasBeenEdited?: boolean;
    isCustomGenerated?: boolean;
    parsedData?: any;
    tags?: string[];
    isApproved?: boolean;
    lastUpdated?: string;
}
export interface SpecDoc {
    sections: Record<SpecSectionId, SpecSection>;
    warnings: ConsistencyWarning[];
    isGenerating?: boolean;
}
export interface ConsistencyWarning {
    id: string;
    type: 'warning' | 'info' | 'error';
    sourceSection: SpecSectionId | string;
    targetSection: SpecSectionId | string;
    message: string;
    suggestion?: string;
}
export interface TechStackSelection {
    frontend: string;
    backend: string;
    database: string;
    styling: string;
    deployment: string;
    notes?: string;
}
export interface DesignStyleToken {
    name: string;
    description: string;
    surface: string;
    shadow: string;
    border: string;
    cornerRadius: string;
}
export interface DesignTypographyToken {
    headingFont: string;
    bodyFont: string;
    monoFont: string;
    scaleDescription: string;
    sampleHeadline: string;
}
export interface DesignLayoutToken {
    style: string;
    density: string;
    containerWidth: string;
    gridSystem: string;
}
export interface DesignColorPalette {
    base: string;
    surface: string;
    primary: string;
    secondary: string;
    accent: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    isDark: boolean;
}
export interface DesignIconToken {
    style: string;
    library: string;
    description: string;
}
export interface DesignDirection {
    id: 'direction-1' | 'direction-2';
    name: string;
    badge: string;
    philosophy: string;
    style: DesignStyleToken;
    typography: DesignTypographyToken;
    layout: DesignLayoutToken;
    colors: DesignColorPalette;
    darkModeVariant?: DesignColorPalette;
    icons: DesignIconToken;
    accessibilityNotes: string;
    contrastRatio: string;
    contrastRating: string;
    responsiveNotes: string;
    componentPreview: {
        buttonClass: string;
        cardClass: string;
        badgeClass: string;
        inputClass: string;
    };
}
export interface DesignGenerationResult {
    directions: [DesignDirection, DesignDirection];
    rationale: string;
}
export interface FullProjectState {
    idea: string;
    providerConfig: UserProviderConfig;
    classification: ClassificationResult | null;
    specDoc: {
        sections: Record<SpecSectionId, SpecSection>;
        warnings: ConsistencyWarning[];
        isGenerating: boolean;
    };
    selectedTechStack: TechStackSelection | null;
    designDirections: [DesignDirection, DesignDirection] | null;
    selectedDesignDirectionId: 'direction-1' | 'direction-2' | null;
    designOverrides?: Partial<DesignDirection>;
    activeStep: number;
}
