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
