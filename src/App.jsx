import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import ProtoBar from './components/ProtoBar';
import Header from './components/Header';
import Sidenav from './components/Sidenav';
import OnbPanel from './components/OnbPanel';
import Footer from './components/Footer';
import Modals from './components/Modals';
import MarketingScreens from './components/screens/MarketingScreens';
import LandingPage from './LandingPage/LandingPage';
import OnboardingScreens from './components/screens/OnboardingScreens';
import AppScreens from './components/screens/AppScreens';
import AdminScreens from './components/screens/AdminScreens';
import { SHELL_MODES } from './constants/screens';
import { fetchUserProfile } from './api/users';
import { fetchPodDetails } from './api/pods';
import ConfirmModal from './components/ConfirmModal';
import Toast from './components/Toast';


const INITIAL_CHAT_MESSAGES = [
  {
    sender: 'Sam Rivera',
    text: 'Excited to have you join our Pod, Jordan! 🎉',
    time: '9:12 AM',
    avatar: null,
    isMe: false
  },
  {
    sender: 'You',
    text: 'Thanks — looking forward to getting to know everyone and building together.',
    time: '9:15 AM',
    avatar: null,
    isMe: true
  },
  {
    sender: 'Morgan Chen',
    text: 'Should we set a time to talk through the agreement scaffolding doc this week?',
    time: '9:20 AM',
    avatar: null,
    isMe: false
  },
  {
    sender: 'Taylor Kim',
    text: 'Thursday evening works great for me! We can review decision voting and equity transfer.',
    time: '9:24 AM',
    avatar: null,
    isMe: false
  }
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Global screens states
  const [activeScreen, setActiveScreen] = useState(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      const parts = path.split('/');
      const subTab = parts[2];
      return subTab ? 'admin-' + subTab : 'admin-dashboard';
    }
    if (path === '/reset-password' || path.endsWith('/reset-password')) {
      return 'reset-password';
    }
    return 'landing';
  });
  const [userOnboarded, setUserOnboarded] = useState(false);
  const [activePodId, setActivePodId] = useState(null);
  const [suggestedPodId, setSuggestedPodId] = useState(null);
  const [podHistory, setPodHistory] = useState([]);
  const [adminViewPodId, setAdminViewPodId] = useState('cedar');
  const [alignedAgreements, setAlignedAgreements] = useState([0, 1]);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('boma_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (adminUser) {
      localStorage.setItem('boma_admin_user', JSON.stringify(adminUser));
      if (activeScreen === 'admin-login' || location.pathname.startsWith('/admin')) {
        const parts = location.pathname.split('/');
        const subTab = parts[2];
        setActiveScreen(subTab ? 'admin-' + subTab : 'admin-dashboard');
      }
    } else {
      localStorage.removeItem('boma_admin_user');
    }
  }, [adminUser]);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('boma_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('boma_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('boma_current_user');
    }
  }, [currentUser]);

  const [inviteToken, setInviteToken] = useState(null);
  const [isInvitationFlow, setIsInvitationFlow] = useState(false);

  const [userPod, setUserPod] = useState(null);

  useEffect(() => {
    if (!currentUser?.id) {
      setUserPod(null);
      return;
    }
    async function syncUserDataAndPod() {
      try {
        const [freshUser, pod] = await Promise.all([
          fetchUserProfile(currentUser.id),
          fetchPodDetails(currentUser.id)
        ]);

        setUserPod(pod || null);

        if (freshUser) {
          if (JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
            setCurrentUser(freshUser);
            localStorage.setItem('boma_current_user', JSON.stringify(freshUser));
          }
        }
      } catch (err) {
        console.error('App.jsx syncUserDataAndPod error:', err);
      }
    }
    syncUserDataAndPod();
  }, [currentUser?.id, currentUser?.entry_path, activeScreen]);

  useEffect(() => {
    if (currentUser) {
      setUserOnboarded(
        currentUser.user_onboarded === true ||
        currentUser.onboarding_status === 'COMPLETED' ||
        currentUser.profile_status === 'UNDER_REVIEW' ||
        currentUser.profile_status === 'APPROVED' ||
        false
      );
    } else {
      setUserOnboarded(false);
    }
  }, [currentUser]);

  // Handle OAuth Redirect Callbacks dynamically on mount
  useEffect(() => {
    async function handleOAuthCallback() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          const email = session.user.email;

          // Check if this Google user exists in our custom 'users' table
          let { data: customUser, error: queryError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle();

          if (queryError) throw queryError;

          // If they don't exist in our custom 'users' table, register them automatically!
          if (!customUser) {
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert([
                {
                  id: session.user.id,
                  email: email.toLowerCase().trim(),
                  password: 'google_oauth_sso_' + Math.random().toString(36).substring(2, 10),
                  name: session.user.user_metadata?.full_name || 'Google User',
                  role: 'user',
                  user_onboarded: false,
                  email_verified: true,
                  profile_status: 'INCOMPLETE',
                  matching_status: 'NOT_ELIGIBLE'
                }
              ])
              .select()
              .single();

            if (insertError) throw insertError;
            customUser = newUser;
          }

          // Save session
          setCurrentUser(customUser);
          localStorage.setItem('boma_current_user', JSON.stringify(customUser));
          setUserOnboarded(customUser.user_onboarded || false);

          // Close the auth modal
          setAuthOverlay({ open: false, mode: 'login' });

          // Clear hash from URL cleanly
          window.history.replaceState(null, '', window.location.pathname);

          // Redirect
          navigateTo('profile');
        }
      } catch (err) {
        console.error('OAuth Callback Error:', err);
      }
    }

    handleOAuthCallback();
  }, []);

  const [registeredEmail, setRegisteredEmail] = useState('');

  // Global Reusable Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    onConfirm: () => { },
    type: 'info'
  });

  const showConfirm = (title, message, onConfirm, type = 'info', confirmText = 'Confirm') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText: 'Cancel',
      onConfirm,
      type
    });
  };

  // Global Reusable Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'error', key: 0 });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type, key: Date.now() });
  };

  const clearToast = () => {
    setToast({ show: false, message: '', type: 'error', key: 0 });
  };

  // Overlays / Modals States
  const [authOverlay, setAuthOverlay] = useState({ open: false, mode: 'login' });
  const [videoModal, setVideoModal] = useState({ open: false, title: '', iframeUrl: null, desc: '' });
  const [whatsBomaModalOpen, setWhatsBomaModalOpen] = useState(false);
  const [agreementDocModalOpen, setAgreementDocModalOpen] = useState(false);

  // Chat Log State
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT_MESSAGES);

  // Scroll to top of window immediately on screen or pathname changes (unless navigating to an anchor hash)
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [activeScreen, location.pathname]);

  const checkAuthAndNavigate = (screenId, currentU = currentUser, adminU = adminUser) => {
    // Read from localStorage directly if state is lagging to avoid async race condition
    if (!adminU && screenId.startsWith('admin-')) {
      try {
        const saved = localStorage.getItem('boma_admin_user');
        if (saved) adminU = JSON.parse(saved);
      } catch { }
    }
    if (!currentU) {
      try {
        const saved = localStorage.getItem('boma_current_user');
        if (saved) currentU = JSON.parse(saved);
      } catch { }
    }

    if (screenId.startsWith('admin-') && screenId !== 'admin-login') {
      if (!adminU) {
        return 'admin-login';
      }
      return screenId;
    }
    const mode = SHELL_MODES[screenId];
    const isUserAppScreen = mode === 'app' || (mode === 'onboarding' && screenId !== 'verify-email' && screenId !== 'join-pod');
    if (isUserAppScreen && !currentU) {
      setAuthOverlay({ open: true, mode: 'login' });
      return 'landing';
    }
    return screenId;
  };

  // Navigate helper function using react-router-dom
  const navigateTo = (screenIdOrPath) => {
    if (typeof screenIdOrPath === 'string' && screenIdOrPath.startsWith('/')) {
      navigate(screenIdOrPath);
      return;
    }
    const resolvedScreenId = checkAuthAndNavigate(screenIdOrPath);
    setActiveScreen(resolvedScreenId);

    let path = '/';
    if (resolvedScreenId === 'how-it-works') path = '/howworks';
    else if (resolvedScreenId === 'about') path = '/about';
    else if (resolvedScreenId === 'contact') path = '/contact';
    else if (resolvedScreenId === 'landing2') path = '/landing2';
    else if (resolvedScreenId === 'landing') path = '/';
    else if (resolvedScreenId === 'verify-email') path = '/verify-email';
    else if (resolvedScreenId === 'reset-password') path = '/reset-password';
    else if (resolvedScreenId === 'learning') path = '/learning';
    else if (resolvedScreenId === 'profile') path = '/profile';
    else if (resolvedScreenId === 'admin-login') path = '/admin';
    else if (resolvedScreenId.startsWith('admin-')) {
      const subTab = resolvedScreenId.substring(6);
      path = subTab === 'dashboard' ? '/admin' : `/admin/${subTab}`;
    }
    else path = '/' + resolvedScreenId;

    if (location.pathname !== path) {
      navigate(path);
    }
  };

  // Sync activeScreen state on URL pathname change
  useEffect(() => {
    const path = location.pathname;
    let targetScreen = 'landing';

    if (path === '/') {
      targetScreen = 'landing';
    } else if (path === '/landing2') {
      targetScreen = 'landing2';
    } else if (path === '/howworks') {
      targetScreen = 'how-it-works';
    } else if (path === '/about') {
      targetScreen = 'about';
    } else if (path === '/contact') {
      targetScreen = 'contact';
    } else if (path === '/admin' || path.startsWith('/admin/')) {
      const parts = path.split('/');
      const subTab = parts[2];
      targetScreen = subTab ? 'admin-' + subTab : 'admin-dashboard';
    } else if (path === '/verify-email') {
      targetScreen = 'verify-email';
    } else if (path === '/reset-password') {
      targetScreen = 'reset-password';
    } else if (path === '/learning') {
      targetScreen = 'learning';
    } else if (path === '/profile') {
      targetScreen = 'profile';
    } else {
      const screenId = path.substring(1);
      if (SHELL_MODES[screenId]) {
        targetScreen = screenId;
      } else {
        targetScreen = 'not-found';
      }
    }

    const storedUser = localStorage.getItem('boma_current_user');
    const storedAdmin = localStorage.getItem('boma_admin_user');
    const currentU = storedUser ? JSON.parse(storedUser) : null;
    const adminU = storedAdmin ? JSON.parse(storedAdmin) : null;

    const resolved = checkAuthAndNavigate(targetScreen, currentU, adminU);
    setActiveScreen(resolved);
  }, [location.pathname]);

  // Determine active shell mode
  const shellMode = SHELL_MODES[activeScreen] || 'marketing';
  const isAppOrAdmin = shellMode === 'app' || (shellMode === 'admin' && !!adminUser);

  // Dynamic layout wrappers to match index.html styling hierarchy
  let shellFrameClass = "flex-1 w-full flex flex-col md:flex-row relative";
  let mainContentClass = "flex-1 w-full min-h-[500px]";
  const outerContainerClass = isAppOrAdmin
    ? "h-screen bg-bg flex flex-col text-ink font-sans overflow-hidden"
    : "min-h-screen bg-bg flex flex-col text-ink font-sans";

  if (isAppOrAdmin) {
    shellFrameClass = "flex-1 min-h-0 w-full max-w-[1180px] mx-auto grid grid-cols-1 md:grid-cols-[236px_1fr] items-stretch relative overflow-hidden";
    mainContentClass = "h-full overflow-y-auto w-full pb-16 px-1";
  } else if (shellMode === 'onboarding') {
    shellFrameClass = "flex-1 w-full grid grid-cols-1 md:grid-cols-[400px_1fr] items-stretch min-h-[calc(100vh-64px)] relative";
    mainContentClass = "flex-1 w-full min-h-[500px] flex items-center";
  } else if (shellMode === 'auth') {
    shellFrameClass = "flex-1 w-full min-h-screen relative";
    mainContentClass = activeScreen === 'admin-login'
      ? "flex-1 w-full min-h-screen"
      : "flex-1 w-full flex items-center justify-center";
  } else {
    // marketing
    shellFrameClass = "flex-1 w-full relative";
    mainContentClass = activeScreen === 'landing'
      ? "flex-1 w-full min-h-[500px]"
      : "flex-1 w-full max-w-[1180px] mx-auto min-h-[500px]";
  }

  // Modal actions helpers
  const openAuthModal = (mode, initialEmail = '') => {
    clearToast();
    setAuthOverlay({ open: true, mode, initialEmail });
  };



  const handleOpenVideo = (title, iframeUrl, desc) => {
    setVideoModal({ open: true, title, iframeUrl, desc });
  };

  const handleLogout = async () => {
    clearToast();
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Supabase signOut error:", e);
    }
    setUserOnboarded(false);
    setActivePodId('cedar');
    setPodHistory([]);
    setSuggestedPodId(null);
    setAlignedAgreements([0, 1]);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setAdminUser(null);
    setCurrentUser(null);
    navigateTo('landing');
  };

  return (
    <div className={outerContainerClass}>


      {/* 2. Main Site Navigation */}
      {(!activeScreen.startsWith('admin-') || !!adminUser) && activeScreen !== 'landing' && activeScreen !== 'admin-login' && (
        <Header
          activeScreen={activeScreen}
          setActiveScreen={navigateTo}
          userOnboarded={userOnboarded}
          onLogout={handleLogout}
          openAuthModal={openAuthModal}
          adminUser={adminUser}
          currentUser={currentUser}
          userPod={userPod}
        />
      )}

      {/* 3. Core Shell Frame Layout */}
      <div className={shellFrameClass}>
        {/* Render Sidenav if in app/admin shells */}
        {isAppOrAdmin && (
          <Sidenav
            activeScreen={activeScreen}
            setActiveScreen={navigateTo}
            userOnboarded={userOnboarded}
            currentUser={currentUser}
            userPod={userPod}
          />
        )}

        {/* Render OnbPanel if in onboarding shell */}
        {shellMode === 'onboarding' && (
          <OnbPanel activeScreen={activeScreen} />
        )}

        {/* Renders screen content via React Router Routes */}
        <main className={mainContentClass}>
          <Routes>
            <Route path="/" element={
              <LandingPage
                openAuthModal={openAuthModal}
                setActiveScreen={navigateTo}
                currentUser={currentUser}
              />
            } />
            <Route path="/landing2" element={
              <MarketingScreens
                activeScreen="landing2"
                setActiveScreen={navigateTo}
                openAuthModal={openAuthModal}
                userOnboarded={userOnboarded}
                setUserOnboarded={setUserOnboarded}
                registeredEmail={registeredEmail}
                setCurrentUser={setCurrentUser}
                currentUser={currentUser}
                showToast={showToast}
                inviteToken={inviteToken}
                setInviteToken={setInviteToken}
                isInvitationFlow={isInvitationFlow}
                setIsInvitationFlow={setIsInvitationFlow}
              />
            } />
            <Route path="/howworks" element={
              <MarketingScreens
                activeScreen="how-it-works"
                setActiveScreen={navigateTo}
                openAuthModal={openAuthModal}
                userOnboarded={userOnboarded}
                setUserOnboarded={setUserOnboarded}
                registeredEmail={registeredEmail}
                setCurrentUser={setCurrentUser}
                currentUser={currentUser}
                showToast={showToast}
                inviteToken={inviteToken}
                setInviteToken={setInviteToken}
                isInvitationFlow={isInvitationFlow}
                setIsInvitationFlow={setIsInvitationFlow}
              />
            } />
            <Route path="/about" element={
              <MarketingScreens
                activeScreen="about"
                setActiveScreen={navigateTo}
                openAuthModal={openAuthModal}
                userOnboarded={userOnboarded}
                setUserOnboarded={setUserOnboarded}
                registeredEmail={registeredEmail}
                setCurrentUser={setCurrentUser}
                currentUser={currentUser}
                showToast={showToast}
                inviteToken={inviteToken}
                setInviteToken={setInviteToken}
                isInvitationFlow={isInvitationFlow}
                setIsInvitationFlow={setIsInvitationFlow}
              />
            } />
            <Route path="/contact" element={
              <MarketingScreens
                activeScreen="contact"
                setActiveScreen={navigateTo}
                openAuthModal={openAuthModal}
                userOnboarded={userOnboarded}
                setUserOnboarded={setUserOnboarded}
                registeredEmail={registeredEmail}
                setCurrentUser={setCurrentUser}
                currentUser={currentUser}
                showToast={showToast}
                inviteToken={inviteToken}
                setInviteToken={setInviteToken}
                isInvitationFlow={isInvitationFlow}
                setIsInvitationFlow={setIsInvitationFlow}
              />
            } />
            <Route path="*" element={
              activeScreen === 'not-found' ? (
                <MarketingScreens
                  activeScreen="not-found"
                  setActiveScreen={navigateTo}
                  openAuthModal={openAuthModal}
                  userOnboarded={userOnboarded}
                  setUserOnboarded={setUserOnboarded}
                  registeredEmail={registeredEmail}
                  setCurrentUser={setCurrentUser}
                  currentUser={currentUser}
                  showToast={showToast}
                  inviteToken={inviteToken}
                  setInviteToken={setInviteToken}
                  isInvitationFlow={isInvitationFlow}
                  setIsInvitationFlow={setIsInvitationFlow}
                />
              ) : (
                <>
                  <MarketingScreens
                    activeScreen={activeScreen}
                    setActiveScreen={navigateTo}
                    openAuthModal={openAuthModal}
                    userOnboarded={userOnboarded}
                    setUserOnboarded={setUserOnboarded}
                    registeredEmail={registeredEmail}
                    setCurrentUser={setCurrentUser}
                    currentUser={currentUser}
                    showToast={showToast}
                    inviteToken={inviteToken}
                    setInviteToken={setInviteToken}
                    isInvitationFlow={isInvitationFlow}
                    setIsInvitationFlow={setIsInvitationFlow}
                  />

                  <OnboardingScreens
                    activeScreen={activeScreen}
                    setActiveScreen={navigateTo}
                    userOnboarded={userOnboarded}
                    setUserOnboarded={setUserOnboarded}
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    showToast={showToast}
                  />

                  <AppScreens
                    activeScreen={activeScreen}
                    setActiveScreen={navigateTo}
                    userOnboarded={userOnboarded}
                    setUserOnboarded={setUserOnboarded}
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    podHistory={podHistory}
                    setPodHistory={setPodHistory}
                    openVideoModal={handleOpenVideo}
                    openWhatsBomaModal={() => setWhatsBomaModalOpen(true)}
                    openAgreementDocModal={() => setAgreementDocModalOpen(true)}
                    chatMessages={chatMessages}
                    setChatMessages={setChatMessages}
                    alignedAgreements={alignedAgreements}
                    setAlignedAgreements={setAlignedAgreements}
                    showConfirm={showConfirm}
                    showToast={showToast}
                    userPod={userPod}
                    setUserPod={setUserPod}
                  />

                  <AdminScreens
                    activeScreen={activeScreen}
                    setActiveScreen={navigateTo}
                    adminViewPodId={adminViewPodId}
                    setAdminViewPodId={setAdminViewPodId}
                    adminUser={adminUser}
                    setAdminUser={setAdminUser}
                    showToast={showToast}
                    showConfirm={showConfirm}
                  />
                </>
              )
            } />
          </Routes>
        </main>
      </div>

      {/* 4. Footer */}
      {shellMode === 'marketing' && activeScreen !== 'admin-login' && activeScreen !== 'landing' && (
        <Footer
          setActiveScreen={navigateTo}
          openAuthModal={openAuthModal}
          userOnboarded={userOnboarded}
        />
      )}

      {/* 5. Modals Overlays Container */}
      <Modals
        authOverlay={authOverlay}
        setAuthOverlay={setAuthOverlay}
        videoModal={videoModal}
        setVideoModal={setVideoModal}
        whatsBomaModalOpen={whatsBomaModalOpen}
        setWhatsBomaModalOpen={setWhatsBomaModalOpen}
        agreementDocModalOpen={agreementDocModalOpen}
        setAgreementDocModalOpen={setAgreementDocModalOpen}
        setActiveScreen={navigateTo}
        userOnboarded={userOnboarded}
        setUserOnboarded={setUserOnboarded}
        registeredEmail={registeredEmail}
        setRegisteredEmail={setRegisteredEmail}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        showToast={showToast}
        inviteToken={inviteToken}
        isInvitationFlow={isInvitationFlow}
      />

      {/* Global Full-Screen Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        type={confirmModal.type}
      />

      {/* Global Toast Notifications */}
      {toast.show && (
        <Toast
          key={toast.key || toast.message + Date.now()}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
}

export default App;
