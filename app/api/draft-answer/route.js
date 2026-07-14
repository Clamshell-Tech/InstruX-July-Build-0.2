import { NextResponse } from 'next/server';
import { getGroq } from '../../../lib/ai.js';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const { question, context, facts } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const systemPrompt = `You are a helpful AI assisting a Subject Matter Expert (SME). 
The SME was asked a question to fill a knowledge gap in a training course.
Your job is to write a highly educated, confident, and professional "Draft Answer" for this question, based on the provided extracted facts from their source material and the context of the gap.
Keep the answer concise (2-4 sentences). The SME will review and edit your draft.

Return ONLY valid JSON in this format:
{
  "draft": "Your suggested answer here..."
}`;

    const userMessage = `
Question: ${question}
Context/Gap: ${context || 'None'}
Available Facts: ${JSON.stringify(facts || {})}
`;

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    });

    const aiRes = completion.choices[0]?.message?.content || '{}';
    let data;
    try {
      data = JSON.parse(aiRes);
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse JSON' }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Draft Answer API Error:', error);
    return NextResponse.json({ error: 'Failed to draft answer.' }, { status: 500 });
  }
}
