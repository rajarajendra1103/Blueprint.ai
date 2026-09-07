"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyIdea = classifyIdea;
const adapters_1 = require("../adapters");
const classify_prompt_1 = require("../prompts/classify.prompt");
async function classifyIdea(idea, config) {
    const adapter = (0, adapters_1.getAdapter)(config.provider);
    const { prompt, systemPrompt } = (0, classify_prompt_1.buildClassificationPrompt)(idea);
    const rawResponse = await adapter.generate(prompt, config.apiKey, config.model, {
        systemPrompt,
        responseFormatJson: true,
        temperature: 0.3,
    });
    try {
        // Strip markdown code fences if model accidentally wrapped in ```json ... ```
        const cleaned = rawResponse
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
        const parsed = JSON.parse(cleaned);
        // Validate expected shape with fallbacks
        return {
            platform: parsed.platform || 'Full-Stack SaaS',
            domain: parsed.domain || 'Software Application',
            complexityTier: parsed.complexityTier || 'Intermediate / Production',
            summary: parsed.summary || 'A modern software solution designed for scalability and user impact.',
            coreProblem: parsed.coreProblem || 'Manual operational overhead and fragmented user workflows.',
            targetAudience: parsed.targetAudience || 'Modern teams and end users.',
            suggestedTechStacks: parsed.suggestedTechStacks || {
                recommended: {
                    name: 'Modern TypeScript Stack',
                    frontend: 'Next.js / React with Tailwind CSS',
                    backend: 'Node.js + Express with TypeScript',
                    database: 'PostgreSQL + Redis',
                    styling: 'Tailwind CSS',
                    deployment: 'Vercel / Cloud Container',
                    rationale: 'High velocity and robust typing across the stack.',
                },
                alternative: {
                    name: 'High Performance Stack',
                    frontend: 'Vite + React SPA',
                    backend: 'Go / Fastify',
                    database: 'PostgreSQL',
                    styling: 'Tailwind CSS',
                    deployment: 'Docker / AWS ECS',
                    rationale: 'Maximum computational throughput and low footprint.',
                },
            },
            keyFeatures: Array.isArray(parsed.keyFeatures) && parsed.keyFeatures.length > 0
                ? parsed.keyFeatures
                : ['Core Resource Lifecycle Management', 'Real-time Event Synchronization', 'Role-Based Access Control', 'Automated Notifications', 'Audit Log Trail'],
        };
    }
    catch (err) {
        throw new Error(`Failed to parse classification JSON from ${adapter.name}: ${err.message}. Raw: ${rawResponse.slice(0, 200)}`);
    }
}
