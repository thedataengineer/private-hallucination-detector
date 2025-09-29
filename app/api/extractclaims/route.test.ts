import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const llmMocks = vi.hoisted(() => ({
  runLLMText: vi.fn(),
  extractJsonSnippet: vi.fn(),
}));

type LlmMocks = {
  runLLMText: ReturnType<typeof vi.fn>;
  extractJsonSnippet: ReturnType<typeof vi.fn>;
};

vi.mock("@/lib/llm", () => llmMocks);

import { POST } from "./route";

const { runLLMText: mockRunLLMText, extractJsonSnippet: mockExtractJsonSnippet } =
  llmMocks as LlmMocks;

describe("POST /api/extractclaims", () => {
  beforeEach(() => {
    mockRunLLMText.mockReset();
    mockExtractJsonSnippet.mockReset();
  });

  it("returns extracted claims when the LLM responds successfully", async () => {
    const claims = [
      { claim: "The sky is blue", original_text: "The sky is blue" },
    ];

    mockRunLLMText.mockResolvedValue("raw-llm-response");
    mockExtractJsonSnippet.mockReturnValue(JSON.stringify(claims));

    const request = {
      json: vi.fn().mockResolvedValue({ content: "Article body" }),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(mockRunLLMText).toHaveBeenCalledTimes(1);
    expect(mockExtractJsonSnippet).toHaveBeenCalledWith("raw-llm-response");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ claims });
  });

  it("returns 400 when content is missing", async () => {
    const request = {
      json: vi.fn().mockResolvedValue({}),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Content is required",
    });
    expect(mockRunLLMText).not.toHaveBeenCalled();
  });

  it("returns 500 when LLM processing fails", async () => {
    mockRunLLMText.mockRejectedValue(new Error("Boom"));

    const request = {
      json: vi.fn().mockResolvedValue({ content: "Article body" }),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(500);
    const result = await response.json();
    expect(result.error).toContain("Failed to extract claims");
  });
});
