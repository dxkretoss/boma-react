import React, { useState, useEffect } from 'react';
import { ChevronDown, LogOut, User, BookOpen, Menu, X, Shield, Bell } from 'lucide-react';
import { SHELL_MODES } from '../constants/screens';
import { supabase } from '../supabaseClient';

export default function Header({
  activeScreen,
  setActiveScreen,
  userOnboarded,
  onLogout,
  openAuthModal,
  adminUser,
  currentUser
}) {
  const [acctMenuOpen, setAcctMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);

  // Close menus on screen change or click outside
  useEffect(() => {
    setAcctMenuOpen(false);
    setNotifMenuOpen(false);
    setMobileMenuOpen(false);
  }, [activeScreen]);

  useEffect(() => {
    const handleOutsideClick = () => {
      setAcctMenuOpen(false);
      setNotifMenuOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleNotifTriggerClick = (e) => {
    e.stopPropagation();
    setNotifMenuOpen(!notifMenuOpen);
    setAcctMenuOpen(false);
  };

  const handleNotifClick = (notif) => {
    setNotifMenuOpen(false);
    if (notif.id.includes('profile')) {
      setActiveScreen('profile');
    } else if (notif.id.includes('match') || notif.id.includes('pod')) {
      setActiveScreen('matching-status');
    }
  };

  // Fetch real-time notification states dynamically on interval
  useEffect(() => {
    if (!currentUser?.id) {
      setNotifications([]);
      return;
    }

    async function loadNotifications() {
      try {
        const notifs = [];

        // 1. Profile Status
        if (currentUser.profile_status === 'APPROVED') {
          notifs.push({
            id: 'profile-approved',
            title: 'Profile Approved',
            message: 'BOMA Operations approved your onboarding profile. You are now in the matching pool!',
            type: 'success',
            date: 'Today'
          });
        } else if (currentUser.profile_status === 'REJECTED') {
          notifs.push({
            id: 'profile-rejected',
            title: 'Profile Action Required',
            message: 'BOMA Operations requested updates to your onboarding profile. Click to fix.',
            type: 'alert',
            date: 'Today'
          });
        }

        // 2. Fetch pod details
        const { data: podMember } = await supabase
          .from('pod_members')
          .select('pod_id, membership_status')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (podMember) {
          const { data: pod } = await supabase
            .from('pods')
            .select('*')
            .eq('id', podMember.pod_id)
            .single();

          if (pod) {
            const { data: allMems } = await supabase
              .from('pod_members')
              .select('*, user:users(name)')
              .eq('pod_id', pod.id);

            // Match proposal
            if (pod.status === 'CREATING') {
              if (podMember.membership_status === 'PENDING') {
                notifs.push({
                  id: 'match-proposal',
                  title: 'Action Required: Match Found!',
                  message: `A compatible Pod match "${pod.name}" is approved by the Board. Review and accept your spot!`,
                  type: 'action',
                  date: 'Today',
                  unread: true
                });
              } else if (podMember.membership_status === 'ACCEPTED') {
                notifs.push({
                  id: 'match-accepted-self',
                  title: 'Pod Proposal Confirmed',
                  message: `You accepted the match for "${pod.name}". Waiting for other members to accept.`,
                  type: 'info',
                  date: 'Today'
                });
              }

              // Notify about other members' confirmations
              if (allMems) {
                allMems.forEach(m => {
                  if (m.user_id !== currentUser.id) {
                    if (m.membership_status === 'ACCEPTED') {
                      notifs.push({
                        id: `match-accepted-${m.user_id}`,
                        title: 'Member Confirmed Match',
                        message: `${m.user?.name || 'A neighbor'} accepted the proposed Pod match.`,
                        type: 'info',
                        date: 'Today'
                      });
                    } else if (m.membership_status === 'DECLINED') {
                      notifs.push({
                        id: `match-declined-${m.user_id}`,
                        title: 'Member Declined Match',
                        message: `${m.user?.name || 'A neighbor'} declined the proposed match.`,
                        type: 'alert',
                        date: 'Today'
                      });
                    }
                  }
                });
              }
            } else if (pod.status === 'ACTIVE') {
              notifs.push({
                id: 'pod-active',
                title: 'Pod Activated!',
                message: `Congratulations! "${pod.name}" is active. Meet your group in The Commons!`,
                type: 'success',
                date: 'Today'
              });
            } else if (pod.status === 'UNDER_REVIEW') {
              notifs.push({
                id: 'pod-review',
                title: 'Match Under Board Review',
                message: `The compatibility pod "${pod.name}" is currently under review by BOMA administrators.`,
                type: 'info',
                date: 'Today'
              });
            }
          }
        }

        setNotifications(notifs);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    }

    loadNotifications();
    const interval = setInterval(loadNotifications, 5000); // Poll every 5s for fast updates
    return () => clearInterval(interval);
  }, [currentUser]);

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
    <header className="sticky  z-40 bg-white/95 backdrop-blur-md border-b border-border w-full ">
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
            <div className="hidden md:flex items-center gap-4 ml-auto">
              {currentUser ? (
                <>
                  {/* Notifications Bell Icon */}
                  <div className="relative">
                    <button
                      onClick={handleNotifTriggerClick}
                      className="relative p-2 text-ink-dim hover:text-ink hover:bg-panel-alt rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                    >
                      <Bell className="w-5 h-5" />
                      {notifications.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rust animate-pulse"></span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {notifMenuOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-[calc(100%+8px)] w-[320px] bg-white border border-border rounded-xl shadow-lg p-1.5 flex flex-col z-50 animate-fade max-h-[380px] overflow-y-auto"
                      >
                        <div className="px-3.5 py-2.5 border-b border-border flex justify-between items-center mb-1.5 text-left">
                          <span className="font-bold text-[13.5px] text-ink">Notifications</span>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-dim font-bold">{notifications.length} Active</span>
                        </div>

                        {notifications.length === 0 ? (
                          <div className="py-8 px-4 text-center text-xs text-ink-dim font-medium">
                            No notifications at this time.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {notifications.map((n) => (
                              <button
                                key={n.id}
                                onClick={() => handleNotifClick(n)}
                                className="w-full text-left p-3 rounded-lg hover:bg-panel-alt transition-colors flex items-start gap-2.5 border border-transparent hover:border-border/40"
                              >
                                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'success' ? 'bg-emerald-500' :
                                    n.type === 'alert' ? 'bg-rust' :
                                      n.type === 'action' ? 'bg-amber' : 'bg-teal'
                                  }`} />
                                <div className="flex-1 flex flex-col text-left">
                                  <span className="font-bold text-[12px] text-ink">{n.title}</span>
                                  <span className="text-[11.5px] text-ink-dim leading-snug mt-0.5">{n.message}</span>
                                  <span className="text-[9px] text-ink-dim font-mono mt-1.5 font-bold uppercase tracking-wider">{n.date}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={handleAcctTriggerClick}
                      className="flex items-center gap-1.5 cursor-pointer hover:opacity-85"
                    >
                      {currentUser.avatar_url && (currentUser.avatar_url.startsWith('http') || currentUser.avatar_url.startsWith('/') || currentUser.avatar_url.startsWith('assets/')) ? (
                        <img
                          src={currentUser.avatar_url}
                          className="w-8 h-8 rounded-full border border-border object-cover"
                          alt=""
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[12px] font-display flex-shrink-0">
                          {(currentUser.name || currentUser.email || 'U').substring(0, 1).toUpperCase()}
                        </div>
                      )}
                      <ChevronDown className="w-3.5 h-3.5 text-ink-dim" />
                    </button>

                    {/* Account Menu Dropdown */}
                    {acctMenuOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-[calc(100%+8px)] w-[220px] bg-white border border-border rounded-xl shadow-lg p-1.5 flex flex-col z-50 animate-fade"
                      >
                        <div className="px-3.5 py-2.5 border-b border-border flex flex-col mb-1.5 text-left">
                          <span className="font-bold text-[13.5px] text-ink">{currentUser.name || 'User'}</span>
                          <span className="text-[11.5px] text-ink-dim font-medium">{currentUser.email || 'user@boma.com'}</span>
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
                          onClick={() => { setAcctMenuOpen(false); onLogout(); }}
                          className="w-full text-left px-3.5 py-2 text-[13px] font-semibold text-rust hover:bg-red-50 rounded-lg flex items-center gap-2 border-t border-border mt-1 pt-2"
                        >
                          <LogOut className="w-4 h-4" /> Log out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </>
        )}

        {/* Logged In App Navigation Links */}
        {shellMode === 'app' && (
          <>
            <nav className="hidden md:flex items-center gap-[26px] ml-10 flex-1">
              <button onClick={() => handleNav('learning')} className={linkClass('learning')}>Learning</button>
              <button onClick={() => handleNav('profile')} className={linkClass('profile')}>Profile</button>
              {currentUser?.entry_path !== 'EXISTING_POD' && currentUser?.matching_status !== 'MATCHED' && (
                <button onClick={() => handleNav('matching-status')} className={linkClass('matching')}>Matching</button>
              )}
              <button onClick={() => handleNav('commons-dashboard')} className={linkClass('commons')}>The Commons</button>
            </nav>
            <div className="hidden md:flex items-center gap-4 ml-auto relative">
              {/* Notifications Bell Icon */}
              <div className="relative">
                <button
                  onClick={handleNotifTriggerClick}
                  className="relative p-2 text-ink-dim hover:text-ink hover:bg-panel-alt rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rust animate-pulse"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-[calc(100%+8px)] w-[320px] bg-white border border-border rounded-xl shadow-lg p-1.5 flex flex-col z-50 animate-fade max-h-[380px] overflow-y-auto"
                  >
                    <div className="px-3.5 py-2.5 border-b border-border flex justify-between items-center mb-1.5 text-left">
                      <span className="font-bold text-[13.5px] text-ink">Notifications</span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-ink-dim font-bold">{notifications.length} Active</span>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="py-8 px-4 text-center text-xs text-ink-dim font-medium">
                        No notifications at this time.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => handleNotifClick(n)}
                            className="w-full text-left p-3 rounded-lg hover:bg-panel-alt transition-colors flex items-start gap-2.5 border border-transparent hover:border-border/40"
                          >
                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'success' ? 'bg-emerald-500' :
                                n.type === 'alert' ? 'bg-rust' :
                                  n.type === 'action' ? 'bg-amber' : 'bg-teal'
                              }`} />
                            <div className="flex-1 flex flex-col text-left">
                              <span className="font-bold text-[12px] text-ink">{n.title}</span>
                              <span className="text-[11.5px] text-ink-dim leading-snug mt-0.5">{n.message}</span>
                              <span className="text-[9px] text-ink-dim font-mono mt-1.5 font-bold uppercase tracking-wider">{n.date}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={handleAcctTriggerClick}
                  className="flex items-center gap-1.5 cursor-pointer hover:opacity-85"
                >
                  {currentUser?.avatar_url && (currentUser.avatar_url.startsWith('http') || currentUser.avatar_url.startsWith('/') || currentUser.avatar_url.startsWith('assets/')) ? (
                    <img
                      src={currentUser.avatar_url}
                      className="w-8 h-8 rounded-full border border-border object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[12px] font-display flex-shrink-0">
                      {(currentUser?.name || currentUser?.email || 'U').substring(0, 1).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-ink-dim" />
                </button>

                {/* Account Menu Dropdown */}
                {acctMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-[calc(100%+8px)] w-[220px] bg-white border border-border rounded-xl shadow-lg p-1.5 flex flex-col z-50 animate-fade"
                  >
                    <div className="px-3.5 py-2.5 border-b border-border flex flex-col mb-1.5 text-left">
                      <span className="font-bold text-[13.5px] text-ink">{currentUser?.name || 'User'}</span>
                      <span className="text-[11.5px] text-ink-dim font-medium">{currentUser?.email || 'user@boma.com'}</span>
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
                  {adminUser?.avatar_url && (adminUser.avatar_url.startsWith('http') || adminUser.avatar_url.startsWith('/') || adminUser.avatar_url.startsWith('assets/')) ? (
                    <img
                      src={adminUser.avatar_url}
                      className="w-8 h-8 rounded-full border border-border object-cover"
                      alt=""
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
          <div className="flex items-center gap-6 ml-auto">
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-ink-dim">
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

            {currentUser && (
              <div className="relative">
                <button
                  onClick={handleAcctTriggerClick}
                  className="flex items-center gap-1.5 cursor-pointer hover:opacity-85"
                >
                  {currentUser.avatar_url && (currentUser.avatar_url.startsWith('http') || currentUser.avatar_url.startsWith('/') || currentUser.avatar_url.startsWith('assets/')) ? (
                    <img
                      src={currentUser.avatar_url}
                      className="w-8 h-8 rounded-full border border-border object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[12px] font-display flex-shrink-0">
                      {(currentUser.name || currentUser.email || 'U').substring(0, 1).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-ink-dim" />
                </button>

                {/* Account Menu Dropdown */}
                {acctMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-[calc(100%+8px)] w-[220px] bg-white border border-border rounded-xl shadow-lg p-1.5 flex flex-col z-50 animate-fade"
                  >
                    <div className="px-3.5 py-2.5 border-b border-border flex flex-col mb-1.5 text-left">
                      <span className="font-bold text-[13.5px] text-ink">{currentUser.name || 'User'}</span>
                      <span className="text-[11.5px] text-ink-dim font-medium">{currentUser.email || 'user@boma.com'}</span>
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
                      onClick={() => { setAcctMenuOpen(false); onLogout(); }}
                      className="w-full text-left px-3.5 py-2 text-[13px] font-semibold text-rust hover:bg-red-50 rounded-lg flex items-center gap-2 mt-1.5 pt-2 border-t border-border"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            )}
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
          {shellMode === 'marketing' && !currentUser ? (
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
              {shellMode === 'marketing' && (
                <>
                  <button onClick={() => handleNav('landing')} className="w-full text-left font-bold text-[15px] py-1.5 text-ink">Home</button>
                  <button onClick={() => handleNav('how-it-works')} className="w-full text-left font-bold text-[15px] py-1.5 text-ink">How it Works</button>
                  <button onClick={() => handleNav('about')} className="w-full text-left font-bold text-[15px] py-1.5 text-ink">About</button>
                  <button onClick={() => handleNav('contact')} className="w-full text-left font-bold text-[15px] py-1.5 text-ink">Contact</button>
                  <div className="h-[1px] bg-border my-2"></div>
                </>
              )}
              <button onClick={() => handleNav('learning')} className="w-full text-left font-bold text-[15px] py-1.5 text-ink">Learning</button>
              <button onClick={() => handleNav('profile')} className="w-full text-left font-bold text-[15px] py-1.5 text-ink">Profile</button>
              {currentUser?.entry_path !== 'EXISTING_POD' && currentUser?.matching_status !== 'MATCHED' && (
                <button onClick={() => handleNav('matching-status')} className="w-full text-left font-bold text-[15px] py-1.5 text-ink">Matching</button>
              )}
              <button onClick={() => handleNav('commons-dashboard')} className="w-full text-left font-bold text-[15px] py-1.5 text-ink">The Commons</button>
              <div className="flex items-center gap-2 border-t border-border pt-4 mt-2">
                {currentUser?.avatar_url && (currentUser.avatar_url.startsWith('http') || currentUser.avatar_url.startsWith('/') || currentUser.avatar_url.startsWith('assets/')) ? (
                  <img
                    src={currentUser.avatar_url}
                    className="w-8 h-8 rounded-full border border-border object-cover"
                    alt=""
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[12px] font-display flex-shrink-0">
                    {(currentUser?.name || currentUser?.email || 'U').substring(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col flex-1 leading-tight text-left">
                  <span className="font-bold text-sm text-ink">{currentUser?.name || 'User'}</span>
                  <span className="text-xs text-ink-dim font-medium">{currentUser?.email || 'user@boma.com'}</span>
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
