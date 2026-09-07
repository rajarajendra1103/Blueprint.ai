"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSpecConsistency = checkSpecConsistency;
function checkSpecConsistency(sections) {
    const warnings = [];
    const dataModelContent = sections.dataModel?.content || '';
    const apiEndpointsContent = sections.apiEndpoints?.content || '';
    const folderStructureContent = sections.folderStructure?.content || '';
    // 1. Extract potential entities from Data Model (looking for tables or capitalized entity words)
    const entityMatches = new Set();
    const entityRegex = /(?:class|table|entity|struct|\b)(\b[A-Z][a-zA-Z0-9_]{2,}\b)/g;
    let match;
    while ((match = entityRegex.exec(dataModelContent)) !== null) {
        const word = match[1];
        if (!['PRIMARY', 'FOREIGN', 'VARCHAR', 'INTEGER', 'TIMESTAMP', 'BOOLEAN', 'TEXT', 'JSONB', 'UUID', 'NULL'].includes(word.toUpperCase())) {
            entityMatches.add(word.toLowerCase());
        }
    }
    // 2. Extract API Endpoint paths (e.g. /api/v1/projects, /users, etc.)
    const endpointRegex = /(?:POST|GET|PUT|PATCH|DELETE)\s+`?([\/a-zA-Z0-9_\-:]+)`?/g;
    const discoveredRoutes = [];
    while ((match = endpointRegex.exec(apiEndpointsContent)) !== null) {
        discoveredRoutes.push({
            method: match[0].split(/\s+/)[0],
            path: match[1],
        });
    }
    // 3. Cross-check endpoints vs Data Model entities
    for (const route of discoveredRoutes) {
        const pathParts = route.path.split('/').filter(p => p && !p.startsWith(':') && !['api', 'v1', 'v2'].includes(p));
        if (pathParts.length > 0) {
            const resourceName = pathParts[0].toLowerCase().replace(/s$/, ''); // singularize crudely
            // If resource name doesn't match any data model entity
            let foundMatch = false;
            for (const entity of entityMatches) {
                if (entity.includes(resourceName) || resourceName.includes(entity)) {
                    foundMatch = true;
                    break;
                }
            }
            if (!foundMatch && entityMatches.size > 0 && resourceName.length > 3) {
                warnings.push({
                    id: `warn-route-entity-${resourceName}`,
                    type: 'warning',
                    sourceSection: 'apiEndpoints',
                    targetSection: 'dataModel',
                    message: `Endpoint \`${route.path}\` operates on resource '${resourceName}', but no corresponding entity was explicitly indexed in the Database Data Model.`,
                    suggestion: `Add a '${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}' table or schema definition to the Data Model section, or update the route naming.`,
                });
                break; // don't spam too many
            }
        }
    }
    // 4. Check for common schema payload mismatches (e.g., id, createdAt, timestamps)
    if (dataModelContent.includes('id') && apiEndpointsContent.includes('POST') && !apiEndpointsContent.includes('id PK') && !apiEndpointsContent.includes('uuid')) {
        // Info level reminder
        warnings.push({
            id: 'info-id-generation',
            type: 'info',
            sourceSection: 'dataModel',
            targetSection: 'apiEndpoints',
            message: `Data Model specifies primary keys, ensure API POST creation payloads do not require client-supplied IDs unless using client-side UUID generation.`,
            suggestion: `Clarify in API Endpoints whether UUIDv4 is server-generated or provided by client.`,
        });
    }
    // 5. Cross-check Endpoints against Folder Structure
    if (discoveredRoutes.length > 0 && folderStructureContent) {
        const hasRoutesOrControllers = folderStructureContent.toLowerCase().includes('routes') ||
            folderStructureContent.toLowerCase().includes('controllers') ||
            folderStructureContent.toLowerCase().includes('handlers') ||
            folderStructureContent.toLowerCase().includes('api/');
        if (!hasRoutesOrControllers) {
            warnings.push({
                id: 'warn-folder-routes',
                type: 'warning',
                sourceSection: 'folderStructure',
                targetSection: 'apiEndpoints',
                message: `API endpoints are defined, but the Project Directory Structure does not show dedicated route handlers, controllers, or API modules.`,
                suggestion: `Include a 'routes/' or 'controllers/' folder in your backend service folder tree to house the ${discoveredRoutes.length} defined endpoints.`,
            });
        }
    }
    // If no warnings were generated, add a clean verification note
    if (warnings.length === 0) {
        warnings.push({
            id: 'info-consistency-clean',
            type: 'info',
            sourceSection: 'dataModel',
            targetSection: 'apiEndpoints',
            message: `All generated API endpoints match entity representations and directory structure cleanly.`,
        });
    }
    return warnings;
}
