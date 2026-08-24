/**
 * Replaces invalid react-icons/fa6 icon names with their correct FA6 exports.
 * Run after check-react-icons.mjs identifies the invalid names.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');

const REPLACEMENTS = {
  FaExternalLink: 'FaArrowUpRightFromSquare',
  FaPlusCircle: 'FaCirclePlus',
  FaBuildingColumn: 'FaLandmark',
};

function collectFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      results.push(...collectFiles(fullPath));
    } else if (/\.(js|jsx)$/.test(entry)) {
      results.push(fullPath);
    }
  }
  return results;
}

let changedFiles = 0;
let totalReplacements = 0;

for (const file of collectFiles(SRC)) {
  let content = readFileSync(file, 'utf8');
  let original = content;
  for (const [invalid, valid] of Object.entries(REPLACEMENTS)) {
    const regex = new RegExp(`\\b${invalid}\\b`, 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, valid);
      totalReplacements += matches.length;
    }
  }
  if (content !== original) {
    writeFileSync(file, content);
    changedFiles++;
    console.log(`✔ ${file}`);
  }
}

console.log(`\n${totalReplacements} replacement(s) applied across ${changedFiles} file(s).`);