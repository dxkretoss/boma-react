import React from 'react';
import { Home, ArrowLeft, Compass, MessageSquare } from 'lucide-react';

export default function NotFound({ setActiveScreen }) {
  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center px-4 py-16 animate-fade">
      <div className="max-w-lg w-full text-center flex flex-col items-center">
        {/* Visual Badge / Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-soft text-ink font-mono text-xs font-semibold uppercase tracking-wider mb-6 border border-border">
          <Compass className="w-3.5 h-3.5" />
          <span>Error 404 • Page Not Found</span>
        </div>

        {/* 404 Big Heading */}
        <h1 className="font-display font-extrabold text-7xl sm:text-8xl text-ink tracking-tight mb-4">
          404
        </h1>

        <h2 className="font-display font-bold text-2xl sm:text-3xl text-navy-deep mb-3">
          Looks like you've wandered off the path
        </h2>

        <p className="font-sans text-ink-dim text-base max-w-md mb-8 leading-relaxed">
          The page or Pod Commons you are looking for doesn't exist, has been moved, or is under construction.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
          <button
            onClick={() => setActiveScreen('landing')}
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-ink text-white font-sans font-semibold text-sm hover:bg-[#201822] hover:-translate-y-[1px] transition-all duration-200 shadow-custom"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>

          <button
            onClick={() => setActiveScreen('how-it-works')}
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white border border-border text-ink font-sans font-semibold text-sm hover:bg-panel-alt transition-all duration-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            How It Works
          </button>
        </div>

        {/* Helpful links card */}
        <div className="mt-12 p-4 rounded-2xl bg-white border border-border shadow-custom w-full flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-soft text-teal flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-navy-deep font-display">Need assistance?</div>
              <div className="text-xs text-ink-dim font-sans">Reach out to the BOMA team</div>
            </div>
          </div>
          <button
            onClick={() => setActiveScreen('contact')}
            className="text-xs font-semibold text-ink hover:underline px-3 py-1.5 rounded-lg hover:bg-amber-soft transition-colors"
          >
            Contact Us →
          </button>
        </div>
      </div>
    </div>
  );
}
