import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req) {
  try {
    const { question, answer, context } = await req.json();

    const groq = createOpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    });

    const { text } = await generateText({
      model: groq('llama3-8b-8192'),
      system: `You are an expert instructional designer evaluating a Subject Matter Expert's answer to a knowledge gap. Keep your feedback under 15 words. Be encouraging. If the answer is vague, ask for an example. If it's good, say 'Great detail!'.`,
      prompt: `Question: ${question}\nContext: ${context}\nExpert's Answer: ${answer}`,
    });

    // Simple heuristic to determine if feedback is positive
    const isPositive = text.toLowerCase().includes('great') || text.toLowerCase().includes('excellent') || answer.length > 50;

    return NextResponse.json({ feedback: text, isPositive });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
