import { anthropic } from "@ai-sdk/anthropic";
import { generateObject, generateText } from "ai";
import { z } from "zod";

type Provider = "anthropic" | "ollama";

const rawProvider = (process.env.LLM_PROVIDER || "anthropic").toLowerCase();
const provider: Provider = rawProvider === "ollama" ? "ollama" : "anthropic";

const anthropicModel = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2";
const ollamaHost = (process.env.OLLAMA_HOST || "http://127.0.0.1:11434").replace(/\/$/, "");

const OLLAMA_JSON_REGEX = /```json[\s\S]*?```/i;

export const extractJsonSnippet = (response: string): string => {
  if (!response) {
    throw new Error("Empty response from model");
  }

  const fencedMatch = response.match(OLLAMA_JSON_REGEX);
  if (fencedMatch) {
    return fencedMatch[0].replace(/```json|```/gi, "").trim();
  }

  const firstBrace = response.indexOf("{");
  const firstBracket = response.indexOf("[");

  if (firstBrace === -1 && firstBracket === -1) {
    throw new Error("No JSON object found in model response");
  }

  const isArray = firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace);
  const start = isArray ? firstBracket : firstBrace;
  const end = isArray ? response.lastIndexOf("]") : response.lastIndexOf("}");

  if (end === -1 || end < start) {
    throw new Error("Malformed JSON in model response");
  }

  return response.slice(start, end + 1).trim();
};

const runAnthropicText = async (prompt: string): Promise<string> => {
  const { text } = await generateText({
    model: anthropic(anthropicModel),
    prompt,
  });
  return text;
};

const runAnthropicObject = async <T>(prompt: string, schema: z.ZodSchema<T>): Promise<T> => {
  const { object } = await generateObject({
    model: anthropic(anthropicModel),
    prompt,
    schema,
    output: "object",
  });

  return object as T;
};

const runOllama = async (prompt: string): Promise<string> => {
  const response = await fetch(`${ollamaHost}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ollamaModel,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as { response?: string };

  if (!data.response) {
    throw new Error("Missing response payload from Ollama");
  }

  return data.response.trim();
};

export const runLLMText = async (prompt: string): Promise<string> => {
  if (provider === "anthropic") {
    return runAnthropicText(prompt);
  }

  return runOllama(prompt);
};

export const runLLMStructured = async <T>(
  prompt: string,
  schema: z.ZodSchema<T>
): Promise<T> => {
  if (provider === "anthropic") {
    return runAnthropicObject(prompt, schema);
  }

  const text = await runOllama(prompt);
  const json = extractJsonSnippet(text);
  const parsed = JSON.parse(json);
  return schema.parse(parsed);
};

export const currentLLMProvider = provider;
export const currentLLMModel = provider === "anthropic" ? anthropicModel : ollamaModel;
