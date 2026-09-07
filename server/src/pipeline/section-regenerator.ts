import {
  ClassificationResult,
  ConsistencyWarning,
  SpecSection,
  SpecSectionId,
  UserProviderConfig,
} from '@blueprint/shared';
import { getAdapter } from '../adapters';
import { buildSectionPrompt, SECTION_METADATA } from '../prompts/spec.prompt';
import { checkSpecConsistency } from './consistency-checker';

export interface RegenerateSectionPayload {
  idea: string;
  classification: ClassificationResult;
  sectionId: SpecSectionId;
  allSections: Record<SpecSectionId, SpecSection>;
  customInstructions?: string;
  config: UserProviderConfig;
}

export async function regenerateSection(
  payload: RegenerateSectionPayload
): Promise<{ section: SpecSection; warnings: ConsistencyWarning[] }> {
  const { idea, classification, sectionId, allSections, customInstructions, config } = payload;
  const adapter = getAdapter(config.provider);
  const meta = SECTION_METADATA[sectionId];

  // Extract sibling context from all approved sections except this one
  const siblingContext: Record<string, string> = {};
  for (const [k, v] of Object.entries(allSections)) {
    if (k !== sectionId && v?.content) {
      siblingContext[k] = v.content;
    }
  }

  const { prompt: basePrompt, systemPrompt } = buildSectionPrompt(sectionId, idea, classification, siblingContext);

  let finalPrompt = basePrompt;
  if (customInstructions) {
    finalPrompt += `\n\nADDITIONAL USER INSTRUCTIONS FOR THIS REGENERATION:\n${customInstructions}\n`;
  }

  const content = await adapter.generate(finalPrompt, config.apiKey, config.model, {
    systemPrompt,
    temperature: 0.6,
  });

  const updatedSection: SpecSection = {
    id: sectionId,
    title: meta.title,
    description: meta.description,
    content,
    isApproved: true,
    lastUpdated: new Date().toISOString(),
  };

  const updatedSections = {
    ...allSections,
    [sectionId]: updatedSection,
  };

  const warnings = checkSpecConsistency(updatedSections);

  return {
    section: updatedSection,
    warnings,
  };
}
