"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regenerateSection = regenerateSection;
const adapters_1 = require("../adapters");
const spec_prompt_1 = require("../prompts/spec.prompt");
const consistency_checker_1 = require("./consistency-checker");
const spec_generator_1 = require("./spec-generator");
function withTimeout(promise, ms, timeoutMsg) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(timeoutMsg)), ms)),
    ]);
}
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
    let content = '';
    try {
        content = await withTimeout(adapter.generate(finalPrompt, config.apiKey, config.model, {
            systemPrompt,
            temperature: 0.6,
        }), 65000, `Timed out after 65s`);
    }
    catch (err) {
        console.warn(`[SectionRegenerator] Notice on ${sectionId}: ${err.message}. Using domain baseline.`);
        content = `> ⚠️ **Provider Notice**: ${err.message}\n> *Synthesized domain baseline architecture below. You can change your provider or model in Settings at any time to re-run with another model.*\n\n` +
            (0, spec_generator_1.synthesizeFallbackSectionContent)(sectionId, idea, classification);
    }
    const updatedSection = {
        id: sectionId,
        title: meta.title,
        description: meta.description,
        content,
        isApproved: true,
        isCustomGenerated: true,
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
