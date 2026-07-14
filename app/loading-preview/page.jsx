'use client';
import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingPreview() {
  return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-8 overflow-hidden relative">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FFCC31] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#1e3a8a] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full max-w-4xl mx-auto relative z-10 flex flex-col items-center">
        
        {/* Loading text with shimmer */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-6">
            <svg className="w-4 h-4 text-[#FFCC31] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span className="text-[11px] font-black uppercase tracking-widest text-white/70">AI Engine Active</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-white animate-shimmer" style={{ backgroundSize: '200% auto' }}>
              Building your course architecture
            </span>
          </h1>
          <p className="mt-4 text-slate-400 font-medium">Synthesizing strategy, extracting facts, and drafting interactive modules...</p>
        </motion.div>

        {/* Skeleton UI */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full bg-[#1e3a8a]/20 border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
          {/* Shimmer sweep effect overlay */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          
          <div className="flex flex-col gap-8">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-4 border-b border-white/5 pb-8">
              <div className="h-4 w-24 bg-white/10 rounded-full"></div>
              <div className="h-10 w-3/4 bg-white/10 rounded-xl"></div>
              <div className="h-6 w-1/2 bg-white/5 rounded-lg"></div>
            </div>

            {/* Modules Skeleton */}
            {[1, 2, 3].map((item, i) => (
              <motion.div 
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.15) }}
                className="flex gap-6 items-start"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FFCC31]/20 flex-shrink-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-[#FFCC31]/40 rounded-full animate-pulse"></div>
                </div>
                <div className="flex-grow space-y-3 pt-1">
                  <div className="h-5 w-1/3 bg-white/10 rounded-lg"></div>
                  <div className="h-4 w-full bg-white/5 rounded-md"></div>
                  <div className="h-4 w-5/6 bg-white/5 rounded-md"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: text-shimmer 2.5s linear infinite;
        }
        @keyframes text-shimmer {
          to {
            background-position: 200% center;
          }
        }
      `}</style>
    </div>
  );
}
