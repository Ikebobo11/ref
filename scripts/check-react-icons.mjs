/**
 * Validates all react-icons imports across src/ against the actual
 * exports declared in the installed react-icons package.
 * Usage: node scripts/check-react-icons.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const nodeModulesIcons = join(ROOT, 'node_modules', 'react-icons');

/** Recursively collect all source files */
function collectFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      results.push(...collectFiles(fullPath));
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry)) {
      results.push(fullPath);
    }
  }
  return results;
}

/** Extract all named exports from a react-icons set index.d.ts */
function getValidExports(setName) {
  const dtsPath = join(nodeModulesIcons, setName, 'index.d.ts');
  try {
    const content = readFileSync(dtsPath, 'utf8');
    const matches = [...content.matchAll(/export declare const (\w+): IconType/g)];
    return new Set(matches.map((m) => m[1]));
  } catch {
    return null; // set not installed
  }
}

const files = collectFiles(SRC);
let errorCount = 0;
const allIcons = new Map(); // iconName -> set name

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  // Match named imports from react-icons/xxx
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]react-icons\/([a-z0-9]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const [, namesBlock, setName] = match;
    const validExports = getValidExports(setName);
    if (validExports === null) {
      console.error(`✖ ${file}: react-icons/${setName} is not installed`);
      errorCount++;
      continue;
    }
    const iconNames = namesBlock
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n && !n.includes('*') && !n.includes('}'));
    for (const name of iconNames) {
      allIcons.set(name, setName);
      if (!validExports.has(name)) {
        console.error(`✖ ${file}: '${name}' is NOT an export of react-icons/${setName}`);
        errorCount++;
      }
    }
  }
}

if (errorCount === 0) {
  console.log(`✔ All ${allIcons.size} react-icons imports across ${files.length} files are valid exports.`);
} else {
  console.error(`\n${errorCount} invalid react-icons import(s) found.`);
  process.exit(1);
}