// routes/auth.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage (use MongoDB/PostgreSQL in prod)
let clients = [];

router.post('/register', (req, res) => {
  const { websiteUrl, name } = req.body;

  if (!websiteUrl || !name) {
    return res.status(400).json({ error: "Website URL and name required" });
  }

  const clientKey = process.env.CLIENT_SECRET_PREFIX + uuidv4().substring(0, 8);

  clients.push({
    id: uuidv4(),
    name,
    websiteUrl,
    clientKey,
    createdAt: new Date().toISOString()
  });

  res.json({
    message: "Registration successful!",
    clientKey,
    widgetScript: `<script src="https://yourdomain.com/widget.js" data-client-key="${clientKey}"></script>`
  });
});

module.exports = router;