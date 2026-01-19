require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { initDatabase, getComments, addComment } = require('./database');
const { runBenchmark, getBenchmarkStatus } = require('./benchmark-runner');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
      "style-src": ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdnjs.cloudflare.com", "cdn.jsdelivr.net"],
      "font-src": ["'self'", "fonts.gstatic.com", "cdnjs.cloudflare.com", "cdn.jsdelivr.net"],
      "img-src": ["'self'", "data:", "cdn.tailwindcss.com"],
      "connect-src": ["'self'", "http://127.0.0.1:3000", "http://localhost:3000", "https://*.run.app"]
    },
  },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../docs')));

// Rate limiters
const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 comments per hour per IP
  message: { error: 'Too many comments. Please try again later.' }
});

const benchmarkLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 benchmarks per minute per IP
  message: { error: 'Please wait before running another benchmark.' }
});

// Comment API Routes

// Get all comments
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await getComments();
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Post a new comment
app.post('/api/comments', commentLimiter, async (req, res) => {
  try {
    const { name, text } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    // Validation
    if (!name || !text) {
      return res.status(400).json({ error: 'Name and text are required' });
    }

    if (name.length > 50) {
      return res.status(400).json({ error: 'Name must be 50 characters or less' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ error: 'Comment must be 1000 characters or less' });
    }

    // Comprehensive profanity filter (server-side)
    // This regex covers a wide range of offensive terms, slurs, and their common variations/leetspeak
    const profanityRegex = /\b(f[u|*|k|v]ck|sh[i|*|t|t]t|b[i|*|t]tch|a[s|*|z]s|d[a|*|m]mn|h[e|*|l]ll|cr[a|*]p|p[u|*]ssy|d[i|*]ck|c[u|*]nt|f[a|*]g|n[i|*]gg[e|*]r|wh[o|*]re|sl[u|*]t|bastard|jackass|dumbass|retard|idiot|stupid|piss|bloody|crap|damn|goddamn|motherfucker|bollocks|bugger|tosser|wanker|slag|prick|twat|numbnut|skank|clit|nonce|nonce|shag|slag|minger|clunge|punter|knob|bellend|jizz|cum|semen|vagina|penis|porn|sex|xxx|boobs|tits|nipple|asshole|faggot|kike|spic|chink|wog|darkie|paki|coon|honky|gook|dyke|tranny|homo|biatch|muff|cooter|rectum|anus|fart|turd|testicle|scrotum|cock|balls|ejaculate|masturbate|orgasm|erotic|hardcore|pedophile|pedobear|bestiality|rape|incest|nazi|hitler|holocaust|terrorist|jihad|suicide|kill|death|murder|cocaine|heroin|meth|weed|marijuana|stoned|drunk|alcoholic|idiot|moron|retard|imbecile|loser|failure|suck|hate|ugly|fat|gross|disgusting)\b/gi;
    if (profanityRegex.test(name) || profanityRegex.test(text)) {
      return res.status(400).json({ error: 'Please keep comments respectful' });
    }

    // Add comment
    const comment = await addComment(name, text, ip);
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Benchmark API Routes

// Supported languages (whitelist)
const SUPPORTED_LANGUAGES = [
  'assembly', 'c', 'cpp', 'rust', 'go', 'julia', 'java', 
  'nodejs', 'csharp', 'dart', 'python_codon', 'pascal', 
  'python', 'php', 'r', 'ruby', 'chap', 'zig', 'fortran', 'nim'
];

// Run benchmark with Server-Sent Events
app.get('/api/run/:language', benchmarkLimiter, async (req, res) => {
  const { language } = req.params;

  // Validate language
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return res.status(400).json({ error: 'Invalid language' });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    await runBenchmark(language, (data) => {
      // Send progress updates to client
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    });

    // Send completion event
    res.write('data: {"status":"completed"}\n\n');
    res.end();
  } catch (error) {
    console.error('Benchmark error:', error);
    res.write(`data: ${JSON.stringify({ status: 'error', message: error.message })}\n\n`);
    res.end();
  }
});

// Get benchmark queue status
app.get('/api/status', (req, res) => {
  const status = getBenchmarkStatus();
  res.json(status);
});

// Serve Frontend

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../docs', 'index.html'));
});
// Start server

app.listen(PORT, () => {
  console.log(`🚀 Language Reactor server running on port ${PORT}`);
  console.log(`📊 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});
