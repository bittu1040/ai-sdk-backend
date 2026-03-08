import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "@ai-sdk/google";
import { generateText, streamText } from 'ai';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, AI SDK!");
});


/*
  {
     "messages": [
         {
           "role": "user",
           "content": "What is Angular?"
        }
      ]
    }
  }
*/

app.post("/chat", async (req, res) => {
  const { messages } = req.body;
  const model = google('gemini-2.5-flash');

  const { text } = await generateText({
    model: model,
    messages: messages,
    system: "You are a helpful assistant that provides concise answers."
  });

  return res.json({ text });
});


app.post("/chatStream", async (req, res) => {
  const { messages } = req.body;
  const model = google('gemini-2.5-flash');

  const result = await streamText({
    model: model,
    messages: messages,
    system: "You are a helpful assistant that provides concise answers."
  });

    result.pipeTextStreamToResponse(res);

});


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});