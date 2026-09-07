"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const providers_route_1 = __importDefault(require("./routes/providers.route"));
const classify_route_1 = __importDefault(require("./routes/classify.route"));
const generate_route_1 = __importDefault(require("./routes/generate.route"));
const export_route_1 = __importDefault(require("./routes/export.route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // allow flexible development and preview
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'Blueprint.ai Stateless API',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});
// Routes
app.use('/api/providers', providers_route_1.default);
app.use('/api/classify', classify_route_1.default);
app.use('/api/generate', generate_route_1.default);
app.use('/api/export', export_route_1.default);
// Central error handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});
app.listen(PORT, () => {
    console.log(`[Blueprint.ai Server] Running stateless API on http://localhost:${PORT}`);
});
