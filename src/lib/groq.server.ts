import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

export function createGroq() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("Missing GROQ_API_KEY");
  return createOpenAICompatible({
    name: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    headers: { Authorization: `Bearer ${key}` },
  });
}
