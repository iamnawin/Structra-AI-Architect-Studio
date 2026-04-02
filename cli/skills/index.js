/**
 * Skills Registry
 *
 * Skills are domain-specific capability packs that inject additional guidance
 * into Claude's system prompt when a relevant topic is detected.
 *
 * Each skill has:
 *   name                 - unique identifier
 *   description          - shown in /skills list
 *   triggers             - array of RegExp patterns that auto-activate it
 *   systemPromptAddition - text appended to the system prompt
 */
import { skill as claudeApiSkill } from './claude-api.js';

/** All registered skills */
const SKILLS = [claudeApiSkill];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Return the full list of registered skills.
 */
export function listSkills() {
  return SKILLS.map(s => ({ name: s.name, description: s.description }));
}

/**
 * Find a skill by exact name.
 * @param {string} name
 */
export function findSkill(name) {
  return SKILLS.find(s => s.name === name) ?? null;
}

/**
 * Detect which skills are triggered by the given text (user message or code).
 * Returns an array of matching skill objects.
 * @param {string} text
 */
export function detectSkills(text) {
  return SKILLS.filter(skill =>
    skill.triggers.some(pattern => pattern.test(text))
  );
}

/**
 * Build the system prompt additions for a set of active skills.
 * Deduplicates by skill name.
 * @param {string[]} activeSkillNames
 * @returns {string}
 */
export function buildSkillSystemPrompt(activeSkillNames) {
  const active = SKILLS.filter(s => activeSkillNames.includes(s.name));
  if (active.length === 0) return '';
  return '\n\n' + active.map(s => s.systemPromptAddition).join('\n\n');
}
