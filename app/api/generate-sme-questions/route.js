import { NextResponse } from 'next/server';
import { safeGroqJsonCall, KB_CONTEXT } from '../../../lib/ai';

export async function POST(request) {
  try {
    const { content, structuredFacts, learner, gap, outcome } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Source content is required' }, { status: 400 });
    }

    const knowledge = KB_CONTEXT;

    const systemPrompt = `You are a senior instructional designer with 25 years experience.
Analyse the source content provided and identify knowledge gaps.
Generate exactly 6 targeted SME interview questions to fill those gaps.

RELEVANT ID METHODOLOGY:
${knowledge}

Rules:
- Questions must be specific to the content, not generic
- Each question must have a context explaining why the gap was detected
- Focus on tacit knowledge not captured in the source material
- Consider the learner profile and business outcome when framing questions

Return ONLY valid JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "The specific SME question",
      "context": "Gap detected: why this question is needed"
    }
  ]
}`;

    let result;
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: structuredFacts
            ? `VERIFIED FACTS EXTRACTED FROM SOURCE (use ONLY these — do not add general knowledge):\nConcepts: ${structuredFacts.concepts?.join(' | ')}\nProcedures: ${structuredFacts.procedures?.join(' | ')}\nRules: ${structuredFacts.rules?.join(' | ')}\nKey Facts: ${structuredFacts.keyFacts?.join(' | ')}\nExamples: ${structuredFacts.examples?.join(' | ')}\n\nCONTENT GAPS (generate your 6 questions specifically to fill these):\n${structuredFacts.contentGaps?.map((g, i) => `${i+1}. ${g}`).join('\n') || 'None detected — ask questions to validate and deepen understanding.'}\n\nLearner: ${learner}\nPerformance gap: ${gap}\nBusiness outcome: ${outcome}`
            : `Source content:\n${(content || '').substring(0, 4000)}\n\nLearner: ${learner}\nPerformance gap: ${gap}\nBusiness outcome: ${outcome}` }
      ];
      result = await safeGroqJsonCall(messages, 7000, 0.5);
    } catch (e) {
      console.error('All retries failed in generate-sme-questions:', e);
      return NextResponse.json({ error: 'AI returned invalid JSON after retries' }, { status: 500 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('generate-sme-questions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
