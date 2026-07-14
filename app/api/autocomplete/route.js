import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req) {
  try {
    const { query } = await req.json();

    if (!query || query.length > 25) {
      return NextResponse.json({ suggestions: [] });
    }

    const groq = createOpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    });

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are an autocomplete engine for an instructional design tool. A user is starting to type the topic of a training course they want to build. 
Based on their partial input, provide exactly 3 highly relevant and professional course topic completions. 
Return ONLY a valid JSON object in this exact format: {"suggestions": ["Topic 1", "Topic 2", "Topic 3"]}. Do not include any other text or markdown formatting.`,
      prompt: `The user has typed: "${query}". Generate 3 autocomplete suggestions.`,
    });

    let suggestions = [];
    try {
      // Clean the text in case the LLM wrapped it in markdown code blocks
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        suggestions = parsed.suggestions;
      }
    } catch (parseError) {
      console.error("Failed to parse JSON from Groq:", text);
    }

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error("Autocomplete API Error:", error);
    return NextResponse.json({ error: error.message, suggestions: [] }, { status: 500 });
  }
}
