import { NextResponse } from 'next/server';
import { getGroq } from '../../../lib/ai.js';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: 'Text too short' }, { status: 400 });
    }

    const systemPrompt = `You are an AI instructional designer. Your task is to quickly scan a piece of source material and auto-detect the optimal training context.
Extract three fields:
1. "learner": Who is the intended audience for this training? (e.g. "Sales Reps", "New Managers", "All Employees"). Max 3-5 words.
2. "gap": What is the skill or knowledge gap? (e.g. "Struggling to close deals", "Unaware of new safety protocols"). Max 5-8 words.
3. "outcome": What is the desired business outcome? (e.g. "Increase close rate by 20%", "Zero compliance violations"). Max 5-8 words.

If a field is not obvious, make a highly educated, professional guess based on the content.
Return ONLY valid JSON.
{
  "learner": "...",
  "gap": "...",
  "outcome": "..."
}`;

    // Only send the first 4000 characters to save time and tokens
    const userMessage = text.substring(0, 4000);

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
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
    console.error('Context Detection API Error:', error);
    return NextResponse.json({ error: 'Failed to detect context.' }, { status: 500 });
  }
}
