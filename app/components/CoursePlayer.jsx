'use client';

import React, { useState, useEffect } from 'react';

export default function CoursePlayer({ wizardData, onBack, isPreview = false }) {
  const [slides, setSlides] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null); // null or index
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitText, setSubmitText] = useState('Submit');
  
  // Track quiz metrics for summary card
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizTotalCount, setQuizTotalCount] = useState(0);
  const [lastQuizPercent, setLastQuizPercent] = useState(null);

  // Flipped state for flipcards
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    if (wizardData?.slides) {
      setSlides([...wizardData.slides]);
    }
  }, [wizardData]);

  const toggleFlip = (idx) => {
    const key = `${currentIdx}-${idx}`;
    setFlippedCards(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const courseTitle = wizardData?.title || 'My Course';
  const currentSlide = slides[currentIdx] || {};

  // Reset quiz state when switching slides
  useEffect(() => {
    setSelectedOpt(null);
    setIsSubmitted(false);
    setSubmitText('Submit');
  }, [currentIdx]);

  const handleNavigate = (dir) => {
    const nextIdx = currentIdx + dir;
    if (nextIdx >= 0 && nextIdx < slides.length) {
      setCurrentIdx(nextIdx);
    }
  };

  const handleOptionSelect = (idx) => {
    if (isSubmitted) return;
    setSelectedOpt(idx);
  };

  const handleQuizSubmit = async () => {
    if (selectedOpt === null || isSubmitted) return;

    setIsSubmitted(true);
    setIsSubmitting(true);
    setSubmitText('Generating adaptive question...');

    const correctIndices = currentSlide.correctIndices || [0];
    const isCorrect = correctIndices.includes(selectedOpt);

    // Update counts
    setQuizTotalCount(prev => prev + 1);
    if (isCorrect) {
      setQuizCorrectCount(prev => prev + 1);
    }

    try {
      const res = await fetch('/api/adaptive-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalQuestion: currentSlide.question,
          isCorrect,
          courseContext: courseTitle
        })
      });
      if (res.ok) {
        const newSlide = await res.json();
        newSlide.challengeNum = (currentSlide.challengeNum || 1) + 1;
        newSlide.scenario = isCorrect 
          ? `🔥 Level Up: ${newSlide.scenario || ''}` 
          : `💡 Let's review: ${newSlide.scenario || ''}`;
        
        // Insert new adaptive slide right after current slide
        setSlides(prev => {
          const updated = [...prev];
          updated.splice(currentIdx + 1, 0, newSlide);
          return updated;
        });
      }
    } catch (err) {
      console.warn('Failed to generate adaptive question:', err);
    } finally {
      setIsSubmitting(false);
      setSubmitText('Continue →');
    }
  };

  // Render Slide Content based on type
  const renderSlideContent = () => {
    switch (currentSlide.type) {
      case 'cover':
        return (
          <div className="flex flex-col items-center justify-between text-center h-full px-6 py-8 text-[var(--color-text-main)] relative z-10">
            {/* Background design */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[var(--color-primary)] to-[#0284c7] -z-10" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/40 -z-10" />
            
            {/* Top tag */}
            <div className="inline-flex items-center space-x-2 bg-white/8 border border-white/12 rounded-full px-4 py-1.5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse inline-block" />
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-main)]/80">InstruX AI Course</span>
            </div>

            {/* Title / Description */}
            <div className="flex-grow flex flex-col items-center justify-center py-6">
              <div className="w-14 h-14 rounded-[20px] bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center mb-5 shrink-0">
                <svg width="24" height="24" fill="none" stroke="var(--color-accent)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-2xl font-black mb-3 leading-tight tracking-tight text-[var(--color-text-main)]">{currentSlide.courseTitle || courseTitle}</h1>
              <p className="text-xs text-[var(--color-text-main)]/65 leading-relaxed max-w-[280px]">{currentSlide.subtitle}</p>
              
              {/* Stats Row */}
              <div className="flex items-center gap-6 mt-8">
                <div className="text-center">
                  <div className="text-xl font-black text-yellow-400">{slides.length}</div>
                  <div className="text-[9px] font-bold text-[var(--color-text-main)]/40 uppercase tracking-widest">Slides</div>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="text-center">
                  <div className="text-xl font-black text-yellow-400">
                    {Math.max(3, Math.round(slides.length * 0.8))}m
                  </div>
                  <div className="text-[9px] font-bold text-[var(--color-text-main)]/40 uppercase tracking-widest">Est. Time</div>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="text-center">
                  <div className="text-xl font-black text-yellow-400">AI</div>
                  <div className="text-[9px] font-bold text-[var(--color-text-main)]/40 uppercase tracking-widest">Designed</div>
                </div>
              </div>

              {lastQuizPercent !== null && (
                <div className="mt-4 inline-flex items-center space-x-2 bg-white/8 border border-white/12 rounded-full px-3 py-1">
                  <span className="text-[9px] font-bold text-[var(--color-text-main)]/50 uppercase tracking-widest">Last attempt</span>
                  <span className="text-[11px] font-black" style={{ color: lastQuizPercent >= 70 ? '#22c55e' : lastQuizPercent >= 40 ? 'var(--color-accent)' : '#ef4444' }}>
                    {lastQuizPercent}%
                  </span>
                </div>
              )}
            </div>

            {/* Start Button */}
            <button
              onClick={() => handleNavigate(1)}
              className="w-full py-4 rounded-[20px] bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-black text-[15px] uppercase tracking-wider cursor-pointer border-none flex items-center justify-center gap-2 focus:outline-none transition-all shadow-[0_8px_32px_rgba(255,204,49,0.4)]"
            >
              <span>Start Course</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        );

      case 'objectives':
        return (
          <div className="flex flex-col justify-start text-left h-full px-6 py-6 text-[var(--color-text-main)] overflow-y-auto no-scrollbar">
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] mb-2">Learning Objectives</div>
            <h2 className="text-xl font-black text-[var(--color-text-main)] leading-tight mb-6">{currentSlide.heading || 'What you will master'}</h2>
            <div className="flex flex-col gap-4 mb-6">
              {(currentSlide.items || []).map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center font-black text-xs text-blue-900">{idx + 1}</div>
                  <p className="text-[var(--color-text-main)]/85 text-xs leading-relaxed pt-0.5">{item}</p>
                </div>
              ))}
            </div>
            {currentSlide.items && currentSlide.items[0] && (
              <div className="bg-white/5 border border-white/10 rounded-[20px] p-4 text-center mt-auto">
                <div className="text-2xl mb-2">✨</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] mb-2">InstruX AI Insight</div>
                <p className="text-[var(--color-text-main)]/75 text-xs leading-relaxed">
                  {currentSlide.items[0] || 'Master the key concepts and apply them confidently in your workplace.'}
                </p>
              </div>
            )}
          </div>
        );

      case 'module-title':
        return (
          <div className="flex flex-col items-center justify-center text-center h-full px-6 py-8 text-[var(--color-text-main)]">
            <div className="w-9 h-1 bg-yellow-400 rounded-full mb-5" />
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] mb-2">Module {currentSlide.moduleNum || 1}</div>
            <h2 className="text-2xl font-black text-[var(--color-text-main)] leading-tight tracking-tight mb-4">{currentSlide.title}</h2>
            <p className="text-sm text-[var(--color-text-main)]/50 italic leading-relaxed mb-8 max-w-[300px]">{currentSlide.story}</p>
            <button
              onClick={() => handleNavigate(1)}
              className="inline-flex items-center justify-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-[var(--color-primary)] font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full cursor-pointer hover:bg-yellow-400/20 focus:outline-none transition-all"
            >
              <span>Begin module</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        );

      case 'content':
        const isCssPattern = currentSlide.imageDecision === 'css-pattern';
        return (
          <div className="flex flex-col justify-start text-left h-full px-5 py-4 text-[var(--color-text-main)] overflow-y-auto no-scrollbar">
            {/* Canva/AI Image block or CSS pattern */}
            {currentSlide.imageUrl && (
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 shrink-0 bg-slate-900 border border-white/10">
                <img src={currentSlide.imageUrl} alt={currentSlide.heading} className="w-full h-full object-cover" />
              </div>
            )}
            {!currentSlide.imageUrl && isCssPattern && (
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 shrink-0 bg-gradient-to-br from-indigo-900 to-blue-900 border border-white/10 flex items-center justify-center relative">
                <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle, white 10%, transparent 11%)', backgroundSize: '12px 12px' }} />
                <span className="text-3xl">✦</span>
              </div>
            )}

            {currentSlide.subtitle && <p className="text-[10px] font-black uppercase text-[var(--color-primary)] tracking-widest mb-1">{currentSlide.subtitle}</p>}
            <h2 className="text-lg font-black leading-tight text-[var(--color-text-main)] mb-2">{currentSlide.heading}</h2>
            <p className="text-xs leading-relaxed text-[var(--color-text-main)]/90 mb-4">{currentSlide.body}</p>
            
            {currentSlide.proTip && (
              <div className="rounded-xl p-3 bg-yellow-400/10 border-l-4 border-yellow-400 mt-auto">
                <p className="text-[10px] font-bold text-[var(--color-primary)]">{currentSlide.proTip}</p>
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="flex flex-col justify-start text-left h-full px-6 py-6 text-[var(--color-text-main)]">
            <h3 className="text-lg font-black text-[var(--color-text-main)] mb-4">{currentSlide.heading || 'Watch and Learn'}</h3>
            <div className="w-full aspect-video rounded-2xl bg-black border border-white/10 flex flex-col items-center justify-center mb-6">
              <span className="text-4xl text-yellow-400 mb-2">▶</span>
              <p className="text-[10px] text-slate-400 px-4 text-center">{currentSlide.videoPrompt}</p>
            </div>
            <div className="text-xs leading-relaxed text-[var(--color-text-main)] bg-white/5 p-4 rounded-xl border border-white/8">
              <span className="font-bold text-[var(--color-primary)] block mb-1">Key Takeaway</span>
              {currentSlide.keyTakeaway}
            </div>
          </div>
        );

      case 'quote':
        return (
          <div className="flex flex-col justify-center items-center text-center h-full px-6 py-8 text-[var(--color-text-main)]">
            <span className="text-4xl text-yellow-400 mb-4">“</span>
            <blockquote className="text-base font-bold italic leading-relaxed text-[var(--color-text-main)] mb-4">
              {currentSlide.text}
            </blockquote>
            {currentSlide.attribution && (
              <cite className="text-xs font-black uppercase tracking-wider text-[var(--color-text-main)] not-italic">
                — {currentSlide.attribution}
              </cite>
            )}
          </div>
        );

      case 'checklist':
        return (
          <div className="flex flex-col justify-start text-left h-full px-6 py-6 text-[var(--color-text-main)]">
            <h3 className="text-lg font-black text-[var(--color-primary)] mb-6 uppercase tracking-wider">{currentSlide.heading || 'How-To Steps'}</h3>
            <div className="space-y-3">
              {(currentSlide.items || []).map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 bg-white/5 rounded-xl px-4 py-3 border border-white/8">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="8" height="8" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-[var(--color-text-main)]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'flipcards':
        const cards = (currentSlide.cards || []).slice(0, 3);
        return (
          <div className="flex flex-col justify-center text-left h-full px-5 py-6 text-[var(--color-text-main)]">
            <div className="mb-4 text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] mb-1">Flip to explore</div>
              <h2 className="text-base font-black text-[var(--color-text-main)]">{currentSlide.heading || 'Consolidate your learning'}</h2>
            </div>
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              {cards.map((card, idx) => {
                const key = `${currentIdx}-${idx}`;
                const isFlipped = !!flippedCards[key];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleFlip(idx)}
                    className="cursor-pointer relative h-[90px] w-full rounded-xl transition-all duration-500"
                    style={{ perspective: '1000px' }}
                  >
                    <div
                      className="relative w-full h-full duration-500 transform-style"
                      style={{
                        transform: isFlipped ? 'rotateY(180deg)' : 'none',
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {/* Front Side */}
                      <div className="absolute inset-0 bg-yellow-400 rounded-xl flex flex-col items-center justify-center px-4 py-2 text-center border border-blue-900/15 shadow-sm backface-hidden">
                        <p className="font-extrabold text-[13px] text-blue-900 leading-tight mb-1">{card.front}</p>
                        <div className="text-[8px] font-black uppercase text-blue-900/45 tracking-widest">↺ tap to flip</div>
                      </div>
                      {/* Back Side */}
                      <div className="absolute inset-0 bg-blue-900 rounded-xl flex flex-col items-center justify-center px-4 py-2 text-center border border-yellow-400/25 shadow-md backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
                        <p className="text-[var(--color-text-main)] text-xs leading-snug font-medium">{card.back}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'quiz':
        const quizCorrectIndices = currentSlide.correctIndices || [0];
        const quizFeedback = currentSlide.feedback || { correct: currentSlide.explanation || 'Great job!', incorrect: currentSlide.explanation || 'Not quite.' };
        
        return (
          <div className="flex flex-col justify-center text-left h-full px-5 py-4 text-[var(--color-text-main)] overflow-y-auto no-scrollbar">
            
            {/* Header */}
            <div className="mb-4 text-left">
              <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] mb-1">
                Challenge {currentSlide.challengeNum || 1}
              </div>
              {currentSlide.scenario && (
                <div className="bg-white/3 border border-white/10 rounded-lg p-3 mb-2 text-[var(--color-text-main)]/60 text-xs italic leading-normal">
                  “{currentSlide.scenario}”
                </div>
              )}
              <h2 className="text-base font-black text-[var(--color-text-main)] leading-snug">{currentSlide.question}</h2>
            </div>

            {/* Options List — matching original white button styling */}
            <div className="flex flex-col gap-2 mb-4">
              {(currentSlide.options || []).map((opt, idx) => {
                const isSelected = selectedOpt === idx;
                const isCorrect = quizCorrectIndices.includes(idx);
                
                let btnBackground = 'white';
                let btnBorder = '2px solid rgba(30,58,138,0.15)';
                let btnColor = 'var(--color-primary)';
                let btnWeight = '600';
                let btnOpacity = '1';
                
                // Styling based on submission states
                if (isSubmitted) {
                  if (isCorrect) {
                    btnBackground = '#22c55e'; btnBorder = '2px solid #22c55e'; btnColor = 'white';
                  } else if (isSelected) {
                    btnBackground = '#ef4444'; btnBorder = '2px solid #ef4444'; btnColor = 'white';
                  } else {
                    btnOpacity = '0.35';
                  }
                } else if (isSelected) {
                  btnBackground = 'var(--color-accent)'; btnBorder = '2px solid var(--color-accent)'; btnColor = 'var(--color-primary)'; btnWeight = '800';
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => handleOptionSelect(idx)}
                    className="w-full text-left p-3 rounded-xl text-xs font-semibold focus:outline-none transition-all flex items-center gap-3 disabled:cursor-default"
                    style={{
                      background: btnBackground,
                      border: btnBorder,
                      color: btnColor,
                      fontWeight: btnWeight,
                      opacity: btnOpacity
                    }}
                  >
                    {/* Circle alphabet badge */}
                    <span
                      className="w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-black shrink-0"
                      style={{
                        borderColor: isSubmitted && (isCorrect || isSelected) ? 'white' : 'rgba(30,58,138,0.15)',
                        color: isSubmitted && (isCorrect || isSelected) ? 'white' : 'var(--color-primary)',
                        background: 'transparent'
                      }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {isSubmitted && (
              <div className="rounded-xl p-3 bg-white/5 border border-white/8 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-1.5"
                  style={{
                    background: quizCorrectIndices.includes(selectedOpt) ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                    color: quizCorrectIndices.includes(selectedOpt) ? '#22c55e' : '#ef4444'
                  }}
                >
                  {quizCorrectIndices.includes(selectedOpt) ? 'Correct' : 'Incorrect'}
                </span>
                <p className="text-[var(--color-text-main)] text-[11px] leading-relaxed">
                  {quizCorrectIndices.includes(selectedOpt) ? quizFeedback.correct : quizFeedback.incorrect}
                </p>
              </div>
            )}

            {/* Submit button — disabled until option selected */}
            <button
              onClick={isSubmitted ? () => handleNavigate(1) : handleQuizSubmit}
              disabled={selectedOpt === null || isSubmitting}
              className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer border-none transition-all focus:outline-none"
              style={{
                background: 'var(--color-accent)', color: 'var(--color-on-accent)',
                opacity: selectedOpt === null ? 0.4 : 1,
                marginTop: 'auto'
              }}
            >
              {submitText}
            </button>

          </div>
        );

      case 'summary':
        // Calculate scores
        const percent = quizTotalCount > 0 ? Math.round((quizCorrectCount / quizTotalCount) * 100) : null;
        
        // Save score as last attempt when reaching summary
        if (percent !== null && lastQuizPercent === null) {
          setLastQuizPercent(percent);
        }

        return (
          <div className="flex flex-col justify-between items-center text-center h-full px-6 py-6 text-[var(--color-text-main)] relative overflow-y-auto no-scrollbar">
            {/* Celebration glow */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-radial-gradient from-yellow-400/15 to-transparent pointer-events-none" />
            
            {/* Trophy */}
            <div className="flex flex-col items-center gap-2 mt-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-[#f59e0b] flex items-center justify-center shadow-[0_0_0_8px_rgba(255,204,49,0.12),0_0_0_16px_rgba(255,204,49,0.05)]">
                <svg width="28" height="28" fill="none" stroke="var(--color-primary)" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)] mt-2">Course Complete</div>
              <h1 className="text-xl font-black text-[var(--color-text-main)] leading-tight">{currentSlide.heading || 'You did it!'}</h1>
              {currentSlide.subheading && <p className="text-xs text-[var(--color-text-main)]/50 leading-relaxed max-w-[260px]">{currentSlide.subheading}</p>}
            </div>

            {/* Stats row */}
            <div className="relative z-10 flex w-full bg-white/4 border border-white/8 rounded-2xl overflow-hidden mt-6 shrink-0">
              <div className="flex-1 py-3 text-center border-r border-white/8">
                <div className="text-lg font-black text-yellow-400">{slides.length}</div>
                <div className="text-[9px] font-bold text-[var(--color-text-main)]/35 uppercase tracking-widest">Slides</div>
              </div>
              <div className="flex-grow flex-1 py-3 text-center border-r border-white/8">
                <div className="text-lg font-black text-yellow-400">
                  {Math.max(3, Math.round(slides.length * 0.8))}m
                </div>
                <div className="text-[9px] font-bold text-[var(--color-text-main)]/35 uppercase tracking-widest">Time</div>
              </div>
              <div className="flex-grow flex-1 py-3 text-center">
                <div className="text-lg font-black" style={{ color: percent === null || percent >= 70 ? '#22c55e' : percent >= 40 ? 'var(--color-accent)' : '#ef4444' }}>
                  {percent !== null ? `${percent}%` : '100%'}
                </div>
                <div className="text-[9px] font-bold text-[var(--color-text-main)]/35 uppercase tracking-widest">
                  {percent !== null ? 'Quiz Score' : 'Done'}
                </div>
              </div>
            </div>

            {/* Key takeaways */}
            {(currentSlide.takeaways || []).length > 0 && (
              <div className="relative z-10 w-full text-left mt-6">
                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-main)]/35 mb-2">Key Takeaways</div>
                <div className="flex flex-col gap-2">
                  {(currentSlide.takeaways || []).slice(0, 3).map((takeaway, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 bg-white/3 border border-white/7 rounded-xl p-2.5">
                      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                        <svg width="7" height="7" fill="none" stroke="white" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-[var(--color-text-main)]/75 text-xs leading-normal">{takeaway}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="relative z-10 w-full flex flex-col gap-2 mt-6">
              <div className="flex gap-2">
                <button
                  onClick={() => handleNavigate(-1)}
                  className="flex-1 py-3 rounded-xl bg-white/6 hover:bg-white/12 border border-white/12 text-[var(--color-text-main)] font-bold text-xs cursor-pointer focus:outline-none transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={() => alert('SCORM package export started!')}
                  className="flex-[2] py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-black text-xs uppercase tracking-wider cursor-pointer border-none transition-all shadow-[0_4px_16px_var(--color-accent-translucent)]"
                >
                  {currentSlide.cta || 'Export Course'}
                </button>
              </div>
            </div>

          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center text-center h-full text-slate-400">
            <p className="text-xs">Unsupported Slide Type: {currentSlide.type}</p>
          </div>
        );
    }
  };

  const isCover = currentSlide.type === 'cover';
  const isSummary = currentSlide.type === 'summary';
  const isQuiz = currentSlide.type === 'quiz';
  const isModuleTitle = currentSlide.type === 'module-title';

  const showBottomNav = !isCover && !isSummary;
  const showNextButton = showBottomNav && !isQuiz && !isModuleTitle;

  return (
    <section className="no-scrollbar relative overflow-y-auto h-full w-full py-8 flex flex-col items-center justify-center" style={{ background: '#0f172a' }}>
      
      {/* Phone Frame */}
      <div className="relative flex flex-col overflow-hidden" 
        style={{
          height: isPreview ? 'min(900px, 90vh)' : 'min(850px, 85vh)',
          width: isPreview ? 'calc(min(900px, 90vh) * (9/16))' : 'calc(min(850px, 85vh) * (9/16))',
          maxWidth: '100%',
          background: 'var(--color-surface)',
          borderRadius: '40px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          border: '8px solid #334155',
          margin: 'auto',
          flexShrink: 0
        }}
      >
        {/* Progress Indicator Dots */}
        <div className="px-5 pt-4 pb-2 flex gap-1.5 z-20 shrink-0 overflow-x-auto no-scrollbar items-center">
          {slides.map((_, idx) => {
            const isActive = idx === currentIdx;
            const isCompleted = idx < currentIdx;
            return (
              <div
                key={idx}
                className="h-1.5 transition-all duration-300 rounded-full shrink-0"
                style={{
                  width: isActive ? '1.25rem' : '0.4rem',
                  background: isActive ? 'var(--color-accent)' : isCompleted ? 'white' : 'rgba(255,255,255,0.2)'
                }}
              />
            );
          })}
        </div>

        {/* Top bar inside mobile */}
        <div className="px-5 py-2 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[var(--color-text-main)] border-none cursor-pointer transition-all"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-[var(--color-text-main)] font-extrabold text-[10px] uppercase tracking-wider opacity-80 truncate max-w-[160px]">
              {courseTitle}
            </span>
          </div>
          <span className="text-[10px] font-black text-[var(--color-text-main)]/40 tracking-widest shrink-0">
            {currentIdx + 1} / {slides.length}
          </span>
        </div>

        {/* Slide viewport */}
        <div className="flex-grow flex items-stretch justify-stretch z-10 overflow-hidden relative">
          <div className="w-full h-full relative">
            {renderSlideContent()}
          </div>
        </div>

        {/* Bottom Navigation (Thumb Zone) — reacts to slide state */}
        {showBottomNav && (
          <div
            className="px-5 py-5 flex items-center gap-4 z-20 shrink-0 transition-all justify-center"
            style={{
              background: 'linear-gradient(to top, var(--color-primary), transparent)'
            }}
          >
            {/* Prev Button */}
            <button
              onClick={() => handleNavigate(-1)}
              style={{ opacity: currentIdx === 0 ? 0.2 : 1 }}
              className="w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-[var(--color-text-main)] text-xl flex items-center justify-center cursor-pointer transition-all focus:outline-none"
            >
              ‹
            </button>

            {/* Next Button — hidden for quiz or module title */}
            {showNextButton && (
              <button
                onClick={() => handleNavigate(1)}
                className="flex-grow h-12 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-blue-900 text-xs font-black uppercase tracking-widest flex items-center justify-center cursor-pointer transition-all shadow-[0_8px_24px_var(--color-accent-translucent)] border-none focus:outline-none"
              >
                {currentIdx === slides.length - 1 ? 'Finish ✓' : 'Next ›'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer action buttons below phone */}
      <div className="mt-4 flex gap-3 shrink-0">
        <button
          onClick={() => alert('Embedded code copied to clipboard!')}
          className="px-5 py-2.5 rounded-full bg-white/8 hover:bg-white/12 border border-white/15 text-[var(--color-text-main)] text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>Share &amp; Embed</span>
        </button>
      </div>

    </section>
  );
}
