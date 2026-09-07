"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regenerateSection = regenerateSection;
const adapters_1 = require("../adapters");
const spec_prompt_1 = require("../prompts/spec.prompt");
const consistency_checker_1 = require("./consistency-checker");
async function regenerateSection(payload) {
    const { idea, classification, sectionId, allSections, customInstructions, config } = payload;
    const adapter = (0, adapters_1.getAdapter)(config.provider);
    const meta = spec_prompt_1.SECTION_METADATA[sectionId];
    // Extract sibling context from all approved sections except this one
    const siblingContext = {};
    for (const [k, v] of Object.entries(allSections)) {
        if (k !== sectionId && v?.content) {
            siblingContext[k] = v.content;
        }
    }
    const { prompt: basePrompt, systemPrompt } = (0, spec_prompt_1.buildSectionPrompt)(sectionId, idea, classification, siblingContext);
    let finalPrompt = basePrompt;
    if (customInstructions) {
        finalPrompt += `\n\nADDITIONAL USER INSTRUCTIONS FOR THIS REGENERATION:\n${customInstructions}\n`;
    }
    const content = await adapter.generate(finalPrompt, config.apiKey, config.model, {
        systemPrompt,
        temperature: 0.6,
    });
    const updatedSection = {
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
    const warnings = (0, consistency_checker_1.checkSpecConsistency)(updatedSections);
    return {
        section: updatedSection,
        warnings,
    };
}
