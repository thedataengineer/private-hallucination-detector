import { describe, expect, it } from "vitest";
import { cn, getAssetPath } from "./utils";

describe("cn", () => {
  it("merges class names and removes conflicting tailwind utilities", () => {
    const result = cn("px-2", "bg-blue-500", "px-4", { hidden: false, block: true });

    expect(result.split(" ")).toContain("px-4");
    expect(result.split(" ")).toContain("bg-blue-500");
    expect(result.split(" ")).toContain("block");
    expect(result.includes("px-2")).toBe(false);
    expect(result.includes("hidden")).toBe(false);
  });

  it("returns an empty string when no classes are provided", () => {
    expect(cn()).toBe("");
  });
});

describe("getAssetPath", () => {
  it("prefixes paths with the hallucination detector base path", () => {
    expect(getAssetPath("/api/extractclaims")).toBe("/hallucination-detector/api/extractclaims");
  });

  it("handles root path inputs", () => {
    expect(getAssetPath("/")).toBe("/hallucination-detector/");
  });
});
