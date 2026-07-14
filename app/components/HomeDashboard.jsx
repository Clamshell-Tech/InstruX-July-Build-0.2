'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function HomeDashboard({ onSelectMode, theme, setTheme }) {
  const greeting = "Welcome back.";

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center py-4 px-6 overflow-hidden">
      
      {/* Background Pattern */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 1px)', 
          backgroundSize: '20px 20px',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
        }}>
      </motion.div>

      {/* Floating Theme Toggle */}
      <div className="absolute top-4 right-6 z-50">
        <button 
          onClick={() => {
            const nextTheme = theme === 'brand' ? 'dark' : theme === 'dark' ? 'light' : 'brand';
            setTheme(nextTheme);
          }}
          title="Toggle Theme" 
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {theme === 'dark' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          ) : theme === 'light' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-main)' }}><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
          )}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-5 w-full text-center lg:text-left"
        >
          <div className="inline-flex items-center space-x-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_var(--color-accent)]" style={{ background: 'var(--color-accent)' }}></span>
            <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-primary)] opacity-80">instruX AI Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight leading-none text-slate-900 mb-2">
            {greeting}
          </h1>
          <p className="text-sm font-medium text-slate-800 opacity-90">
            What kind of learning experience are we architecting today?
          </p>
        </motion.div>

        {/* Asymmetrical Bento Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full"
        >
          
          {/* Card 1: HERO */}
          <motion.div 
            variants={itemVariants}
            onClick={() => onSelectMode('paste')} 
            className="group relative col-span-1 lg:col-span-2 lg:row-span-2 rounded-[24px] p-6 lg:p-8 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_10px_30px_var(--color-shadow)] hover:-translate-y-1 border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[80px] opacity-20 transition-transform duration-700 group-hover:scale-110" style={{ background: 'var(--color-accent)', transform: 'translate(30%, -30%)' }}></div>
            
            <div className="relative z-20 w-full h-full flex flex-col justify-between">
              <div className="w-full lg:w-[65%]">
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest mb-3" style={{ background: 'var(--color-accent)', color: 'var(--color-on-accent)' }}>
                  Recommended
                </div>
                <h2 className="text-2xl lg:text-3xl font-black mb-2 tracking-tight text-[var(--color-text-main)]">Pro Design Studio</h2>
                <p className="text-xs font-medium leading-relaxed opacity-80 text-[var(--color-text-main)]">
                  Take full creative control. Upload raw source material, configure precise learner profiles, and generate structured microlearning modules.
                </p>
              </div>

              <div className="mt-6 flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 shadow-sm" style={{ background: 'var(--color-text-main)', color: 'var(--color-surface)' }}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-main)]">Enter Studio</span>
              </div>
            </div>

            {/* Abstract UI Mockup */}
            <div className="hidden lg:block absolute bottom-[-10px] right-[-10px] w-[180px] h-[160px] rounded-tl-[16px] p-4 shadow-lg rotate-3 transition-all duration-500 group-hover:rotate-0 group-hover:scale-105 group-hover:-translate-y-1 bg-white/10 backdrop-blur-xl border border-white/20 z-10">
              <div className="flex space-x-1 mb-3">
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
              </div>
              <div className="w-2/3 h-3 rounded-full mb-4 bg-white/90"></div>
              <div className="space-y-2">
                <div className="w-full h-4 rounded-md bg-white/20"></div>
                <div className="w-5/6 h-4 rounded-md bg-white/30"></div>
                <div className="w-full h-4 rounded-md bg-white/10"></div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Instant AI Course */}
          <motion.div 
            variants={itemVariants}
            onClick={() => onSelectMode('generate')} 
            className="group relative col-span-1 rounded-[24px] p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-[0_10px_30px_var(--color-shadow)] border overflow-hidden lg:h-[130px]"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
             <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-[20px] opacity-30 transition-transform duration-700 group-hover:scale-150" style={{ background: 'var(--color-accent)' }}></div>
             <div className="relative z-10 flex items-start space-x-4">
                <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-6 shadow-sm" style={{ background: 'var(--color-primary)' }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>
                  <h3 className="text-base font-black mb-1 text-[var(--color-text-main)] group-hover:text-[var(--color-accent)] transition-colors">Instant AI</h3>
                  <p className="text-[10px] font-medium opacity-70 text-[var(--color-text-main)] leading-snug">Generate a ready-to-use course instantly.</p>
                </div>
             </div>
          </motion.div>

          {/* Card 3: Templates */}
          <motion.div 
            variants={itemVariants}
            onClick={() => onSelectMode('template')} 
            className="group relative col-span-1 rounded-[24px] p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-[0_10px_30px_var(--color-shadow)] border overflow-hidden lg:h-[130px]"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
             <div className="absolute bottom-2 right-2 w-14 h-14 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
               <div className="absolute inset-0 rounded-md bg-white/5 border border-white/10 rotate-6 translate-x-2 translate-y-2"></div>
               <div className="absolute inset-0 rounded-md bg-white/10 border border-white/20 rotate-3 translate-x-1 translate-y-1"></div>
               <div className="absolute inset-0 rounded-md bg-white/20 border border-white/30 backdrop-blur-sm"></div>
             </div>
             <div className="relative z-10 flex items-start space-x-4">
                <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-sm" style={{ background: 'var(--color-primary)' }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <div>
                  <h3 className="text-base font-black mb-1 text-[var(--color-text-main)] group-hover:text-[var(--color-accent)] transition-colors">Templates</h3>
                  <p className="text-[10px] font-medium opacity-70 text-[var(--color-text-main)] leading-snug">Start from a proven framework.</p>
                </div>
             </div>
          </motion.div>

          {/* Card 4: Import / Upload Ribbon */}
          <motion.div 
            variants={itemVariants}
            onClick={() => onSelectMode('import')} 
            className="group relative col-span-1 lg:col-span-3 rounded-[20px] p-4 flex items-center justify-between cursor-pointer transition-all duration-300 hover:shadow-md overflow-hidden"
            style={{ background: 'var(--color-accent)', border: '1px solid rgba(0,0,0,0.05)' }}
          >
            <div className="absolute top-0 left-0 w-[200%] h-full opacity-[0.05] pointer-events-none transition-transform duration-1000 group-hover:-translate-x-8" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}></div>
            
            <div className="relative z-10 flex items-center space-x-4">
              <div className="hidden lg:flex w-10 h-10 rounded-lg items-center justify-center shadow-inner transition-transform duration-500 group-hover:rotate-180" style={{ background: 'var(--color-on-accent)', color: 'var(--color-accent)' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              </div>
              <div>
                <h3 className="text-base font-black mb-0" style={{ color: 'var(--color-on-accent)' }}>Have an existing course?</h3>
                <p className="text-[10px] font-bold opacity-80" style={{ color: 'var(--color-on-accent)' }}>Upload SCORM or PDF to rebuild it in seconds.</p>
              </div>
            </div>
            
            <div className="relative z-10 inline-flex items-center space-x-1.5 px-4 py-2 rounded-full font-black uppercase tracking-widest text-[9px] shadow-sm transition-all duration-300 group-hover:scale-105" style={{ background: 'var(--color-on-accent)', color: 'var(--color-accent)' }}>
              <span>Upload & Rebuild</span>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
