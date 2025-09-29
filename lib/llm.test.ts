import { describe, expect, it } from "vitest";
import { extractJsonSnippet } from "./llm";

describe("extractJsonSnippet", () => {
  it("extracts JSON contained inside fenced code blocks", () => {
    const response = "Here you go:\n```json\n{\n  \"value\": 42\n}\n```";

    expect(extractJsonSnippet(response)).toBe("{\n  \"value\": 42\n}");
  });

  it("extracts raw JSON objects without fencing", () => {
    const response = "Some text before {\"message\":\"hello\"} trailing bits";

    expect(extractJsonSnippet(response)).toBe('{"message":"hello"}');
  });

  it("extracts JSON arrays when they appear first", () => {
    const response = "Output:[{\"id\":1}]";

    expect(extractJsonSnippet(response)).toBe('[{"id":1}]');
  });

  it("throws when response is empty", () => {
    expect(() => extractJsonSnippet(""))
      .toThrowError("Empty response from model");
  });

  it("throws when no JSON object can be found", () => {
    expect(() => extractJsonSnippet("No JSON here"))
      .toThrowError("No JSON object found in model response");
  });

  it("throws when JSON is malformed", () => {
    expect(() => extractJsonSnippet("{\"incomplete\": true"))
      .toThrowError("Malformed JSON in model response");
  });
});
