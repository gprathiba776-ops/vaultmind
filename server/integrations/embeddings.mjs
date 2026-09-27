import { config } from '../config.mjs';

let client;

export async function embedText(text) {
  if (!config.embeddings.apiKey) {
    throw new Error('GEMINI_API_KEY is required for live semantic memory.');
  }
  if (!client) {
    const { GoogleGenAI } = await import('@google/genai');
    client = new GoogleGenAI({ apiKey: config.embeddings.apiKey });
  }
  const result = await client.models.embedContent({
    model: config.embeddings.model,
    contents: text,
    config: { outputDimensionality: config.embeddings.outputDimensionality },
  });
  const values = result.embeddings?.[0]?.values;
  if (!Array.isArray(values) || values.length !== config.qdrant.vectorSize) {
    throw new Error(`Embedding dimension mismatch. Expected ${config.qdrant.vectorSize}.`);
  }
  return values;
}
