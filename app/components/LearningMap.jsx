'use client';

import React, { useState, useEffect } from 'react';

const FORMAT_COLORS = {
  'Concept Card': 'var(--color-accent)',
  'Concept Video': '#ec4899',
  'Interaction Card': '#3b82f6',
  'Scenario Card': '#10b981',
  'Knowledge Check': '#f59e0b',
  'Animated Video': '#ec4899',
  'Static Screen': 'var(--color-accent)',
  'Interactive Quiz': '#f59e0b'
};

export default function LearningMap({ wizardData, onBack, onComplete }) {
  const [customer, setCustomer] = useState('');
  const [project, setProject] = useState('');
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  
  // Drag and drop states
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  // Initial load of modules from API or fallback
  useEffect(() => {
    const fetchLearningMap = async () => {
      setIsLoading(true);
      setLoadingText('Generating Learning Map…');
      try {
        const res = await fetch('/api/generate-learning-map', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: wizardData?.content || '',
            learner: wizardData?.learner || '',
            gap: wizardData?.gap || '',
            outcome: wizardData?.outcome || '',
            strategy: wizardData?.strategy || 'Microlearning',
            smeAnswers: [],
            aiGenerateContent: false,
            structuredFacts: wizardData?.structuredFacts
          })
        });
        const data = await res.json();
        if (data.modules && Array.isArray(data.modules)) {
          setModules(data.modules);
        } else {
          throw new Error('Invalid modules');
        }
      } catch (err) {
        console.warn('Failed to load learning map:', err);
        // Fallback learning map
        setModules([
          {
            title: 'Mobile Learning Sequence',
            story: 'Structure optimized for mobile retention.',
            rows: [
              { topic: 'The Hook', ref: 'Source', time: 0.5, format: 'Concept Card', screen: 'Introduction to the core concept.' },
              { topic: 'Key Application', ref: 'Source', time: 1, format: 'Interaction Card', screen: 'Practical application.' },
              { topic: 'Final Check', ref: 'Source', time: 1, format: 'Knowledge Check', screen: 'Quick 1-question assessment.' }
            ]
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningMap();
  }, [wizardData]);

  // Calculations
  let cardCount = 0;
  let totalTime = 0;
  modules.forEach(mod => {
    (mod.rows || []).forEach(row => {
      cardCount++;
      totalTime += row.time || 0;
    });
  });

  const exportLearningMapCSV = () => {
    let csv = 'Module,Topic,Format,Time (min),Screen Description\n';
    const escVal = (s) => String(s || '').replace(/"/g, '""');
    modules.forEach((mod) => {
      (mod.rows || []).forEach(r => {
        csv += `"${escVal(mod.title)}","${escVal(r.topic)}","${escVal(r.format)}",${r.time},"${escVal(r.screen)}"\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learning-map.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDragStart = (e, flatIdx) => {
    setDraggedItem(flatIdx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e, flatIdx) => {
    e.preventDefault();
    setDragOverItem(flatIdx);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, destIdx) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === destIdx) {
      setDragOverItem(null);
      setDraggedItem(null);
      return;
    }
    
    // Flatten
    const modSizes = modules.map(m => (m.rows || []).length);
    const flat = [];
    modules.forEach(mod => (mod.rows || []).forEach(row => flat.push(row)));
    
    // Reorder
    const [moved] = flat.splice(draggedItem, 1);
    flat.splice(destIdx, 0, moved);
    
    // Reconstruct
    let idx = 0;
    const newModules = modules.map((mod, mi) => {
      const size = modSizes[mi];
      const slice = flat.slice(idx, idx + size);
      idx += size;
      return { ...mod, rows: slice };
    });
    
    setModules(newModules);
    setDragOverItem(null);
    setDraggedItem(null);
  };

  const handleUpdateField = (modIdx, rowIdx, field, val) => {
    setModules(prev => {
      const updated = [...prev];
      if (updated[modIdx] && updated[modIdx].rows[rowIdx]) {
        updated[modIdx].rows[rowIdx] = { ...updated[modIdx].rows[rowIdx], [field]: val };
      }
      return updated;
    });
  };

  const handleRemoveCard = (modIdx, rowIdx) => {
    setModules(prev => {
      const updated = [...prev];
      if (updated[modIdx]) {
        updated[modIdx].rows = updated[modIdx].rows.filter((_, idx) => idx !== rowIdx);
      }
      return updated;
    });
  };

  const handleAddCard = () => {
    setModules(prev => {
      const updated = [...prev];
      if (updated.length === 0) {
        updated.push({ title: 'New Module', story: '', rows: [] });
      }
      const lastModIdx = updated.length - 1;
      updated[lastModIdx].rows.push({
        topic: 'New Slide Topic',
        ref: 'Custom',
        time: 1.0,
        format: 'Concept Card',
        screen: 'Write what this slide should cover here.'
      });
      return updated;
    });
  };

  const handleAskAI = async (modIdx, rowIdx) => {
    const card = modules[modIdx]?.rows[rowIdx];
    if (!card) return;
    const promptText = prompt(`How would you like AI to rewrite this module?\n(e.g. "Explain in detail by covering LLM transformers")`);
    if (!promptText) return;

    setIsLoading(true);
    setLoadingText('AI is rewriting card...');
    try {
      const res = await fetch('/api/rewrite-map-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card, instruction: promptText })
      });
      const data = await res.json();
      if (data.card) {
        handleUpdateField(modIdx, rowIdx, 'topic', data.card.topic);
        handleUpdateField(modIdx, rowIdx, 'screen', data.card.screen);
      }
    } catch (err) {
      alert('Failed to rewrite card.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuildCourse = async () => {
    // 1. Open the tab synchronously right away to bypass the browser's popup blocker
    const previewWindow = window.open('/loading-preview', '_blank'); 

    setIsLoading(true);
    setLoadingText('Building your course…');
    const title = (project || 'My Course').trim();
    const learnerText = (wizardData?.learner || 'professionals').trim();
    const gapText = (wizardData?.gap || '').trim();
    const outcomeText = (wizardData?.outcome || '').trim();
    const strat = wizardData?.strategy || 'Microlearning';

    try {
      const res = await fetch('/api/build-microlearning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle: `${strat} · ${learnerText}`,
          objectives: [
            gapText ? `Close the gap: ${gapText}` : 'Apply key concepts on the job',
            outcomeText ? `Achieve: ${outcomeText}` : 'Improve performance outcomes',
            `Strategy: ${strat}`
          ],
          modules,
          learner: learnerText,
          gap: gapText,
          outcome: outcomeText,
          bloomLevel: wizardData?.bloomLevel || 'Apply / Analyse',
          modality: wizardData?.modality || 'eLearning',
          strategy: strat,
          structuredFacts: wizardData?.structuredFacts
        })
      });
      const slides = await res.json();
      if (!res.ok || slides.error) {
        throw new Error(slides.error || 'Failed to generate course.');
      }
      localStorage.setItem('instrux_preview_data', JSON.stringify({ slides, title }));
      
      // 2. Redirect the already-opened tab to the actual preview page
      if (previewWindow) previewWindow.location.href = '/preview';
      
      // Still call onComplete so the parent knows we finished
      onComplete({ slides, title });
    } catch (err) {
      console.warn('buildMicrolearningCourse error, using fallback:', err);
      // Fallback slide deck generator exactly matching index.html line 4697
      const fallbackSlides = [];
      const totalMin = modules.reduce((s, m) => s + (m.rows || []).reduce((sr, r) => sr + (r.time || 1), 0), 0);
      fallbackSlides.push({ type: 'cover', courseTitle: title, subtitle: `Designed for ${learnerText}`, totalModules: modules.length, estimatedTime: `${totalMin} min` });
      
      const objItems = modules.map(m => `Master: ${m.title.replace(/Module \d+\s*[\u2014\-]\s*/, '')}`);
      fallbackSlides.push({ type: 'objectives', heading: 'What you will master', items: objItems.slice(0, 3) });
      
      let quizNum = 0;
      modules.forEach((mod, mi) => {
        fallbackSlides.push({ type: 'module-title', moduleNum: mi + 1, title: mod.title, story: mod.story || "Let's explore the key concepts in this module." });
        (mod.rows || []).slice(0, 3).forEach(row => {
          fallbackSlides.push({
            type: 'content',
            heading: row.topic,
            subtitle: null,
            body: row.screen || 'Explore the key principles and apply them to real workplace situations.',
            infoBox: null,
            aiNote: `Focus on applying this in your daily workflow for maximum impact.`,
            actions: [{ label: 'KEY POINT', detail: row.screen || 'Apply this concept in context.' }]
          });
        });
        const flipCards = (mod.rows || []).slice(0, 3).map(r => ({ front: r.topic, back: r.screen || 'Core concept' }));
        while (flipCards.length < 3) flipCards.push({ front: 'Key Concept', back: 'Apply this in your work context.' });
        fallbackSlides.push({ type: 'flipcards', heading: 'Consolidate your learning', cards: flipCards });
        quizNum++;
        fallbackSlides.push({
          type: 'quiz', challengeNum: quizNum,
          question: `Which approach best reflects the principle from: ${mod.title.replace(/Module \d+\s*[\u2014\-]\s*/, '')}?`,
          instruction: 'Select the best answer',
          options: ['Apply systematically and review outcomes', 'Skip until it becomes urgent', 'Delegate without follow-up', 'Use a one-size-fits-all approach'],
          correctIndices: [0],
          explanation: 'Applying systematically while reviewing outcomes is the evidence-based best practice aligned with the ID methodology.'
        });
      });
      fallbackSlides.push({
        type: 'summary', heading: 'Course complete!',
        subheading: `You've completed ${title}`,
        takeaways: modules.slice(0, 3).map(m => `Mastered: ${m.title.replace(/Module \d+\s*[\u2014\-]\s*/, '')}`),
        cta: 'Export your course'
      });

      localStorage.setItem('instrux_preview_data', JSON.stringify({ slides: fallbackSlides, title }));
      
      // 2. Redirect the fallback data to the preview page
      if (previewWindow) previewWindow.location.href = '/preview';
      
      onComplete({ slides: fallbackSlides, title });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="no-scrollbar relative overflow-y-auto h-full w-full" style={{ background: 'var(--color-bg)' }}>
      <div className="relative z-10 w-full mx-auto px-6 lg:px-12 pt-8 pb-16">

        {/* Header */}
        <div className="mt-4 mb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 text-left">
          <div>
            <div className="inline-flex items-center px-3 py-1.5 rounded-full mb-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-main)]">Learning Map — Step 4 of 4</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
              Review &amp; confirm<br /><span style={{ color: 'var(--color-primary)' }}>your learning map.</span>
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={exportLearningMapCSV}
              className="w-full sm:w-auto flex justify-center items-center space-x-2 px-5 py-4 sm:py-3 rounded-[24px] sm:rounded-2xl font-bold text-[15px] sm:text-sm transition-all text-[var(--color-text-main)]"
              style={{ background: 'var(--color-surface)', border: '2px solid rgba(255,255,255,0.2)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              <span>Export .CSV</span>
            </button>
            <button
              onClick={handleBuildCourse}
              disabled={isLoading}
              className="w-full sm:w-auto justify-center flex items-center px-8 py-4 sm:py-3 rounded-[24px] sm:rounded-2xl font-black text-[16px] sm:text-sm text-[var(--color-on-accent)] shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-80"
              style={{
                background: 'var(--color-accent)',
                border: '2px solid rgba(0,0,0,0.15)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
              }}
            >
              {isLoading && (
                <svg className="w-4 h-4 animate-spin inline-block mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              <span>{isLoading ? 'Building your course…' : 'Build My Course →'}</span>
            </button>
          </div>
        </div>

        {/* Metadata row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 text-left">
          <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)' }}>
            <div className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-main)] mb-1">Customer</div>
            <input
              type="text"
              value={customer}
              onChange={e => setCustomer(e.target.value)}
              className="w-full text-sm font-bold text-[var(--color-text-main)] bg-transparent focus:outline-none"
              placeholder="Customer name"
              style={{ caretColor: 'var(--color-accent)' }}
            />
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)' }}>
            <div className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-main)] mb-1">Project</div>
            <input
              type="text"
              value={project}
              onChange={e => setProject(e.target.value)}
              className="w-full text-sm font-bold text-[var(--color-text-main)] bg-transparent focus:outline-none"
              placeholder="Course / project name"
              style={{ caretColor: 'var(--color-accent)' }}
            />
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)' }}>
            <div className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-main)] mb-1">Strategy</div>
            <div className="text-sm font-bold text-[var(--color-text-main)]">
              {wizardData?.strategy || 'Microlearning'}
            </div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)' }}>
            <div className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-main)] mb-1">Total Seat Time</div>
            <div className="text-sm font-bold text-[var(--color-text-main)]">
              {cardCount} Cards · {totalTime.toFixed(1)} Minutes
            </div>
          </div>
        </div>

        {/* Learning Map Grid */}
        <div className="mb-8 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(() => {
              let flatIdx = 0;
              let currentCardCount = 0;
              return modules.map((mod, modIdx) =>
                (mod.rows || []).map((row, rowIdx) => {
                  const fi = flatIdx++;
                  currentCardCount++;
                  const color = FORMAT_COLORS[row.format] || '#94a3b8';
                  const isDragging = draggedItem === fi;
                  const isOver = dragOverItem === fi;

                  return (
                    <div
                      key={`${modIdx}-${rowIdx}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, fi)}
                      onDragEnter={(e) => handleDragEnter(e, fi)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, fi)}
                      className={`relative flex flex-col gap-3 p-6 rounded-[24px] overflow-hidden cursor-move transition-all duration-200 ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'} ${isOver ? 'ring-2 ring-yellow-400 scale-105' : ''}`}
                      style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        minHeight: '220px'
                      }}
                    >
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: color }} />
                      
                      <div className="flex justify-center mb-1">
                        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="opacity-30">
                          <rect y="0" width="16" height="2" rx="1" fill="white"/>
                          <rect y="4" width="16" height="2" rx="1" fill="white"/>
                          <rect y="8" width="16" height="2" rx="1" fill="white"/>
                        </svg>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-[var(--color-text-main)]/40 uppercase tracking-widest">Card {currentCardCount}</span>
                        <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full"
                          style={{ color: color, background: `${color}20` }}>
                          {row.format}
                        </span>
                      </div>

                      <h4
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => handleUpdateField(modIdx, rowIdx, 'topic', e.target.innerText)}
                        className="text-[var(--color-text-main)] font-extrabold text-base leading-tight focus:outline-none mt-1"
                      >
                        {row.topic}
                      </h4>

                      <p
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => handleUpdateField(modIdx, rowIdx, 'screen', e.target.innerText)}
                        className="text-[var(--color-text-main)]/50 text-xs leading-relaxed focus:outline-none flex-1 mt-1"
                      >
                        {row.screen}
                      </p>

                      <div className="mt-auto pt-4 flex justify-between items-center border-t border-white/10 text-slate-500">
                        <span className="text-xs font-black" style={{ color }}>{row.time}m</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAskAI(modIdx, rowIdx)}
                            className="px-2 py-1 rounded-xl text-[9px] font-black text-yellow-400 bg-yellow-400/15 border-none cursor-pointer hover:bg-yellow-400/25 transition-all"
                          >
                            ✨ Ask AI
                          </button>
                          <button
                            onClick={() => handleRemoveCard(modIdx, rowIdx)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-red-500 bg-red-500/10 border-none cursor-pointer hover:bg-red-500/20 font-black"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              );
            })()}
          </div>
        </div>

        {/* Add New Card Button */}
        <button
          onClick={handleAddCard}
          className="w-full p-5 rounded-[20px] font-bold flex items-center justify-center space-x-2 mb-8 text-[var(--color-text-main)] focus:outline-none transition-all hover:bg-blue-900/10"
          style={{ border: '2px dashed var(--color-shadow)', background: 'rgba(30,58,138,0.08)' }}
        >
          <svg className="w-5 h-5 text-[var(--color-text-main)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-main)]">Add New Card</span>
        </button>

        {/* Footer Back Button */}
        <div className="text-left">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-4 sm:py-3 rounded-[24px] sm:rounded-2xl text-[15px] sm:text-sm font-bold text-[var(--color-text-main)] transition-all hover:opacity-90 focus:outline-none"
            style={{ background: 'rgba(30,58,138,0.8)' }}
          >
            ← Back to Strategy Selector
          </button>
        </div>

      </div>
    </section>
  );
}
