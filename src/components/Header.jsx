import React, { useState, useEffect } from 'react';
import { ChevronDown, LogOut, User, BookOpen, Menu, X, Shield } from 'lucide-react';
import { SHELL_MODES } from '../constants/screens';

export default function Header({
  activeScreen,
  setActiveScreen,
  userOnboarded,
  onLogout,
  openAuthModal,
  adminUser
}) {
  const [acctMenuOpen, setAcctMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menus on screen change or click outside
  useEffect(() => {
    setAcctMenuOpen(false);
    setMobileMenuOpen(false);
  }, [activeScreen]);

  useEffect(() => {
    const handleOutsideClick = () => {
      setAcctMenuOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleAcctTriggerClick = (e) => {
    e.stopPropagation();
    setAcctMenuOpen(!acctMenuOpen);
  };

  const shellMode = SHELL_MODES[activeScreen] || 'marketing';

  // Navigation Links definition
  const handleNav = (screenId) => {
    setActiveScreen(screenId);
  };

  const getActiveNav = () => {
    if (activeScreen === 'landing') return 'landing';
    if (activeScreen === 'how-it-works') return 'how-it-works';
    if (activeScreen === 'about') return 'about';
    if (activeScreen === 'contact') return 'contact';

    if (activeScreen === 'learning') return 'learning';
    if (['profile', 'profile-edit', 'readiness-detail', 'status-tracking', 'pod-history'].includes(activeScreen)) return 'profile';
    if (['matching-status', 'pod-suggestion', 'pod-preview', 'confirm-join'].includes(activeScreen)) return 'matching';
    if (activeScreen.startsWith('commons-')) return 'commons';

    return '';
  };

  const activeNav = getActiveNav();

  const linkClass = (navKey) => {
    const isActive = activeNav === navKey;
    return `text-sm font-semibold py-1 border-b-2 transition-all duration-150 ${isActive
        ? 'text-ink border-amber'
        : 'text-ink-dim border-transparent hover:text-ink'
      }`;
  };

  return (
    <header className="sticky  z-40 bg-white/95 backdrop-blur-md border-b border-border w-full select-none">
      <div className="max-w-[1180px] mx-auto flex items-center justify-between px-6 md:px-8 h-16 relative">
        {/* Brand */}
        <div
          onClick={() => handleNav(userOnboarded ? 'learning' : 'landing')}
          className="font-display font-extrabold text-[22px] tracking-tight text-ink cursor-pointer hover:opacity-90"
        >
          BOMA
        </div>

        {/* Marketing Navigation Links */}
        {shellMode === 'marketing' && (
          <>
            <nav className="hidden md:flex items-center gap-[26px] ml-10 flex-1">
              <button onClick={() => handleNav('landing')} className={linkClass('landing')}>Home</button>
              <button onClick={() => handleNav('how-it-works')} className={linkClass('how-it-works')}>How it Works</button>
              <button onClick={() => handleNav('about')} className={linkClass('about')}>About</button>
              <button onClick={() => handleNav('contact')} className={linkClass('contact')}>Contact</button>
            </nav>
            <div className="hidden md:flex items-center gap-2.5 ml-auto">
              <button
                onClick={() => openAuthModal('login')}
                className="bg-transparent border border-border text-ink rounded-lg px-4 py-2 text-sm font-bold hover:bg-panel-alt transition-all cursor-pointer"
              >
                Log in
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="bg-amber text-white rounded-lg px-4 py-2 text-sm font-bold shadow-md hover:bg-[#2450C4] hover:-translate-y-[1px] transition-all cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </>
        )}

        {/* Logged In App Navigation Links */}
        {shellMode === 'app' && (
          <>
            <nav className="hidden md:flex items-center gap-[26px] ml-10 flex-1">
              <button onClick={() => handleNav('learning')} className={linkClass('learning')}>Learning</button>
              <button onClick={() => handleNav('profile')} className={linkClass('profile')}>Profile</button>
              <button onClick={() => handleNav('matching-status')} className={linkClass('matching')}>Matching</button>
              <button onClick={() => handleNav('commons-dashboard')} className={linkClass('commons')}>The Commons</button>
            </nav>
            <div className="hidden md:flex items-center gap-2.5 ml-auto relative">
              <div className="relative">
                <button
                  onClick={handleAcctTriggerClick}
                  className="flex items-center gap-1.5 cursor-pointer hover:opacity-85"
                >
                  <img
                    src="https://i.pravatar.cc/60?img=68"
                    className="w-8 h-8 rounded-full border border-border"
                    alt="Jordan Lee"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-ink-dim" />
                </button>

                {/* Account Menu Dropdown */}
                {acctMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-[calc(100%+8px)] w-[220px] bg-white border border-border rounded-xl shadow-lg p-1.5 flex flex-col z-50 animate-fade"
                  >
                    <div className="px-3.5 py-2.5 border-b border-border flex flex-col mb-1.5">
                      <span className="font-bold text-[13.5px] text-ink">Jordan Lee</span>
                      <span className="text-[11.5px] text-ink-dim font-medium">jordan@email.com</span>
                    </div>
                    <button
                      onClick={() => { setAcctMenuOpen(false); handleNav('learning'); }}
                      className="w-full text-left px-3.5 py-2 text-[13px] font-semibold text-ink-dim hover:text-ink hover:bg-panel-alt rounded-lg flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" /> Learning Hub
                    </button>
                    <button
                      onClick={() => { setAcctMenuOpen(false); handleNav('profile'); }}
                      className="w-full text-left px-3.5 py-2 text-[13px] font-semibold text-ink-dim hover:text-ink hover:bg-panel-alt rounded-lg flex items-center gap-2"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3.5 py-2 text-[13px] font-semibold text-rust hover:bg-red-50 rounded-lg flex items-center gap-2 mt-1.5 pt-2 border-t border-border"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Admin Navigation Header */}
        {shellMode === 'admin' && (
          <>
            <div className="hidden md:flex items-center gap-[26px] ml-10 flex-1">
              <span className="bg-teal-soft text-teal text-xs font-bold px-2.5 py-1 rounded-full border border-border">
                Admin Console
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2.5 ml-auto relative">
              <div className="relative">
                <button
                  onClick={handleAcctTriggerClick}
                  className="flex items-center gap-1.5 cursor-pointer hover:opacity-85"
                >
                  {adminUser?.avatar_url ? (
                    <img
                      src={adminUser.avatar_url}
                      className="w-8 h-8 rounded-full border border-border object-cover"
                      alt="Admin"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[12px] font-display flex-shrink-0">
                      {(adminUser?.name || adminUser?.email || 'A').substring(0, 1).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-ink-dim" />
                </button>

                {/* Admin Menu Dropdown */}
                {acctMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-[calc(100%+8px)] w-[220px] bg-white border border-border rounded-xl shadow-lg p-1.5 flex flex-col z-50 animate-fade"
                  >
                    <div className="px-3.5 py-2.5 border-b border-border flex flex-col mb-1.5 text-left">
                      <span className="font-bold text-[13.5px] text-ink">{adminUser?.name || 'Boma Admin'}</span>
                      <span className="text-[11.5px] text-ink-dim font-medium">{adminUser?.email || 'admin@boma.com'}</span>
                    </div>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3.5 py-2 text-[13px] font-semibold text-rust hover:bg-red-50 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Onboarding progress bar indicator in header */}
        {shellMode === 'onboarding' && (
          <div className="flex items-center gap-2 ml-auto text-[11px] font-mono text-ink-dim">
            <span>Onboarding Progress:</span>
            <span id="onb-progress" className="font-bold text-amber">
              {activeScreen === 'onboarding-welcome' && 'Welcome'}
              {activeScreen === 'onboarding-age' && 'Step 1 of 9'}
              {activeScreen === 'onboarding-lifestyle' && 'Step 2 of 9'}
              {activeScreen === 'onboarding-community' && 'Step 3 of 9'}
              {activeScreen === 'onboarding-location' && 'Step 4 of 9'}
              {activeScreen === 'onboarding-budget' && 'Step 5 of 9'}
              {activeScreen === 'onboarding-intent' && 'Step 6 of 9'}
              {activeScreen === 'onboarding-commitment' && 'Step 7 of 9'}
              {activeScreen === 'onboarding-review' && 'Step 8 of 9'}
              {activeScreen === 'onboarding-score' && 'Step 9 of 9'}
              {activeScreen === 'onboarding-approval' && 'Under Review'}
              {activeScreen === 'verify-email' && 'Verify Email'}
              {activeScreen.startsWith('pod-') && 'Group Registration'}
            </span>
          </div>
        )}

        {/* Mobile Hamburger menu button */}
        {(shellMode === 'marketing' || shellMode === 'app') && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 border border-border rounded-lg bg-panel hover:bg-panel-alt transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-ink" /> : <Menu className="w-5 h-5 text-ink" />}
          </button>
        )}
      </div>

      {/* Mobile Drawer (Expandable menu) */}
      {mobileMenuOpen && (shellMode === 'marketing' || shellMode === 'app') && (
        <div className="md:hidden border-t border-border bg-white p-4 flex flex-col gap-3.5 z-50 animate-fade">
          {shellMode === 'marketing' ? (
            <>
              <button onClick={() => handleNav('landing')} className="w-full text-left font-bold text-[15px] py-1.5 text-ink">Home</button>
              <button onClick={() => handleNav('how-it-works')} className="w-full text-left font-bold text-[15px] py-1.5 text-ink">How it Works</button>
              <button onClick={() => handleNav('about')} className="w-full text-left font-bold text-[15px] py-1.5 text-ink">About</button>
              <button onClick={() => handleNav('contact')} className="w-full text-left font-bold text-[15px] py-1.5 text-ink">Contact</button>
              <div className="flex gap-2.5 mt-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex-1 bg-transparent border border-border text-ink rounded-lg py-2.5 text-sm font-bold text-center hover:bg-panel-alt"
                >
                  Log in
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="flex-1 bg-amber text-white rounded-lg py-2.5 text-sm font-bold text-center shadow-md hover:bg-[#2450C4]"
                >
                  Get Started
                </button>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => handleNav('learning')} className="w-full text-left font-bold text-[15px] py-1.5 text-ink">Learning</button>
              <button onClick={() => handleNav('profile')} className="w-full text-left font-bold text-[15px] py-1.5 text-ink">Profile</button>
              <button onClick={() => handleNav('matching-status')} className="w-full text-left font-bold text-[15px] py-1.5 text-ink">Matching</button>
              <button onClick={() => handleNav('commons-dashboard')} className="w-full text-left font-bold text-[15px] py-1.5 text-ink">The Commons</button>
              <div className="flex items-center gap-2 border-t border-border pt-4 mt-2">
                <img
                  src="https://i.pravatar.cc/60?img=68"
                  className="w-8 h-8 rounded-full border border-border"
                  alt="Jordan Lee"
                />
                <div className="flex flex-col flex-1 leading-tight">
                  <span className="font-bold text-sm text-ink">Jordan Lee</span>
                  <span className="text-xs text-ink-dim font-medium">jordan@email.com</span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-rust p-1.5 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
