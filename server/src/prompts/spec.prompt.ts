import { ClassificationResult, SpecSectionId } from '@blueprint/shared';

export const SECTION_METADATA: Record<SpecSectionId, { title: string; description: string }> = {
  architecture: {
    title: 'System Architecture',
    description: 'High-level topology, component interaction, and client-server boundaries.',
  },
  requirements: {
    title: 'Requirements (FR & NFR with MVP Phasing)',
    description: 'Functional requirements tagged with MVP vs Phase 2, and non-functional performance/scalability standards.',
  },
  algorithms: {
    title: 'Algorithms & Core Logic (Backend & Frontend)',
    description: 'Named per-component algorithms for both backend (must) and frontend, time/space complexities, and data structures.',
  },
  dataModel: {
    title: 'Database-Agnostic Data Model',
    description: 'Entity relationship definitions, field types, relationships, and indexing.',
  },
  apiEndpoints: {
    title: 'API Endpoints & Contracts',
    description: 'RESTful/RPC routes with request payload, response schema, and status codes.',
  },
  folderStructure: {
    title: 'Project Directory Structure',
    description: 'Scalable repository tree with separation of concerns and file placement.',
  },
  businessLogic: {
    title: 'Business Logic & Invariants',
    description: 'State machine lifecycles, concurrency locks, and permission constraints.',
  },
  techStack: {
    title: 'Technology Stack Options',
    description: 'Recommended frameworks, libraries, database, caching, and evaluation matrix.',
  },
  deployment: {
    title: 'Deployment Architecture',
    description: 'Cloud hosting, containerization, CDN edge distribution, and CI/CD pipelines.',
  },
  security: {
    title: 'Security & Compliance Strategy',
    description: 'Authentication strategy, GDPR data privacy flags, and input validation boundaries.',
  },
  costEstimate: {
    title: 'Infrastructure Cost Projections',
    description: 'Estimated monthly cloud hosting costs per suggested tech stack tier.',
  },
  integrations: {
    title: 'Third-Party Integrations & APIs',
    description: 'Auto-detected external APIs (Payments, Geolocation, Auth, SMS/Email, Monitoring).',
  },
  testingStrategy: {
    title: 'Testing Strategy & Quality Gates',
    description: 'Layered testing matrix: unit tests for business logic, integration for APIs, and E2E for critical flows.',
  },
  riskAssumptions: {
    title: 'Risks, Assumptions & Scope Phasing',
    description: 'AI assumptions log, technical risk mitigations, and MVP vs Phase 2 boundaries.',
  },
};

export function buildSectionPrompt(
  sectionId: SpecSectionId,
  idea: string,
  classification: ClassificationResult,
  siblingContext?: Record<string, string>
): { prompt: string; systemPrompt: string } {
  const meta = SECTION_METADATA[sectionId];

  const systemPrompt = `You are a Principal Software Architect generating an executive-grade software specification for a real production project.
Format your output in clean, highly structured, professional GitHub-Flavored Markdown.

CRITICAL FORMATTING RULES FOR ATTRACTIVE, PROFESSIONAL PRESENTATION:
1. FLOWCHARTS & TOPOLOGIES (STRICTLY VERTICAL TOP-DOWN - MANDATORY):
   - ALL architecture, deployment, data flow, and system topology diagrams MUST use \`flowchart TD\` (Top-to-Bottom).
   - NEVER use \`flowchart LR\`, \`graph LR\`, or horizontal orientations. Horizontal flowcharts are strictly forbidden because they stretch into unreadable thin strips on screens and PDF documents.
   - For multi-tier topologies (System Architecture, Deployment, Data Flow), stack tiers vertically from top to bottom:
     * Tier 1 (Top): Client Tier / DNS / Edge CDN
     * Tier 2: API Gateway / Ingress / Load Balancers
     * Tier 3: Core Application Services / Microservices & Workers
     * Tier 4 (Bottom): Data Layer (Databases, Caches, Event Brokers, Storage)
   - Connect tiers vertically (\`tier1 --> tier2 --> tier3 --> tier4\`).
   - If using \`subgraph\`, ALWAYS include \`direction TB\` inside each subgraph and keep subgraphs vertically stacked.
   - Do NOT chain 10+ nodes horizontally in a single row.
   - CRITICAL MERMAID SYNTAX RULES:
     * Always enclose node labels in double quotes if they contain parentheses, ampersands, colons, slashes, or special characters, e.g.: \`clientTier["Client Tier (Web/Mobile)"] --> apiGw["API Gateway (Envoy & Kong)"]\`.
     * Do NOT put raw LaTeX math ($...$) or HTML inside Mermaid labels.
     * Use clean alphanumeric IDs for nodes: \`nodeA\`, \`nodeB\`, \`dbCluster\`.
2. STRUCTURED TABLES: For requirements, endpoints, algorithms, tech comparisons, cost models, test pyramids, and risk matrices, ALWAYS format them as clean Markdown tables with column headers. Tables look significantly more attractive than long bullet walls.
3. DO NOT OUTPUT TOP-LEVEL # TITLES: The UI already renders the section name in the card header. Do not repeat \`# System Architecture\` or \`## System Architecture\` at the beginning. Start directly with an executive summary, a Mermaid diagram, or \`### Subsection\` headings.
4. NO *** OR --- DIVIDER SPAM: Do NOT use decorative separator lines (\`***\` or \`---\`) between paragraphs or items. They look cluttering and unstyled. Use semantic subheadings (\`###\`) and styled tables instead.
5. Be deeply specific, technical, and concrete. Avoid generic placeholders or hand-waving.`;

  let contextSnippet = '';
  if (siblingContext && Object.keys(siblingContext).length > 0) {
    contextSnippet = `\n--- PREVIOUSLY APPROVED SECTIONS CONTEXT ---
${Object.entries(siblingContext)
  .filter(([k]) => k !== sectionId)
  .slice(-3)
  .map(([k, v]) => `[Section: ${k}]\n${v.slice(0, 600)}...`)
  .join('\n\n')}
---------------------------------------------\n`;
  }

  const prompt = `Project Idea:
${idea}

Classification:
- Platform: ${classification.platform}
- Domain: ${classification.domain}
- Complexity: ${classification.complexityTier}
- Core Features: ${classification.keyFeatures.join(', ')}
${contextSnippet}

Generate the **${meta.title}** section for this project.
Section Objective: ${meta.description}

Section-Specific Requirements:
${getSectionSpecificInstructions(sectionId)}

Provide ONLY the clean Markdown content for this section. Remember: no top-level # title and no *** separator lines.`;

  return { prompt, systemPrompt };
}

function getSectionSpecificInstructions(sectionId: SpecSectionId): string {
  switch (sectionId) {
    case 'architecture':
      return `- MUST provide a strictly vertical Mermaid flowchart diagram (\`\`\`mermaid\nflowchart TD\n...\n\`\`\`) detailing tiers stacked vertically from Top to Bottom:
  1. Client Tier (Web / Mobile / Native) [TOP]
  2. API Gateway & Reverse Proxy / Load Balancer
  3. Core Application Service Tier & Async Workers
  4. Data Layer, Caching & Event Bus [BOTTOM]
- Ensure every tier is stacked vertically under the tier above it (\`flowchart TD\` with vertical connections). Do NOT place tiers or subgraphs side-by-side.
- Follow with a structured summary of synchronous (HTTP/gRPC/WebSocket) vs asynchronous (Message Queues/Events) communication patterns.
- Detail high availability, fault tolerance, and failover boundaries.`;

    case 'requirements':
      return `- MUST provide a Functional Requirements (FR) table with columns: | ID | Requirement | Scope Tag ([MVP] vs [Phase 2]) | Priority (P0/P1/P2) | Acceptance Criteria |
- Explicitly tag every requirement so stakeholders immediately distinguish MVP launch scope from Phase 2.
- MUST provide a Non-Functional Requirements (NFR) table with columns: | ID | Category | Target SLA / Metric | Verification Method |`;

    case 'algorithms':
      return `- MUST detail algorithms for BOTH Backend (must have) and Frontend.
- MUST provide an Algorithms Table: | Component | Task / Function | Named Algorithm / Pattern | Execution Context (Backend/Frontend) | Time Complexity | Space Complexity |
- Provide an annotated code block (\`\`\`typescript ... \`\`\`) implementing the core backend algorithm (e.g. Token Bucket rate limiter, DAG resolver, CRDT merge, indexing heuristic).`;

    case 'dataModel':
      return `- MUST provide a Mermaid ER diagram (\`\`\`mermaid\nerDiagram\n...\n\`\`\`) modeling core entities and relationships.
- MUST provide a Schema Table: | Entity | Field | Type | Constraints (PK, FK, Unique, Indexed) | Description |
- Explicitly annotate indexes for high-frequency query paths.`;

    case 'apiEndpoints':
      return `- MUST provide an API Endpoints Table: | Method | Endpoint Path | Summary | Auth Required | Request Payload Summary | Response Status & Body |
- Include sample JSON payloads for the primary CRUD and mutation actions.`;

    case 'folderStructure':
      return `- Provide a clean directory tree in a \`\`\`bash code block representing a scalable production repo or monorepo.
- Annotate key modules with their architectural purpose and separation of concerns.`;

    case 'businessLogic':
      return `- MUST provide a Mermaid State Machine (\`\`\`mermaid\nstateDiagram-v2\n...\n\`\`\`) illustrating the primary entity lifecycle, valid transitions, and guard conditions.
- Detail concurrency controls (optimistic vs pessimistic locking) and tenancy data isolation rules in structured bullet points.`;

    case 'techStack':
      return `- MUST provide a Tech Stack Comparison Table: | Layer / Category | Recommended Choice | Leading Alternative | Trade-off & Justification |
- Clearly explain why the recommended stack fits this project's domain, performance SLA, and team velocity.`;

    case 'deployment':
      return `- MUST provide a strictly vertical Mermaid Cloud Deployment Flowchart (\`\`\`mermaid\nflowchart TD\n...\n\`\`\`) stacked Top-to-Bottom:
  1. DNS & Edge CDN Tier (Cloudflare / Route 53 / Fastly) [TOP]
  2. Ingress & Load Balancing (ALB / NGINX / Cloud Armor)
  3. Compute & Container Cluster (AWS ECS Fargate / Kubernetes / Cloud Run)
  4. Managed Databases, Cache & Object Storage (RDS PostgreSQL / Redis / S3) [BOTTOM]
- MUST use \`flowchart TD\` (Top-Down vertical flow). NEVER use \`flowchart LR\` or horizontal layout.
- Connect the cloud layers vertically from top to bottom (\`dns --> alb --> services --> databases\`).
- Provide a CI/CD Pipeline Table: | Stage | Trigger | Actions & Tools | Success Gate |`;

    case 'security':
      return `- Detail Authentication & Authorization strategy (OAuth2, JWT rotation, session revocation, RBAC).
- Provide a Data Privacy & GDPR Table: | Privacy Dimension | Requirement | Compliance Measure |
- Define Input Validation boundaries (Zod validation at HTTP gateway, parameterized SQL queries, rate limiting).`;

    case 'costEstimate':
      return `- MUST provide an Infrastructure Cost Projections Table with columns: | Cost Category | MVP (0-1k MAU) | Growth (10k-50k MAU) | Scale (100k+ MAU) | Cost Optimization Strategy |
- Give realistic monthly dollar estimates for compute, database, caching, storage, and third-party SaaS.`;

    case 'integrations':
      return `- Auto-detect all required third-party services and provide an Integrations Table: | Service Name | Category (Payments/Auth/Maps/Email) | Protocol (REST/Webhook/SDK) | Free Tier vs Paid Quota | Key Endpoints |`;

    case 'testingStrategy':
      return `- MUST provide a Testing Strategy Table: | Testing Layer | Scope & Responsibility | Recommended Framework | Target Coverage | Execution Timing |
- Cover Unit, Integration, and E2E testing with quality gates.`;

    case 'riskAssumptions':
      return `- Provide an Assumptions Log: list of assumptions made regarding the user's concept for review.
- MUST provide a Technical Risk Matrix Table: | Risk Description | Severity (High/Med/Low) | Likelihood (High/Med/Low) | Mitigation Strategy |`;
  }
}
