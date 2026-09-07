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
1. FLOWCHARTS & DIAGRAMS (MUST BE MERMAID): For any topology, architecture, data flow, entity-relationship, or state machine, you MUST provide a valid Mermaid diagram enclosed in a \`\`\`mermaid code block (e.g. \`flowchart TD\`, \`sequenceDiagram\`, \`stateDiagram-v2\`, or \`erDiagram\`). The UI compiles these into interactive vector SVG diagrams.
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
function getSectionSpecificInstructions(sectionId) {
    switch (sectionId) {
        case 'architecture':
            return `- MUST provide a valid Mermaid flowchart diagram (\`\`\`mermaid\nflowchart TD\n...\n\`\`\`) detailing Client Tier, API Gateway / Reverse Proxy, Service Tier / Workers, and Data / Cache Tier.
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
            return `- MUST provide a Mermaid Cloud Deployment Flowchart (\`\`\`mermaid\nflowchart LR\n...\n\`\`\`) showing DNS/Edge CDN -> Container Cluster -> Managed DB & Cache.
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
