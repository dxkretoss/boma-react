import React from 'react';

export default function Footer({ 
  setActiveScreen, 
  openAuthModal, 
  userOnboarded 
}) {
  return (
    <footer className="bg-navy-deep text-white px-6 md:px-8 py-16 mt-auto  w-full">
      <div className="max-w-[1180px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 md:gap-12 border-b border-white/10 pb-12">
        {/* Brand Column */}
        <div className="sm:col-span-2 flex flex-col">
          <h4 className="font-display text-[22px] font-extrabold text-white mb-3.5">
            BOMA
          </h4>
          <p className="text-[#A3B3C8] text-sm max-w-[280px] leading-relaxed">
            Match your neighbors. Build your community. A new path to community-driven housing.
          </p>
        </div>

        {/* Column 1: Product */}
        <div className="flex flex-col">
          <h5 className="text-[#7F92B0] font-mono text-[11px] uppercase tracking-wider mb-4.5 font-semibold">
            Product
          </h5>
          <button 
            onClick={() => setActiveScreen('how-it-works')}
            className="block text-[#D7E2EE] text-sm mb-2.5 font-medium hover:text-white transition-colors cursor-pointer text-left outline-none"
          >
            How it works
          </button>
          <button 
            onClick={() => setActiveScreen(userOnboarded ? 'learning' : 'landing')}
            className="block text-[#D7E2EE] text-sm mb-2.5 font-medium hover:text-white transition-colors cursor-pointer text-left outline-none"
          >
            Learning Hub
          </button>
        </div>

        {/* Column 2: Company */}
        <div className="flex flex-col">
          <h5 className="text-[#7F92B0] font-mono text-[11px] uppercase tracking-wider mb-4.5 font-semibold">
            Company
          </h5>
          <button 
            onClick={() => setActiveScreen('about')}
            className="block text-[#D7E2EE] text-sm mb-2.5 font-medium hover:text-white transition-colors cursor-pointer text-left outline-none"
          >
            About
          </button>
          <button 
            onClick={() => setActiveScreen('contact')}
            className="block text-[#D7E2EE] text-sm mb-2.5 font-medium hover:text-white transition-colors cursor-pointer text-left outline-none"
          >
            Contact
          </button>
        </div>

        {/* Column 3: Account */}
        <div className="flex flex-col">
          <h5 className="text-[#7F92B0] font-mono text-[11px] uppercase tracking-wider mb-4.5 font-semibold">
            Account
          </h5>
          <button 
            onClick={() => openAuthModal('login')}
            className="block text-[#D7E2EE] text-sm mb-2.5 font-medium hover:text-white transition-colors cursor-pointer text-left outline-none"
          >
            Log in
          </button>
          <button 
            onClick={() => openAuthModal('signup')}
            className="block text-[#D7E2EE] text-sm mb-2.5 font-medium hover:text-white transition-colors cursor-pointer text-left outline-none"
          >
            Sign up
          </button>
        </div>
      </div>
      
      <div className="max-w-[1180px] mx-auto pt-6 text-[12.5px] text-[#7F92B0] font-mono">
        © 2026 BOMA Living. All rights reserved.
      </div>
    </footer>
  );
}
