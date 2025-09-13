// routes/chat.js
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ChromaClient } = require("chromadb");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const client = new ChromaClient();
const collection = await client.getCollection("knowledge_base");

router.post('/', async (req, res) => {
  const { clientKey, message } = req.body;

  // Authenticate client
  const clientData = findClientByApiKey(clientKey);
  if (!clientData) return res.status(401).json({ error: "Unauthorized" });

  // Step 1: Retrieve relevant context from KB
  const queryEmbeddingResult = await genAI.getGenerativeModel({ model: "embedding-001" })
    .generateContent(message);
  const queryEmbedding = queryEmbeddingResult.response.candidates[0].embedding.values;

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: 3
  });

  const context = results.documents.flat().join("\n\n---\n\n");

  // Step 2: Craft prompt with RAG
  const prompt = `
You are a helpful assistant for ${clientData.name}'s website.
Use ONLY the following context to answer the question.
If you don't know the answer, say: "I'm not sure about that. Please contact support at support@${new URL(clientData.websiteUrl).hostname}."

Context:
${context}

Question: ${message}
Answer:
`.trim();

  // Step 3: Call Gemini Pro
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Optional: Log chat history (store in DB)
  console.log(`[${clientData.name}] Q: ${message} → A: ${responseText}`);

  res.json({ reply: responseText });
});

module.exports = router;