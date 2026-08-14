import React from 'react';
import { ArrowLeft, Moon, Leaf, Utensils, Dog, Briefcase, Heart, HelpCircle } from 'lucide-react';

export default function OnboardingLifestyle({ selectedLifestyles, toggleLifestyle, setActiveScreen, stepProgressBar, options }) {
  const getIconForLabel = (lbl = '') => {
    const l = lbl.toLowerCase();
    if (l.includes('quiet') || l.includes('low-key')) return Moon;
    if (l.includes('sustain') || l.includes('eco') || l.includes('green')) return Leaf;
    if (l.includes('meal') || l.includes('food') || l.includes('din') || l.includes('social')) return Utensils;
    if (l.includes('pet') || l.includes('dog') || l.includes('cat')) return Dog;
    if (l.includes('work') || l.includes('remote') || l.includes('office')) return Briefcase;
    return Heart;
  };

  const lifestyleOptions = (options || []).map(opt => ({
    label: opt.label,
    icon: getIconForLabel(opt.label)
  }));
  return (
    <div className="max-w-[660px] mx-auto ">
      <div className="text-xs font-mono uppercase tracking-wider text-ink-dim font-bold mb-1.5">
        Step 2 of 9 — Lifestyle &amp; Values
      </div>
      {stepProgressBar(2)}

      <h1 className="font-display text-[26px] font-extrabold text-ink mb-6">
        What matters most to you day to day?
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-8">
        {lifestyleOptions.map(opt => {
          const Icon = opt.icon;
          const isSelected = selectedLifestyles.includes(opt.label);
          return (
            <div
              key={opt.label}
              onClick={() => toggleLifestyle(opt.label)}
              className={`flex flex-col items-center text-center p-4.5 rounded-xl border cursor-pointer shadow-sm transition-all duration-150 ${isSelected
                ? 'border-amber bg-amber-soft/85'
                : 'border-border bg-white hover:border-amber hover:-translate-y-[1px]'
                }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${isSelected ? 'bg-amber text-white' : 'bg-teal-soft text-teal'
                }`}>
                {Icon && <Icon className="w-4.5 h-4.5" />}
              </div>
              <div className="text-[13px] font-extrabold text-ink leading-tight ">
                {opt.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3.5">
        <button
          onClick={() => setActiveScreen('onboarding-age')}
          className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => setActiveScreen('onboarding-community')}
          className="bg-ink text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
