"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exporter_1 = require("../export/exporter");
const router = (0, express_1.Router)();
// POST /api/export
router.post('/', (req, res) => {
    try {
        const { idea, classification, specDoc, selectedTechStack, selectedDesign, format } = req.body;
        if (!idea || !classification || !specDoc) {
            return res.status(400).json({ error: 'Incomplete project state provided for export.' });
        }
        const markdown = (0, exporter_1.renderFullMarkdown)({
            idea,
            classification,
            specDoc,
            selectedTechStack,
            selectedDesign,
        });
        if (format === 'markdown') {
            res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="blueprint-specification.md"');
            return res.send(markdown);
        }
        // Default JSON payload containing markdown and raw state
        return res.json({
            markdown,
            exportedAt: new Date().toISOString(),
        });
    }
    catch (err) {
        console.error('Error rendering export:', err);
        return res.status(500).json({ error: err.message || 'Failed to export document.' });
    }
});
exports.default = router;
