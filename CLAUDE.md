# Structra CLI — Setup & Development Guide

## Quick start (CLI)

```bash
# 1. Install dependencies (includes @anthropic-ai/sdk)
npm install

# 2. Create your .env and add your Anthropic key
cp .env.example .env
# then edit .env and set:  ANTHROPIC_API_KEY=sk-ant-...

# 3. Launch the CLI
npm run cli
```

You'll see the REPL prompt. Type any request, for example:

```
You: open a terminal and run ls -la
You: take a screenshot and tell me what's on the screen
You: open Safari and navigate to google.com
You: create a new file called hello.py with a Hello World script
```

---

## CLI commands

| Command | What it does |
|---------|-------------|
| `/help` | Show all commands |
| `/clear` | Reset conversation history |
| `/screenshot` | Capture the screen immediately |
| `/computer on\|off` | Toggle computer use (mouse/keyboard/screenshot) |
| `/skills` | List available skills |
| `/skill claude-api` | Activate the Claude API app-builder skill |
| `/model <name>` | Switch model (e.g. `claude-sonnet-4-6`) |
| `/status` | Show current configuration |
| `/exit` | Quit |

---

## Computer use

The CLI uses **Anthropic's computer-use beta** (`computer-use-2025-01-24`) which
gives Claude three built-in tools:

| Tool | What it does |
|------|-------------|
| `computer` | Screenshot, mouse move/click/drag, keyboard type/key, scroll |
| `bash` | Run shell commands (filtered by safety classifier) |
| `str_replace_based_edit_tool` | View, create, and edit files |

### macOS
- **Screenshot**: `screencapture -x -t png`
- **Mouse & keyboard**: AppleScript via `osascript`
- For click-drag, install `cliclick`: `brew install cliclick`

### Linux
- **Screenshot**: `scrot` (first choice), then ImageMagick `import`, then `gnome-screenshot`
- **Mouse & keyboard**: `xdotool` — install with `sudo apt install xdotool`

Install helpers on Linux:
```bash
sudo apt install scrot xdotool
```

---

## Shell safety classifier

Every command Claude tries to run through the `bash` tool is checked first:

- **safe** — runs automatically
- **warn** — shows the command and asks `[y/N]` before running
- **block** — refused entirely; Claude is told why and asked to find an alternative

Blocked patterns include: `rm -rf /`, fork bombs, `mkfs`, disk overwrites, piping
network responses directly into bash, etc.

Warned patterns include: recursive deletes, `sudo rm`, force-push, `git reset --hard`,
`DROP TABLE`, reboot, `kill -9`, etc.

---

## Skills

Skills inject domain-specific guidance into Claude's system prompt when triggered.

| Skill | Triggered by |
|-------|-------------|
| `claude-api` | `@anthropic-ai/sdk` imports, "build a Claude app", Anthropic API questions |

To add a new skill, create `cli/skills/my-skill.js` following the pattern in
`cli/skills/claude-api.js`, then import and register it in `cli/skills/index.js`.

---

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `ANTHROPIC_API_KEY` | *(required)* | Anthropic API key |
| `CLAUDE_MODEL` | `claude-opus-4-6` | Model for all CLI requests |
| `MAX_TOKENS` | `8096` | Max tokens per response |
| `COMPUTER_USE` | `true` | Set to `false` to disable computer use |
| `SHELL_SAFETY` | `true` | Set to `false` to disable safety classifier |

---

## Project structure

```
cli/
├── index.js              # Main REPL entry point
├── config.js             # Config loading + validation
├── computer-use.js       # Screenshot, mouse, keyboard (macOS + Linux)
├── shell-classifier.js   # Shell command safety checker
└── skills/
    ├── index.js          # Skills registry
    └── claude-api.js     # Claude API / Anthropic SDK skill

server/                   # Express + SQLite backend (Structra web app)
src/                      # React frontend (Structra web app)
```

---

## Web app (separate from CLI)

The Structra web app (architecture studio) runs independently:

```bash
npm run dev:full   # starts React (port 3000) + Express API (port 8787)
npm run smoke      # smoke-test the API endpoints
```
