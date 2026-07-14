import { NextResponse } from 'next/server';
import { getGroq, KB_CONTEXT } from '../../../lib/ai';

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, subtitle, objectives, modules, learner, gap, outcome, bloomLevel, modality, strategy, structuredFacts, brandKitId } = body;

    if (!modules || !Array.isArray(modules) || modules.length === 0) {
      return NextResponse.json({ error: 'modules array is required' }, { status: 400 });
    }

    const knowledge = KB_CONTEXT;

    const systemPrompt = `You are InstruX, a Senior Instructional Designer and Technical Architect specializing in premium Mobile Microlearning.
Your goal is to build a highly detailed, data-dense, and expert-level microlearning course.

DESIGN PRINCIPLES:
- Deep Technical Depth: Body text MUST provide a highly detailed, multi-paragraph technical breakdown. Do NOT limit your character count. Focus on extreme depth, architectural explanations, and the 'how and why'.
- Clarity: Focus deeply on one specific technical concept per card. Use multiple detailed paragraphs to thoroughly explain it.
- Visual Variety: Use the 'designHint' to create a mix of layouts. DO NOT use the same hint twice in a row.
- Visuals: EVERY content, quote, and module-title card MUST include a 'visualPrompt' AND 'imageDecision' field.

IMAGE DECISION RULES (set 'imageDecision' on every content and quote card):
- "canva-ai"   → the concept is physical/visual: a process, object, place, person, diagram, screenshot, data chart, procedure, tool
- "css-pattern" → the concept is abstract/conceptual: frameworks, principles, definitions, mindsets, attitudes, values
- "none"        → quiz, flipcards, checklist, objectives, module-title (never need images)

VISUAL STYLE RULES (set 'visualStyle' on every canva-ai card — pick the one that best fits the content):
- "cinematic"   → People, leadership, workplace scenarios, emotions, storytelling, culture — dramatic film-quality photography
- "illustrated" → Concepts, frameworks, data, abstract ideas that need visual metaphor — premium editorial digital illustration
- "comic"       → Safety, compliance, gamified or fun content, dos-and-don'ts — bold comic book art style
- "3d-render"   → Technology, software, products, systems, architecture — clean photorealistic 3D CGI
- "realistic"   → Physical procedures, equipment, medical, scientific, step-by-step — high-res professional photography

ANTI-HALLUCINATION & ANTI-GENERIC RULES (CRITICAL):
- DEEP DIVES ONLY: If explaining 'Agentic AI Systems', DO NOT just say 'They act autonomously'. You MUST explain the architecture of LLM transformers, memory management, and tool-use loops. If explaining 'Databricks', explain the underlying Apache Spark architecture and Lakehouse paradigm, do NOT say 'Used by data engineers for efficient processing'.
- NO DICTIONARY DEFINITIONS or high-level generic summaries.
- ALWAYS provide highly technical, data-dense, and deep architectural/expert explanations.
- Every fact, number, name, threshold, or procedure in a slide MUST come from the verified knowledge below if provided.

RELEVANT ID METHODOLOGY FROM YOUR KNOWLEDGE BASE:
${knowledge}

Design a complete 7taps-style card deck as a JSON ARRAY.
Use ONLY these card types: cover, objectives, module-title, content, video, quote, checklist, flipcards, quiz, summary.

STRICT OUTPUT RULES:
- Return ONLY a valid JSON array. No markdown, no backticks, no wrapper object.
- NO DUMMY CONTENT: Use ONLY specific examples, facts, and terminology from the source material.

CARD SCHEMAS:

cover:
{ 
  "type": "cover", 
  "designHint": "geometric-bg" | "image-full",
  "courseTitle": "string", 
  "subtitle": "ACTION outcome", 
  "totalModules": 1, 
  "estimatedTime": "X min" 
}

objectives:
{ "type": "objectives", "heading": "What you will master", "items": ["Deep technical outcome 1", "Deep technical outcome 2"] }

module-title:
{ "type": "module-title", "moduleNum": 1, "title": "string", "story": "Short 1-sentence narrative bridge" }

content:
{
  "type": "content",
  "designHint": "image-top" | "text-focus" | "split-view",
  "visualPrompt": "REQUIRED. Vivid vertical (9:16) scene description",
  "imageDecision": "canva-ai" | "css-pattern" | "none",
  "visualStyle": "cinematic" | "illustrated" | "comic" | "3d-render" | "realistic",
  "heading": "string",
  "subtitle": "string or null",
  "body": "A highly detailed, 3-4 paragraph technical breakdown. DO NOT limit character count, focus on extreme depth and architectural explanations. NEVER use generic dictionary definitions or high-level summaries.",
  "proTip": "Advanced expert callout or specific technical nuance (null if not needed)"
}

video:
{
  "type": "video",
  "heading": "Watch and Learn",
  "videoPrompt": "Description of the video content needed",
  "keyTakeaway": "Deep technical summary of the video"
}

quote:
{
  "type": "quote",
  "designHint": "simple" | "image-bg",
  "visualPrompt": "Vivid vertical background scene description",
  "imageDecision": "canva-ai" | "css-pattern",
  "visualStyle": "cinematic" | "illustrated" | "comic" | "3d-render" | "realistic",
  "text": "High-impact technical statement",
  "attribution": "Expert Architect"
}

checklist:
{ "type": "checklist", "heading": "Implementation Steps", "items": ["Advanced Action 1", "Advanced Action 2", "Advanced Action 3"] }

flipcards:
{ "type": "flipcards", "heading": "Deep Dive", "cards": [{ "front": "Advanced Concept", "back": "Highly specific, data-dense technical explanation of the 'how' and 'why' (no char limit, write multiple paragraphs if needed). NEVER use generic overviews or dictionary definitions." }] }

quiz:
{ 
  "type": "quiz", 
  "challengeNum": 1, 
  "scenario": "Highly complex, real-world technical architecture scenario requiring deep synthesis to solve (3-4 sentences)",
  "question": "Advanced application or critical thinking question", 
  "instruction": "Tap the correct answer", 
  "options": ["A", "B", "C"], 
  "correctIndices": [0], 
  "feedback": { "correct": "In-depth technical explanation of the underlying mechanism or architecture proving why this is correct (3-4 sentences)", "incorrect": "In-depth technical correction explaining the specific architectural flaw or missing knowledge (3-4 sentences)" }
}

summary:
{ "type": "summary", "heading": "Done!", "subheading": "Action next step", "takeaways": ["Technical Takeaway 1", "Technical Takeaway 2"], "cta": "Export" }`;

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

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 7000,
      response_format: { type: "json_object" },
      messages: [
        { role: 'system', content: systemPrompt + '\n\nIMPORTANT: You must return a valid JSON object with a single property named "slides" that contains the array of card objects.' },
        { role: 'user', content: userMessage }
      ]
    });

    const raw = completion.choices[0].message.content.trim();

    let slides;
    try {
      const parsedData = JSON.parse(raw);
      slides = parsedData.slides || parsedData; 
      
      if (!Array.isArray(slides)) {
        throw new Error('Parsed JSON does not contain an array of slides');
      }
    } catch (e) {
      console.error('JSON parse error:', e.message, '\nRaw:', raw.substring(0, 500));
      return NextResponse.json({ error: 'AI returned invalid JSON', details: e.message }, { status: 500 });
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
