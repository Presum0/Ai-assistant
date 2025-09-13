// server.js
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const authRoute = require('./routes/auth');
const chatRoute = require('./routes/chat');
const kbRoute = require('./routes/kb');

app.use('/api/auth', authRoute);
app.use('/api/chat', chatRoute);
app.use('/api/kb', kbRoute);

// Serve widget.js to any client
app.get('/widget.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'widget.js'));
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});