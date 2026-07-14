'use client';

import React, { useState } from 'react';

const STRATEGIES = [
  { id: 'Microlearning', emoji: '⚡', label: 'Micro-learning', desc: 'Short, focused 3–5 min bursts optimised for mobile and spaced over time.', lessonLen: '3–5 minutes', bestFor: 'Onboarding, compliance, skill refresh', format: 'Video + Knowledge Check' },
  { id: 'Scenario-Based', emoji: '🎭', label: 'Scenario-Based', desc: 'Real-world decision trees where learners face authentic workplace situations.', lessonLen: '8–15 minutes', bestFor: 'Soft skills, leadership, sales', format: 'Interactive Scenario + Branching' },
  { id: 'Gamified', emoji: '🎮', label: 'Gamified', desc: 'Points, badges, leaderboards, and challenges drive engagement and retention.', lessonLen: '5–10 minutes', bestFor: 'Sales teams, high-competition roles', format: 'Challenges + Leaderboard' },
  { id: 'Case Study', emoji: '📋', label: 'Case Study', desc: 'Deep dives into real or hypothetical cases that develop analytical thinking.', lessonLen: '15–25 minutes', bestFor: 'Professional development, MBA-style', format: 'Long-form Case + Discussion' },
  { id: 'Socratic', emoji: '💬', label: 'Socratic', desc: 'Question-led discovery where learners arrive at insights through guided inquiry.', lessonLen: '10–20 minutes', bestFor: 'Critical thinking, complex topics', format: 'Guided Questions + Reflection' },
  { id: 'Spaced Repetition', emoji: '🔁', label: 'Spaced Repetition', desc: 'Content revisited at increasing intervals to maximise long-term retention.', lessonLen: '2–4 minutes', bestFor: 'Compliance, safety, technical recall', format: 'Flashcards + Spaced Review' },
  { id: 'Storytelling', emoji: '📖', label: 'Storytelling', desc: 'Narrative-driven learning through a character who faces and solves challenges.', lessonLen: '8–12 minutes', bestFor: 'Culture, values, onboarding', format: 'Story Video + Character Journey' },
];

export default function StrategySelector({ onSelectStrategy, onBack }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (strat) => {
    setSelected(strat);
  };

  const handleClear = () => setSelected(null);

  const handleConfirm = () => {
    if (selected) onSelectStrategy(selected.id);
  };

  return (
    <section
      className="relative overflow-y-auto h-full w-full"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 pt-8 pb-16">

        {/* Header */}
        <div className="mb-10">
          <div
            className="inline-flex items-center px-4 py-2 rounded-full mb-5"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-main)]">Strategy Selection</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-3 tracking-tighter text-slate-900">
            Choose your<br /><span style={{ color: 'var(--color-primary)' }}>learning strategy.</span>
          </h2>
          <p className="text-base font-medium text-slate-800">
            InstruX will use this to shape the structure, format, and pacing of your course.
          </p>
        </div>

        {/* Strategy grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {STRATEGIES.map((strat) => {
            const isActive = selected?.id === strat.id;
            return (
              <button
                key={strat.id}
                onClick={() => handleSelect(strat)}
                className="flex flex-col items-center p-5 rounded-[20px] transition-all hover:brightness-110 hover:-translate-y-0.5"
                style={{
                  background: isActive ? 'var(--color-accent)' : 'var(--color-surface)',
                  border: isActive ? '2px solid rgba(0,0,0,0.15)' : '1px solid var(--color-border)',
                  boxShadow: isActive ? '0 8px 24px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                <span className="text-2xl mb-2">{strat.emoji}</span>
                <span
                  className="text-[9px] font-black uppercase tracking-wider text-center"
                  style={{ color: isActive ? 'var(--color-on-accent)' : 'var(--color-text-main)' }}
                >
                  {strat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Confirmation panel */}
        {selected && (
          <div
            className="rounded-[32px] p-8 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300 text-left"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest mb-2 text-[var(--color-text-main)]">You Selected</div>
                <h3 className="text-3xl font-black text-[var(--color-text-main)] tracking-tight mb-1">{selected.label}</h3>
                <p className="text-sm text-[var(--color-text-main)] leading-relaxed">{selected.desc}</p>
              </div>
              <button
                onClick={handleClear}
                className="text-[10px] font-black px-3 py-1.5 rounded-lg text-[var(--color-on-accent)] hover:brightness-90 transition-all"
                style={{ background: 'var(--color-accent)' }}
              >
                Change →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Lesson Length', value: selected.lessonLen },
                { label: 'Best For', value: selected.bestFor },
                { label: 'Primary Format', value: selected.format },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-2xl" style={{ background: 'var(--color-border)' }}>
                  <div className="text-[9px] font-black uppercase tracking-widest mb-1 text-[var(--color-text-main)]">{item.label}</div>
                  <div className="text-sm font-bold text-[var(--color-text-main)]">{item.value}</div>
                </div>
              ))}
            </div>

            <button
              onClick={handleConfirm}
              className="w-full py-5 rounded-[24px] font-black text-base transition-all text-[var(--color-on-accent)] hover:-translate-y-0.5"
              style={{ background: 'var(--color-accent)', boxShadow: '0 8px 30px rgba(255,204,49,0.4)' }}
            >
              Confirm &amp; Generate Learning Map →
            </button>
          </div>
        )}

        {/* Back button */}
        <div>
          <button
          onClick={onBack}
            className="w-full sm:w-auto px-6 py-4 sm:py-3 rounded-[24px] sm:rounded-2xl text-[15px] sm:text-sm font-bold text-[var(--color-text-main)] transition-all hover:opacity-90"
            style={{ background: 'rgba(30,58,138,0.8)' }}
          >
            ← Back to SME Questions
          </button>
        </div>

      </div>
    </section>
  );
}
