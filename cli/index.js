#!/usr/bin/env node
/**
 * Structra CLI — Local Claude Code AI Assistant
 *
 * A single-file REPL that connects to the Anthropic API with:
 *   • Computer use  (screenshot, mouse, keyboard)
 *   • Bash tool     (run shell commands with safety classifier)
 *   • Text editor   (view / create / edit files)
 *   • Skills        (auto-detected domain guidance injected into system prompt)
 *
 * Usage:
 *   npm run cli
 *   node cli/index.js
 */

import readline from 'readline';
import { promisify } from 'util';
import { exec } from 'child_process';
import Anthropic from '@anthropic-ai/sdk';

import { config, validateConfig } from './config.js';
import {
  getScreenDimensions,
  executeComputerAction,
  handleTextEditorAction,
  buildComputerToolDef,
} from './computer-use.js';
import { classifyShellCommand, confirmRiskyCommand } from './shell-classifier.js';
import {
  listSkills,
  findSkill,
  detectSkills,
  buildSkillSystemPrompt,
} from './skills/index.js';

const execAsync = promisify(exec);

// ─── ANSI colour helpers ──────────────────────────────────────────────────────

const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  cyan:   '\x1b[36m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  blue:   '\x1b[34m',
  magenta:'\x1b[35m',
  white:  '\x1b[37m',
  gray:   '\x1b[90m',
};

function print(msg)   { process.stdout.write(msg + '\n'); }
function dim(msg)     { process.stdout.write(`${c.dim}${msg}${c.reset}\n`); }
function info(msg)    { process.stdout.write(`${c.cyan}ℹ${c.reset}  ${msg}\n`); }
function warn(msg)    { process.stdout.write(`${c.yellow}⚠${c.reset}  ${msg}\n`); }
function err(msg)     { process.stdout.write(`${c.red}✗${c.reset}  ${msg}\n`); }
function success(msg) { process.stdout.write(`${c.green}✓${c.reset}  ${msg}\n`); }
function tool(msg)    { process.stdout.write(`${c.magenta}⚙${c.reset}  ${c.dim}${msg}${c.reset}\n`); }

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  /** Active conversation messages (persists across turns) */
  messages: [],
  /** Active skill names auto-detected this session */
  activeSkills: [],
  /** Whether computer use is currently on */
  computerUse: config.computerUseEnabled,
  /** Screen dimensions, detected at startup */
  screen: { width: 1280, height: 800 },
  /** Whether we are mid-tool-loop (blocks new user input) */
  busy: false,
};

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt() {
  const skillExtra = buildSkillSystemPrompt(state.activeSkills);

  return (
    `You are a powerful AI coding and computer-use assistant running locally on the user's machine. ` +
    `You have access to:\n` +
    `  1. A "computer" tool — take screenshots, move the mouse, click, type, press keys, scroll\n` +
    `  2. A "bash" tool — run shell commands (a safety classifier will confirm risky ones)\n` +
    `  3. A "str_replace_based_edit_tool" — view, create, and edit files\n\n` +
    `Guidelines:\n` +
    `  • Always take a screenshot first when doing UI tasks so you can see the screen.\n` +
    `  • Prefer focused, minimal shell commands over long one-liners.\n` +
    `  • When editing files use the text editor tool; do not use shell redirection for multi-line content.\n` +
    `  • Never delete files or run destructive commands without explaining why first.\n` +
    `  • If a shell command is blocked by the safety classifier, explain the situation and ask the user how to proceed.\n` +
    `  • Be concise in text responses; use markdown for code.\n` +
    `Platform: ${process.platform === 'darwin' ? 'macOS' : process.platform}\n` +
    `Screen: ${state.screen.width}×${state.screen.height}` +
    skillExtra
  );
}

// ─── Tool definitions ─────────────────────────────────────────────────────────

function buildTools() {
  const tools = [];

  if (state.computerUse) {
    tools.push(buildComputerToolDef(state.screen.width, state.screen.height));
  }

  tools.push({ type: 'bash_20250124', name: 'bash' });
  tools.push({ type: 'text_editor_20250124', name: 'str_replace_based_edit_tool' });

  return tools;
}

// ─── Bash tool handler ────────────────────────────────────────────────────────

/**
 * Execute a bash command after running it through the safety classifier.
 * If 'warn', ask the readline interface for confirmation.
 * If 'block', return an error message to Claude.
 */
async function executeBashCommand(command, rl) {
  const classification = classifyShellCommand(command);

  if (classification.level === 'block') {
    warn(`Blocked command: ${c.bold}${command}`);
    err(`Reason: ${classification.reason}`);
    return `BLOCKED: The safety classifier refused to run this command.\nReason: ${classification.reason}\nPlease choose a safer alternative.`;
  }

  if (classification.level === 'warn') {
    const approved = await confirmRiskyCommand(rl, command, classification.reason);
    if (!approved) {
      return `User declined to run: ${command}\nReason: ${classification.reason}`;
    }
  }

  tool(`bash: ${command}`);
  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout: 60_000,
      maxBuffer: 5 * 1024 * 1024, // 5 MB
    });
    const output = (stdout + (stderr ? `\nSTDERR:\n${stderr}` : '')).trim();
    return output || '(command completed with no output)';
  } catch (e) {
    return `Command failed (exit ${e.code ?? '?'}):\n${e.stderr ?? e.message}`;
  }
}

// ─── Tool call dispatcher ─────────────────────────────────────────────────────

/**
 * Handle a single tool_use block from the model response.
 * Returns the tool_result content (string or image array).
 */
async function handleToolUse(block, rl) {
  const { name, input } = block;

  switch (name) {
    case 'computer': {
      tool(`computer: ${input.action ?? input.type ?? JSON.stringify(input)}`);
      return executeComputerAction(input);
    }
    case 'bash': {
      if (input.restart) {
        return '(bash session restarted)';
      }
      return executeBashCommand(input.command, rl);
    }
    case 'str_replace_based_edit_tool': {
      tool(`editor: ${input.command} ${input.path ?? ''}`);
      return handleTextEditorAction(input);
    }
    default:
      return `Unknown tool: "${name}"`;
  }
}

// ─── Agentic loop ─────────────────────────────────────────────────────────────

/**
 * Run the full agentic loop for one user message:
 *   send → handle tool calls → repeat → return final text
 */
async function runAgenticLoop(client, rl) {
  let response;

  try {
    response = await client.beta.messages.create({
      model: config.model,
      max_tokens: config.maxTokens,
      system: buildSystemPrompt(),
      tools: buildTools(),
      messages: state.messages,
      betas: [config.computerUseBeta],
    });
  } catch (e) {
    err(`API error: ${e.message}`);
    // Remove the last user message so the user can retry
    state.messages.pop();
    return null;
  }

  // Tool loop
  while (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');

    // Record assistant turn
    state.messages.push({ role: 'assistant', content: response.content });

    // Execute each tool call and collect results
    const toolResults = [];
    for (const block of toolUseBlocks) {
      let resultContent;
      try {
        resultContent = await handleToolUse(block, rl);
      } catch (e) {
        err(`Tool error (${block.name}): ${e.message}`);
        resultContent = `Error: ${e.message}`;
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: resultContent,
      });
    }

    // Record tool results as a user turn
    state.messages.push({ role: 'user', content: toolResults });

    // Continue the loop
    try {
      response = await client.beta.messages.create({
        model: config.model,
        max_tokens: config.maxTokens,
        system: buildSystemPrompt(),
        tools: buildTools(),
        messages: state.messages,
        betas: [config.computerUseBeta],
      });
    } catch (e) {
      err(`API error: ${e.message}`);
      return null;
    }
  }

  // Record the final assistant message
  state.messages.push({ role: 'assistant', content: response.content });

  // Extract text content
  const texts = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text);

  return texts.join('\n').trim();
}

// ─── REPL commands ────────────────────────────────────────────────────────────

function handleSlashCommand(cmd, rl) {
  const [command, ...args] = cmd.trim().split(/\s+/);

  switch (command.toLowerCase()) {
    case '/help':
      print(
        `\n${c.bold}Structra CLI — Commands${c.reset}\n` +
        `  ${c.cyan}/help${c.reset}              Show this help\n` +
        `  ${c.cyan}/clear${c.reset}             Clear conversation history\n` +
        `  ${c.cyan}/screenshot${c.reset}        Take a screenshot right now\n` +
        `  ${c.cyan}/computer on|off${c.reset}   Toggle computer use tools\n` +
        `  ${c.cyan}/skills${c.reset}            List available skills\n` +
        `  ${c.cyan}/skill <name>${c.reset}      Activate a skill by name\n` +
        `  ${c.cyan}/model <name>${c.reset}      Switch model (e.g. claude-sonnet-4-6)\n` +
        `  ${c.cyan}/status${c.reset}            Show current configuration\n` +
        `  ${c.cyan}/exit${c.reset}              Exit the CLI\n`
      );
      return true;

    case '/clear':
      state.messages = [];
      state.activeSkills = [];
      success('Conversation history cleared.');
      return true;

    case '/screenshot':
      (async () => {
        try {
          info('Taking screenshot…');
          const { takeScreenshot } = await import('./computer-use.js');
          const base64 = await takeScreenshot();
          success(`Screenshot captured (${Math.round(base64.length * 0.75 / 1024)} KB)`);
        } catch (e) {
          err(`Screenshot failed: ${e.message}`);
        }
      })();
      return true;

    case '/computer': {
      const toggle = args[0]?.toLowerCase();
      if (toggle === 'on')  { state.computerUse = true;  success('Computer use enabled.'); }
      else if (toggle === 'off') { state.computerUse = false; success('Computer use disabled.'); }
      else { info(`Computer use is currently ${state.computerUse ? c.green + 'on' : c.red + 'off'}${c.reset}.`); }
      return true;
    }

    case '/skills': {
      const skills = listSkills();
      print(`\n${c.bold}Available Skills${c.reset}`);
      for (const s of skills) {
        const active = state.activeSkills.includes(s.name) ? ` ${c.green}(active)${c.reset}` : '';
        print(`  ${c.cyan}${s.name}${c.reset}${active} — ${s.description}`);
      }
      print('');
      return true;
    }

    case '/skill': {
      const name = args[0];
      if (!name) { err('Usage: /skill <name>'); return true; }
      const found = findSkill(name);
      if (!found) { err(`Skill not found: "${name}". Run /skills to see available skills.`); return true; }
      if (!state.activeSkills.includes(name)) {
        state.activeSkills.push(name);
        success(`Skill "${name}" activated.`);
      } else {
        info(`Skill "${name}" is already active.`);
      }
      return true;
    }

    case '/model': {
      const model = args[0];
      if (!model) { info(`Current model: ${config.model}`); return true; }
      config.model = model;
      success(`Model set to: ${model}`);
      return true;
    }

    case '/status':
      print(
        `\n${c.bold}Structra CLI Status${c.reset}\n` +
        `  Model:         ${c.cyan}${config.model}${c.reset}\n` +
        `  Computer use:  ${state.computerUse ? c.green + 'enabled' : c.red + 'disabled'}${c.reset}\n` +
        `  Shell safety:  ${config.shellSafetyEnabled ? c.green + 'enabled' : c.red + 'disabled'}${c.reset}\n` +
        `  Screen:        ${state.screen.width}×${state.screen.height}\n` +
        `  Active skills: ${state.activeSkills.length ? state.activeSkills.join(', ') : '(none)'}\n` +
        `  Messages:      ${state.messages.length}\n`
      );
      return true;

    case '/exit':
    case '/quit':
      print('\nGoodbye!');
      process.exit(0);
      return true;

    default:
      err(`Unknown command: "${command}". Type /help for a list of commands.`);
      return true;
  }
}

// ─── Banner ───────────────────────────────────────────────────────────────────

function printBanner(screen) {
  print(
    `\n${c.bold}${c.cyan}  Structra CLI${c.reset}  ${c.dim}— Local Claude Code AI Assistant${c.reset}\n` +
    `  ${c.dim}Model:${c.reset} ${config.model}\n` +
    `  ${c.dim}Computer use:${c.reset} ${config.computerUseEnabled ? c.green + 'enabled' : c.gray + 'disabled'}${c.reset}` +
    ` ${c.dim}(${screen.width}×${screen.height})${c.reset}\n` +
    `  ${c.dim}Shell safety:${c.reset} ${config.shellSafetyEnabled ? c.green + 'enabled' : c.gray + 'disabled'}${c.reset}\n\n` +
    `  ${c.dim}Type your request, or ${c.reset}${c.cyan}/help${c.reset}${c.dim} for commands.${c.reset}\n`
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Validate config (exits if ANTHROPIC_API_KEY missing)
  validateConfig();

  // Detect screen resolution
  info('Detecting screen dimensions…');
  state.screen = await getScreenDimensions();
  success(`Screen detected: ${state.screen.width}×${state.screen.height}`);

  // Create Anthropic client
  const client = new Anthropic({ apiKey: config.anthropicApiKey });

  printBanner(state.screen);

  // ── Readline REPL ────────────────────────────────────────────────────────
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${c.bold}${c.blue}You:${c.reset} `,
    terminal: true,
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) { rl.prompt(); return; }

    // ── Slash commands ───────────────────────────────────────────────────
    if (input.startsWith('/')) {
      handleSlashCommand(input, rl);
      rl.prompt();
      return;
    }

    // ── Busy guard ───────────────────────────────────────────────────────
    if (state.busy) {
      warn('Still processing the previous request…');
      rl.prompt();
      return;
    }

    // ── Auto-detect skills ───────────────────────────────────────────────
    const triggered = detectSkills(input);
    for (const skill of triggered) {
      if (!state.activeSkills.includes(skill.name)) {
        state.activeSkills.push(skill.name);
        dim(`  Skill activated: ${skill.name}`);
      }
    }

    // ── Add user message ─────────────────────────────────────────────────
    state.messages.push({ role: 'user', content: input });

    // ── Run agentic loop ─────────────────────────────────────────────────
    state.busy = true;
    process.stdout.write(`\n${c.bold}${c.magenta}Claude:${c.reset} `);

    const reply = await runAgenticLoop(client, rl);

    if (reply) {
      process.stdout.write(reply + '\n');
    }

    process.stdout.write('\n');
    state.busy = false;
    rl.prompt();
  });

  rl.on('close', () => {
    print('\nGoodbye!');
    process.exit(0);
  });
}

main().catch(e => {
  err(`Fatal: ${e.message}`);
  process.exit(1);
});
