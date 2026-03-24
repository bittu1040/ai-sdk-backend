# AI SDK Backend

A TypeScript/Express.js backend server providing AI-powered chat and intelligent tool-routing capabilities using the Vercel AI SDK and OpenRouter API.

## Features

- **Simple chat endpoints** - Get full text or streaming responses
- **Smart query routing** - AI intelligently selects which tools/data sources to use
- **AI Agent with tool calling** - Automatically executes appropriate functions based on queries
- **Multi-turn conversation support** - Maintain conversation context across messages
- **7 Built-in tools** - Weather, Time, User Info, Blog Posts, Products (easily extensible)
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

### 1. POST `/api/chat` - Simple Chat

Get a complete response to a user message (no tools).

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

Stream a response token-by-token for real-time updates (no tools).

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

### 3. POST `/api/smart-query` - Smart Query with AI Tool Routing ⭐

AI analyzes your query and automatically selects the appropriate tool(s) to call, then provides a natural language response.

**Request:**
```bash
curl -X POST http://localhost:3001/api/smart-query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the current weather in London?"
  }'
```

**Response:**
```json
{
  "query": "What is the current weather in London?",
  "result": "The current weather in London is sunny with a temperature of 72°F.",
  "toolCalls": [
    {
      "name": "getWeather",
      "arguments": { "city": "London" }
    }
  ],
  "toolResults": [
    {
      "name": "getWeather",
      "result": "{\"city\": \"London\", \"temperature\": 72, \"condition\": \"Sunny\"}"
    }
  ]
}
```

**Example Queries:**
```
"What's the weather in London?"
"What time is it in New York?"
"Show me user 123 info"
"Get all blog posts"
"Show me products in Electronics category"
"What's the price of product 5?"
```

**Available Tools:**
- `getWeather` - Get current weather for a city
- `getCurrentTime` - Get current time for a timezone
- `getUserInfo` - Retrieve user information by ID
- `getPosts` - Get blog posts (optionally filter by user)
- `getPostById` - Get a specific post by ID
- `getProducts` - Get products catalog (can filter by category or stock)
- `getProductById` - Get specific product details

### 4. GET `/health` - Health Check

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
├── index.ts                 # Main server file - mounts all routers
├── routes/
│   ├── chat.ts             # Chat endpoints (/api/chat, /api/chat/stream)
│   └── agent.ts            # Smart query endpoint (/api/smart-query)
├── tools/
│   └── tool-definition.ts  # Tool definitions (getWeather, getCurrentTime, etc.)
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── .env                    # Environment variables (create this file)
└── README.md               # This file
```

**File Responsibilities:**
- `index.ts` - Express app setup, middleware, router mounting, health check
- `routes/chat.ts` - Simple chat and streaming endpoints (no tools)
- `routes/agent.ts` - Smart query endpoint with AI tool routing
- `tools/tool-definition.ts` - Tool definitions and implementations

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

## Tools & Smart Routing

The `/api/smart-query` endpoint uses AI to intelligently decide which tools to call based on natural language queries.

### Built-in Tools

**getWeather**
- Get current weather for a city
- Parameters: `city` (required)
- Returns: Weather information

**getCurrentTime**
- Get current time for a timezone
- Parameters: `timezone` (optional, defaults to UTC)
- Returns: Current time and timezone info

**getUserInfo**
- Retrieve user information by ID
- Parameters: `userId` (required)
- Returns: User details

**getPosts**
- Get blog posts from JSONPlaceholder
- Parameters: `userId` (optional - filter posts by user)
- Returns: Array of blog posts

**getPostById**
- Get a specific blog post by ID
- Parameters: `postId` (required)
- Returns: Blog post details

**getProducts**
- Get products catalog with filtering
- Parameters: `category` (optional - Electronics, Sports, Home & Kitchen, Accessories, Stationery), `inStock` (optional - true/false)
- Returns: Array of products

**getProductById**
- Get detailed information about a specific product
- Parameters: `productId` (required)
- Returns: Product details with price, specs, etc.

### Extending Tools

To add new tools, edit `tools/tool-definition.ts`:

1. Add tool definition to the `tools` object
2. Implement schema with Zod
3. Add execute function
4. Use axios to call your own API endpoints

**Example Pattern:**
```typescript
export const tools = {
  getTasks: {
    description: 'Get project tasks',
    inputSchema: z.object({
      projectId: z.string().describe('The project ID'),
    }),
    execute: async ({ projectId }: { projectId: string }) => {
      const res = await axios.get(`${baseURL}/api/tasks`, {
        params: { projectId }
      });
      return res.data;
    },
  },
  // Add more tools...
};
```

The AI will automatically learn to use new tools based on their descriptions!

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

**Smart query returns empty result:**
- Check that tools are properly defined in `tools/tool-definition.ts`
- Ensure axios calls are pointing to valid API endpoints
- Check console logs for tool execution errors
- Try a simpler query to test basic functionality

**Tool not being called:**
- Make sure tool description clearly explains its purpose
- Try rephrasing your query to match the tool description
- Check that `inputSchema` is correctly defined with Zod

## Notes

- For multi-turn conversations with `/api/chat`, include all previous messages in each request
- The `/api/smart-query` endpoint is stateless - each query is independent (no conversation history needed)
- Streaming responses use the AI SDK's native streaming implementation
- All responses are JSON-formatted
- Tools are executed automatically based on AI analysis of the query
- The AI can combine multiple tool calls in a single query (e.g., "Show me users and their recent payments")

## License

ISC

## Support

For issues with OpenRouter API, visit: https://openrouter.ai/
For AI SDK documentation, visit: https://sdk.vercel.ai/
