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
