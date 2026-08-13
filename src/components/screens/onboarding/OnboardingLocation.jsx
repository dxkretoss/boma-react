import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function OnboardingLocation({ locationCity, setLocationCity, locationRadius, setLocationRadius, settingPreference, setSettingPreference, setActiveScreen, stepProgressBar }) {
  return (
    <div className="max-w-[660px] mx-auto ">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-dim font-bold mb-1.5">
            Step 4 of 9 — Location
          </div>
          {stepProgressBar(4)}
          
          <div className="mb-5">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">
              Preferred city or metro area
            </label>
            <input 
              type="text" 
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              placeholder="e.g. Austin, TX" 
              list="us-cities"
              className="w-full bg-panel border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" 
            />
            <datalist id="us-cities">
              <option value="Austin, TX" />
              <option value="Atlanta, GA" />
              <option value="Boston, MA" />
              <option value="Charlotte, NC" />
              <option value="Chicago, IL" />
              <option value="Dallas, TX" />
              <option value="Denver, CO" />
              <option value="Detroit, MI" />
              <option value="Houston, TX" />
              <option value="Las Vegas, NV" />
              <option value="Los Angeles, CA" />
              <option value="Miami, FL" />
              <option value="Minneapolis, MN" />
              <option value="Nashville, TN" />
              <option value="New York, NY" />
              <option value="Orlando, FL" />
              <option value="Philadelphia, PA" />
              <option value="Phoenix, AZ" />
              <option value="Portland, OR" />
              <option value="Salt Lake City, UT" />
              <option value="San Antonio, TX" />
              <option value="San Diego, CA" />
              <option value="San Francisco, CA" />
              <option value="Seattle, WA" />
              <option value="Tampa, FL" />
              <option value="Washington, DC" />
            </datalist>
          </div>

          <div className="mb-6 flex flex-col">
            <div className="flex justify-between items-center text-sm font-semibold text-ink mb-1.5">
              <span>Relocation radius</span>
              <span className="font-mono text-xs">{locationRadius} mi</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="150" 
              value={locationRadius}
              onChange={(e) => setLocationRadius(parseInt(e.target.value))}
              className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-amber" 
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-2 font-semibold">
              Setting preference
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8">
            {[
              { id: 'urban', label: 'Urban' },
              { id: 'suburban', label: 'Suburban' },
              { id: 'rural', label: 'Rural' }
            ].map(opt => (
              <div 
                key={opt.id}
                onClick={() => setSettingPreference(opt.id)}
                className={`flex flex-col items-center text-center p-4 rounded-xl border cursor-pointer shadow-sm transition-all duration-150 ${
                  settingPreference === opt.id 
                    ? 'border-amber bg-amber-soft/85' 
                    : 'border-border bg-white hover:border-amber hover:-translate-y-[1px]'
                }`}
              >
                <div className="text-[13px] font-extrabold text-ink leading-tight  uppercase tracking-wide">
                  {opt.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => setActiveScreen('onboarding-community')}
              className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={() => setActiveScreen('onboarding-budget')}
              className="bg-ink text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
  );
}
