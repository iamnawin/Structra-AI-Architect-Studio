/**
 * Shell Command Safety Classifier
 *
 * Before Claude runs any shell command via the bash tool, this classifier
 * assesses the risk level:
 *
 *   safe  — run without asking
 *   warn  — show command + ask for confirmation before running
 *   block — refuse to run; tell Claude why
 */

// ─── Risk Rules ──────────────────────────────────────────────────────────────

const RULES = [
  // ── BLOCK: immediately destructive / irreversible ──────────────────────────
  {
    level: 'block',
    reason: 'Would delete root filesystem',
    pattern: /\brm\s+(-[^-\s]*f[^-\s]*|-[^-\s]*r[^-\s]*f[^-\s]*|--force)\s+\//,
  },
  {
    level: 'block',
    reason: 'Would recursively delete home directory',
    pattern: /\brm\s+(-[^-\s]*r[^-\s]*|-rf?)\s+(~|\$HOME|\/home\/\w+)\s*$/,
  },
  {
    level: 'block',
    reason: 'Fork bomb detected',
    pattern: /:\s*\(\s*\)\s*\{[^}]*:\s*\|\s*:\s*&/,
  },
  {
    level: 'block',
    reason: 'Would format or wipe a disk device',
    pattern: /\b(mkfs\.|dd\s+if=\/dev\/zero\s+of=\/dev\/[sh]d)/,
  },
  {
    level: 'block',
    reason: 'Would overwrite a disk device',
    pattern: />\s*\/dev\/[sh]d[a-z]/,
  },
  {
    level: 'block',
    reason: 'Piping remote code directly into a shell is dangerous',
    pattern: /\b(curl|wget)\b.+\|\s*(ba)?sh\b/,
  },
  {
    level: 'block',
    reason: 'Would wipe the system with shutdown --poweroff / halt',
    pattern: /\b(halt|poweroff|init\s+0)\b/,
  },

  // ── WARN: risky but potentially intentional ────────────────────────────────
  {
    level: 'warn',
    reason: 'Recursive deletion — double-check the target path',
    pattern: /\brm\s+(-[^-\s]*r[^-\s]*|-rf?)\b/,
  },
  {
    level: 'warn',
    reason: 'Sudo + rm is elevated deletion',
    pattern: /\bsudo\s+rm\b/,
  },
  {
    level: 'warn',
    reason: 'Sudo + chmod may change critical permissions',
    pattern: /\bsudo\s+chmod\b/,
  },
  {
    level: 'warn',
    reason: 'broad world-writable chmod on system path',
    pattern: /\bchmod\s+(777|a\+w|o\+w)\s+\//,
  },
  {
    level: 'warn',
    reason: 'DROP TABLE will permanently delete database table data',
    pattern: /\bDROP\s+TABLE\b/i,
  },
  {
    level: 'warn',
    reason: 'DROP DATABASE will permanently delete the entire database',
    pattern: /\bDROP\s+DATABASE\b/i,
  },
  {
    level: 'warn',
    reason: 'TRUNCATE TABLE permanently removes all rows',
    pattern: /\bTRUNCATE\s+TABLE\b/i,
  },
  {
    level: 'warn',
    reason: 'Force-push can destroy shared git history',
    pattern: /\bgit\s+push\b.*--force\b/,
  },
  {
    level: 'warn',
    reason: 'git reset --hard discards all uncommitted changes',
    pattern: /\bgit\s+reset\b.*--hard\b/,
  },
  {
    level: 'warn',
    reason: 'git clean -f deletes untracked files',
    pattern: /\bgit\s+clean\b.*-[^-]*f\b/,
  },
  {
    level: 'warn',
    reason: 'reboot will restart the machine',
    pattern: /\b(reboot|shutdown\s+-r)\b/,
  },
  {
    level: 'warn',
    reason: 'killing process by signal — confirm target',
    pattern: /\bkill\s+(-9|-SIGKILL)\b/,
  },
  {
    level: 'warn',
    reason: 'npm/pip install with sudo — check package name carefully',
    pattern: /\bsudo\s+(npm|pip3?|yarn|pnpm)\s+install\b/,
  },
];

// ─── Classifier ──────────────────────────────────────────────────────────────

/**
 * @typedef {{ safe: boolean, level: 'safe'|'warn'|'block', reason: string|null }} Classification
 */

/**
 * Classify a shell command and return its safety level.
 * @param {string} command
 * @returns {Classification}
 */
export function classifyShellCommand(command) {
  const trimmed = command.trim();

  for (const { level, reason, pattern } of RULES) {
    if (pattern.test(trimmed)) {
      return { safe: level !== 'block', level, reason };
    }
  }

  return { safe: true, level: 'safe', reason: null };
}

// ─── Interactive confirmation (used by CLI) ───────────────────────────────────

/**
 * Ask the user to confirm a risky command.
 * Reads one line from stdin; resolves to true if user typed y/yes.
 *
 * @param {import('readline').Interface} rl - The active readline interface
 * @param {string} command
 * @param {string} reason
 * @returns {Promise<boolean>}
 */
export function confirmRiskyCommand(rl, command, reason) {
  return new Promise(resolve => {
    process.stdout.write(
      `\n\x1b[33m⚠  Warning:\x1b[0m ${reason}\n` +
      `\x1b[90mCommand:\x1b[0m ${command}\n` +
      `Run anyway? \x1b[90m[y/N]\x1b[0m `
    );
    rl.once('line', answer => {
      const yes = /^y(es)?$/i.test(answer.trim());
      process.stdout.write('\n');
      resolve(yes);
    });
  });
}
