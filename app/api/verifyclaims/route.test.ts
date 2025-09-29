import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const llmMocks = vi.hoisted(() => ({
  runLLMStructured: vi.fn(),
}));

type LlmMocks = {
  runLLMStructured: ReturnType<typeof vi.fn>;
};

vi.mock("@/lib/llm", () => llmMocks);

import { POST } from "./route";

const { runLLMStructured: mockRunLLMStructured } = llmMocks as LlmMocks;

describe("POST /api/verifyclaims", () => {
  beforeEach(() => {
    mockRunLLMStructured.mockReset();
  });

  it("returns fact-check results when validation succeeds", async () => {
    const factCheckResult = {
      claim: "The sky is blue",
      assessment: "True" as const,
      summary: "Correct",
      fixed_original_text: "The sky is blue",
      confidence_score: 80,
    };

    mockRunLLMStructured.mockResolvedValue(factCheckResult);

    const request = {
      json: vi.fn().mockResolvedValue({
        claim: "The sky is blue",
        original_text: "The sky is blue",
      }),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(mockRunLLMStructured).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ claims: factCheckResult });
  });

  it("returns 400 when required fields are missing", async () => {
    const request = {
      json: vi.fn().mockResolvedValue({ claim: "", original_text: "" }),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Claim and original text are required",
    });
    expect(mockRunLLMStructured).not.toHaveBeenCalled();
  });

  it("returns 500 when structured call fails", async () => {
    mockRunLLMStructured.mockRejectedValue(new Error("LLM error"));

    const request = {
      json: vi.fn().mockResolvedValue({
        claim: "The sky is blue",
        original_text: "The sky is blue",
      }),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(500);
    const result = await response.json();
    expect(result.error).toContain("Failed to verify claims");
  });
});
