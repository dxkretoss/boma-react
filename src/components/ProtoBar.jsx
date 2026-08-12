import React from 'react';
import { SCREENS_ORDER, SCREENS_LABELS, SCREEN_URLS } from '../constants/screens';

export default function ProtoBar({
  activeScreen,
  setActiveScreen,
  userOnboarded,
  setUserOnboarded,
  updateOnboardUI
}) {
  const currentIdx = SCREENS_ORDER.indexOf(activeScreen);

  const handlePrev = () => {
    const nextIdx = Math.max(0, currentIdx - 1);
    setActiveScreen(SCREENS_ORDER[nextIdx]);
  };

  const handleNext = () => {
    const nextIdx = Math.min(SCREENS_ORDER.length - 1, currentIdx + 1);
    setActiveScreen(SCREENS_ORDER[nextIdx]);
  };

  const handleSelectChange = (e) => {
    setActiveScreen(e.target.value);
  };

  const toggleOnboarding = () => {
    const nextVal = !userOnboarded;
    setUserOnboarded(nextVal);
    if (updateOnboardUI) {
      updateOnboardUI(nextVal);
    }
  };

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-3 md:px-5 py-2 bg-[#1C1A14] text-[#B9B2A0] font-mono text-[11px] border-b border-[#2A2720]">
      <div className="hidden sm:block opacity-85">
        <span className="text-[#8A8578]">boma.app/</span>
        <span className="text-[#D8D2C2]">{SCREEN_URLS[activeScreen]?.replace('boma.app/', '') || ''}</span>
      </div>
      
      <div className="flex items-center gap-2 md:gap-2.5 ml-auto sm:ml-0">
        <select 
          className="bg-[#2A2720] border border-[#3A362C] text-[#D8D2C2] rounded-md px-2 py-1 text-[11px] font-mono outline-none cursor-pointer max-w-[120px] sm:max-w-[200px]"
          value={activeScreen}
          onChange={handleSelectChange}
        >
          {SCREENS_ORDER.map(id => (
            <option key={id} value={id}>
              {SCREENS_LABELS[id]}
            </option>
          ))}
        </select>
        
        <button 
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="bg-transparent border border-[#3A362C] text-[#D8D2C2] rounded-md px-2.5 py-1 text-[11px] hover:bg-[#2A2720] disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
        >
          ← Prev
        </button>
        
        <span className="text-[#8A8578] hidden xs:inline">
          {currentIdx + 1} / {SCREENS_ORDER.length}
        </span>
        
        <button 
          onClick={handleNext}
          disabled={currentIdx === SCREENS_ORDER.length - 1}
          className="bg-transparent border border-[#3A362C] text-[#D8D2C2] rounded-md px-2.5 py-1 text-[11px] hover:bg-[#2A2720] disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
        >
          Next →
        </button>
        
        <button
          onClick={toggleOnboarding}
          style={{ backgroundColor: userOnboarded ? '#1F8A6B' : '#2F5FE0' }}
          className="text-white font-semibold rounded-md px-2.5 py-1 text-[11px] hover:opacity-90 active:scale-95 transition-all cursor-pointer ml-1"
        >
          Status: {userOnboarded ? 'Onboarded (Complete)' : 'Pending Onboarding'}
        </button>
      </div>
    </div>
  );
}
