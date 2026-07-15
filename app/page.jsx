'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobilePreviewPlayer from './components/MobilePreviewPlayer';
import HomeDashboard from './components/HomeDashboard';
import TextInputWizard from './components/TextInputWizard';
import SMEQuestionEngine from './components/SMEQuestionEngine';
import StrategySelector from './components/StrategySelector';
import LearningMap from './components/LearningMap';
import CoursePlayer from './components/CoursePlayer';

function WizardHeader({ step, title, onBack, theme, setTheme }) {
  // Exact pcts from original showIDScreen: 1:10%, 2:30%, 3:55%, 4:75%, 5:100%
  const stepsPcts = { 1: '10%', 2: '30%', 3: '55%', 4: '75%', 5: '100%' };

  return (
    <div className="shrink-0">
      <header className="h-16 flex items-center justify-between px-8 shrink-0" style={{ background: 'var(--color-bg)' }}>
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-primary)] hover:bg-black/10 transition-all" style={{ background: 'rgba(0,0,0,0.08)' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h2 className="text-base font-extrabold text-[var(--color-primary)]">Design Studio</h2>
            <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest" style={{ color: 'rgba(15,23,42,0.5)' }}>
              <span className="text-[var(--color-primary)] px-2 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.1)' }}>Step {step}</span>
              <span>{title}</span>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex items-center space-x-3">
          {/* Theme Toggle (Cycles Brand -> Dark -> Light) */}
          <button 
            onClick={() => {
              const nextTheme = theme === 'brand' ? 'dark' : theme === 'dark' ? 'light' : 'brand';
              setTheme(nextTheme);
            }}
            title="Toggle Theme" 
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
            style={{ background: 'var(--color-overlay)' }}
          >
            {theme === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFCC31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : theme === 'light' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
            )}
          </button>
          {/* Brand kit badge */}
          <button title="Select brand kit" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--color-overlay)', border: '1px solid var(--color-border)', borderRadius: '999px', padding: '0.25rem 0.625rem', cursor: 'pointer', transition: 'all 0.2s' }}>
            <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-primary)', flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
            <span className="text-[10px] font-black text-[var(--color-primary)]">Brand</span>
          </button>
          {/* Credit badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--color-overlay)', border: '1px solid var(--color-border)', borderRadius: '999px', padding: '0.25rem 0.625rem', opacity: 0.6, transition: 'all 0.3s' }}>
            <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-primary)', flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span className="text-[10px] font-black text-[var(--color-primary)]">—</span>
            <span className="text-[9px] font-semibold" style={{ color: 'var(--color-primary)' }}>credits</span>
          </div>
          <button className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] transition-all hover:brightness-110" style={{ background: 'var(--color-overlay)' }}>Share</button>
          <div className="w-px h-5 bg-black/10"></div>
          <button className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-md">Export</button>
        </div>
      </header>
      <div className="px-8 py-3 shrink-0" style={{ background: 'var(--color-bg)' }}>
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
          <div className="h-full bg-[var(--color-primary)] transition-all duration-500" style={{ width: stepsPcts[step] || '10%' }}></div>
        </div>
      </div>
    </div>
  );
}
import InstantAIWizard from './components/InstantAIWizard';

export default function InstruXReactApp() {
  const [currentView, setCurrentView] = useState('home');
  const [wizardData, setWizardData] = useState(null);
  
  // 3-Way Theme Engine
  const [theme, setTheme] = useState('brand'); // 'brand', 'dark', 'light'
  
  React.useEffect(() => {
    document.body.classList.remove('dark-theme', 'light-theme');
    if (theme === 'dark') document.body.classList.add('dark-theme');
    if (theme === 'light') document.body.classList.add('light-theme');
  }, [theme]);

  const handleSelectMode = (mode) => {
    if (mode === 'template' || mode === 'import') {
      alert("This feature is coming soon in Phase 2!");
      return;
    }
    setCurrentView(mode);
  };

  const handleWizardComplete = (data) => {
    setWizardData(data);
    if (data.isInstantAI) {
      setCurrentView('strategy');
    } else {
      setCurrentView('sme');
    }
  };

  const handleSmeComplete = () => {
    setCurrentView('strategy');
  };

  const handleSelectStrategy = (strategyId) => {
    setWizardData(prev => ({ ...prev, strategy: strategyId }));
    setCurrentView('map');
  };

  const handleMapComplete = (mapData) => {
    setWizardData(prev => ({
      ...prev,
      slides: mapData.slides,
      title: mapData.title
    }));
    // We intentionally DO NOT call setCurrentView('player') here anymore.
    // The CoursePlayer now opens in a dedicated /preview new tab, 
    // so we leave the user on the Learning Map in this tab.
  };

  // 1. HOME DASHBOARD
  if (currentView === 'home') {
    return (
      <div className="flex h-screen font-sans overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="flex-1 w-full h-full overflow-y-auto flex items-center justify-center">
          <HomeDashboard onSelectMode={handleSelectMode} theme={theme} setTheme={setTheme} />
        </div>
      </div>
    );
  }


  // 3. WIZARD VIEWS (Paste / Generate / SME / Strategy / Map / Player)
  const WIZARD_VIEWS = ['paste', 'generate', 'sme', 'strategy', 'map', 'player'];
  if (WIZARD_VIEWS.includes(currentView)) {
    let step = 1;
    let title = currentView === 'generate' ? "Instant AI Generation" : "Requirements Analysis";
    
    if (currentView === 'sme') { step = 2; title = "SME Question Engine"; }
    else if (currentView === 'strategy') { step = 3; title = "Learning Strategy"; }
    else if (currentView === 'map') { step = 4; title = "Learning Map"; }
    else if (currentView === 'player') { step = 5; title = "Course Player"; }

    return (
      <div className="flex flex-col h-screen font-sans overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
        <WizardHeader 
          step={step} 
          title={title} 
          theme={theme}
          setTheme={setTheme}
          onBack={() => {
             if (currentView === 'player') setCurrentView('map');
             else if (currentView === 'map') setCurrentView('strategy');
             else if (currentView === 'strategy') {
               if (wizardData?.isInstantAI) setCurrentView('generate');
               else setCurrentView('sme');
             }
             else if (currentView === 'sme') setCurrentView('paste');
             else if (currentView === 'generate') setCurrentView('home');
             else setCurrentView('home');
          }} 
        />
        <div className="flex-grow overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.8 }}
              className="absolute inset-0 w-full h-full"
            >
              {currentView === 'paste' && <TextInputWizard onComplete={handleWizardComplete} />}
              {currentView === 'generate' && <InstantAIWizard onComplete={handleWizardComplete} />}
              {currentView === 'sme' && <SMEQuestionEngine wizardData={wizardData} onBack={() => setCurrentView('paste')} onComplete={handleSmeComplete} />}
              {currentView === 'strategy' && <StrategySelector onSelectStrategy={handleSelectStrategy} onBack={() => {
                if (wizardData?.isInstantAI) setCurrentView('generate');
                else setCurrentView('sme');
              }} />}
              {currentView === 'map' && <LearningMap wizardData={wizardData} onBack={() => setCurrentView('strategy')} onComplete={handleMapComplete} />}
              {currentView === 'player' && <CoursePlayer wizardData={wizardData} onBack={() => setCurrentView('map')} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // 3. EDITOR VIEW (Fallback for when wizard is done)
  return (
    <div className="flex h-screen font-sans overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-0 h-full max-h-screen overflow-hidden bg-slate-50">
        <Header />
        <div className="flex-1 overflow-y-auto p-6 flex gap-8 h-full">
          <div className="flex-1 flex flex-col h-full w-full items-center justify-center">
            <h1 className="text-3xl font-black text-[var(--color-text-main)]">Editor Workspace</h1>
            <p className="mt-4 text-slate-500">Coming soon in Phase 2.</p>
          </div>
          <div className="w-[400px] shrink-0 sticky top-0 h-[800px]">
            <MobilePreviewPlayer />
          </div>
        </div>
      </main>
    </div>
  );
}
