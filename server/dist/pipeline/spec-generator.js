"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFullSpec = generateFullSpec;
const adapters_1 = require("../adapters");
const spec_prompt_1 = require("../prompts/spec.prompt");
const consistency_checker_1 = require("./consistency-checker");
const SECTION_BATCHES = [
    ['architecture', 'requirements'],
    ['algorithms', 'dataModel', 'apiEndpoints', 'folderStructure', 'businessLogic'],
    ['techStack', 'deployment', 'security', 'costEstimate', 'integrations', 'testingStrategy', 'riskAssumptions'],
];
async function generateFullSpec(idea, classification, config) {
    const adapter = (0, adapters_1.getAdapter)(config.provider);
    const sections = {};
    const siblingContext = {};
    for (const batch of SECTION_BATCHES) {
        await Promise.all(batch.map(async (sectionId) => {
            const meta = spec_prompt_1.SECTION_METADATA[sectionId];
            const { prompt, systemPrompt } = (0, spec_prompt_1.buildSectionPrompt)(sectionId, idea, classification, siblingContext);
            let content = '';
            try {
                content = await adapter.generate(prompt, config.apiKey, config.model, {
                    systemPrompt,
                    temperature: 0.5,
                });
            }
            catch (err) {
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
        }));
        // Accumulate context from completed batch for subsequent batches
        for (const sectionId of batch) {
            if (sections[sectionId]?.content) {
                siblingContext[sectionId] = sections[sectionId].content;
            }
        }
    }
    const completeSections = sections;
    let warnings = [];
    try {
        warnings = (0, consistency_checker_1.checkSpecConsistency)(completeSections);
    }
    catch (err) {
        console.warn('Consistency check warning:', err);
    }
    return {
        sections: completeSections,
        warnings,
        isGenerating: false,
    };
}
