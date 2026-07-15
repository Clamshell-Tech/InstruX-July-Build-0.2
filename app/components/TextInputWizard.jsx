'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

const FILE_TYPE_COLORS = {
  pdf:  'rgba(239,68,68,0.35)',
  docx: 'rgba(59,130,246,0.35)',
  doc:  'rgba(59,130,246,0.35)',
  pptx: 'rgba(234,88,12,0.35)',
  ppt:  'rgba(234,88,12,0.35)',
  xlsx: 'rgba(22,163,74,0.35)',
  xls:  'rgba(22,163,74,0.35)',
  txt:  'rgba(100,116,139,0.35)',
  md:   'rgba(100,116,139,0.35)',
  csv:  'rgba(100,116,139,0.35)',
};

const BLOOM_LABELS = {
  remember: 'Remember',
  apply: 'Apply',
  evaluate: 'Evaluate'
};

const MODALITY_LABELS = {
  elearning: 'eLearning',
  ilt: 'ILT',
  blended: 'Blended',
  mobile: 'Mobile'
};

export default function TextInputWizard({ onComplete }) {
  const [file, setFile]               = useState(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pasteContent, setPasteContent] = useState('');

  // Upload states
  const [uploadPhase, setUploadPhase] = useState('idle'); // idle | reading | ready | error
  const [readingLabel, setReadingLabel] = useState('');
  const [readingPct, setReadingPct]   = useState(0);
  const [scanPhase, setScanPhase]     = useState(0);       // 0-2 cycles scan lines
  const [stats, setStats]             = useState(null);    // { pages, words, domain, truncated, extractLabel, hasImages, preview, text, images }
  const [extractError, setExtractError] = useState('');
  const [showContentModal, setShowContentModal] = useState(false);

  // Validation & AI status states
  const [errorMsg, setErrorMsg]       = useState('');   // validation hint below CTA
  const [aiStatus, setAiStatus]       = useState('ready'); // ready | analysing

  // Training Context Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [learner, setLearner]         = useState('');
  const [gap, setGap]                 = useState('');
  const [outcome, setOutcome]         = useState('');
  const [bloomLevel, setBloomLevel]   = useState('apply'); // remember | apply | evaluate
  const [selectedModality, setSelectedModality] = useState('elearning'); // elearning | ilt | blended | mobile

  // Refs
  const animRef          = useRef(null);
  const ctxBtnRef        = useRef(null);  // ref to Training Context button for outline flash
  const errorTimerRef    = useRef(null);

  // Clean up animation interval on unmount
  useEffect(() => {
    return () => {
      if (animRef.current) clearInterval(animRef.current);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) applyFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e) => { if (e.target.files?.[0]) applyFile(e.target.files[0]); };

  const clearUpload = (e) => {
    e.stopPropagation();
    if (animRef.current) clearInterval(animRef.current);
    setFile(null); setUploadPhase('idle'); setReadingLabel(''); setReadingPct(0);
    setStats(null); setExtractError('');
  };

  async function applyFile(selectedFile) {
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    setFile(selectedFile);
    setStats(null);
    setExtractError('');

    // Show selected state immediately
    const SUPPORTED = ['pdf','docx','doc','pptx','ppt','xlsx','xls','txt','md','csv'];
    if (!SUPPORTED.includes(ext)) {
      setUploadPhase('ready'); // just show as attached, no extraction
      return;
    }

    // Start reading animation
    setUploadPhase('reading');
    setReadingPct(0);
    const estPages = Math.max(5, Math.round(selectedFile.size / 51200));
    let simPage = 0;
    let animDone = false;

    if (animRef.current) clearInterval(animRef.current);
    animRef.current = setInterval(() => {
      if (animDone) return;
      simPage = Math.min(simPage + 1, estPages - 1);
      const pct = Math.min((simPage / estPages) * 92, 92);
      setReadingPct(pct);
      setReadingLabel(`Reading page ${simPage} of ~${estPages}…`);
      setScanPhase(p => (p + 1) % 3);
    }, 300);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res  = await fetch('/api/extract-file', { method: 'POST', body: formData });
      const data = await res.json();

      animDone = true;
      clearInterval(animRef.current);

      if (!res.ok) {
        setUploadPhase('error');
        setExtractError(data.error || 'Failed to extract file.');
        return;
      }

      // Snap to 100%
      setReadingPct(100);
      setReadingLabel(`Done! ${data.numpages} pages extracted.`);
      await new Promise(r => setTimeout(r, 500));

      // Build stats object
      const hasOcrText = (data.images || []).some(i => (i.ocrText || '').length >= 30);
      let extractLabel = 'Text extracted';
      if (hasOcrText && !data.text?.trim()) extractLabel = 'Text recovered via OCR';
      else if (ext === 'pdf')  extractLabel = 'PDF text extracted';
      else if (ext === 'docx') extractLabel = 'DOCX text extracted';
      else if (ext === 'pptx' || ext === 'ppt') extractLabel = 'PPTX slides extracted';
      else if (ext === 'xlsx' || ext === 'xls') extractLabel = 'Spreadsheet extracted';

      const preview = (data.text || '').trim().replace(/\s+/g, ' ').substring(0, 160);
      setStats({
        pages:       data.numpages,
        words:       data.words,
        domain:      data.domain || 'General',
        truncated:   data.truncated,
        extractLabel,
        isOcr:       hasOcrText && !data.text?.trim(),
        hasImages:   (data.images || []).length > 0,
        imageCount:  (data.images || []).length,
        preview:     preview.length > 20 ? preview + (data.text?.length > 160 ? '…' : '') : '',
        text:        data.text,
        images:      data.images || []
      });
      // Deliberately NOT clearing pasteContent here so users can type instructions + upload a PDF without it erasing.
      setUploadPhase('ready');

    } catch (err) {
      animDone = true;
      if (animRef.current) clearInterval(animRef.current);
      setUploadPhase('error');
      setExtractError(err.message || 'Network error during extraction.');
    }
  }

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const textareaRef = useRef(null);
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 400)}px`;
    }
  }, [pasteContent]);

  // Global drag overlay
  useEffect(() => {
    const handleDragOver = (e) => {
      e.preventDefault();
      if (!isGlobalDragging) setIsGlobalDragging(true);
    };
    const handleDragLeave = (e) => {
      e.preventDefault();
      if (e.clientX === 0 || e.clientY === 0) setIsGlobalDragging(false);
    };
    const handleDrop = (e) => {
      e.preventDefault();
      setIsGlobalDragging(false);
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        applyFile(e.dataTransfer.files[0]);
      }
    };
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [isGlobalDragging]);

  const [typeaheadSuggestions, setTypeaheadSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const suggestionTimeout = useRef(null);

  useEffect(() => {
    const text = pasteContent.trim();
    // Only show suggestions for short, fresh typing
    if (!text || text.length > 25) {
      setTypeaheadSuggestions([]);
      return;
    }

    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);

    suggestionTimeout.current = setTimeout(async () => {
      setIsFetchingSuggestions(true);
      try {
        const res = await fetch('/api/autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: text })
        });
        const data = await res.json();
        if (data.suggestions) {
          setTypeaheadSuggestions(data.suggestions);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 400); // 400ms debounce
    
    return () => clearTimeout(suggestionTimeout.current);
  }, [pasteContent]);

  // Auto-detect training context from uploaded files or scraped URLs
  const [isDetectingContext, setIsDetectingContext] = useState(false);
  useEffect(() => {
    const textToAnalyze = stats?.text;
    if (textToAnalyze && textToAnalyze.length > 200 && !learner && !gap && !outcome) {
      const detectContext = async () => {
        setIsDetectingContext(true);
        try {
          const res = await fetch('/api/detect-context', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textToAnalyze })
          });
          const data = await res.json();
          if (data && !data.error) {
            setLearner(data.learner || '');
            setGap(data.gap || '');
            setOutcome(data.outcome || '');
          }
        } catch (err) {
          console.error("Auto-detect context failed:", err);
        }
        setIsDetectingContext(false);
      };
      detectContext();
    }
  }, [stats]);

  const handleEnhance = async () => {
    if (!pasteContent.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setErrorMsg('');
    setAiSuggestion(null);
    try {
      const res = await fetch('/api/validate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: pasteContent, learner, outcome })
      });
      const data = await res.json();
      if (data.status === 'gibberish') {
        setErrorMsg(data.feedback || "I couldn't understand that instruction.");
      } else if (data.suggestion && data.suggestion.trim() !== pasteContent.trim()) {
        setAiSuggestion(data.suggestion);
      }
    } catch (e) {
      console.error(e);
    }
    setIsEnhancing(false);
  };

  const handleAnalyzeClick = async () => {
    let fileText = stats?.text || '';
    let userText = pasteContent.trim();
    
    // Web Scraper Logic - Check if user just pasted a URL
    const urlMatch = userText.match(/^(https?:\/\/[^\s]+)$/i);
    if (urlMatch && !fileText) {
      setUploadPhase('reading');
      setReadingLabel('Scraping webpage...');
      setReadingPct(50);
      try {
        const scrapeRes = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlMatch[0] })
        });
        const scrapeData = await scrapeRes.json();
        if (scrapeData.error) throw new Error(scrapeData.error);
        
        fileText = scrapeData.text;
        setStats({
          text: fileText,
          domain: new URL(urlMatch[0]).hostname,
          words: fileText.split(/\s+/).length,
          pages: Math.ceil(fileText.length / 3000),
          isOcr: false,
          extractLabel: 'Web Scrape'
        });
        setUploadPhase('ready');
        setReadingPct(100);
        userText = ''; // Clear the URL from userText since we absorbed it into fileText
      } catch (err) {
        setUploadPhase('error');
        setExtractError(err.message || 'Failed to scrape webpage.');
        return;
      }
    }

    const content = [fileText, userText].filter(Boolean).join('\n\n--- USER INSTRUCTIONS ---\n\n');

    // Validation 1 — no content at all
    if (!content) {
      setErrorMsg('Please paste your source material first.');
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => setErrorMsg(''), 5000);
      return;
    }

    // Validation 2 — Content too short
    if (content.length < 150) {
      setShowContentModal(true);
      return;
    }

    // Validation 3 — no Training Context set
    const hasContext = learner.trim().length > 0 || gap.trim().length > 0 || outcome.trim().length > 0;
    if (!hasContext) {
      setErrorMsg('Tip: add Training Context (learner, gap, outcome) for higher quality SME questions.');
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => setErrorMsg(''), 5000);
      if (ctxBtnRef.current) {
        ctxBtnRef.current.style.outline = '2px solid var(--color-accent)';
        ctxBtnRef.current.style.outlineOffset = '3px';
        setTimeout(() => {
          if (ctxBtnRef.current) {
            ctxBtnRef.current.style.outline = '';
            ctxBtnRef.current.style.outlineOffset = '';
          }
        }, 3500);
      }
    } else {
      setErrorMsg('');
    }

    await proceedWithAnalysis(content);
  };

  const proceedWithAnalysis = async (content) => {
    setAiStatus('analysing');
    setIsAnalyzing(true);
    setShowContentModal(false);

    try {
      let structuredFacts = null;
      try {
        const analyseRes = await fetch('/api/analyse-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: content,
            images: stats?.images || [],
            learner,
            gap,
            outcome
          })
        });
        if (analyseRes.ok) {
          structuredFacts = await analyseRes.json();
        }
      } catch (e) {
        console.warn('analyse-content skipped/failed:', e.message);
      }

      const res = await fetch('/api/generate-sme-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          learner,
          gap,
          outcome,
          bloomLevel,
          modality: selectedModality,
          structuredFacts
        })
      });

      let questions = [];
      if (!res.ok) {
        console.warn('generate-sme-questions failed, using fallback dummy questions.');
        questions = [
          { id: 1, question: "What are the most common mistakes beginners make?", context: "Gap detected: Practical application" },
          { id: 2, question: "Are there any specific edge cases or exceptions to these rules?", context: "Gap detected: Edge cases" },
          { id: 3, question: "How is this knowledge typically tested or validated on the job?", context: "Gap detected: Assessment" },
          { id: 4, question: "What is the business impact if this procedure is performed incorrectly?", context: "Gap detected: Business impact" }
        ];
      } else {
        const data = await res.json();
        questions = data.questions || [];
      }

      setAiStatus('ready');
      setIsAnalyzing(false);
      onComplete({
        content,
        structuredFacts,
        questions,
        learner,
        gap,
        outcome,
        bloomLevel,
        modality: selectedModality
      });

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Could not reach AI server. Make sure the backend is running.');
      setAiStatus('ready');
      setIsAnalyzing(false);
    }
  };

  const handleAiGenerateBypass = () => {
    const fileText = stats?.text || '';
    const userText = pasteContent.trim();
    const content = [fileText, userText].filter(Boolean).join('\n\n--- USER INSTRUCTIONS ---\n\n');
    setShowContentModal(false);
    // Skip SME questions completely by passing isInstantAI = true
    onComplete({
      content,
      learner: learner || 'General Audience',
      gap,
      outcome,
      bloomLevel,
      modality: selectedModality,
      structuredFacts: null,
      isInstantAI: true
    });
  };

  const ext = file?.name.split('.').pop().toLowerCase() || '';

  // Helpers to check if context inputs are set
  const pillLabel = (val, defaultVal) => {
    if (!val) return defaultVal;
    return val.length > 14 ? val.slice(0, 13) + '…' : val;
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full relative overflow-y-auto lg:overflow-y-hidden">
      {/* Global Drag Overlay */}
      {isGlobalDragging && (
        <div 
          className="fixed inset-0 z-[9999] flex flex-col items-end justify-center pr-32 bg-blue-900/80 backdrop-blur-md border-[10px] border-yellow-400 m-4 rounded-[40px] pointer-events-none transition-all duration-300"
        >
          <div className="flex flex-col items-end text-right">
            <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-[0_0_100px_rgba(255,204,49,0.8)]">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <h2 className="text-5xl font-black text-[var(--color-text-main)] tracking-tight drop-shadow-xl mb-4">Drop it like it's hot.</h2>
            <p className="text-xl font-bold text-[var(--color-primary)]">We'll magically read your file and build a course.</p>
          </div>
        </div>
      )}

      {/* ── LEFT PANEL — Navy ── */}
      <div
        className="hidden lg:flex no-scrollbar flex-col justify-between p-10 w-[38%] shrink-0 h-full"
        style={{ background: 'var(--color-surface)', overflowY: 'auto' }}
      >
        <div className="flex-1">
          {/* Brand */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-accent-translucent)', border: '2px solid var(--color-accent)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="var(--color-accent)" />
                <path d="M19 16L19.9 18.1L22 19L19.9 19.9L19 22L18.1 19.9L16 19L18.1 18.1L19 16Z" fill="var(--color-accent)" opacity="0.7" />
                <path d="M5 3L5.7 4.8L7.5 5.5L5.7 6.2L5 8L4.3 6.2L2.5 5.5L4.3 4.8L5 3Z" fill="var(--color-accent)" opacity="0.5" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-main)]">ID Design Studio</p>
              <p className="text-[13px] font-black text-[var(--color-text-main)] leading-tight">Your training brief,<br />built into a course.</p>
            </div>
          </div>

          {/* Guide (no file) */}
          {!file && (
            <div>
              <div className="rounded-2xl rounded-tl-none px-4 py-3 mb-5"
                style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
                <p className="text-[12px] font-medium text-[var(--color-text-main)] leading-relaxed">
                  Tell me about your training need. I'll map the gap, suggest a strategy, and generate expert SME questions —{' '}
                  <span style={{ color: 'var(--color-accent)', fontWeight: 800 }}>in under 60 seconds.</span>
                </p>
              </div>
              <div className="hidden lg:block">
                <p className="text-[9px] font-black uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-muted)' }}>What happens next</p>
              <div className="relative">
                <div className="absolute left-[10px] top-6 bottom-6 w-px"
                  style={{ background: 'linear-gradient(to bottom, rgba(255,204,49,0.4), rgba(255,204,49,0.1))' }} />
                <div className="space-y-0">
                  <div className="flex items-start space-x-4 pb-5 relative">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 z-10"
                      style={{ background: 'var(--color-accent)', color: 'var(--color-on-accent)', boxShadow: '0 0 12px var(--color-accent-translucent)' }}>1</div>
                    <div className="rounded-xl p-3 flex-1" style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
                      <p className="text-[11px] font-black text-[var(--color-text-main)] mb-0.5">Gap &amp; SME Analysis</p>
                      <p className="text-[10px] leading-snug" style={{ color: 'var(--color-text-muted)' }}>AI reads your source and finds knowledge gaps</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 pb-5 relative">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 z-10"
                      style={{ background: 'var(--color-accent-translucent)', color: 'var(--color-accent)', border: '1.5px solid var(--color-accent-translucent)' }}>2</div>
                    <div className="rounded-xl p-3 flex-1" style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-overlay)' }}>
                      <p className="text-[11px] font-black text-[var(--color-text-main)] mb-0.5">SME Questions</p>
                      <p className="text-[10px] leading-snug" style={{ color: 'var(--color-text-muted)' }}>6 expert questions to fill what AI can't know</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 relative">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 z-10"
                      style={{ background: 'var(--color-accent-translucent)', color: 'rgba(255,204,49,0.6)', border: '1.5px solid var(--color-accent-translucent)' }}>3</div>
                    <div className="rounded-xl p-3 flex-1" style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
                      <p className="text-[11px] font-black text-[var(--color-text-main)] mb-0.5">Learning Strategy</p>
                      <p className="text-[10px] leading-snug" style={{ color: 'var(--color-text-muted)' }}>Microlearning, Scenario-Based, or Case Study</p>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Document loaded stats (after successful extraction) */}
          {file && uploadPhase === 'ready' && stats && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Document loaded</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="rounded-2xl p-3" style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
                  <p className="text-xl font-black text-[var(--color-text-main)] leading-none mb-0.5">{stats.pages}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(165,180,252,0.7)' }}>Pages</p>
                </div>
                <div className="rounded-2xl p-3" style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
                  <p className="text-xl font-black text-[var(--color-text-main)] leading-none mb-0.5">{stats.words >= 1000 ? (stats.words/1000).toFixed(1)+'k' : stats.words}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(110,231,183,0.7)' }}>Words</p>
                </div>
                <div className="rounded-2xl p-3" style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
                  <p className="text-[11px] font-black text-[var(--color-text-main)] leading-none mb-0.5 truncate">{stats.domain}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(252,211,77,0.7)' }}>Domain</p>
                </div>
                <div className="rounded-2xl p-3" style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
                  <p className="text-xl font-black text-[var(--color-text-main)] leading-none mb-0.5">{stats.imageCount ?? 0}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(249,168,212,0.7)' }}>Images</p>
                </div>
              </div>
              <div className="rounded-2xl px-4 py-3 flex items-center space-x-3"
                style={{ background: 'rgba(255,204,49,0.12)', border: '1px solid rgba(255,204,49,0.25)' }}>
                <span className="text-base shrink-0">✦</span>
                <p className="text-[11px] font-bold leading-snug" style={{ color: 'var(--color-text-main)' }}>
                  Click <span style={{ color: 'var(--color-accent)', fontWeight: 900 }}>Analyse My Content</span> to extract knowledge gaps
                </p>
              </div>
            </div>
          )}

          {/* Reading / Error state on left */}
          {file && uploadPhase === 'reading' && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Reading document...</p>
              <div className="rounded-2xl p-4" style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
                <div className="w-full rounded-full overflow-hidden mb-2" style={{ height: '3px', background: 'var(--color-border)' }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${readingPct}%`, background: 'var(--color-accent)' }} />
                </div>
                <p className="text-[10px] font-bold text-[var(--color-text-main)] animate-pulse">{readingLabel || 'Starting...'}</p>
              </div>
            </div>
          )}

          {file && uploadPhase === 'error' && (
            <div className="rounded-2xl p-4" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p className="text-[11px] font-bold text-red-300">⚠ {extractError}</p>
            </div>
          )}
        </div>

        {/* AI Status — reacts to analysing state, matching original */}
        <div className="flex items-center space-x-2 mt-6 shrink-0">
          <span className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${
            aiStatus === 'analysing' ? 'bg-yellow-400' : 'bg-green-400'
          }`}></span>
          <span className="text-[10px] font-black text-[var(--color-text-main)] uppercase tracking-wide">
            {aiStatus === 'analysing' ? 'InstruX AI · Analysing.' : 'InstruX AI · Ready'}
          </span>
        </div>
      </div>

      {/* ── RIGHT PANEL — Yellow ── */}
      <div className="no-scrollbar flex flex-col justify-between px-4 py-6 lg:px-10 lg:py-6 flex-1 h-full pb-8 lg:pb-6"
        style={{ background: 'var(--color-bg)', overflowY: 'auto' }}>
        <div className="space-y-3 w-full">

          {/* ① Source Material */}
          <div className="rounded-[20px] p-4" style={{ background: 'var(--color-surface)' }}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black" style={{ background: 'var(--color-accent)', color: 'var(--color-on-accent)' }}>1</div>
                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-accent)]">Source Material</label>
              </div>
              <button 
                onClick={handleEnhance}
                disabled={isEnhancing || !pasteContent.trim()}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed  hover:brightness-110" style={{ background: "var(--color-accent)", color: "var(--color-on-accent)" }}
              >
                <span>{isEnhancing ? 'Enhancing...' : '✨ Enhance'}</span>
              </button>
            </div>
            
            <div className="flex justify-between items-end mb-2">
              <span className="text-[9px] font-medium text-[var(--color-text-muted)]">paste notes, transcript, URL, or drop a file</span>
              <div className="flex items-center space-x-2">
                <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--color-text-main)]">Content Richness</span>
                <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                  <div className="h-full transition-all duration-500 rounded-full" 
                       style={{ 
                         width: `${Math.min(100, ((stats?.text?.length || 0) + pasteContent.length) / 30)}%`, 
                         background: (((stats?.text?.length || 0) + pasteContent.length) > 1500) ? '#4ade80' : (((stats?.text?.length || 0) + pasteContent.length) > 300) ? 'var(--color-accent)' : '#ef4444'
                       }}>
                  </div>
                </div>
              </div>
            </div>

            <textarea 
              ref={textareaRef}
              value={pasteContent} 
              onChange={e => { setPasteContent(e.target.value); if(aiSuggestion) setAiSuggestion(null); }}
              placeholder={uploadPhase === 'reading' ? 'Extracting content from file…' : uploadPhase === 'ready' && file ? '✓ File loaded! You can add extra instructions here…' : 'Paste your raw notes, SME transcript, URL, or training brief...'}
              readOnly={uploadPhase === 'reading'}
              className="w-full rounded-xl p-3 text-sm font-medium resize-none focus:outline-none leading-relaxed mb-2 transition-all duration-200"
              style={{ background: 'var(--color-border)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)', minHeight: '100px', overflow: 'hidden' }}
            />

            {aiSuggestion && (
              <div 
                className="mb-4 p-3 rounded-xl cursor-pointer transition-all hover:bg-yellow-400/20 group relative overflow-hidden"
                style={{ background: 'rgba(255,204,49,0.1)', border: '1px solid var(--color-accent-translucent)' }}
                onClick={() => {
                  setPasteContent(aiSuggestion);
                  setAiSuggestion(null);
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/0 via-yellow-300/10 to-yellow-300/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--color-accent)' }}>
                    <span className="animate-pulse">✨</span> AI Suggested Expansion
                  </span>
                  <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-accent)' }}>Click to apply</span>
                </div>
                <p className="text-xs text-[var(--color-text-main)]/90 leading-relaxed italic pr-4">"{aiSuggestion}"</p>
              </div>
            )}

            {/* Real-time typing suggestions */}
            {typeaheadSuggestions.length > 0 && !aiSuggestion && (
              <div className="mb-4 flex flex-wrap gap-2 items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-main)]">Suggestions</span>
                {typeaheadSuggestions.map(suggestion => (
                  <button 
                    key={suggestion}
                    onClick={() => setPasteContent(suggestion)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-[var(--color-text-main)] hover:bg-white/20" 
                    style={{ background: 'var(--color-border)', border: '1px solid var(--color-border)' }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Upload Dropzone */}
            <input type="file" id="file-upload-input" className="hidden" onChange={handleFileChange} />
            <div
              className={`mt-1 transition-all rounded-[20px] border-2 border-dashed
                ${uploadPhase === 'idle' ? 'cursor-pointer p-6 flex flex-col items-center justify-center' : 'p-3'} 
                ${isDragging ? 'border-yellow-400 bg-yellow-400/10 scale-[1.02]' : 'border-white/20 bg-white/5 hover:bg-white/10'}`}
              onClick={() => uploadPhase === 'idle' && document.getElementById('file-upload-input').click()}
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            >
              {/* IDLE — no file */}
              {uploadPhase === 'idle' && (
                <div className="px-3 py-2 flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--color-border)' }}>
                    <svg className="w-3 h-3 text-[var(--color-text-main)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <p className="text-[11px] font-bold text-[var(--color-text-main)] flex-1">Drop file, or <span style={{ color: 'var(--color-accent)' }}>browse</span></p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {[['PDF','rgba(239,68,68,0.25)'],['DOCX','rgba(59,130,246,0.25)'],['PPTX','rgba(234,88,12,0.25)'],['XLS','rgba(22,163,74,0.25)'],['TXT','rgba(100,116,139,0.25)']].map(([e,bg]) => (
                      <span key={e} className="px-1.5 py-0.5 rounded text-[7px] font-black text-[var(--color-text-main)] uppercase" style={{ background: bg }}>{e}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* READING — animated progress bar */}
              {uploadPhase === 'reading' && file && (
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-black text-[var(--color-text-main)] shrink-0"
                        style={{ background: FILE_TYPE_COLORS[ext] || 'rgba(100,116,139,0.35)' }}>
                        {ext.toUpperCase().slice(0,4)}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[var(--color-text-main)] leading-none">{file.name}</p>
                        <p className="text-[8px] text-[var(--color-text-main)]">{(file.size/1024/1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-bold animate-pulse" style={{ color: 'var(--color-accent)' }}>Extracting text...</span>
                  </div>
                  {/* Animated progress bar */}
                  <div className="mt-2 space-y-1">
                    <div className="w-full rounded-full overflow-hidden" style={{ height:'3px', background:'var(--color-border)' }}>
                      <div className="h-full rounded-full transition-all duration-300" style={{ width:`${readingPct}%`, background:'var(--color-accent)' }} />
                    </div>
                    {/* 3 scan lines */}
                    <div className="flex gap-1 mt-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="h-1.5 rounded flex-1 overflow-hidden" style={{ background:'var(--color-overlay)' }}>
                          <div className="h-full w-full transition-transform duration-500"
                            style={{ background:`rgba(255,204,49,${0.4 - i*0.1})`, transform: scanPhase % 3 === i ? 'translateX(0)' : 'translateX(-100%)' }} />
                        </div>
                      ))}
                    </div>
                    <p className="text-[7px] font-bold text-[var(--color-text-main)]">{readingLabel}</p>
                  </div>
                </div>
              )}

              {/* READY — file loaded successfully */}
              {(uploadPhase === 'ready' || uploadPhase === 'error') && file && (
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-black text-[var(--color-text-main)] shrink-0"
                        style={{ background: FILE_TYPE_COLORS[ext] || 'rgba(100,116,139,0.35)' }}>
                        {ext.toUpperCase().slice(0,4)}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[var(--color-text-main)] leading-none">{file.name}</p>
                        <p className="text-[8px] text-[var(--color-text-main)]">
                          {(file.size/1024/1024).toFixed(2)} MB
                          {stats?.truncated ? ' · truncated' : uploadPhase === 'ready' ? ' ✓' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-1.5 h-1.5 rounded-full inline-block shrink-0 ${uploadPhase === 'error' ? 'bg-red-400' : 'bg-green-400'}`}></span>
                      <span className={`text-[8px] font-bold ${uploadPhase === 'error' ? 'text-red-300' : 'text-green-300'}`}>{uploadPhase === 'error' ? 'Error' : 'Ready'}</span>
                      <button onClick={clearUpload} className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] text-[var(--color-text-main)] hover:text-[var(--color-text-main)] transition-all ml-1" style={{ background: 'var(--color-border)' }}>✕</button>
                    </div>
                  </div>

                  {/* Extraction stats card — shown after successful read */}
                  {uploadPhase === 'ready' && stats && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Extract method badge */}
                        <div className="flex items-center gap-1.5 rounded-lg px-2 py-1"
                          style={{ background: stats.isOcr ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)', border: `1px solid ${stats.isOcr ? 'rgba(251,191,36,0.25)' : 'rgba(52,211,153,0.25)'}` }}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: stats.isOcr ? '#fbbf24' : '#34d399' }}></span>
                          <span className="text-[10px] font-black" style={{ color: stats.isOcr ? '#fbbf24' : '#34d399' }}>{stats.extractLabel}</span>
                        </div>
                        {/* Truncated badge */}
                        {stats.truncated && (
                          <div className="flex items-center gap-1.5 rounded-lg px-2 py-1" style={{ background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.25)' }}>
                            <span className="text-[10px] font-black" style={{ color:'#fbbf24' }}>Truncated at 100k chars</span>
                          </div>
                        )}
                        {/* Domain badge */}
                        <div className="flex items-center gap-1.5 rounded-lg px-2 py-1 ml-auto" style={{ background:'rgba(255,204,49,0.12)', border:'1px solid rgba(255,204,49,0.25)' }}>
                          <span className="text-[10px] font-black" style={{ color:'var(--color-accent)' }}>{stats.domain}</span>
                        </div>
                      </div>
                      {/* Text preview snippet */}
                      {stats.preview && (
                        <div className="rounded-lg px-3 py-2" style={{ background:'var(--color-overlay)', border:'1px solid var(--color-overlay)' }}>
                          <p className="text-[8px] font-black uppercase tracking-wider text-[var(--color-accent)] mb-1">Extracted text preview</p>
                          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--color-text-main)' }}>{stats.preview}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ② Training Context — ref wired for outline flash hint */}
          <button ref={ctxBtnRef} onClick={() => setIsModalOpen(true)} className="w-full rounded-[16px] px-4 py-3.5 transition-all hover:brightness-110 text-left"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background:'var(--color-accent-translucent)', border:'1px solid rgba(255,204,49,0.35)' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="var(--color-accent)" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-accent)]">Training Context</span>
                  {isDetectingContext && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-[8px] font-bold text-yellow-400 bg-yellow-400/20 animate-pulse border border-yellow-400/30">
                      Auto-detecting... ✨
                    </span>
                  )}
                </div>
              <div className="flex items-center space-x-1.5 rounded-lg px-2 py-1" style={{ background:'var(--color-overlay)' }}>
                <svg className="w-2.5 h-2.5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="text-[8px] font-bold" style={{ color: "var(--color-text-main)" }}>Edit details</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Learner',  val: learner,  color: '#4ade80' },
                { label: 'Gap',      val: gap,      color: '#4ade80' },
                { label: 'Outcome',  val: outcome,  color: '#4ade80' },
                { label: "Bloom's",  val: BLOOM_LABELS[bloomLevel], color: '#4ade80' },
                { label: 'Modality', val: MODALITY_LABELS[selectedModality], color: '#4ade80' }
              ].map(pill => {
                const isSet = !!pill.val;
                return (
                  <span key={pill.label} className="inline-flex items-center space-x-1.5 rounded-full px-2.5 py-1 transition-all"
                    style={{
                      background: 'var(--color-overlay)',
                      border: `1px solid ${isSet ? 'var(--color-accent-translucent)' : 'var(--color-border)'}`
                    }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: isSet ? 'var(--color-accent)' : 'var(--color-overlay)' }}></span>
                    <span className="text-[9px] font-semibold transition-colors"
                      style={{ color: isSet ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}>
                      {pillLabel(pill.val, pill.label)}
                    </span>
                  </span>
                );
              })}
            </div>
          </button>

          {/* ③ CTA */}
          <div>
            {/* Error / hint message — shown above button, auto-hides after 5s */}
            {errorMsg && (
              <p className="text-red-700 text-[11px] uppercase tracking-widest font-black text-center mb-3"
                style={{ textShadow: '0 1px 3px rgba(255,204,49,1)' }}>
                {errorMsg}
              </p>
            )}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyzeClick} 
              disabled={isAnalyzing || uploadPhase === 'reading'}
              className="w-full py-4 lg:py-3 font-black text-[16px] lg:text-sm transition-colors flex items-center justify-center space-x-2 border-none disabled:opacity-60"
              style={{ background: 'var(--color-surface)', color:'var(--color-accent)', borderRadius:'100px', boxShadow:'0 15px 30px var(--color-shadow)' }}>
              {isAnalyzing ? (
                <span className="animate-pulse">Analysing...</span>
              ) : uploadPhase === 'reading' ? (
                <span className="animate-pulse">Reading file...</span>
              ) : (
                <><span>Analyse My Content</span><span className="font-black">→</span></>
              )}
            </motion.button>
          </div>

        </div>
      </div>

      {/* ── TRAINING CONTEXT MODAL OVERLAY — Exact matching original line 1550 ── */}
      {isModalOpen && (
        <div
          id="context-popup-overlay"
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            if (e.target.id === 'context-popup-overlay') setIsModalOpen(false);
          }}
        >
          <div className="rounded-3xl w-full max-w-lg flex flex-col overflow-hidden text-left"
            style={{ background: 'var(--color-surface)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', maxHeight: '90vh' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-7 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'var(--color-accent-translucent)', border: '1.5px solid var(--color-accent)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="var(--color-accent)" />
                    <path d="M19 16L19.9 18.1L22 19L19.9 19.9L19 22L18.1 19.9L16 19L18.1 18.1L19 16Z" fill="var(--color-accent)" opacity="0.7" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-primary)]">Training Context</p>
                  <p className="text-[11px] text-[var(--color-text-main)] mt-0.5">Complete your course brief for the best AI output</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-[13px] text-[var(--color-text-main)] hover:text-[var(--color-text-main)] transition-colors shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }}>✕</button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto px-7 py-5 space-y-5 flex-1 no-scrollbar">

              {/* ② Learner Profile */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0" style={{ background: 'var(--color-bg)', color: 'var(--color-on-accent)' }}>2</div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-primary)]">Learner Profile</label>
                  <span className="text-[9px] text-[var(--color-primary)] font-medium">Who are you designing for?</span>
                </div>
                <input
                  type="text"
                  value={learner}
                  onChange={e => setLearner(e.target.value)}
                  placeholder="e.g. Mid-level managers, new hires, frontline staff..."
                  className="w-full rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none transition-all"
                  style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', caretColor: 'var(--color-accent)' }}
                />
              </div>

              {/* ③ Performance Gap */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0" style={{ background: 'var(--color-bg)', color: 'var(--color-on-accent)' }}>3</div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-primary)]">Performance Gap</label>
                  <span className="text-[9px] text-[var(--color-primary)] font-medium">What skill or behaviour is missing?</span>
                </div>
                <input
                  type="text"
                  value={gap}
                  onChange={e => setGap(e.target.value)}
                  placeholder="e.g. Avoid difficult conversations, lack of product knowledge..."
                  className="w-full rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none transition-all"
                  style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', caretColor: 'var(--color-accent)' }}
                />
              </div>

              {/* ④ Business Outcome */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0" style={{ background: 'var(--color-bg)', color: 'var(--color-on-accent)' }}>4</div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-primary)]">Business Outcome</label>
                  <span className="text-[9px] text-[var(--color-primary)] font-medium">Kirkpatrick L4 — measurable result</span>
                </div>
                <input
                  type="text"
                  value={outcome}
                  onChange={e => setOutcome(e.target.value)}
                  placeholder="e.g. Reduce conflict escalations by 30% in 90 days..."
                  className="w-full rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none transition-all"
                  style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', caretColor: 'var(--color-accent)' }}
                />
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid var(--color-overlay)' }} />

              {/* ⑤ Cognitive Target — Bloom's */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0" style={{ background: 'var(--color-bg)', color: 'var(--color-on-accent)' }}>5</div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-primary)]">Cognitive Target</label>
                  <span className="text-[9px] text-[var(--color-primary)] font-medium">Bloom's Taxonomy</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { key: 'remember', emoji: '🎯', title: 'Remember', desc: 'Awareness' },
                    { key: 'apply',    emoji: '⚙️', title: 'Apply',    desc: 'Skill-build' },
                    { key: 'evaluate', emoji: '🏆', title: 'Evaluate', desc: 'Leadership' }
                  ].map(b => {
                    const isSelected = bloomLevel === b.key;
                    return (
                      <button
                        key={b.key}
                        onClick={() => setBloomLevel(b.key)}
                        className="py-4 rounded-2xl text-center transition-all focus:outline-none"
                        style={{
                          background: isSelected ? 'var(--color-accent)' : 'var(--color-overlay)',
                          border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`
                        }}
                      >
                        <div className="text-2xl mb-1.5">{b.emoji}</div>
                        <div className="text-[11px] font-black" style={{ color: isSelected ? 'var(--color-on-accent)' : 'var(--color-text-main)' }}>{b.title}</div>
                        <div className="text-[9px]" style={{ color: isSelected ? 'var(--color-on-accent)' : 'var(--color-text-muted)', opacity: isSelected ? 0.8 : 1 }}>{b.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ⑥ Delivery Modality */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0" style={{ background: 'var(--color-bg)', color: 'var(--color-on-accent)' }}>6</div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-primary)]">Delivery Modality</label>
                  <span className="text-[9px] text-[var(--color-primary)] font-medium">How will learners access the course?</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'elearning', emoji: '💻', title: 'eLearning', desc: 'Self-paced' },
                    { key: 'ilt',       emoji: '🎓', title: 'ILT',       desc: 'Live' },
                    { key: 'blended',   emoji: '🔀', title: 'Blended',   desc: 'Hybrid' },
                    { key: 'mobile',    emoji: '📱', title: 'Mobile',    desc: 'Micro' }
                  ].map(m => {
                    const isSelected = selectedModality === m.key;
                    return (
                      <button
                        key={m.key}
                        onClick={() => setSelectedModality(m.key)}
                        className="py-4 rounded-2xl text-center transition-all focus:outline-none"
                        style={{
                          background: isSelected ? 'var(--color-accent)' : 'var(--color-overlay)',
                          border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`
                        }}
                      >
                        <div className="text-2xl mb-1.5">{m.emoji}</div>
                        <div className="text-[10px] font-black" style={{ color: isSelected ? 'var(--color-on-accent)' : 'var(--color-text-main)' }}>{m.title}</div>
                        <div className="text-[8px]" style={{ color: isSelected ? 'var(--color-on-accent)' : 'var(--color-text-muted)', opacity: isSelected ? 0.8 : 1 }}>{m.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-7 py-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button onClick={() => setIsModalOpen(false)} className="w-full py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center space-x-2 focus:outline-none" style={{ background: 'var(--color-accent)', color: 'var(--color-on-accent)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="var(--color-primary)" />
                </svg>
                <span>Save Details</span>
                <span>→</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Content Check Modal */}
      {showContentModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-surface)] border border-white/10 rounded-[32px] w-full max-w-md p-8 shadow-2xl">
            <div className="w-16 h-16 bg-[var(--color-accent)]/10 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl text-[var(--color-accent)]">✨</span>
            </div>
            <h3 className="text-2xl font-black text-[var(--color-text-main)] mb-3 tracking-tight">Expand your course?</h3>
            <p className="text-[var(--color-text-main)]/60 text-sm leading-relaxed mb-8">
              I only see a short topic here. For a truly expert-led course, I usually need more source material. Would you like to provide more, or should I (AI) generate the expert content for you?
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setShowContentModal(false)}
                className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-[var(--color-text-main)] font-bold rounded-2xl transition-all"
              >
                I'll add more content
              </button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAiGenerateBypass}
                className="w-full py-4 bg-[var(--color-accent)] hover:brightness-110 text-[var(--color-on-accent)] font-black rounded-2xl transition-colors shadow-lg shadow-[var(--color-accent)]/20"
              >
                ✨ Generate Course Automatically
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
