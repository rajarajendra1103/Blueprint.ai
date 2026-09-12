import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import providersRouter from './routes/providers.route';
import classifyRouter from './routes/classify.route';
import generateRouter from './routes/generate.route';
import exportRouter from './routes/export.route';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, 
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.use('/api/providers', providersRouter);
app.use('/api/classify', classifyRouter);
app.use('/api/generate', generateRouter);
app.use('/api/export', exportRouter);

// Central error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const server = app.listen(PORT, () => {
  console.log(`[Blueprint.ai Server] Running stateless API on http://localhost:${PORT}`);
});

// Configure long-running timeouts for AI synthesis to prevent ERR_EMPTY_RESPONSE
server.timeout = 600000; // 10 minutes
server.headersTimeout = 605000; // 10 minutes + 5s
server.requestTimeout = 600000;
server.keepAliveTimeout = 600000;

