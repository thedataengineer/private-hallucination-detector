import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import FactChecker from "./FactChecker";

const originalFetch = global.fetch;
const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof global.fetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe("FactChecker", () => {
  it("shows a validation error when the textarea is empty", async () => {
    const user = userEvent.setup();
    render(<FactChecker />);

    const submitButton = screen.getByRole("button", { name: /Detect Hallucinations/i });
    await user.click(submitButton);

    expect(await screen.findByText(/Please enter some content/i)).toBeInTheDocument();
  });

  it("warns when the provided content is too short", async () => {
    const user = userEvent.setup();
    render(<FactChecker />);

    const textarea = screen.getByPlaceholderText("Enter Your Content");
    await user.type(textarea, "Too short");

    const submitButton = screen.getByRole("button", { name: /Detect Hallucinations/i });
    await user.click(submitButton);

    expect(await screen.findByText(/at least 50 characters/i)).toBeInTheDocument();
  });

  it("submits content, calls both APIs, and renders the resulting claims", async () => {
    const user = userEvent.setup();
    const article = "The sky is blue and everyone knows it. This detailed sentence easily surpasses fifty characters.";

    const extractResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          claims: [
            {
              claim: "The sky is blue",
              original_text: "The sky is blue",
            },
          ],
        }),
    } as Response;

    const verifyResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          claims: {
            claim: "The sky is blue",
            assessment: "False",
            summary: "The sky can appear in various colors.",
            fixed_original_text: "The sky often appears blue during clear days.",
            confidence_score: 65,
          },
        }),
    } as Response;

    fetchMock.mockResolvedValueOnce(extractResponse);
    fetchMock.mockResolvedValueOnce(verifyResponse);

    render(<FactChecker />);

    const textarea = screen.getByPlaceholderText("Enter Your Content");
    await user.type(textarea, article);

    const submitButton = screen.getByRole("button", { name: /Detect Hallucinations/i });
    await user.click(submitButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/hallucination-detector/api/extractclaims",
      expect.objectContaining({
        method: "POST",
      }),
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/hallucination-detector/api/verifyclaims",
      expect.objectContaining({
        method: "POST",
      }),
    );

    const claimTexts = await screen.findAllByText("The sky is blue");
    expect(claimTexts.length).toBeGreaterThan(0);

    const summaries = await screen.findAllByText("The sky can appear in various colors.");
    expect(summaries.length).toBeGreaterThan(0);

    expect(
      screen.getByText("The sky often appears blue during clear days."),
    ).toBeInTheDocument();

    const refutedBadges = screen.getAllByText(/Refuted/i);
    expect(refutedBadges.length).toBeGreaterThan(0);

    expect(screen.getByText(/Hide Claims/i)).toBeInTheDocument();
  });
});
