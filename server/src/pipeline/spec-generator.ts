import {
  ClassificationResult,
  SpecDoc,
  SpecSection,
  SpecSectionId,
  UserProviderConfig,
} from '@blueprint/shared';
import { getAdapter } from '../adapters';
import { buildSectionPrompt, SECTION_METADATA } from '../prompts/spec.prompt';
import { checkSpecConsistency } from './consistency-checker';

const SECTION_BATCHES: SpecSectionId[][] = [
  ['architecture', 'requirements'],
  ['algorithms', 'dataModel', 'apiEndpoints', 'folderStructure', 'businessLogic'],
  ['techStack', 'deployment', 'security', 'costEstimate', 'integrations', 'testingStrategy', 'riskAssumptions'],
];

export async function generateFullSpec(
  idea: string,
  classification: ClassificationResult,
  config: UserProviderConfig
): Promise<SpecDoc> {
  const adapter = getAdapter(config.provider);
  const sections: Partial<Record<SpecSectionId, SpecSection>> = {};
  const siblingContext: Record<string, string> = {};

  for (const batch of SECTION_BATCHES) {
    await Promise.all(
      batch.map(async (sectionId) => {
        const meta = SECTION_METADATA[sectionId];
        const { prompt, systemPrompt } = buildSectionPrompt(sectionId, idea, classification, siblingContext);

        let content = '';
        try {
          content = await adapter.generate(prompt, config.apiKey, config.model, {
            systemPrompt,
            temperature: 0.5,
          });
        } catch (err: any) {
          content = `> ⚠️ Generation notice for ${meta.title}: ${err.message}\n\nPlease click "Regenerate Section" to retry with your current provider or adjust provider credentials.`;
        }

        sections[sectionId] = {
          id: sectionId,
          title: meta.title,
          description: meta.description,
          content,
          isApproved: true,
          lastUpdated: new Date().toISOString(),
        };
      })
    );

    // Accumulate context from completed batch for subsequent batches
    for (const sectionId of batch) {
      if (sections[sectionId]?.content) {
        siblingContext[sectionId] = sections[sectionId]!.content;
      }
    }
  }

  const completeSections = sections as Record<SpecSectionId, SpecSection>;
  let warnings: any[] = [];
  try {
    warnings = checkSpecConsistency(completeSections);
  } catch (err) {
    console.warn('Consistency check warning:', err);
  }

  return {
    sections: completeSections,
    warnings,
    isGenerating: false,
  };
}
