/**
 * CLI Configuration
 * Loads and validates environment variables for the Structra CLI.
 */
import { createRequire } from 'module';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = join(__dirname, '..');

// Load .env from project root
const envPath = join(ROOT_DIR, '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config(); // fallback to process env
}

export const config = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  // Default to opus-4-6 for best computer use performance
  model: process.env.CLAUDE_MODEL || 'claude-opus-4-6',
  maxTokens: parseInt(process.env.MAX_TOKENS || '8096', 10),
  // Computer use is enabled by default; set COMPUTER_USE=false to disable
  computerUseEnabled: process.env.COMPUTER_USE !== 'false',
  // Shell safety classifier is enabled by default; set SHELL_SAFETY=false to disable
  shellSafetyEnabled: process.env.SHELL_SAFETY !== 'false',
  // Beta string required for computer use
  computerUseBeta: 'computer-use-2025-01-24',
};

export function validateConfig() {
  if (!config.anthropicApiKey) {
    process.stderr.write(
      '\x1b[31mError:\x1b[0m ANTHROPIC_API_KEY is not set.\n' +
      'Add it to your .env file:\n' +
      '  ANTHROPIC_API_KEY=sk-ant-...\n'
    );
    process.exit(1);
  }
}
