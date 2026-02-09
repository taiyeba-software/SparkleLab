const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load .env.local from project root
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  env.split(/\r?\n/).forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const idx = line.indexOf('=');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  });
}

const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
if (!uri) {
  console.error('No MONGODB_URI or MONGODB_URL found in .env.local');
  process.exit(2);
}

console.log('[test-mongo] attempting to connect to MongoDB (uri redacted)');

mongoose
  .connect(uri, { maxPoolSize: 2 })
  .then(() => {
    console.log('[test-mongo] connected successfully');
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[test-mongo] connection error:');
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  });
