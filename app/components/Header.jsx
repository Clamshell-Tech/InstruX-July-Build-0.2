'use client';

import React from 'react';

export default function Header({ credits = "—", onlineUsers = 3 }) {
  return (
    <div className="absolute top-0 right-0 p-6 flex justify-end items-center space-x-6 z-50">
      <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
        <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1e3a8a', flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-[10px] font-black text-slate-800">{credits}</span>
        <span className="text-[9px] font-semibold text-slate-500">credits</span>
      </div>

      <div className="flex items-center space-x-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
        <span className="text-[10px] font-bold text-slate-600">{onlineUsers} online</span>
      </div>

      <button className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-800 transition-all hover:bg-black/15" style={{ background: 'rgba(0,0,0,0.1)' }}>
        Share
      </button>
      <div className="w-px h-5 bg-black/10"></div>
      <button className="px-5 py-2.5 bg-slate-900 text-slate-800 rounded-2xl font-bold text-sm">
        Export
      </button>
    </div>
  );
}
