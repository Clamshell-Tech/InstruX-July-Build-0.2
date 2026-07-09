import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

// Create fresh instances using a getter so env vars are always current
export function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

// Static instances removed to fix Vercel/serverless env var loading issues
// Use the getOpenAI(), getGroq(), and getSupabase() getters instead.

// Takes any text and converts it to a vector (1536 numbers)
export async function embedText(text) {
  const response = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

// Searches your knowledge base for the most relevant chunks
export async function retrieveKnowledge(query, matchCount = 5) {
  const queryEmbedding = await embedText(query);

  const { data, error } = await getSupabase().rpc('match_knowledge', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
  });

  if (error) {
    console.error('Knowledge retrieval error:', error);
    return [];
  }

  // Return just the text chunks joined together
  return data.map(row => row.content).join('\n\n');
}

// ─── Inline Knowledge Base ────────────────────────────────────────────────────
// Full KB baked in — used instead of RAG to avoid OpenAI embedding costs.
export const KB_CONTEXT = `
CRAFT FRAMEWORK (5-phase agile ID process):
Phase 1 — CONSULT: Kick-off meeting + Content outline (Learning Map/Script). Input required: Training Gain, Impact, and Success Factors Document.
Phase 2 — REFINE: Visual mockups, prototype, storyboard and design pack reviews.
Phase 3 — AGGREGATE: Alpha development and reviews (first working build).
Phase 4 — FORM: Beta review with professional audio + Final review and sign-off.
Phase 5 — TEST: Feedback from users, SMEs, and business stakeholders + Analytics.

CRAFT RULES:
RULE 1 — Always start with the "why": Training Gain (behaviour change), Impact (business cost of inaction), Success Factors (how to measure). Never design a topic-driven course — always anchor to a performance gap.
RULE 2 — Content outline before visuals: Learning Map must be defined before any visual design.
RULE 3 — Iterative review mindset: Alpha → Beta → Final.
RULE 4 — SME and user feedback closes the loop: measure behaviour change and business metric improvement.
RULE 5 — Consultative, not prescriptive: ask clarifying questions rather than assume.

INTERACTION LEVELS:
L1 = Basic click-and-learn only. No scenarios, no complex interactions. For reference/compliance only.
L2 = Must include min 1-3 interactions from EACH of: Click and Learn, Scenario+Question, Conversational, unique interactions.
L3 = Same as L2 but higher complexity. RULE: Any course targeting behaviour change must be L2 or L3.
RULE 6 — Every course needs: a scenario with a question, a conversation, a drag-and-drop check, a video interaction.

TEMPLATE TYPES:
Content: text-image, landing, overview, objectives, infographic.
Knowledge Checks: single-answer MCQ, multiple-answer MCQ, True/False, Yes/No.
Scenarios: scenario+narrative, scenario+question, scenario+text-input, video+analysis.
Conversations: character intro, dialogue flow, conversation+question.
Click and Learn: buttons, tabs, accordion, images, carousel, hotspot, flip cards, slider, scrollable.
Drag and Drop: one-to-one, many-to-one, many-to-two, many-to-three.
Video: animated intro, branching video, show+try+test simulation.
RULE 7 — Show objectives early: learners must see what they will DO before content begins.
RULE 8 — Match interaction type to content: Procedural → Show+Try+Test; Scenario/decision → scenario+question; Concept → tabs/accordion; Verification → drag-and-drop.

KIRKPATRICK MODEL:
L1 Reaction: Did learners find it satisfying/engaging/relevant? Measured by post-course survey.
L2 Learning: Did learners gain knowledge/skills? Measured by knowledge check scores.
L3 Behaviour: Are learners applying learning on the job? Measured by manager observation.
L4 Performance: Did training impact org goals? Measured by revenue/satisfaction/efficiency metrics.
RULE 13 — L1=awareness only; L2=knowledge retention (must include assessments); L3=behaviour change (must include scenarios+practice); L4=business impact (must tie to measurable org metric).

BLOOM'S TAXONOMY:
L1 REMEMBER: define, list, name, recall, recognise → awareness, compliance, product knowledge.
L2 UNDERSTAND: explain, describe, summarise, classify → concept training, policy, induction.
L3 APPLY: apply, use, demonstrate, execute, solve → skill-based, process, tool usage.
L4 ANALYSE: analyse, differentiate, examine, compare → critical thinking, problem solving.
L5 EVALUATE: evaluate, judge, justify, recommend → leadership, decision-making, QA.
L6 CREATE: design, build, construct, develop → advanced skill, strategy, creative roles.
RULE 21 — Every objective must use a measurable action verb. BAD: "Understand customer service." GOOD: "Apply the 3-step de-escalation process when handling an angry customer."
RULE 22 — Match verb level to course purpose.
RULE 23 — 2–4 objectives maximum per course. More than 4 = split into 2 courses.

MCQ RULES:
RULE 24 — Test application, not memorisation.
RULE 25 — Write plausible distractors representing common misconceptions.
RULE 26 — Never use "All of the above"/"None of the above"; never make correct answer always longest; no double negatives; no trick questions.
RULE 27 — One clearly correct answer only.
RULE 28 — Feedback must explain WHY: BAD: "Correct!" GOOD: "Correct. Acknowledging frustration before solving makes customers feel heard."

SCENARIO WRITING RULES:
RULE 29 — Ground in a real, specific workplace moment. BAD: "Imagine you are a manager." GOOD: "It's 9am Monday. Jake walks in tense. He says 'I've had an offer from another company.' You have a team meeting in 20 minutes."
RULE 30 — Every scenario: setup + trigger + decision point (2–3 choices) + consequences.
RULE 31 — Wrong choices must fail for the right reason. BAD: "That was incorrect." GOOD: "You jump to problem-solving. Three weeks later, he accepted the offer."
RULE 32 — Use realistic diverse names, roles, and workplace contexts. Stakes must matter.
RULE 33 — 2 choices is better than 4: forces a clear contrast between instinctive reaction vs trained response.

AUDIENCE ANALYSIS (RULE 34 — 5 Questions):
1. ROLE: Job title and day-to-day responsibility.
2. EXPERIENCE: How long in role? What do they already know?
3. MOTIVATION: Want to learn, or forced? (Compliance = reluctant → hook must create urgency; Skill = motivated → challenge them.)
4. BARRIER: Knowledge gap? Skill gap? Attitude gap? Confidence gap? Process gap?
5. WIIFM: What's In It For Me? Answer in first 30 seconds.
RULE 35 — Design for the barrier, not the topic.
RULE 36 — Reluctant learners need a different hook: Motivated = challenge them; Reluctant = make it relevant fast; Compliance = make the consequence real.

7-BLOCK COURSE STRUCTURE:
Block 1 (cover): Title + subtitle + 2–3 measurable outcomes + duration.
Block 2 (stat): A surprising research stat that creates urgency or reframes thinking.
Block 3 (pillars): The 3 core concepts/framework/principles (never more than 3).
Block 4 (hotspot): 4 clickable real-world items — practice identifying/applying.
Block 5 (scenario): Realistic workplace moment + decision point + consequences.
Block 6 (quiz): 3 application questions — test what they would DO, not what they recall.
Block 7 (summary): 5 specific action commitments + motivational close.
RULE: Every course MUST include min 1 scenario block + 1 quiz block.

WORKED EXAMPLE — Soft Skills (Manager Feedback):
Brief: "Help new managers have better 1-on-1 conversations."
Audience: First-time managers 0–12 months, reluctant to have tough conversations. L3 behaviour change.
Cover: "The Conversation Most Managers Avoid." Stat: "68% of employees say their manager never gives useful feedback." Pillars: Check-in / Development / Performance. Hotspot: Agenda, Setting, Opening, Listening, Close. Scenario: Maya missed 2nd deadline. A) Bring it up directly B) Wait and see. Quiz: 3 application questions. Summary: "Before your next 1-on-1, do these 5 things."
Objectives: Apply SBI model; Demonstrate active listening; Evaluate whether an issue requires immediate discussion.

WORKED EXAMPLE — Compliance (GDPR):
Brief: "All staff must understand GDPR and daily work impact." Audience: All employees, mixed roles, reluctant (mandatory). L2 knowledge.
Stat: "1 in 3 data breaches caused by employee error." Pillars: Lawful basis / Data minimisation / Subject rights. Hotspot: Email, Spreadsheets, Customer calls, Printing. Scenario: Customer data request received, manager away. A) Forward to IT B) Reply directly with data. Objectives: Identify GDPR data types; Apply correct SAR process; Recognise 3 common data handling mistakes.

WORKED EXAMPLE — Leadership (Decision Making):
Brief: "Senior leaders need to make faster, better decisions when data is incomplete." Audience: Directors/VPs, experienced, time-scarce, sceptical. L3 behaviour change.
Stat: "64% of senior leaders cite decision paralysis as #1 productivity drain." Pillars: OODA Loop / Pre-mortem / Two-way door test. Hotspot: Analysis paralysis, Consensus addiction, Recency bias, Sunk cost. Scenario: 3 hours to decide whether to delay product launch. A) Call another meeting B) Make the call with data you have.

VISUAL DESIGN:
Minimal/Flat design (recommended): clean, simple, authentic — best for behaviour change, soft skills, leadership.
Material Design: card shapes, bold typography, bright colours — best for content-heavy, data-driven, tech audiences.
5 dimensions: Brand colours, Typography, Imagery, Icons/shapes, Infographics.
RULE 10 — Behaviour change/soft skills → Minimal/Flat. Technical/data-driven → Material. Leadership/executive → Clean typographic minimal.
RULE 11 — Consistent visual language across all 5 dimensions.
RULE 12 — Use infographic blocks (stat, pillars) only for statistics, comparisons, frameworks. NOT for narrative or procedural content.

MOBILE MICROLEARNING STANDARDS (SOURCE 11):
Total Duration: Strictly 3–10 minutes. NEVER exceed 10 minutes.
Structure: Single cohesive sequence of 10–15 Mobile Cards.
Video Selection (RULE 37): Use "Concept Video" ONLY if content requires physical or software demonstration. Otherwise use "Concept Card" with high-impact visual.
Cognitive Load: Focus on ONE primary learning objective. Remove all "nice-to-know" fluff.
Pacing: 15–45 seconds per card.

PROJECT RISK RULES:
RULE 14 — Content must be locked before design begins. Content changes after design = rework + delays.
RULE 15 — Collect 3 inputs minimum before generating: Who is the audience? What is the business need? What does success look like (Kirkpatrick level)?
Risk 1: New content after design = rework. Risk 2: SME unavailability = timeline slippage. Risk 3: Content changes after Alpha/Beta = expensive rework.
`.trim();
