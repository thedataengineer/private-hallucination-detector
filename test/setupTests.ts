import "@testing-library/jest-dom";
import { vi } from "vitest";

// jsdom does not implement scrollIntoView; stub to avoid errors during tests.
Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
  value: vi.fn(),
  configurable: true,
});

if (!globalThis.navigator) {
  // Ensure navigator exists in the test environment.
  // @ts-expect-error navigator is not defined on globalThis in Node.
  globalThis.navigator = {};
}

if (!globalThis.navigator.clipboard) {
  // Provide a basic clipboard mock used by components that copy text.
  Object.defineProperty(globalThis.navigator, "clipboard", {
    value: {
      writeText: vi.fn(),
    },
    configurable: true,
  });
}
