// routes/kb.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ChromaClient } = require("chromadb");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const client = new ChromaClient(); // Local instance
const collection = await client.createCollection({ name: "knowledge_base" });

router.post('/upload', async (req, res) => {
  const { clientKey, file } = req.body; // file is base64 string or URL

  // Verify client exists
  const client = findClientByApiKey(clientKey);
  if (!client) return res.status(401).json({ error: "Invalid client key" });

  let text = "";

  if (file.endsWith('.pdf')) {
    const buffer = Buffer.from(file.split(',')[1], 'base64');
    const data = await pdfParse(buffer);
    text = data.text;
  } else {
    text = file; // plain text
  }

  // Split into chunks (simple approach)
  const chunks = text.match(/.{1,500}/g) || [text];

  // Generate embeddings using Gemini
  const embeddings = [];
  for (let chunk of chunks) {
    const embeddingResult = await genAI.getGenerativeModel({ model: "embedding-001" })
      .generateContent(chunk);
    const embedding = embeddingResult.response.candidates[0].embedding.values;
    embeddings.push({ chunk, embedding });
  }

  // Store in ChromaDB
  await collection.add({
    ids: chunks.map((_, i) => `${client.id}_${i}`),
    embeddings: embeddings.map(e => e.embedding),
    documents: chunks,
    metadatas: chunks.map(() => ({ clientId: client.id }))
  });

  res.json({ message: "Knowledge base updated!" });
});

module.exports = router;