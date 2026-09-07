export function buildClassificationPrompt(idea: string): { prompt: string; systemPrompt: string } {
  const systemPrompt = `You are a Principal Software Architect and Technical Product Leader.
Your role is to analyze a raw software idea and produce a rigorous, structured classification and technology stack recommendations.
You MUST respond with valid, parseable JSON ONLY, without Markdown code fences, commentary, or backticks.`;

  const prompt = `Classify the following software idea and propose initial technology foundations:

---
IDEA:
${idea}
---

Return a JSON object conforming precisely to this TypeScript schema:
{
  "platform": "Web Application" | "Mobile App (iOS/Android)" | "Desktop App" | "Full-Stack SaaS" | "CLI / Developer Tool" | "Game / Interactive",
  "domain": string, // e.g. "FinTech & Payments", "Healthcare & Telemedicine", "Developer Tools", "AI / Workflow Automation"
  "complexityTier": "MVP / Prototype" | "Intermediate / Production" | "Enterprise / Distributed",
  "summary": string, // 2-sentence executive summary
  "coreProblem": string, // The fundamental friction being solved
  "targetAudience": string, // Primary users & personas
  "keyFeatures": string[], // Top 5 critical functional capabilities
  "suggestedTechStacks": {
    "recommended": {
      "name": string,
      "frontend": string,
      "backend": string,
      "database": string,
      "styling": string,
      "deployment": string,
      "rationale": string
    },
    "alternative": {
      "name": string,
      "frontend": string,
      "backend": string,
      "database": string,
      "styling": string,
      "deployment": string,
      "rationale": string
    }
  }
}

Output JSON only:`;

  return { prompt, systemPrompt };
}
