const mongoose = require('mongoose');

// Direct hosts obtained from SRV lookup
const hosts = [
  'ac-4wqe5gt-shard-00-00.eugk0tc.mongodb.net:27017',
  'ac-4wqe5gt-shard-00-01.eugk0tc.mongodb.net:27017',
  'ac-4wqe5gt-shard-00-02.eugk0tc.mongodb.net:27017',
];

// WARNING: this will place credentials in the connection string; read them from .env.local
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '..', '.env.local');
let userUri = null;
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  env.split(/\r?\n/).forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const idx = line.indexOf('=');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (key === 'MONGODB_URL' || key === 'MONGODB_URI') userUri = val;
  });
}

if (!userUri) {
  console.error('No MONGODB_URL/URI in .env.local');
  process.exit(2);
}

// extract credentials (user:pass) and db name
const match = userUri.match(/mongodb\+srv:\/\/(.*?@)?([^/]+)\/(.*)$/);
let credential = '';
let dbName = 'test';
if (match) {
  credential = match[1] ? match[1] : '';
  dbName = match[3] || dbName;
} else {
  console.error('Unable to parse SRV URI; aborting');
  process.exit(2);
}

const directUri = `mongodb://${credential}${hosts.join(',')}/${dbName}?ssl=true&authSource=admin&retryWrites=true&w=majority`;
console.log('[test-mongo-direct] attempting direct connect to hosts (uri redacted)');

mongoose
  .connect(directUri, { maxPoolSize: 2 })
  .then(() => {
    console.log('[test-mongo-direct] connected successfully');
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[test-mongo-direct] connection error:');
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  });
