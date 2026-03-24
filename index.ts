import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import chatRouter from './routes/chat.js';
import agentRouter from './routes/agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// ------------------------------------------------------------------
// Chat Routes
// Mount the chat router for regular chat and stream endpoints
// ------------------------------------------------------------------
app.use('/api', chatRouter);

// ------------------------------------------------------------------
// Agent Routes
// Mount the agent router for tool-calling functionality
// ------------------------------------------------------------------
app.use('/api', agentRouter);

// ------------------------------------------------------------------
// Health check
//
// POSTMAN TEST:
// 1. Method: GET
// 2. URL: http://localhost:3001/health
// 3. Expected Response: { "status": "ok" }
// ------------------------------------------------------------------
app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 Angular Chat API server running → http://localhost:${PORT}`);
  console.log(`${'='.repeat(70)}\n`);
  console.log('📌 Available Endpoints:');
  console.log('   1. POST /api/chat          - Simple chat (no tools)');
  console.log('   2. POST /api/chat/stream   - Streaming chat (no tools)');
  console.log('   3. POST /api/smart-query   - Smart query with AI tool routing ⭐');
  console.log('   4. GET  /health            - Health check\n');
});
