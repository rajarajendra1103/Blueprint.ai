import { ClassificationResult, UserProviderConfig } from '@blueprint/shared';
import { getAdapter } from '../adapters';
import { buildClassificationPrompt } from '../prompts/classify.prompt';

export async function classifyIdea(idea: string, config: UserProviderConfig): Promise<ClassificationResult> {
  const adapter = getAdapter(config.provider);
  const { prompt, systemPrompt } = buildClassificationPrompt(idea);

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

    const parsed = JSON.parse(cleaned) as ClassificationResult;

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
  } catch (err: any) {
    throw new Error(`Failed to parse classification JSON from ${adapter.name}: ${err.message}. Raw: ${rawResponse.slice(0, 200)}`);
  }
}
