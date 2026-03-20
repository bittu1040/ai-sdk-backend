import express, { Request, Response } from 'express';
import cors from 'cors';
import { generateText, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// ------------------------------------------------------------------
// Helper – build the OpenRouter model (OpenAI-compatible)
// NOTE: OpenRouter expects chat-completions payloads for these models.
// Using the default OpenAI Responses model shape can fail with 400.
// ------------------------------------------------------------------
function getModel() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY environment variable');
  
  const openrouter = createOpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    headers: {
      'HTTP-Referer': 'http://localhost:4200',
      'X-Title': 'Angular Chat App',
    },
  });
  
  return openrouter.chat(process.env.MODEL ?? 'openai/gpt-3.5-turbo');
}

// ------------------------------------------------------------------
// POST /api/chat  – single-turn, returns full text response
// 
// POSTMAN TEST - Basic Request:
// 1. Method: POST
// 2. URL: http://localhost:3001/api/chat
// 3. Headers: Content-Type: application/json
// 4. Body (raw JSON):
//    {
//      "messages": [
//        { "role": "user", "content": "Hello, how are you?" }
//      ]
//    }
// 5. Expected Response:
//    {
//      "text": "I'm doing well, thank you! How can I help you today?"
//    }
//
// POSTMAN TEST - Follow-up Conversation:
// To maintain conversation context, include ALL previous messages:
// 6. Second Request Body:
//    {
//      "messages": [
//        { "role": "user", "content": "Hello, how are you?" },
//        { "role": "assistant", "content": "I'm doing well, thank you! How can I help you today?" },
//        { "role": "user", "content": "Tell me about TypeScript" }
//      ]
//    }
// 7. Third Request Body (continue the pattern):
//    {
//      "messages": [
//        { "role": "user", "content": "Hello, how are you?" },
//        { "role": "assistant", "content": "I'm doing well, thank you! How can I help you today?" },
//        { "role": "user", "content": "Tell me about TypeScript" },
//        { "role": "assistant", "content": "TypeScript is a typed superset of JavaScript..." },
//        { "role": "user", "content": "What about its benefits?" }
//      ]
//    }
//
// NOTE: For each follow-up, copy the "text" value from the previous response
//       into a new assistant message, then add your new user message at the end.
// ------------------------------------------------------------------
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!messages?.length) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    const { text } = await generateText({
      model: getModel(),
      messages,
    });

    res.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/chat]', message);
    res.status(500).json({ error: message });
  }
});

// ------------------------------------------------------------------
// POST /api/chat/stream  – streaming using AI SDK DataStream
//
// POSTMAN TEST:
// 1. Method: POST
// 2. URL: http://localhost:3001/api/chat/stream
// 3. Headers: Content-Type: application/json
// 4. Body (raw JSON):
//    {
//      "messages": [
//        { "role": "user", "content": "Tell me a short story" }
//      ]
//    }
// 5. Expected Response: Text stream (will appear in chunks)
// 6. Note: For multi-turn conversations, add previous messages:
//    {
//      "messages": [
//        { "role": "user", "content": "Hello" },
//        { "role": "assistant", "content": "Hi! How can I help?" },
//        { "role": "user", "content": "Tell me a joke" }
//      ]
//    }
// ------------------------------------------------------------------
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!messages?.length) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    const result = await streamText({
      model: getModel(),
      messages,
    });

    // Use AI SDK's built-in text stream response
    result.pipeTextStreamToResponse(res);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/chat/stream]', message);
    console.error('[/api/chat/stream] Full error:', err);
    
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});

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
  console.log(`Angular Chat API server running → http://localhost:${PORT}`);
});
