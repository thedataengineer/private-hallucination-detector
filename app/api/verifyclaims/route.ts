// app/api/verifyclaims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runLLMStructured } from '@/lib/llm';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { claim, original_text } = await req.json();

    if (!claim || !original_text) {
      return NextResponse.json({ error: 'Claim and original text are required' }, { status: 400 });
    }

    const factCheckSchema = z.object({
      claim: z.string(),
      assessment: z.enum(["True", "False", "Insufficient Information"]),
      summary: z.string(),
      fixed_original_text: z.string(),
      confidence_score: z.number().min(0).max(100)
    });

    const prompt = `You are an offline fact-checker working without live internet access.

      Task: Assess the factual accuracy of the claim using only your internal knowledge and the provided excerpt. If you are unsure or lack high-confidence knowledge, respond with \"Insufficient Information\".

      Original text excerpt: ${original_text}

      Here is the claim: ${claim}

      Provide your answer as a JSON object with the following structure:

      claim: "...",
      assessment: "True" or "False" or "Insufficient Information",
      summary: "Why is this claim correct and if it isn't correct, then what's correct. In a single line.",
      fixed_original_text: "If the assessment is False then correct the original text (keeping everything as it is and just fix the fact in the part of the text)",
      confidence_score: a percentage number between 0 and 100 (100 means fully confident that the decision you have made is correct, 0 means you are completely unsure),

      Use the following guidance when you are uncertain:
      - If you cannot recall the necessary information, respond with \"Insufficient Information\" and set confidence below 40.
      - If the claim is directionally correct but you are not completely certain, err on the side of \"Insufficient Information\".
      
      `;

    const object = await runLLMStructured(prompt, factCheckSchema);

    console.log('LLM response:', object);
    
    return NextResponse.json({ claims: object });
  } catch (error) {
    console.error('Verify claims API error:', error);
    return NextResponse.json({ error: `Failed to verify claims | ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
  }
}
