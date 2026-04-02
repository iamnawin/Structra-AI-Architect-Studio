/**
 * Computer Use Tools
 * Implements platform-specific actions for screen capture, mouse control,
 * and keyboard input on macOS and Linux.
 *
 * macOS: uses screencapture + osascript (AppleScript)
 * Linux: uses scrot/import for screenshots + xdotool for mouse/keyboard
 */
import { execSync } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import { readFileSync, writeFileSync, readSync, openSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import os from 'os';

const execAsync = promisify(exec);
const PLATFORM = process.platform; // 'darwin' | 'linux'
const SCREENSHOT_PATH = join(os.tmpdir(), 'structra-cli-screenshot.png');

// ─── Screen Dimensions ───────────────────────────────────────────────────────

/**
 * Detect the primary display resolution.
 * Falls back to 1280×800 when no display is available.
 */
export async function getScreenDimensions() {
  try {
    if (PLATFORM === 'darwin') {
      // python3 is always available on macOS
      const result = execSync(
        `python3 -c "import subprocess; out=subprocess.check_output(['system_profiler','SPDisplaysDataType']).decode(); ` +
        `import re; m=re.search(r'Resolution: (\\\\d+) x (\\\\d+)', out); print(m.group(1),m.group(2)) if m else print('1280 800')"`,
        { encoding: 'utf8', timeout: 5000 }
      ).trim();
      const [w, h] = result.split(' ').map(Number);
      if (w && h) return { width: w, height: h };
    } else {
      // Linux: try xrandr
      const result = execSync(
        `xrandr 2>/dev/null | grep -m1 '\\*' | awk '{print $1}'`,
        { encoding: 'utf8', timeout: 5000 }
      ).trim();
      const match = result.match(/^(\d+)x(\d+)$/);
      if (match) return { width: parseInt(match[1], 10), height: parseInt(match[2], 10) };
    }
  } catch {
    // no display — silently fall back
  }
  return { width: 1280, height: 800 };
}

// ─── Screenshot ──────────────────────────────────────────────────────────────

/**
 * Take a full-screen screenshot and return it as a base64 PNG string.
 */
export async function takeScreenshot() {
  if (PLATFORM === 'darwin') {
    execSync(`screencapture -x -t png "${SCREENSHOT_PATH}" 2>/dev/null`);
  } else {
    // Try scrot, then ImageMagick import, then gnome-screenshot
    const tools = [
      `scrot "${SCREENSHOT_PATH}"`,
      `import -window root "${SCREENSHOT_PATH}"`,
      `gnome-screenshot -f "${SCREENSHOT_PATH}"`,
    ];
    let captured = false;
    for (const cmd of tools) {
      try {
        execSync(cmd, { timeout: 8000 });
        captured = true;
        break;
      } catch {
        continue;
      }
    }
    if (!captured) {
      throw new Error(
        'No screenshot tool found. Install scrot (Linux) or ensure a display is available.'
      );
    }
  }
  const data = readFileSync(SCREENSHOT_PATH);
  return data.toString('base64');
}

// ─── Mouse Control ───────────────────────────────────────────────────────────

export async function moveMouse(x, y) {
  if (PLATFORM === 'darwin') {
    await execAsync(
      `osascript -e 'tell application "System Events" to set the position of the mouse to {${x}, ${y}}'`
    );
  } else {
    await execAsync(`xdotool mousemove --sync ${x} ${y}`);
  }
}

export async function leftClick(x, y) {
  if (PLATFORM === 'darwin') {
    await execAsync(
      `osascript -e 'tell application "System Events" to click at {${x}, ${y}}'`
    );
  } else {
    await execAsync(`xdotool mousemove --sync ${x} ${y} click 1`);
  }
}

export async function rightClick(x, y) {
  if (PLATFORM === 'darwin') {
    await execAsync(
      `osascript -e 'tell application "System Events" to right click at {${x}, ${y}}'`
    );
  } else {
    await execAsync(`xdotool mousemove --sync ${x} ${y} click 3`);
  }
}

export async function middleClick(x, y) {
  if (PLATFORM === 'darwin') {
    // No native AppleScript middle-click; approximate with cliclick if available
    try {
      await execAsync(`cliclick c:${x},${y}`);
    } catch {
      throw new Error('Middle-click on macOS requires the cliclick utility: brew install cliclick');
    }
  } else {
    await execAsync(`xdotool mousemove --sync ${x} ${y} click 2`);
  }
}

export async function doubleClick(x, y) {
  if (PLATFORM === 'darwin') {
    await execAsync(
      `osascript -e 'tell application "System Events" to double click at {${x}, ${y}}'`
    );
  } else {
    await execAsync(`xdotool mousemove --sync ${x} ${y} click --repeat 2 --delay 100 1`);
  }
}

export async function leftClickDrag(fromX, fromY, toX, toY) {
  if (PLATFORM === 'darwin') {
    // AppleScript doesn't support drag natively; use cliclick if available
    try {
      await execAsync(`cliclick dd:${fromX},${fromY} m:${toX},${toY} du:${toX},${toY}`);
    } catch {
      // Fallback: move, mousedown, move, mouseup via python
      await execAsync(
        `python3 -c "
import subprocess, time
subprocess.run(['osascript','-e','tell app \"System Events\" to click at {${fromX},${fromY}}'])
time.sleep(0.1)
subprocess.run(['osascript','-e','tell app \"System Events\" to click at {${toX},${toY}}'])
"`
      );
    }
  } else {
    await execAsync(
      `xdotool mousemove --sync ${fromX} ${fromY} mousedown 1 ` +
      `mousemove --sync ${toX} ${toY} mouseup 1`
    );
  }
}

export async function scroll(x, y, direction, amount = 3) {
  if (PLATFORM === 'darwin') {
    const dy = direction === 'up' ? amount : direction === 'down' ? -amount : 0;
    const dx = direction === 'right' ? amount : direction === 'left' ? -amount : 0;
    await execAsync(
      `osascript -e 'tell application "System Events" to scroll (the position {${x},${y}}) by {${dx},${dy}}'`
    );
  } else {
    // xdotool button: 4=scroll-up, 5=scroll-down, 6=scroll-left, 7=scroll-right
    const btn = { up: 4, down: 5, left: 6, right: 7 }[direction] ?? 5;
    const cmds = Array.from({ length: amount }, () => `click --clearmodifiers ${btn}`).join(' ');
    await execAsync(`xdotool mousemove --sync ${x} ${y} ${cmds}`);
  }
}

export async function getCursorPosition() {
  try {
    if (PLATFORM === 'darwin') {
      const out = (
        await execAsync(
          `osascript -e 'tell application "System Events" to return the position of the mouse'`
        )
      ).stdout.trim();
      const [x, y] = out.split(',').map(s => parseInt(s.trim(), 10));
      return { x, y };
    } else {
      const out = (await execAsync(`xdotool getmouselocation --shell`)).stdout;
      const xm = out.match(/X=(\d+)/);
      const ym = out.match(/Y=(\d+)/);
      return { x: parseInt(xm[1], 10), y: parseInt(ym[1], 10) };
    }
  } catch {
    return { x: 0, y: 0 };
  }
}

// ─── Keyboard ────────────────────────────────────────────────────────────────

export async function typeText(text) {
  if (PLATFORM === 'darwin') {
    // Use printf to avoid escaping issues; pipe to osascript
    const escaped = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    await execAsync(`osascript -e 'tell application "System Events" to keystroke "${escaped}"'`);
  } else {
    // Use xdotool with -- to handle leading hyphens and special chars
    await execAsync(`xdotool type --clearmodifiers --delay 30 -- ${JSON.stringify(text)}`);
  }
}

export async function pressKey(keyStr) {
  if (PLATFORM === 'darwin') {
    // Map common X11 key names / ctrl+x combos to AppleScript syntax
    const macKeyMap = {
      Return: 'return',
      BackSpace: 'delete',
      Escape: 'escape',
      Tab: 'tab',
      Delete: 'forwarddelete',
      'ctrl+c': 'c using command down',
      'ctrl+v': 'v using command down',
      'ctrl+z': 'z using command down',
      'ctrl+a': 'a using command down',
      'ctrl+s': 's using command down',
      'ctrl+x': 'x using command down',
      'ctrl+n': 'n using command down',
      'ctrl+w': 'w using command down',
      'ctrl+t': 't using command down',
      'ctrl+l': 'l using command down',
      'ctrl+r': 'r using command down',
      'super+space': 'space using command down',
    };
    const mapped = macKeyMap[keyStr] ?? keyStr;
    await execAsync(
      `osascript -e 'tell application "System Events" to keystroke ${mapped}'`
    );
  } else {
    await execAsync(`xdotool key --clearmodifiers -- ${keyStr}`);
  }
}

// ─── Text Editor Tool (str_replace_based_edit_tool) ──────────────────────────

/**
 * Handle Anthropic's built-in text editor tool actions.
 * Claude uses this to view/create/edit files directly.
 */
export async function handleTextEditorAction(input) {
  const { command, path: filePath } = input;

  switch (command) {
    case 'view': {
      if (!existsSync(filePath)) {
        return `File not found: ${filePath}`;
      }
      const content = readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const start = (input.view_range?.[0] ?? 1) - 1;
      const end = input.view_range?.[1] ?? lines.length;
      const sliced = lines.slice(start, end);
      return sliced.map((l, i) => `${start + i + 1}\t${l}`).join('\n');
    }
    case 'create': {
      const dir = filePath.substring(0, filePath.lastIndexOf('/'));
      if (dir) mkdirSync(dir, { recursive: true });
      writeFileSync(filePath, input.file_text ?? '', 'utf8');
      return `File created: ${filePath}`;
    }
    case 'str_replace': {
      if (!existsSync(filePath)) {
        return `File not found: ${filePath}`;
      }
      const original = readFileSync(filePath, 'utf8');
      if (!original.includes(input.old_str)) {
        return `Error: old_str not found in file. No changes made.`;
      }
      const updated = original.replace(input.old_str, input.new_str ?? '');
      writeFileSync(filePath, updated, 'utf8');
      return `File updated: ${filePath}`;
    }
    case 'insert': {
      if (!existsSync(filePath)) {
        return `File not found: ${filePath}`;
      }
      const lines = readFileSync(filePath, 'utf8').split('\n');
      const insertLine = input.insert_line ?? 0;
      lines.splice(insertLine, 0, input.new_str ?? '');
      writeFileSync(filePath, lines.join('\n'), 'utf8');
      return `Inserted at line ${insertLine + 1} in ${filePath}`;
    }
    case 'undo_edit': {
      return `Undo is not supported in this implementation.`;
    }
    default:
      return `Unknown text editor command: ${command}`;
  }
}

// ─── Main Action Dispatcher ──────────────────────────────────────────────────

/**
 * Execute a computer use action from the Anthropic API response.
 * Returns the tool_result content (string or image block).
 */
export async function executeComputerAction(action) {
  const { type } = action;

  switch (type) {
    case 'screenshot': {
      const base64 = await takeScreenshot();
      return [{ type: 'image', source: { type: 'base64', media_type: 'image/png', data: base64 } }];
    }
    case 'mouse_move': {
      const [x, y] = action.coordinate;
      await moveMouse(x, y);
      return 'Mouse moved.';
    }
    case 'left_click': {
      const [x, y] = action.coordinate;
      await leftClick(x, y);
      return 'Left click done.';
    }
    case 'right_click': {
      const [x, y] = action.coordinate;
      await rightClick(x, y);
      return 'Right click done.';
    }
    case 'middle_click': {
      const [x, y] = action.coordinate;
      await middleClick(x, y);
      return 'Middle click done.';
    }
    case 'double_click': {
      const [x, y] = action.coordinate;
      await doubleClick(x, y);
      return 'Double click done.';
    }
    case 'left_click_drag': {
      const [fromX, fromY] = action.startCoordinate;
      const [toX, toY] = action.coordinate;
      await leftClickDrag(fromX, fromY, toX, toY);
      return 'Drag done.';
    }
    case 'type': {
      await typeText(action.text);
      return 'Text typed.';
    }
    case 'key': {
      await pressKey(action.text);
      return 'Key pressed.';
    }
    case 'scroll': {
      const [x, y] = action.coordinate;
      await scroll(x, y, action.direction, action.amount ?? 3);
      return 'Scroll done.';
    }
    case 'cursor_position': {
      const pos = await getCursorPosition();
      return `Cursor position: (${pos.x}, ${pos.y})`;
    }
    default:
      throw new Error(`Unknown computer action type: "${type}"`);
  }
}

/**
 * Build the computer tool definition for the Anthropic API call.
 */
export function buildComputerToolDef(width, height) {
  return {
    type: 'computer_20250124',
    name: 'computer',
    display_width_px: width,
    display_height_px: height,
    display_number: 1,
  };
}
