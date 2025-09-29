# 🔍 Hallucinations Detector (Offline First)

![Screenshot](./public/opengraph-image.jpg)

<br>

## 🎯 What Is This?

An open-source tool that highlights likely hallucinations in your long-form content using an LLM you control. It extracts verifiable claims from your text, rates their factual reliability, and suggests fixes—all without hitting external search APIs.

<br>

## ✨ Key Features

- Local or hosted LLM support (Ollama out of the box, Anthropic optional)
- Claim extraction + fact assessment in a single workflow
- Inline suggestions for repairing incorrect statements
- Built for offline or air-gapped environments

<br>

## 🛠️ How It Works

1. **Claim Extraction** – The configured LLM breaks your article into discrete, verifiable claims.
2. **Offline Verification** – Each claim is assessed using the model’s internal knowledge and the original sentence. When the model is unsure it returns `Insufficient Information`.
3. **Suggested Fixes** – For claims flagged as false, the model proposes a corrected sentence you can apply with one click.
4. **Preview & Export** – Updated copy can be previewed and copied back into your workflow.

> ⚠️ Without a retrieval layer this checker relies on the model’s prior knowledge. Treat the output as advisory and confirm critical facts with trusted sources.

<br>

## 💻 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/docs) App Router, [Tailwind CSS](https://tailwindcss.com), TypeScript
- **LLM Runtime**: [Ollama](https://ollama.com) locally by default, or any Vercel AI SDK provider (Anthropic, OpenAI, etc.)
- **AI Toolkit**: [Vercel AI SDK](https://sdk.vercel.ai/docs/ai-sdk-core) with structured output helpers

<br>

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ (Node 20 LTS recommended)
- [Ollama](https://ollama.com/download) if you plan to run fully offline

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/exa-labs/exa-hallucination-detector.git
   cd exa-hallucination-detector
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create `.env.local`
   ```bash
   LLM_PROVIDER=ollama # or anthropic
   OLLAMA_MODEL=llama3.2
   # OLLAMA_HOST=http://127.0.0.1:11434

   # Only required if you switch to a hosted provider
   # ANTHROPIC_API_KEY=your_anthropic_api_key
   # ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open <http://localhost:3000/hallucination-detector>

<br>

## 🧠 Using Ollama Locally

1. Install and start Ollama: `ollama serve`
2. Pull a model: `ollama pull llama3.2` (or any other instruction-tuned model)
3. Ensure `.env.local` has `LLM_PROVIDER=ollama` and `OLLAMA_MODEL` set to your pulled model
4. Restart `npm run dev`

The API routes will now call your local model for both extraction and verification. Anthropic or another provider can be re-enabled at any time by switching `LLM_PROVIDER`.

<br>

## 🔌 API Endpoints

`POST /hallucination-detector/api/extractclaims`
- **Body**: `{ content: string }`
- **Response**: `{ claims: Array<{ claim: string; original_text: string }> }`
- **Notes**: Expects valid JSON from the LLM. On failure returns `{ error: string }` with status `400` or `500`.

`POST /hallucination-detector/api/verifyclaims`
- **Body**: `{ claim: string; original_text: string }`
- **Response**: `{ claims: { claim: string; assessment: "True" | "False" | "Insufficient Information"; summary: string; fixed_original_text: string; confidence_score: number } }`
- **Notes**: Designed for offline reasoning—models should answer `"Insufficient Information"` when uncertain. Errors surface as `{ error: string }` with status `400` or `500`.

Example client call:

```ts
const response = await fetch('/hallucination-detector/api/verifyclaims', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ claim, original_text }),
});

if (!response.ok) throw new Error(await response.text());
const data = await response.json();
```

<br>

## 🔒 Recommended Models for Offline Fact Checking

- `llama3.2:11b-text` – Balanced accuracy vs. speed on Apple Silicon
- `mixtral:8x7b-instruct` – Higher precision if you have ≥32 GB RAM
- `qwen2.5:14b-instruct` – Strong multilingual reasoning

<br>

## 📋 Notes & Limitations

- No web search: results are based on the model’s prior training, so double-check high-stakes facts
- JSON responses are validated with Zod; if your model emits malformed JSON, tighten prompts or choose a more instruction-following model
- The UI still surfaces “Insufficient Information” claims so you can investigate manually

<br>

Made with ❤️ for local-first AI workflows.
