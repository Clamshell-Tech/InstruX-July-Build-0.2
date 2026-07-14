'use client';

import React, { useEffect, useState } from 'react';
import CoursePlayer from '../components/CoursePlayer';

export default function PreviewPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('instrux_preview_data');
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load preview data', e);
    }
  }, []);

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white font-sans flex-col">
        <svg className="w-8 h-8 animate-spin text-yellow-400 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-sm font-bold tracking-widest uppercase">Loading Preview...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-900 flex items-center justify-center overflow-hidden">
      <CoursePlayer 
        wizardData={data} 
        onBack={() => window.close()} 
        isPreview={true}
      />
    </div>
  );
}
