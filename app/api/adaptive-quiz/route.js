import { NextResponse } from 'next/server';

export const runtime = 'edge';

const systemPrompt = `You are an expert Instructional Designer building an adaptive microlearning quiz.
The user just answered a quiz question.
If they got it RIGHT, your task is to generate a slightly HARDER follow-up question to test deeper mastery (Bloom's Taxonomy level up).
If they got it WRONG, your task is to generate a slightly EASIER follow-up question that provides a helpful HINT or scaffolds the concept better.

Return ONLY valid JSON matching this exact structure:
{
  "type": "quiz",
  "challengeNum": 2,
  "question": "The new adaptive question text...",
  "scenario": "Optional scenario text or hint context...",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndices": [1],
  "feedback": {
    "correct": "Why it's right...",
    "incorrect": "Why it's wrong..."
  }
}`;

export async function POST(req) {
  try {
    const { originalQuestion, isCorrect, courseContext } = await req.json();

    const prompt = `
=== COURSE CONTEXT ===
${courseContext}

=== PREVIOUS QUESTION ===
${originalQuestion}

=== USER PERFORMANCE ===
The user got the previous question: ${isCorrect ? 'CORRECT! Generate a harder question.' : 'WRONG! Generate an easier question with a hint/scaffolding.'}

Please generate the next adaptive quiz question.
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
    console.error("Adaptive Quiz Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
