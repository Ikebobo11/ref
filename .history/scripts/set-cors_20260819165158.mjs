/**
 * Sets CORS configuration on the Firebase Storage bucket.
 * Gets a fresh access token from Firebase CLI and applies CORS via GCS API.
 * Run: node scripts/set-cors.mjs
 */
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const corsConfig = JSON.parse(readFileSync(join(__dirname, '..', 'cors.json'), 'utf-8'));

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

console.log(`Setting CORS on bucket: ${bucketName}`);
console.log('CORS config:', JSON.stringify(corsConfig, null, 2));

async function main() {
  try {
    // Get a fresh access token using Firebase CLI
    console.log('\nGetting fresh access token...');
    const authOutput = execSync('firebase login:list --json', {
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 15000,
    });
    const authData = JSON.parse(authOutput);
    const accessToken = authData?.result?.[0]?.tokens?.access_token;

    if (!accessToken) {
      console.error('No access token found. Run `firebase login` first.');
      process.exit(1);
    }

    console.log('Token obtained, setting CORS...');

    // Set CORS configuration using the Storage JSON API
    const response = await fetch(
      `https://storage.googleapis.com/storage/v1/b/${bucketName}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cors: corsConfig }),
      }
    );

    const result = await response.text();
    console.log(`HTTP ${response.status}:`, result);

    if (response.ok) {
      console.log('\nCORS configuration has been set successfully!');
      console.log('File uploads from localhost should now work.');
      console.error('\nFailed to set CORS configuration.');
      process.exit(1);
    }
  } catch (e) {
    console.error('Error setting CORS:', e.message);
    process.exit(1);
  }
}

main();