"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECTION_METADATA = void 0;
exports.buildSectionPrompt = buildSectionPrompt;
exports.SECTION_METADATA = {
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
function buildSectionPrompt(sectionId, idea, classification, siblingContext) {
    const meta = exports.SECTION_METADATA[sectionId];
    const systemPrompt = `You are a Principal Software Architect generating an executive-grade software specification for a real production project.
Format your output in clean, highly structured, professional GitHub-Flavored Markdown.

CRITICAL FORMATTING RULES FOR ATTRACTIVE, PROFESSIONAL PRESENTATION:
1. FLOWCHARTS & TOPOLOGIES (STRICT RULES & DIAGRAM RESTRICTIONS):
   - Flowcharts / diagrams are ONLY permitted for:
     * Section 1: Architecture (flowchart TD)
     * Section 4: Data Model (erDiagram)
     * Section 7: Business Logic (stateDiagram-v2)
     * Section 8: Deployment (flowchart TD)
   - STRICTLY FORBIDDEN: DO NOT generate any flowchart or Mermaid diagram for Sections 10 to 13 (Cost Projections, Integrations, Testing Strategy, Risk Assumptions). Those sections MUST be presented exclusively as structured Markdown tables and formatted lists.
   - When generating permitted diagrams:
     * ALL architecture, deployment, data flow, and system topology diagrams MUST use \`flowchart TD\` (Top-to-Bottom).
     * NEVER use \`flowchart LR\`, \`graph LR\`, or horizontal orientations.
     * Stack tiers vertically from top to bottom (Client -> Gateway -> Application -> Data).
     * Always enclose node labels in double quotes if they contain special characters: \`clientTier["Client Tier"] --> apiGw["API Gateway"]\`.
     * Do NOT put raw LaTeX math ($...$) or HTML inside Mermaid labels.
     * Use clean alphanumeric IDs for nodes: \`nodeA\`, \`nodeB\`, \`dbCluster\`.
2. STRUCTURED TABLES: For requirements, endpoints, algorithms, tech comparisons, cost models, test pyramids, and risk matrices, ALWAYS format them as clean Markdown tables with column headers. Tables look significantly more attractive than long bullet walls.
3. DO NOT OUTPUT TOP-LEVEL # TITLES: The UI already renders the section name in the card header. Do not repeat \`# System Architecture\` or \`## System Architecture\` at the beginning. Start directly with an executive summary, a Mermaid diagram, or \`### Subsection\` headings.
4. NO *** OR --- DIVIDER SPAM: Do NOT use decorative separator lines (\`***\` or \`---\`) between paragraphs or items. They look cluttering and unstyled. Use semantic subheadings (\`###\`) and styled tables instead.
5. Be deeply specific, technical, and concrete. Avoid generic placeholders or hand-waving.
6. ABSOLUTELY NO META-COMMENTARY, CHAIN-OF-THOUGHT, OR PLANNING NOTES: Do NOT write conversational preambles such as "Let's break down the entities:", "Now let's write the schema:", "However note that...", or draft notes. Start IMMEDIATELY with the Mermaid diagram or subsection heading. Every token must be part of the final production Markdown.`;
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
- Core Features: ${Array.isArray(classification.keyFeatures) ? classification.keyFeatures.join(', ') : 'Core Workflows, API Sync, User Access'}
${contextSnippet}

Generate the **${meta.title}** section for this project.
Section Objective: ${meta.description}

Section-Specific Requirements:
${getSectionSpecificInstructions(sectionId)}

Provide ONLY the clean Markdown content for this section. Remember: no top-level # title, no *** separator lines, and no conversational preamble.`;
    return { prompt, systemPrompt };
}
function getSectionSpecificInstructions(sectionId) {
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
            return `- MUST start IMMEDIATELY with a comprehensive Mermaid ER diagram (\`\`\`mermaid\nerDiagram\n...\n\`\`\`) modeling all core entities, attributes, and relationships.
- CRITICAL MERMAID ER DIAGRAM SYNTAX RULES:
  * Line 1 MUST be \`erDiagram\` (no spaces or extra text).
  * Relationships MUST use valid Mermaid cardinalities:
    - \`EntityA ||--o{ EntityB : "has"\` (one-to-many)
    - \`EntityA ||--|| EntityB : "relates_to"\` (one-to-one)
    - \`EntityA }o--o{ EntityB : "associates"\` (many-to-many)
    - ALWAYS wrap relationship labels in double quotes.
  * Define entity fields inside curly braces:
    EntityName {
      uuid id PK
      uuid foreign_id FK
      string name
      datetime created_at
    }
  * Attribute types MUST be single alphanumeric words without parentheses or spaces (e.g. \`uuid\`, \`string\`, \`int\`, \`float\`, \`boolean\`, \`datetime\`, \`date\`, \`json\`). NEVER use \`varchar(255)\`, \`timestamp with time zone\`, or spaces/parentheses.
  * Key constraints (\`PK\`, \`FK\`, \`UK\`) go immediately after the field name.
  * NEVER put \`#\` or \`//\` comments inside entity blocks. If you must describe a field, enclose the description in double quotes at the end: e.g. \`string role "student, teacher, admin"\`.
  * Ensure all open curly braces \`{\` have matching closing braces \`}\`.
- MUST follow the diagram with:
  1. A structured Schema Table: | Entity | Field | Type | Constraints (PK, FK, Unique, Indexed) | Description |
  2. High-Frequency Indexing Strategy: Explicitly document compound & B-Tree indexes for fast queries (e.g. multi-tenant isolation, roll_number lookups, user_id, chat_room_id, timestamps).`;
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
            return `- STRICTLY DO NOT GENERATE FLOWCHARTS OR MERMAID DIAGRAMS. Use Markdown tables and bulleted text only.
- MUST provide an Infrastructure Cost Projections Table with columns: | Cost Category | MVP (0-1k MAU) | Growth (10k-50k MAU) | Scale (100k+ MAU) | Cost Optimization Strategy |
- Give realistic monthly dollar estimates for compute, database, caching, storage, and third-party SaaS.`;
        case 'integrations':
            return `- STRICTLY DO NOT GENERATE FLOWCHARTS OR MERMAID DIAGRAMS. Use Markdown tables and bulleted text only.
- Auto-detect all required third-party services and provide an Integrations Table: | Service Name | Category (Payments/Auth/Maps/Email) | Protocol (REST/Webhook/SDK) | Free Tier vs Paid Quota | Key Endpoints |`;
        case 'testingStrategy':
            return `- STRICTLY DO NOT GENERATE FLOWCHARTS OR MERMAID DIAGRAMS. Use Markdown tables and bulleted text only.
- MUST provide a Testing Strategy Table: | Testing Layer | Scope & Responsibility | Recommended Framework | Target Coverage | Execution Timing |
- Cover Unit, Integration, and E2E testing with quality gates.`;
        case 'riskAssumptions':
            return `- STRICTLY DO NOT GENERATE FLOWCHARTS OR MERMAID DIAGRAMS. Use Markdown tables and bulleted text only.
- Provide an Assumptions Log: list of assumptions made regarding the user's concept for review.
- MUST provide a Technical Risk Matrix Table: | Risk Description | Severity (High/Med/Low) | Likelihood (High/Med/Low) | Mitigation Strategy |`;
    }
}
