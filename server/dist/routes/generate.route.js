"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const spec_generator_1 = require("../pipeline/spec-generator");
const section_regenerator_1 = require("../pipeline/section-regenerator");
const design_bundler_1 = require("../pipeline/design-bundler");
const router = (0, express_1.Router)();
// Helper to validate provider credentials
function extractProviderConfig(body) {
    const { provider, apiKey, model, customEndpoint } = body;
    if (!provider) {
        throw new Error('Please select an LLM provider to run generation.');
    }
    if (!apiKey) {
        throw new Error(`API key is required for provider '${provider}'.`);
    }
    return {
        provider,
        apiKey: apiKey || '',
        model,
        customEndpoint,
    };
}
// POST /api/generate/spec
router.post('/spec', async (req, res) => {
    try {
        const { idea, classification, hybrid } = req.body;
        if (!idea || !classification) {
            return res.status(400).json({ error: 'Missing idea or classification context in request body.' });
        }
        const config = extractProviderConfig(req.body);
        const isHybrid = hybrid !== undefined ? Boolean(hybrid) : true;
        const specDoc = await (0, spec_generator_1.generateFullSpec)(idea, classification, config, { hybrid: isHybrid });
        return res.json({ specDoc });
    }
    catch (err) {
        console.error('Error generating spec:', err);
        return res.status(500).json({ error: err.message || 'Failed to generate specification document.' });
    }
});
// POST /api/generate/section
router.post('/section', async (req, res) => {
    try {
        const { idea, classification, sectionId, allSections, customInstructions } = req.body;
        if (!idea || !classification || !sectionId || !allSections) {
            return res.status(400).json({ error: 'Missing required parameters for section regeneration.' });
        }
        const config = extractProviderConfig(req.body);
        const result = await (0, section_regenerator_1.regenerateSection)({
            idea,
            classification,
            sectionId: sectionId,
            allSections,
            customInstructions,
            config,
        });
        return res.json(result);
    }
    catch (err) {
        console.error('Error regenerating section:', err);
        return res.status(500).json({ error: err.message || 'Failed to regenerate section.' });
    }
});
// POST /api/generate/design
router.post('/design', async (req, res) => {
    try {
        const { idea, classification } = req.body;
        if (!idea || !classification) {
            return res.status(400).json({ error: 'Missing idea or classification context for design generation.' });
        }
        const config = extractProviderConfig(req.body);
        const designResult = await (0, design_bundler_1.generateDesignDirections)(idea, classification, config);
        return res.json(designResult);
    }
    catch (err) {
        console.error('Error generating design directions:', err);
        return res.status(500).json({ error: err.message || 'Failed to generate design directions.' });
    }
});
exports.default = router;
