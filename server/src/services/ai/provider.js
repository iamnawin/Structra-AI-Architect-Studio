/**
 * AiProvider interface contract.
 * All providers must return the same DesignOutput shape.
 *
 * DesignOutput {
 *   summary: string
 *   floorPlan: { rooms: Array<{ name, area }>, totalArea: number }
 *   style: string
 *   estimatedCost: string
 *   renderPrompt: string
 *   boqItems: Array<{ item, qty, unit, estimatedCost }>
 * }
 */

export class MockProvider {
  name = 'mock';

  async generateDesign({ requirements, prompt }) {
    await new Promise((r) => setTimeout(r, 800)); // simulate latency

    const style = requirements?.style ?? 'Contemporary';
    const plotSize = requirements?.plotSize ?? '30x40 ft';

    return {
      summary: `A ${style} home design for a ${plotSize} plot. Optimized for natural light and open living spaces.`,
      floorPlan: {
        rooms: [
          { name: 'Living Room', area: '18x16 ft' },
          { name: 'Master Bedroom', area: '14x12 ft' },
          { name: 'Bedroom 2', area: '12x10 ft' },
          { name: 'Kitchen', area: '12x10 ft' },
          { name: 'Dining', area: '12x10 ft' },
          { name: 'Bathrooms', area: '2x (8x6 ft)' },
        ],
        totalArea: 1800,
      },
      style,
      estimatedCost: requirements?.budgetRange ?? '₹60L - ₹80L',
      renderPrompt: `Photorealistic exterior render of a modern ${style} villa, ${plotSize} plot, warm golden hour lighting, lush landscaping, 8k quality`,
      boqItems: [
        { item: 'Foundation & Structure', qty: 1, unit: 'lot', estimatedCost: '₹15L' },
        { item: 'Brickwork & Masonry', qty: 2400, unit: 'sqft', estimatedCost: '₹12L' },
        { item: 'Roofing', qty: 1800, unit: 'sqft', estimatedCost: '₹8L' },
        { item: 'Flooring (Marble/Vitrified)', qty: 1800, unit: 'sqft', estimatedCost: '₹10L' },
        { item: 'Electrical & Plumbing', qty: 1, unit: 'lot', estimatedCost: '₹8L' },
      ],
    };
  }
}

export class GeminiProvider {
  name = 'gemini';

  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async generateDesign({ requirements, prompt }) {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: this.apiKey });

    const systemPrompt = `You are an expert architectural designer. Generate a detailed home design based on the requirements.
Return ONLY valid JSON matching this schema exactly:
{
  "summary": "string",
  "floorPlan": {
    "rooms": [{"name": "string", "area": "string"}],
    "totalArea": number
  },
  "style": "string",
  "estimatedCost": "string",
  "renderPrompt": "string",
  "boqItems": [{"item": "string", "qty": number, "unit": "string", "estimatedCost": "string"}]
}`;

    const userMessage = `Design requirements:
Plot Size: ${requirements?.plotSize ?? 'Not specified'}
Style: ${requirements?.style ?? 'Contemporary'}
Budget: ${requirements?.budgetRange ?? 'Not specified'}
Rooms: ${JSON.stringify(requirements?.rooms ?? ['Living Room', 'Master Bedroom', '2 Bedrooms', 'Kitchen', 'Dining'])}
Vastu: ${requirements?.vastu ? 'Yes, follow Vastu principles' : 'Not required'}
Additional notes: ${prompt ?? 'None'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const text = response.candidates[0].content.parts[0].text;
    return JSON.parse(text);
  }
}

export function createProvider(env = process.env) {
  const mode = env.AI_PROVIDER ?? 'mock';
  if (mode === 'gemini') {
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.warn('[ai] GEMINI_API_KEY not set — falling back to mock provider');
      return new MockProvider();
    }
    return new GeminiProvider(env.GEMINI_API_KEY);
  }
  return new MockProvider();
}
