import { NextResponse } from 'next/server';
import { getGroq } from '../../../lib/ai.js';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const { prompt, learner, outcome } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ status: 'gibberish', feedback: 'Please enter a topic.' });
    }

    const systemPrompt = `You are an AI curriculum assistant. Your job is to analyze a user's course topic idea and classify it.
You must return a raw JSON object. Do not wrap it in markdown.

Input constraints:
- If the input is just random letters, keyboard smashes (e.g., "asdf", "gfhj"), or completely nonsensical, classify as "gibberish".
- If the input is extremely short (1-3 words) and lacks detail, or has typos, classify as "vague".
- If the input is already a well-written, clear sentence or paragraph (e.g., "I want to teach my sales team how to negotiate better contracts"), classify as "valid".

If the input is "vague" or "valid", you must write a beautifully expanded, 2-3 sentence professional training brief.

Return exactly this JSON format:
{
  "status": "valid" | "vague" | "gibberish",
  "feedback": "If gibberish, a polite error message. Otherwise empty string.",
  "suggestion": "If vague or valid, a fully fleshed-out, professional 2-3 sentence training brief expanding on their idea. If gibberish, empty string.",
  "corrected_topic": "If they had a typo or used just one word, write the correctly spelled core topic (e.g., 'Fire Safety')."
}`;

    const userMessage = `User's Topic Idea: "${prompt}"
${learner ? `Target Audience: "${learner}"` : ''}
${outcome ? `Business Outcome: "${outcome}"` : ''}

Classify and expand this. Return JSON only.`;

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
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
      data = { status: 'valid', suggestion: prompt }; // fallback
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Validation API Error:', error);
    // On error, we just let them pass as valid to avoid blocking the user
    return NextResponse.json({ status: 'valid', suggestion: '' });
  }
}
