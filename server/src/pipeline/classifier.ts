import { ClassificationResult, UserProviderConfig } from '@blueprint/shared';
import { getAdapter } from '../adapters';
import { buildClassificationPrompt } from '../prompts/classify.prompt';
import { extractAndParseJson } from '../utils/json-parser';

function synthesizeFallbackClassification(idea: string): Partial<ClassificationResult> {
  const lower = idea.toLowerCase();

  let platform: ClassificationResult['platform'] = 'Full-Stack SaaS';
  if (lower.includes('mobile') || lower.includes('ios') || lower.includes('android')) {
    platform = 'Mobile App (iOS/Android)';
  } else if (lower.includes('cli') || lower.includes('terminal') || lower.includes('developer tool')) {
    platform = 'CLI / Developer Tool';
  } else if (lower.includes('game') || lower.includes('interactive') || lower.includes('3d')) {
    platform = 'Game / Interactive';
  } else if (lower.includes('desktop') || lower.includes('electron') || lower.includes('tauri')) {
    platform = 'Desktop App';
  }

  let domain = 'Cloud & SaaS Application';
  if (lower.includes('pet') || lower.includes('grooming') || lower.includes('dog') || lower.includes('cat')) {
    domain = 'Pet Care & Services Marketplace';
  } else if (lower.includes('escrow') || lower.includes('freelance') || lower.includes('crypto') || lower.includes('payment') || lower.includes('fintech') || lower.includes('bank')) {
    domain = 'FinTech & Payments';
  } else if (lower.includes('health') || lower.includes('ehr') || lower.includes('medical') || lower.includes('clinic') || lower.includes('patient') || lower.includes('doctor')) {
    domain = 'Healthcare & Digital Health';
  } else if (lower.includes('agent') || lower.includes('llm') || lower.includes('observability') || lower.includes('telemetry') || lower.includes('ai')) {
    domain = 'Developer Tools & AI Infrastructure';
  } else if (lower.includes('commerce') || lower.includes('store') || lower.includes('shop') || lower.includes('marketplace')) {
    domain = 'E-Commerce & Digital Marketplace';
  }

  return {
    platform,
    domain,
    complexityTier: 'Intermediate / Production',
    summary: `An intelligent, modern solution engineered for ${domain.toLowerCase()} with robust distributed architecture.`,
    coreProblem: 'Operational fragmentation, manual friction, and lack of real-time visibility in existing workflows.',
    targetAudience: 'Professional teams, platform operators, and end consumers.',
    suggestedTechStacks: {
      recommended: {
        name: 'Modern TypeScript Stack',
        frontend: 'Next.js 15 / React with Tailwind CSS',
        backend: 'Node.js + Express with TypeScript',
        database: 'PostgreSQL + Prisma ORM + Redis',
        styling: 'Tailwind CSS',
        deployment: 'Cloud Container / Docker on AWS/GCP',
        rationale: 'High velocity, universal TypeScript type safety, and battle-tested ecosystem maturity.',
      },
      alternative: {
        name: 'High Performance Stack',
        frontend: 'Vite + React SPA',
        backend: 'Go (Fiber/Gin) / Fastify',
        database: 'PostgreSQL + ClickHouse',
        styling: 'Tailwind CSS',
        deployment: 'Docker / Kubernetes',
        rationale: 'Maximum computational throughput, minimal memory footprint, and low-latency execution.',
      },
    },
    keyFeatures: [
      'Core Resource Lifecycle & State Machine Management',
      'Real-time Event Synchronization & WebSocket Updates',
      'Role-Based Access Control (RBAC) & Audit Logging',
      'Automated Notifications & Webhook Integrations',
      'Comprehensive Analytics & Operational Metrics Dashboard',
    ],
  };
}

export async function classifyIdea(idea: string, config: UserProviderConfig): Promise<ClassificationResult> {
  const adapter = getAdapter(config.provider);
  const { prompt, systemPrompt } = buildClassificationPrompt(idea);

  let rawResponse = '';
  try {
    rawResponse = await adapter.generate(prompt, config.apiKey, config.model, {
      systemPrompt,
      responseFormatJson: true,
      temperature: 0.3,
    });
  } catch (err: any) {
    console.warn(`[Classifier] Model generate call failed (${err.message}). Using resilient heuristic fallback.`);
  }

  let parsed: any = null;
  if (rawResponse) {
    try {
      parsed = extractAndParseJson<Partial<ClassificationResult>>(rawResponse);
    } catch (err: any) {
      console.warn(`[Classifier] extractAndParseJson failed: ${err.message}. Using resilient heuristic fallback.`);
    }
  }

  const fallback = synthesizeFallbackClassification(idea);

  return {
    platform: parsed?.platform || fallback.platform || 'Full-Stack SaaS',
    domain: parsed?.domain || fallback.domain || 'Software Application',
    complexityTier: parsed?.complexityTier || fallback.complexityTier || 'Intermediate / Production',
    summary: parsed?.summary || fallback.summary || 'A modern software solution designed for scalability and user impact.',
    coreProblem: parsed?.coreProblem || fallback.coreProblem || 'Manual operational overhead and fragmented user workflows.',
    targetAudience: parsed?.targetAudience || fallback.targetAudience || 'Modern teams and end users.',
    suggestedTechStacks: parsed?.suggestedTechStacks || fallback.suggestedTechStacks!,
    keyFeatures: Array.isArray(parsed?.keyFeatures) && parsed.keyFeatures.length > 0
      ? parsed.keyFeatures
      : fallback.keyFeatures!,
  };
}
