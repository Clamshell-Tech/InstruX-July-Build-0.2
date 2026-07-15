import { NextResponse } from 'next/server';
import { safeGroqJsonCall, KB_CONTEXT } from '../../../lib/ai';

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, subtitle, objectives, modules, learner, gap, outcome, bloomLevel, modality, strategy, structuredFacts, brandKitId } = body;

    if (!modules || !Array.isArray(modules) || modules.length === 0) {
      return NextResponse.json({ error: 'modules array is required' }, { status: 400 });
    }

    const knowledge = KB_CONTEXT;

    const systemPrompt = `You are InstruX, a Senior Instructional Designer specializing in premium Mobile Microlearning (inspired by 7taps, Zerodha Varsity, and Axonify).
Your goal is to build highly engaging, bite-sized, and action-oriented microlearning courses.

DESIGN PRINCIPLES (STRICT):
1. The 7taps Rule (Extreme Brevity): NO walls of text. Body text on 'content' cards MUST NEVER exceed 250 characters. Write 1-2 punchy sentences. 
2. The Zerodha Analogy Engine: You MUST use real-world analogies to explain complex technical concepts. Write conversationally, as if texting a smart friend.
3. The Axonify 'One-Rule': Exactly ONE concept per card. If a topic has two concepts, split it into two separate cards.
4. Duolingo Engagement: Use emojis strategically. Break up text. Use active voice.
5. Visuals: EVERY content, quote, and module-title card MUST include a 'visualPrompt' AND 'imageDecision' field.

IMAGE DECISION RULES:
- "canva-ai"   → the concept is physical/visual (process, object, place, diagram)
- "css-pattern" → the concept is abstract/conceptual (frameworks, definitions, mindsets)
- "none"        → quiz, flipcards, checklist, objectives, module-title (never need images)

VISUAL STYLE RULES (for canva-ai):
- "cinematic"   → People, leadership, scenarios
- "illustrated" → Concepts, frameworks, metaphors
- "comic"       → Safety, compliance, dos-and-don'ts
- "3d-render"   → Technology, software, systems
- "realistic"   → Physical procedures, equipment

ANTI-HALLUCINATION RULES:
- NO DUMMY CONTENT.
- Every fact, number, name, or procedure MUST come from the verified knowledge below if provided.
- Do NOT use cliché AI words like "delve", "unlock", or "master".

RELEVANT ID METHODOLOGY FROM YOUR KNOWLEDGE BASE:
\${knowledge}

Design a complete 7taps-style card deck as a JSON ARRAY.
Use ONLY these card types: cover, objectives, module-title, content, video, quote, checklist, flipcards, quiz, summary.

STRICT OUTPUT RULES:
- Return ONLY a valid JSON array. No markdown, no backticks, no wrapper object.

CARD SCHEMAS:

cover:
{ 
  "type": "cover", 
  "designHint": "geometric-bg" | "image-full",
  "courseTitle": "string (Short & Punchy)", 
  "subtitle": "ACTION outcome (Max 5 words)", 
  "totalModules": 1, 
  "estimatedTime": "X min" 
}

objectives:
{ "type": "objectives", "heading": "What you will learn", "items": ["Short outcome 1", "Short outcome 2"] }

module-title:
{ "type": "module-title", "moduleNum": 1, "title": "string", "story": "Short 1-sentence hook" }

content:
{
  "type": "content",
  "designHint": "image-top" | "text-focus" | "split-view",
  "visualPrompt": "REQUIRED. Vivid vertical (9:16) scene description",
  "imageDecision": "canva-ai" | "css-pattern" | "none",
  "visualStyle": "cinematic" | "illustrated" | "comic" | "3d-render" | "realistic",
  "heading": "string (Max 5 words)",
  "subtitle": "string or null",
  "body": "STRICT MAX 250 CHARACTERS. 1-2 punchy sentences. Use conversational analogies. NEVER write long paragraphs.",
  "proTip": "Short tip or analogy (null if not needed)"
}

video:
{
  "type": "video",
  "heading": "Watch and Learn",
  "videoPrompt": "Description of the video content needed",
  "keyTakeaway": "1 sentence takeaway"
}

quote:
{
  "type": "quote",
  "designHint": "simple" | "image-bg",
  "visualPrompt": "Vivid vertical background scene description",
  "imageDecision": "canva-ai" | "css-pattern",
  "visualStyle": "cinematic" | "illustrated" | "comic" | "3d-render" | "realistic",
  "text": "High-impact short statement",
  "attribution": "Expert Name"
}

checklist:
{ "type": "checklist", "heading": "Action Steps", "items": ["Short Step 1", "Short Step 2", "Short Step 3"] }

flipcards:
{ "type": "flipcards", "heading": "Quick Review", "cards": [{ "front": "Short Concept", "back": "STRICT MAX 150 CHARACTERS. Bite-sized explanation or analogy." }] }

quiz:
{ 
  "type": "quiz", 
  "challengeNum": 1, 
  "scenario": "Short 1-2 sentence scenario.",
  "question": "Clear, direct question?", 
  "instruction": "Tap the correct answer", 
  "options": ["A", "B", "C"], 
  "correctIndices": [0], 
  "feedback": { "correct": "1-2 crisp sentences explaining why.", "incorrect": "1-2 crisp sentences correcting the error." }
}

summary:
{ "type": "summary", "heading": "Done!", "subheading": "Next step", "takeaways": ["Short Takeaway 1", "Short Takeaway 2"], "cta": "Export" }`;

    const modulesText = JSON.stringify(modules, null, 2);
    const groundingBlock = structuredFacts
      ? `\nVERIFIED KNOWLEDGE FROM SOURCE (ALL slide content must be traceable to these facts):\nConcepts: ${structuredFacts.concepts?.join(' | ')}\nProcedures: ${structuredFacts.procedures?.join(' | ')}\nRules: ${structuredFacts.rules?.join(' | ')}\nKey Facts: ${structuredFacts.keyFacts?.join(' | ')}\nExamples: ${structuredFacts.examples?.join(' | ')}\n`
      : '';
    const userMessage = `Build a complete microlearning course from this learning map.${groundingBlock}

Course Title: ${title}
Subtitle: ${subtitle || ''}
Learner Population: ${learner}
Performance Gap: ${gap}
Business Outcome: ${outcome}
Bloom's Level: ${bloomLevel}
Delivery Modality: ${modality}
Learning Strategy: ${strategy}

Learning Map (${modules.length} modules):
${modulesText}

Generate all slides following the structure: cover → objectives → [module-title → content slides → flipcards → quiz] × ${modules.length} → summary.
Return ONLY the JSON array.`;

    let slides;
    try {
      const messages = [
        { role: 'system', content: systemPrompt + '\n\nIMPORTANT: You must return a valid JSON object with a single property named "slides" that contains the array of card objects.' },
        { role: 'user', content: userMessage }
      ];
      const parsedData = await safeGroqJsonCall(messages, 7000, 0.7);
      slides = parsedData.slides || parsedData; 
      
      if (!Array.isArray(slides)) {
        throw new Error('Parsed JSON does not contain an array of slides');
      }
    } catch (e) {
      console.error('All retries failed in build-microlearning:', e.message);
      return NextResponse.json({ error: 'AI returned invalid JSON after retries', details: e.message }, { status: 500 });
    }

    // --- Image Generation (Canva AI — brand-consistent, high quality) ---
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    await Promise.allSettled(
      slides.map(async (slide, idx) => {
        if (slide.imageDecision !== 'canva-ai' || !slide.visualPrompt) return;
        try {
          const res = await fetch(`${baseUrl}/api/generate-slide-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              visualPrompt: slide.visualPrompt,
              visualStyle: slide.visualStyle || 'cinematic',
              slideTitle: slide.heading || '',
              brandKitId: brandKitId || undefined
            })
          });
          const data = await res.json();
          if (data.imageUrl) slide.imageUrl = data.imageUrl;
        } catch (err) {
          console.warn(`Canva image skipped slide ${idx}:`, err.message);
        }
      })
    );
    // --- END: Image Generation ---

    return NextResponse.json(slides);

  } catch (error) {
    console.error('build-microlearning error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
