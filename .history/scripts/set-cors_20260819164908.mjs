/**
 * Sets CORS configuration on the Firebase Storage bucket.
 * Uses the Firebase CLI's access token for authentication.
 * Run: node scripts/set-cors.mjs
 */
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const corsConfig = JSON.parse(readFileSync(join(__dirname, '..', 'cors.json'), 'utf-8'));

// Get the Firebase access token
let accessToken;
try {
  const authOutput = execSync('firebase login:list --json', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
  const authData = JSON.parse(authOutput);
  accessToken = authData?.result?.[0]?.tokens?.access_token;
} catch (e) {
  console.error('Failed to get Firebase auth token. Make sure you are logged in with `firebase login`.');
  console.error(e.message);
  process.exit(1);
}

if (!accessToken) {
  console.error('No access token found. Run `firebase login` first.');
  process.exit(1);
}

// Get the project ID from .firebaserc
let projectId;
try {
  const rc = JSON.parse(readFileSync(join(__dirname, '..', '.firebaserc'), 'utf-8'));
  projectId = rc?.projects?.default;
} catch (e) {
  console.error('Failed to read .firebaserc:', e.message);
  process.exit(1);
}

if (!projectId) {
  console.error('No default project found in .firebaserc');
  process.exit(1);
}

const bucketName = `${projectId}.firebasestorage.app`;
const url = `https://storage.googleapis.com/storage/v1/b/${bucketName}?fields=cors`;

console.log(`Setting CORS on bucket: ${bucketName}`);
console.log('CORS config:', JSON.stringify(corsConfig, null, 2));

try {
  // First check if we can access the bucket
  const checkResult = execSync(
    `curl -s -X GET "https://storage.googleapis.com/storage/v1/b/${bucketName}?fields=name" -H "Authorization: Bearer ${accessToken}"`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
  );
  console.log('Bucket check:', checkResult);

  // Set CORS configuration
  const corsBody = JSON.stringify(corsConfig);
  const result = execSync(
    `curl -s -X PATCH "https://storage.googleapis.com/storage/v1/b/${bucketName}" -H "Authorization: Bearer ${accessToken}" -H "Content-Type: application/json" -d ${JSON.stringify(JSON.stringify({ cors: corsConfig }))}`,
