import { NextResponse } from 'next/server';

export const runtime = 'edge';

const systemPrompt = `You are an expert Instructional Designer. 
The user is reviewing a specific "Learning Map" module for a training course.
They want to customize this specific module based on new instructions.

You will be given:
1. The original topic and screen details.
2. The user's specific instructions for rewriting it.
3. The overall training context (for alignment).

Rewrite the "topic" and "screen" to perfectly incorporate the user's instructions while keeping the instructional design sound. Keep the topic short (max 5 words) and the screen description concise but detailed (max 3 sentences).

Return ONLY valid JSON matching this structure:
{
  "topic": "Updated Topic",
  "screen": "Updated description of what the learner will see or do on screen."
}`;

export async function POST(req) {
  try {
    const { originalTopic, originalScreen, instruction, context } = await req.json();

    const prompt = `
=== TRAINING CONTEXT ===
${context}

=== ORIGINAL MODULE ===
Topic: ${originalTopic}
Screen: ${originalScreen}

=== USER'S REWRITE INSTRUCTIONS ===
${instruction}

Please rewrite the module to follow the user's instructions.
`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Rewrite Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
