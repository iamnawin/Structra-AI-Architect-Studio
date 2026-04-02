/**
 * Skill: claude-api
 *
 * Triggered when a user wants to build an application using the Anthropic SDK /
 * Claude API, or when code already imports `@anthropic-ai/sdk`.
 *
 * Provides a starter system prompt and code scaffolding guidance that Claude
 * will inject into the conversation when this skill is active.
 */

export const skill = {
  name: 'claude-api',
  description: 'Build apps with the Claude API / Anthropic SDK',
  /** Keywords / patterns that auto-activate this skill */
  triggers: [
    /\banthropicai\/sdk\b/i,
    /@anthropic-ai\/sdk/i,
    /\bAnthropicClient\b/,
    /\bnew Anthropic\b/,
    /claude[_-]?agent[_-]?sdk/i,
    /build.*(?:claude|anthropic).*app/i,
    /(?:anthropic|claude)\s+api/i,
    /import\s+Anthropic/,
    /require.*anthropic/,
  ],
  /**
   * System-prompt injection when this skill is active.
   * Merged into the main system message sent to the model.
   */
  systemPromptAddition: `
## Skill: Claude API App Builder

You are an expert at building applications with the Anthropic Claude API.

**Best practices to follow:**

### Model selection
- Default to \`claude-opus-4-6\` for complex tasks, \`claude-sonnet-4-6\` for speed/cost balance
- Use \`claude-haiku-4-5-20251001\` for simple, high-volume tasks
- Always pin a specific model; do not rely on alias strings

### SDK usage (Node.js)
\`\`\`js
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const msg = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
});
console.log(msg.content[0].text);
\`\`\`

### Tool use (function calling)
\`\`\`js
const tools = [{
  name: 'get_weather',
  description: 'Get current weather for a location',
  input_schema: {
    type: 'object',
    properties: { location: { type: 'string', description: 'City name' } },
    required: ['location'],
  },
}];
\`\`\`

### Streaming
\`\`\`js
const stream = client.messages.stream({ model, max_tokens, messages });
for await (const event of stream) {
  if (event.type === 'content_block_delta') process.stdout.write(event.delta.text);
}
\`\`\`

### Computer use
\`\`\`js
const response = await client.beta.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 4096,
  tools: [{ type: 'computer_20250124', name: 'computer', display_width_px: 1280, display_height_px: 800 }],
  messages,
  betas: ['computer-use-2025-01-24'],
});
\`\`\`

### Security
- Never hard-code API keys; always use environment variables
- Validate all user-supplied input before including in prompts
- Use system prompts to constrain model behaviour in production apps
`.trim(),
};
