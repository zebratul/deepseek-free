// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_URL = 'https://openrouter.ai/v1/chat/completions';
const API_KEY = process.env.OPENROUTER_API_KEY;
if (!API_KEY) {
  console.error('❌ Missing OPENROUTER_API_KEY in env');
  process.exit(1);
}

app.post('/api/deepseek', async (req, res) => {
  const { goal, enemies } = req.body;
  console.log('received a req', goal, enemies);
  
  if (typeof goal !== 'string' || !Array.isArray(enemies)) {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324',
        messages: [
          { role: 'system', content: 'You are a strategic advisor for a tabletop game Twilight Imperium, 4th edition. Based on the user prompt, provide short advice on how to counter-play your enemies' },
          { role: 'user', content: `Goal: ${goal}\nEnemies: ${enemies.join(', ')}` }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    console.log('final data', data);
    res.json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Internal proxy error' });
  }
});

// Render provides PORT in env, default to 4000 locally
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Proxy listening on port ${PORT}`);
});
