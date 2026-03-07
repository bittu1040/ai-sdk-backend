import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { generateText } from 'ai';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, AI SDK!");
});

app.post("/chat", async (req, res) => {
  const { messages } = req.body;

  // Use the last user message as the prompt, or pass the messages array directly
  const { text } = await generateText({
    model: openai('gpt-4o'),
    // Option A: Pass the entire conversation history
    messages: messages, 
    // Option B: If you only want the latest prompt: 
    // prompt: messages[messages.length - 1].content,
    system: 'You are a helpful assistant that provides concise answers.', 
  });

  // Express uses res.json(), not Response.json()
  return res.json({ text });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});