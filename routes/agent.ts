import { Router } from 'express';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { tools } from '../tools/tool-definition.js';

const router = Router();

// ------------------------------------------------------------------
// Helper – Create OpenRouter AI model
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
// POST /smart-query – AI decides which API to call based on natural language
//
// HOW IT WORKS:
// 1. User sends a natural language query (e.g., "get team members")
// 2. AI analyzes the query and selects appropriate tool(s) to call
// 3. AI executes the tool (which calls our data sources)
// 4. AI returns a response with both raw data and natural language answer
//
// POSTMAN TEST:
// 1. Method: POST
// 2. URL: http://localhost:3001/api/smart-query
// 3. Headers: Content-Type: application/json
// 4. Body examples:
//    { "query": "Who are our team members?" }
//    { "query": "Show me admins" }
//    { "query": "Get payment records" }
// 
// 5. Expected Response:
//    {
//      "query": "Who are our team members?",
//      "result": "We have 4 team members: Alice Johnson...",
//      "toolCalls": [
//        {
//          "name": "getMembers",
//          "arguments": {}
//        }
//      ],
//      "toolResults": [...]
//    }
// ------------------------------------------------------------------
router.post('/smart-query', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      res.status(400).json({ error: 'query is required' });
      return;
    }

    console.log(`[Smart Query] Processing: "${query}"`);

    // Use AI to determine which tool to call
    const result = await generateText({
      model: getModel(),
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
      tools,
    });

    // Extract tool calls and results from AI response
    const toolCalls = result.steps
      .flatMap(step => step.toolCalls)
      .filter(Boolean);

    const toolResults = result.steps
      .flatMap(step => step.toolResults)
      .filter(Boolean);

    console.log(`[Smart Query] Tools used: ${toolCalls.map((tc: any) => tc.toolName).join(', ')}`);

    // If we have tool results but no text response, generate a natural language response
    let aiResponse = result.text;
    
    if (toolResults.length > 0 && !aiResponse) {
      console.log('[Smart Query] Generating natural language response from tool results...');
      
      // Create a summary of tool results
      const toolResultSummary = toolResults
        .map((tr: any) => `Tool: ${tr.toolName}\nResult: ${JSON.stringify(tr.result || tr.output, null, 2)}`)
        .join('\n\n');

      // Ask AI to format the results into a natural response
      const formatResult = await generateText({
        model: getModel(),
        messages: [
          {
            role: 'user',
            content: `Original question: "${query}"\n\nAPI Results:\n${toolResultSummary}\n\nPlease provide a natural, conversational response to the user's question based on these results.`,
          },
        ],
      });
      
      aiResponse = formatResult.text;
    }

    res.json({
      query,
      result: aiResponse,
      toolCalls: toolCalls.map((tc: any) => ({
        name: tc.toolName,
        arguments: tc.args,
      })),
      toolResults: toolResults.map((tr: any) => ({
        name: tr.toolName,
        result: tr.result,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Smart Query Error]', message);
    res.status(500).json({ error: message });
  }
});

export default router;
