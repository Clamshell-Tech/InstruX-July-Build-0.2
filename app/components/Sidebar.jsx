'use client';

import React from 'react';

export default function Sidebar() {
  return (
    <div className="w-[300px] h-full bg-slate-900 text-[var(--color-text-main)] shrink-0 hidden md:flex flex-col rounded-r-3xl relative z-40 overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none -mr-[200px] -mt-[200px]"></div>

      <div className="p-8 pb-4 shrink-0 relative z-10">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <h1 className="text-xl font-black tracking-tight">InstruX</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 relative z-10 scrollbar-hide">
        <div>
          <div className="flex items-center justify-between px-2 mb-3">
            <h2 className="text-[10px] font-black tracking-widest text-slate-500 uppercase">My Workspace</h2>
            <button className="text-slate-400 hover:text-[var(--color-text-main)] transition-colors">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            </button>
          </div>
          <div className="space-y-1">
            <button className="w-full text-left px-3 py-2.5 rounded-xl bg-white/10 text-[var(--color-text-main)] font-medium text-sm flex items-center space-x-3 transition-colors border border-white/5">
              <span className="text-lg">⚡</span>
              <span>New AI Project</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6 shrink-0 border-t border-white/10 relative z-10">
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4" alt="User Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors">Alex C.</p>
            <p className="text-[10px] font-semibold text-slate-400">Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
