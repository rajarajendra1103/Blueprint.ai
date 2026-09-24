import {
  ClassificationResult,
  DesignGenerationResult,
  ProviderMeta,
  SpecDoc,
  SpecSection,
  SpecSectionId,
  TechStackSelection,
  UserProviderConfig,
} from '@blueprint/shared';

const envBase = import.meta.env.VITE_API_BASE_URL;
const API_BASE = envBase 
  ? (envBase.replace(/\/+$/, '').endsWith('/api') ? envBase.replace(/\/+$/, '') : `${envBase.replace(/\/+$/, '')}/api`)
  : '/api';

async function handleResponse<T>(res: Response, defaultErrMsg: string): Promise<T> {
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const errorMsg = json?.error || (text && text.length < 300 ? text : `${defaultErrMsg} (HTTP ${res.status})`);
    throw new Error(errorMsg);
  }

  return json as T;
}

export async function fetchProviders(): Promise<ProviderMeta[]> {
  const res = await fetch(`${API_BASE}/providers`);
  const data = await handleResponse<{ providers: ProviderMeta[] }>(res, 'Failed to load supported providers.');
  return data.providers;
}

export async function validateProviderKey(config: UserProviderConfig): Promise<{ valid: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/providers/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
    }),
  });

  return handleResponse<{ valid: boolean; message?: string }>(res, 'Failed to validate key.');
}

export async function classifyIdea(idea: string, config: UserProviderConfig): Promise<ClassificationResult> {
  const res = await fetch(`${API_BASE}/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idea,
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
    }),
  });

  const data = await handleResponse<{ classification: ClassificationResult }>(res, 'Failed to classify idea.');
  return data.classification;
}

export async function generateFullSpec(
  idea: string,
  classification: ClassificationResult,
  config: UserProviderConfig,
  hybrid: boolean = true
): Promise<SpecDoc> {
  const res = await fetch(`${API_BASE}/generate/spec`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idea,
      classification,
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
      hybrid,
    }),
  });

  const data = await handleResponse<{ specDoc: SpecDoc }>(res, 'Failed to generate specification document.');
  return data.specDoc;
}

export async function regenerateSection(params: {
  idea: string;
  classification: ClassificationResult;
  sectionId: SpecSectionId;
  allSections: Record<SpecSectionId, SpecSection>;
  customInstructions?: string;
  config: UserProviderConfig;
}): Promise<{ section: SpecSection; warnings: any[] }> {
  const { idea, classification, sectionId, allSections, customInstructions, config } = params;

  const res = await fetch(`${API_BASE}/generate/section`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idea,
      classification,
      sectionId,
      allSections,
      customInstructions,
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
    }),
  });

  const data = await handleResponse<{ section: SpecSection; warnings: any[] }>(res, 'Failed to regenerate section.');
  return data;
}

export async function generateDesign(
  idea: string,
  classification: ClassificationResult,
  config: UserProviderConfig
): Promise<DesignGenerationResult> {
  const res = await fetch(`${API_BASE}/generate/design`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idea,
      classification,
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
    }),
  });

  const data = await handleResponse<DesignGenerationResult>(res, 'Failed to generate design directions.');
  return data;
}

export async function exportSpecification(payload: {
  idea: string;
  classification: ClassificationResult;
  specDoc: SpecDoc;
  selectedTechStack?: TechStackSelection | null;
  selectedDesign?: any;
}): Promise<{ markdown: string }> {
  const res = await fetch(`${API_BASE}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await handleResponse<{ markdown: string }>(res, 'Failed to export specification.');
  return data;
}
