'use client';

import React, { useState } from 'react';

export default function InstantAIWizard({ onComplete }) {
  const [prompt, setPrompt] = useState('');
  const [goal, setGoal] = useState(''); // E.g., 'Learn something new'
  const [learner, setLearner] = useState('');
  const [outcome, setOutcome] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [suggestionModal, setSuggestionModal] = useState(null); // { corrected_topic, suggestion }

  const calculateStrength = () => {
    const len = prompt.length;
    if (len === 0) return 0;
    if (len < 20) return 20;
    if (len < 50) return 50;
    if (len < 100) return 80;
    return 100;
  };

  const strength = calculateStrength();

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/validate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, learner, outcome })
      });
      const data = await res.json();
      if (data.status === 'gibberish') {
        setErrorMsg(data.feedback || "I couldn't understand that topic.");
      } else if (data.suggestion) {
        setPrompt(data.suggestion);
      }
    } catch (e) {
      console.error(e);
    }
    setIsEnhancing(false);
  };

  const proceedWithGeneration = (finalPrompt) => {
    setSuggestionModal(null);
    setIsGenerating(true);
    setTimeout(() => {
      onComplete({
        content: finalPrompt,
        learner: learner || 'General Audience',
        gap: goal,
        outcome: outcome || 'General outcome based on prompt',
        bloomLevel: 'Apply',
        modality: 'Microlearning',
        structuredFacts: null,
        isInstantAI: true
      });
    }, 800);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !goal) return;
    
    // If they typed less than 50 characters, let's validate it
    if (prompt.length < 50) {
      setIsGenerating(true);
      setErrorMsg('');
      try {
        const res = await fetch('/api/validate-topic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, learner, outcome })
        });
        const data = await res.json();
        setIsGenerating(false);

        if (data.status === 'gibberish') {
          setErrorMsg(data.feedback || "That doesn't look like a valid topic.");
          return;
        } else if (data.status === 'vague') {
          // Pop the suggestion modal
          setSuggestionModal({
            corrected_topic: data.corrected_topic || prompt,
            suggestion: data.suggestion
          });
          return;
        }
      } catch (e) {
        console.error(e);
        setIsGenerating(false);
      }
    }

    proceedWithGeneration(prompt);
  };

  return (
    <div className="w-full relative px-12 pt-8 pb-10 overflow-y-auto" style={{ minHeight: 'calc(100vh - 5rem)', background: 'var(--color-bg)' }}>
      <div className="relative z-10 max-w-5xl mx-auto mt-4">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full mb-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: 'var(--color-accent)' }}></span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-main)]">AI Design Engine Active</span>
          </div>
          <h1 className="text-4xl font-black mb-3 tracking-tighter leading-tight text-[var(--color-text-main)]">What do you want to teach?</h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(15,23,42,0.6)' }}>Describe your topic in plain language. InstruX will handle the rest.</p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
          
          {/* Prompt area - 2 cols */}
          <div className="lg:col-span-2">
            <div className="relative rounded-[32px] p-7 h-full" style={{ background: 'var(--color-surface)' }}>
              
              <div className="flex justify-between items-center mb-7">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">Your Course Idea</label>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={handleEnhance}
                    disabled={isEnhancing || !prompt.trim()}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed  hover:brightness-110" style={{ background: "var(--color-accent)", color: "var(--color-on-accent)" }}
                  >
                    <span>{isEnhancing ? 'Enhancing...' : '✨ Enhance'}</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--color-text-main)]">Idea Strength</span>
                    <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                      <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${strength}%`, background: 'var(--color-accent)' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <textarea 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. 'I want to help new managers have better one-on-one conversations with their team'"
                className="w-full text-xl font-bold bg-transparent focus:outline-none resize-none h-28 leading-tight tracking-tight text-[var(--color-text-main)] placeholder-blue-200/50"
                style={{ caretColor: 'var(--color-accent)' }}
              />

              {errorMsg && (
                <div className="mt-2 text-red-400 text-sm font-bold animate-pulse">
                  {errorMsg}
                </div>
              )}

              <div className="mt-8 pt-6 flex flex-wrap gap-2 items-center" style={{ borderTop: '1px solid var(--color-border)' }}>
                <span className="text-[9px] font-black uppercase tracking-widest mr-2 text-[var(--color-text-main)]">Starters</span>
                <button onClick={() => setPrompt("Understand and apply ")} className="px-4 py-2 rounded-xl text-xs font-bold transition-all text-[var(--color-text-main)] hover:bg-white/20" style={{ background: 'var(--color-border)', border: '1px solid var(--color-border)' }}>Understand &amp; Apply</button>
                <button onClick={() => setPrompt("Practice and improve ")} className="px-4 py-2 rounded-xl text-xs font-bold transition-all text-[var(--color-text-main)] hover:bg-white/20" style={{ background: 'var(--color-border)', border: '1px solid var(--color-border)' }}>Practice &amp; Improve</button>
                <button onClick={() => setPrompt("Build and grow ")} className="px-4 py-2 rounded-xl text-xs font-bold transition-all text-[var(--color-text-main)] hover:bg-white/20" style={{ background: 'var(--color-border)', border: '1px solid var(--color-border)' }}>Build &amp; Grow</button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] mb-2 block">Who is this for?</label>
                  <input 
                    type="text" 
                    value={learner} 
                    onChange={e => setLearner(e.target.value)}
                    placeholder="e.g. Sales team" 
                    className="w-full rounded-xl px-4 py-3 text-sm font-bold text-[var(--color-text-main)] focus:outline-none transition-all placeholder-white/30"
                    style={{ background: 'var(--color-border)', border: '1px solid var(--color-border)' }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] mb-2 block">Business Outcome</label>
                  <input 
                    type="text" 
                    value={outcome} 
                    onChange={e => setOutcome(e.target.value)}
                    placeholder="e.g. Increase close rate" 
                    className="w-full rounded-xl px-4 py-3 text-sm font-bold text-[var(--color-text-main)] focus:outline-none transition-all placeholder-white/30"
                    style={{ background: 'var(--color-border)', border: '1px solid var(--color-border)' }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Sidebar - Learning Goal + CTA */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="rounded-[24px] p-5 h-full flex flex-col" style={{ background: 'var(--color-surface)' }}>
              <label className="text-[10px] font-black uppercase tracking-widest mb-3 block text-[var(--color-primary)]">Learning Goal</label>
              <div className="space-y-2 flex-grow">
                {['Learn something new', 'Get better at a skill', 'Change a habit or behavior'].map(g => (
                  <button 
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`w-full p-3.5 rounded-2xl text-left text-sm font-bold transition-all text-[var(--color-text-main)] ${goal === g ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`} 
                    style={{ border: '1px solid' }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={!prompt.trim() || !goal || isGenerating}
              className="w-full py-5 rounded-[28px] font-black text-lg transition-all text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
              style={{ background: (!prompt.trim() || !goal) ? 'rgba(0,0,0,0.12)' : '#0a0d14', color: (!prompt.trim() || !goal) ? 'rgba(0,0,0,0.3)' : 'white', border: (!prompt.trim() || !goal) ? '2px solid rgba(0,0,0,0.1)' : 'none' }}
            >
              {isGenerating ? 'Validating...' : 'Build My Course \u2192'}
            </button>
          </div>

        </div>
      </div>

      {/* Suggestion Modal for Vague Topics */}
      {suggestionModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-surface)] border border-white/10 rounded-[32px] w-full max-w-md p-8 shadow-2xl">
            <div className="w-16 h-16 bg-[var(--color-accent)]/10 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl text-[var(--color-accent)]">✨</span>
            </div>
            <h3 className="text-2xl font-black text-[var(--color-text-main)] mb-3 tracking-tight">Did you mean {suggestionModal.corrected_topic}?</h3>
            <p className="text-[var(--color-text-main)]/60 text-sm leading-relaxed mb-6">
              To guarantee a highly actionable, expert-led course, I expanded your topic into a detailed training brief:
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
              <p className="text-sm font-medium text-[var(--color-text-main)] italic">"{suggestionModal.suggestion}"</p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setPrompt(suggestionModal.suggestion);
                  proceedWithGeneration(suggestionModal.suggestion);
                }}
                className="w-full py-4 bg-[var(--color-accent)] hover:brightness-110 text-[var(--color-on-accent)] font-black rounded-2xl transition-all shadow-lg shadow-[var(--color-accent)]/20"
              >
                Accept &amp; Build
              </button>
              <button 
                onClick={() => setSuggestionModal(null)}
                className="w-full py-4 bg-transparent border border-white/20 hover:bg-white/10 text-[var(--color-text-main)] font-bold rounded-2xl transition-all"
              >
                Let me edit it
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
