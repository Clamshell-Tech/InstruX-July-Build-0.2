'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const FALLBACK_QUESTIONS = [
  { id: 1, question: 'What is the single most common mistake learners make in this topic area?', context: 'Gap detected: insufficient error pattern data in source.' },
  { id: 2, question: 'What does success look like 90 days after completing this training?', context: 'Gap detected: no measurable outcome defined in source.' },
  { id: 3, question: 'What prerequisite knowledge should learners have before starting?', context: 'Gap detected: entry-level assumptions unclear.' },
  { id: 4, question: 'Are there any regulatory or compliance requirements this course must address?', context: 'Gap detected: compliance framing absent from source.' },
  { id: 5, question: 'What real-world scenarios or case examples best illustrate this topic?', context: 'Gap detected: applied context limited in source.' },
  { id: 6, question: 'What are the top three "must-know" takeaways for a learner to be considered competent?', context: 'Gap detected: competency benchmarks not defined.' }
];

export default function SMEQuestionEngine({ wizardData, onBack, onComplete }) {
  const questions = wizardData?.questions && wizardData.questions.length > 0
    ? wizardData.questions
    : FALLBACK_QUESTIONS;

  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [flagNotes, setFlagNotes] = useState({});
  const [collapsed, setCollapsed] = useState({});

  // Initialize answers object when questions load
  useEffect(() => {
    const initialAnswers = {};
    questions.forEach((_, idx) => {
      initialAnswers[idx] = '';
    });
    setAnswers(initialAnswers);
  }, [questions]);

  const answeredCount = Object.values(answers).filter((a) => a && a.trim().length > 0).length;
  const progressPct = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  const setAnswer = (i, val) => setAnswers((prev) => ({ ...prev, [i]: val }));
  const toggleFlag = (i) => setFlagged((prev) => ({ ...prev, [i]: !prev[i] }));
  const setFlagNote = (i, val) => setFlagNotes((prev) => ({ ...prev, [i]: val }));
  const toggleCollapse = (i) => setCollapsed((prev) => ({ ...prev, [i]: !prev[i] }));

  // Real AI Feedback State
  const debounceTimers = useRef({});
  const [aiFeedback, setAiFeedback] = useState({});
  const [isEvaluating, setIsEvaluating] = useState({});

  const handleAnswerChange = (i, val, q) => {
    setAnswer(i, val);
    
    // Clear previous timer
    if (debounceTimers.current[i]) {
      clearTimeout(debounceTimers.current[i]);
    }
    
    // Clear feedback if empty
    if (!val.trim()) {
      setAiFeedback(prev => ({ ...prev, [i]: null }));
      return;
    }

    // Set new timer for evaluation
    debounceTimers.current[i] = setTimeout(async () => {
      setIsEvaluating(prev => ({ ...prev, [i]: true }));
      try {
        const res = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q.question, answer: val, context: q.context })
        });
        const data = await res.json();
        setAiFeedback(prev => ({ ...prev, [i]: { text: data.feedback, isPositive: data.isPositive } }));
      } catch (err) {
        console.error("AI Evaluation failed:", err);
      } finally {
        setIsEvaluating(prev => ({ ...prev, [i]: false }));
      }
    }, 1500); // 1.5s debounce
  };

  const markCompleteAndNext = (currentIndex) => {
    setCollapsed((prev) => ({ ...prev, [currentIndex]: true }));
    // Try to find the next unanswered/uncollapsed question
    const nextIndex = questions.findIndex((_, idx) => idx > currentIndex && !collapsed[idx] && (!answers[idx] || answers[idx].length < 30) && !flagged[idx]);
    if (nextIndex !== -1) {
      setCollapsed((prev) => ({ ...prev, [nextIndex]: false }));
      // Slight delay to let DOM update before scrolling
      setTimeout(() => {
        const el = document.getElementById(`question-card-${nextIndex}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  // Feature: Voice Dictation & AI Auto-Draft
  const [isDrafting, setIsDrafting] = useState({});
  const [isListening, setIsListening] = useState({});

  const handleDraftAnswer = async (i, q) => {
    if (isDrafting[i]) return;
    setIsDrafting(prev => ({ ...prev, [i]: true }));
    try {
      const res = await fetch('/api/draft-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          context: q.context,
          facts: wizardData?.structuredFacts || {}
        })
      });
      const data = await res.json();
      if (data.draft) {
        setAnswer(i, data.draft);
      }
    } catch (e) {
      console.error("Drafting failed:", e);
    }
    setIsDrafting(prev => ({ ...prev, [i]: false }));
  };

  const handleDictate = (i) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice dictation is not supported in this browser. Try Chrome.");
      return;
    }
    if (isListening[i]) return;

    setIsListening(prev => ({ ...prev, [i]: true }));
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswers(prev => {
        const existing = prev[i] || '';
        const newAns = existing ? existing + ' ' + transcript : transcript;
        return { ...prev, [i]: newAns };
      });
    };
    recognition.onerror = () => setIsListening(prev => ({ ...prev, [i]: false }));
    recognition.onend = () => setIsListening(prev => ({ ...prev, [i]: false }));
    recognition.start();
  };

  // Content DNA structured facts
  const facts = wizardData?.structuredFacts;

  const renderPill = (text, color) => (
    <span
      key={text}
      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mr-1 mb-1"
      style={{
        background: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {text.length > 55 ? text.substring(0, 55) + '…' : text}
    </span>
  );

  const renderSection = (label, items, color) => {
    if (!items || !items.length) return null;
    const displayItems = items.slice(0, 6);
    const hasMore = items.length > 6;

    return (
      <div className="mb-3">
        <p className="text-[9px] font-black uppercase tracking-wider mb-1.5" style={{ color: color }}>
          {label} ({items.length})
        </p>
        <div>
          {displayItems.map((item) => renderPill(typeof item === 'string' ? item : JSON.stringify(item), color))}
          {hasMore && renderPill(`+${items.length - 6} more`, color)}
        </div>
      </div>
    );
  };  return (
    <section className="relative overflow-y-auto h-full w-full no-scrollbar" style={{ background: 'var(--color-bg)' }}>
      
      {/* Sticky Top Header (Progress Bar) */}
      <div className="sticky top-0 z-50 px-6 lg:px-12 py-4 bg-[var(--color-accent)]/95 backdrop-blur-md border-b border-black/10 shadow-sm flex items-center justify-between">
        <div className="flex-grow max-w-4xl mx-auto flex items-center space-x-6">
          <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-primary)] shrink-0">Progress</span>
          <div className="flex-grow h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ background: 'var(--color-surface)', width: `${progressPct}%` }}
            ></div>
          </div>
          <span className="text-[11px] font-black shrink-0 text-[var(--color-primary)]">{answeredCount} of {questions.length} answered</span>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 pt-12 pb-24">
        
        {/* Header */}
        <div className="mb-10 text-left">
          <div
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-5 shadow-sm"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: 'var(--color-accent)' }}></span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-main)]">SME Question Engine</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black mb-4 tracking-tighter text-slate-900">
            AI found <span style={{ color: 'var(--color-primary)' }}>{questions.length}</span> knowledge gaps.<br />Help it fill them.
          </h2>
          <p className="text-lg font-medium text-slate-800" style={{ opacity: 0.9 }}>
            Generated by analysing your source content. Answer what you know — flag the rest for your SME.
          </p>
        </div>

        {/* Content DNA panel */}
        {facts && (
          <div className="rounded-[24px] p-6 mb-10 text-left shadow-lg" style={{ background: '#f0f9ff', border: '2px solid #0ea5e9' }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#0ea5e9' }}>
                  <svg className="w-3.5 h-3.5 text-[var(--color-text-main)]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.396 0 2.7.376 3.8 1.029A7.969 7.969 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
                <p className="text-sm font-black text-sky-800">Content DNA Context</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {facts.bloomsLevel && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ background: '#7c3aed20', color: '#7c3aed', border: '1px solid #7c3aed40' }}>
                    Bloom's: {facts.bloomsLevel}
                  </span>
                )}
                {facts.estimatedComplexity && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ background: '#0369a120', color: '#0369a1', border: '1px solid #0369a140' }}>
                    {facts.estimatedComplexity}
                  </span>
                )}
              </div>
            </div>

            {renderSection('Concepts', facts.concepts, 'var(--color-primary)')}
            {renderSection('Procedures', facts.procedures, '#065f46')}
            {renderSection('Rules', facts.rules, '#991b1b')}
            {renderSection('Examples', facts.examples, '#075985')}
            {renderSection('Key Facts', facts.keyFacts, '#9a3412')}
          </div>
        )}

        {/* Questions */}
        <div className="space-y-4 mb-8 text-left">
          {questions.map((q, i) => {
            const isFlagged = !!flagged[i];
            return (
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: collapsed[i] ? 0.98 : 1 }}
                id={`question-card-${i}`}
                key={q.id || i}
                className={`rounded-[24px] p-6 transition-all duration-300 ${collapsed[i] ? 'cursor-pointer hover:brightness-110' : ''}`}
                style={{
                  background: collapsed[i] ? 'var(--color-overlay)' : 'var(--color-surface)',
                  border: `1px solid ${isFlagged ? 'var(--color-accent)' : collapsed[i] ? 'rgba(74,222,128,0.3)' : 'var(--color-border)'}`,
                }}
                onClick={() => { if (collapsed[i]) toggleCollapse(i); }}
              >
                {collapsed[i] ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 truncate">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isFlagged ? 'bg-yellow-400/20' : 'bg-green-400/20'}`}>
                        {isFlagged ? (
                          <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 2H19a2 2 0 012 2v8a2 2 0 01-2 2h-5l-1-2H5v6z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm font-bold text-[var(--color-text-main)]/80 truncate">
                        {isFlagged ? 'Flagged for SME: ' : 'Completed: '} {q.question}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-[var(--color-text-main)]/40 uppercase tracking-widest ml-4">Edit</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-grow">
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5 text-[var(--color-on-accent)]"
                          style={{ background: 'var(--color-accent)' }}
                        >
                          {q.id || (i + 1)}
                        </span>
                        <div className="flex-grow">
                          <p className="text-sm font-bold text-[var(--color-text-main)] mb-1 leading-normal">{q.question}</p>
                          {q.context && <p className="text-[10px] text-[var(--color-text-main)] leading-snug">{q.context}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFlag(i)}
                        className="ml-4 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 transition-all focus:outline-none"
                        style={{
                          color: isFlagged ? 'var(--color-on-accent)' : 'var(--color-text-muted)',
                          background: isFlagged ? 'var(--color-accent)' : 'var(--color-border)',
                        }}
                      >
                        {isFlagged ? 'Flagged' : 'Flag'}
                      </button>
                    </div>

                    {isListening[i] && (
                      <div className="flex items-center justify-center space-x-1.5 mb-3 py-3 w-full rounded-xl bg-black/20 border border-white/5 overflow-hidden shadow-inner">
                        {[...Array(7)].map((_, idx) => (
                          <motion.div
                            key={idx}
                            className="w-1.5 bg-gradient-to-t from-[var(--color-accent)] via-[#ff2d55] to-[#5856d6] rounded-full"
                            animate={{
                              height: [
                                idx % 2 === 0 ? '12px' : '24px', 
                                idx % 2 === 0 ? '36px' : '16px', 
                                idx % 2 === 0 ? '12px' : '24px'
                              ],
                            }}
                            transition={{
                              duration: 0.6 + (idx * 0.05),
                              repeat: Infinity,
                              repeatType: "reverse",
                              delay: idx * 0.1,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                        <span className="text-[var(--color-text-main)]/60 text-[10px] font-black uppercase tracking-widest ml-4 animate-pulse">Listening...</span>
                      </div>
                    )}

                    <textarea
                      className="w-full rounded-xl p-3 text-sm font-medium resize-none focus:outline-none transition-all text-[var(--color-text-main)] mb-2"
                      rows={2}
                      value={answers[i] || ''}
                      onChange={(e) => handleAnswerChange(i, e.target.value, q)}
                      placeholder="Your answer. (leave blank to flag for SME)"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid var(--color-border)',
                        caretColor: 'var(--color-accent)',
                      }}
                    />

                    {isFlagged && (
                      <div className="mb-2 animate-fadeIn">
                        <textarea
                          className="w-full rounded-xl p-3 text-xs font-medium resize-none focus:outline-none transition-all text-yellow-900"
                          rows={1}
                          value={flagNotes[i] || ''}
                          onChange={(e) => setFlagNote(i, e.target.value)}
                          placeholder="Leave a quick note for the expert... (e.g. 'Jane, please verify the compliance rule here')"
                          style={{ background: 'var(--color-accent)', caretColor: 'var(--color-primary)' }}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleDictate(i)}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isListening[i] ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/50' : 'bg-white/5 text-[var(--color-text-main)]/50 hover:bg-white/10 border border-white/10'}`}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                            <line x1="12" y1="19" x2="12" y2="23"/>
                            <line x1="8" y1="23" x2="16" y2="23"/>
                          </svg>
                          <span>{isListening[i] ? 'Listening...' : 'Dictate'}</span>
                        </button>

                        <button 
                          onClick={() => handleDraftAnswer(i, q)}
                          disabled={isDrafting[i]}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 text-[var(--color-text-main)] bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/20"
                        >
                          <span>{isDrafting[i] ? 'Drafting...' : '✨ Auto-Draft'}</span>
                        </button>
                      </div>

                      {/* AI Critic & Mark Complete / Flag */}
                      <div className="flex items-center space-x-3">
                        {!isFlagged && isEvaluating[i] ? (
                          <span className="text-[10px] font-bold text-[var(--color-text-main)]/50 italic flex items-center bg-white/5 px-2 py-1 rounded-md animate-pulse">
                            <span className="mr-1">🤖</span> AI is thinking...
                          </span>
                        ) : !isFlagged && aiFeedback[i] ? (
                          <span className={`text-[10px] font-bold italic flex items-center px-2 py-1 rounded-md ${aiFeedback[i].isPositive ? 'text-green-400/80 bg-green-400/10' : 'text-yellow-400/80 bg-yellow-400/10'}`}>
                            <span className="mr-1">{aiFeedback[i].isPositive ? '✓' : '💡'}</span> AI: {aiFeedback[i].text}
                          </span>
                        ) : null}

                        {!isFlagged && answers[i] && answers[i].length >= 30 && (
                          <button
                            onClick={() => markCompleteAndNext(i)}
                            className="px-3 py-1.5 rounded-full bg-green-500 hover:bg-green-400 text-[var(--color-text-main)] text-[10px] font-black uppercase tracking-widest transition-all animate-fadeIn"
                          >
                            Mark Complete
                          </button>
                        )}

                        {isFlagged && flagNotes[i] && flagNotes[i].trim().length > 0 && (
                          <button
                            onClick={() => markCompleteAndNext(i)}
                            className="px-3 py-1.5 rounded-full bg-[var(--color-accent)] hover:bg-yellow-400 text-[var(--color-on-accent)] text-[10px] font-black uppercase tracking-widest transition-all animate-fadeIn shadow-[0_0_15px_rgba(255,204,49,0.4)]"
                          >
                            Save Flag & Next
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Inline Bottom Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-8 mt-12 gap-4 border-t border-black/10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="w-full sm:w-auto px-8 py-4 rounded-full text-[15px] font-bold text-[var(--color-text-main)] transition-all hover:bg-white/30 focus:outline-none"
            style={{ border: '2px solid rgba(0,0,0,0.1)' }}
          >
            ← Back to Studio
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="w-full sm:w-auto px-10 py-4 rounded-full font-black text-[16px] transition-colors text-[var(--color-text-main)] focus:outline-none shadow-2xl hover:shadow-[0_10px_40px_var(--color-shadow)]"
            style={{ background: 'var(--color-surface)' }}
          >
            Select Learning Strategy →
          </motion.button>
        </div>

      </div>
    </section>
  );
}
