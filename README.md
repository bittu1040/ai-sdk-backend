# AI SDK Backend

A TypeScript/Express.js backend server that provides AI-powered chat capabilities using the Vercel AI SDK and OpenRouter API.

## Features

- **Single-turn chat endpoint** - Get full text responses for user queries
- **Streaming chat endpoint** - Stream responses in real-time
- **Multi-turn conversation support** - Maintain conversation context across messages
- **CORS enabled** - Configured for Angular frontend on localhost:4200
- **Health check endpoint** - Monitor server status

## Prerequisites

- Node.js (v16+)
- npm (v8+)
- OpenRouter API Key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-sdk-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
MODEL=openai/gpt-3.5-turbo
PORT=3001
```

**Required Environment Variables:**
- `OPENROUTER_API_KEY` - Your OpenRouter API key (required)
- `MODEL` - The AI model to use (default: `openai/gpt-3.5-turbo`)
- `PORT` - Port to run the server on (default: `3001`)

## Running the Server

Start the development server:
```bash
npm start
```

The server will start on `http://localhost:3001`

You should see:
```
[dotenv@17.3.1] injecting env (3) from .env
Angular Chat API server running → http://localhost:3001
```

## API Endpoints

### 1. POST `/api/chat` - Single-turn Chat

Get a complete response to a user message.

**Request:**
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Hello, how are you?" }
    ]
  }'
```

**Response:**
```json
{
  "text": "I'm doing well, thank you! How can I help you today?"
}
```

### 2. POST `/api/chat/stream` - Streaming Chat

Stream a response token-by-token for real-time updates.

**Request:**
```bash
curl -X POST http://localhost:3001/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Tell me a short story" }
    ]
  }'
```

**Response:** Text stream (chunks of text returned progressively)

### 3. GET `/health` - Health Check

Check if the server is running.

**Request:**
```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "ok"
}
```

## Multi-turn Conversations

To maintain conversation context, include all previous messages in the request:

**First Request:**
```json
{
  "messages": [
    { "role": "user", "content": "What is TypeScript?" }
  ]
}
```

**Second Request (with context):**
```json
{
  "messages": [
    { "role": "user", "content": "What is TypeScript?" },
    { "role": "assistant", "content": "TypeScript is a typed superset of JavaScript..." },
    { "role": "user", "content": "What are its benefits?" }
  ]
}
```

## Testing with Postman

1. **Import requests** or manually create:
   - **POST** `http://localhost:3001/api/chat`
   - Headers: `Content-Type: application/json`
   - Body: See examples above

2. **Test health endpoint**:
   - **GET** `http://localhost:3001/health`

3. **Test streaming**:
   - **POST** `http://localhost:3001/api/chat/stream`
   - Headers: `Content-Type: application/json`

## Project Structure

```
.
├── index.ts           # Main server file with route handlers
├── package.json       # Project dependencies and scripts
├── .env              # Environment variables (create this file)
├── tsconfig.json     # TypeScript configuration
└── README.md         # This file
```

## Technologies Used

- **Express.js** - Web framework
- **TypeScript** - Language for type safety
- **Vercel AI SDK** - AI model integration
- **OpenRouter API** - Access to multiple AI models
- **Dotenv** - Environment variable management
- **CORS** - Cross-Origin Resource Sharing support
- **TSX** - TypeScript executor for Node.js

## Error Handling

The server includes comprehensive error handling:
- Missing API key validation
- Invalid request validation
- Comprehensive error logging
- 400/500 status codes with error messages

## Available AI Models

You can use any model supported by OpenRouter. Common options:

- `openai/gpt-3.5-turbo` (default)
- `openai/gpt-4`
- `openai/gpt-4-turbo`
- `google/gemini-pro`
- `anthropic/claude-3-opus`

Set your preferred model in the `.env` file:
```env
MODEL=openai/gpt-4
```

## Troubleshooting

**Port already in use:**
```bash
# Use a different port
PORT=3002 npm start
```

**Missing API Key:**
Ensure your `.env` file contains a valid `OPENROUTER_API_KEY`

**CORS errors:**
The frontend must be running on `http://localhost:4200` (configured in code)

## Notes

- For multi-turn conversations, you must include all previous messages in each request
- The assistant's previous response should be copied into the messages array as an `assistant` role message
- Streaming responses use the AI SDK's native streaming implementation
- All responses are JSON-formatted

## License

ISC

## Support

For issues with OpenRouter API, visit: https://openrouter.ai/
For AI SDK documentation, visit: https://sdk.vercel.ai/
