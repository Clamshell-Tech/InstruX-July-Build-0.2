'use client';

import React from 'react';

export default function MobilePreviewPlayer() {
  return (
    <div className="w-[360px] h-[700px] bg-black rounded-[40px] border-[8px] border-black overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.2)] shrink-0 hidden lg:block mx-8 my-auto">
      {/* Top Notch */}
      <div className="absolute top-0 inset-x-0 h-6 bg-black z-50 rounded-b-xl w-32 mx-auto"></div>
      
      {/* Screen Inner */}
      <div className="w-full h-full bg-white relative">
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50">
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-slate-300 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="text-sm font-bold text-[var(--color-text-main)]">Mobile Preview</h3>
          <p className="text-xs text-slate-500 mt-2">Generate a course to see how it looks on a learner's device.</p>
        </div>
      </div>
    </div>
  );
}
