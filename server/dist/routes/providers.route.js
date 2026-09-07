"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adapters_1 = require("../adapters");
const router = (0, express_1.Router)();
// GET /api/providers
router.get('/', (_req, res) => {
    res.json({
        providers: adapters_1.PROVIDERS_META,
    });
});
// POST /api/providers/validate
router.post('/validate', async (req, res) => {
    try {
        const { provider, apiKey, model } = req.body || {};
        const cleanKey = typeof apiKey === 'string' ? apiKey.trim() : '';
        const cleanModel = typeof model === 'string' && model.trim() ? model.trim() : undefined;
        if (!provider) {
            return res.status(400).json({ valid: false, message: 'Provider ID is required.' });
        }
        if (!cleanKey) {
            return res.status(400).json({ valid: false, message: `API Key is required for provider '${provider}'.` });
        }
        const adapter = (0, adapters_1.getAdapter)(provider);
        const result = await adapter.validateKey(cleanKey, cleanModel);
        return res.json(result);
    }
    catch (err) {
        return res.status(500).json({
            valid: false,
            message: err.message || 'Key validation failed.',
        });
    }
});
exports.default = router;
