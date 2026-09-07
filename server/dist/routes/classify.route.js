"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const classifier_1 = require("../pipeline/classifier");
const router = (0, express_1.Router)();
// POST /api/classify
router.post('/', async (req, res) => {
    try {
        const { idea, provider, apiKey, model, customEndpoint } = req.body;
        if (!idea || typeof idea !== 'string' || idea.trim().length < 5) {
            return res.status(400).json({
                error: 'A descriptive software idea (at least 5 characters) is required.',
            });
        }
        if (!provider) {
            return res.status(400).json({
                error: 'Please connect an LLM provider (e.g. Gemini, Anthropic, OpenRouter) to proceed.',
            });
        }
        if (!apiKey) {
            return res.status(400).json({
                error: `An API key is required for provider '${provider}'. Keys are held strictly in your browser session and never persisted on the server.`,
            });
        }
        const config = {
            provider,
            apiKey: apiKey || '',
            model,
            customEndpoint,
        };
        const classification = await (0, classifier_1.classifyIdea)(idea.trim(), config);
        return res.json({ classification });
    }
    catch (err) {
        console.error('Error during classification:', err);
        return res.status(500).json({
            error: err.message || 'Failed to classify idea. Please check your provider credentials and try again.',
        });
    }
});
exports.default = router;
