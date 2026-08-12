import React, { useState, useEffect } from 'react';
import ProtoBar from './components/ProtoBar';
import Header from './components/Header';
import Sidenav from './components/Sidenav';
import OnbPanel from './components/OnbPanel';
import Footer from './components/Footer';
import Modals from './components/Modals';
import MarketingScreens from './components/screens/MarketingScreens';
import OnboardingScreens from './components/screens/OnboardingScreens';
import AppScreens from './components/screens/AppScreens';
import AdminScreens from './components/screens/AdminScreens';
import { SHELL_MODES } from './constants/screens';

// Constants for initial Pod data
const INITIAL_POD_DATA = {
  cedar: {
    name: 'Cedar Grove Pod',
    location: 'Austin, TX',
    formed: '12 days ago',
    photo: 'assets/pod_austin.png',
    avgReadiness: 83,
    health: 'Stable',
    matchPct: 87,
    origin: 'Matched via Engine',
    tags: ['Austin, TX', 'Suburban', 'Sustainability', '5+ year commitment'],
    members: [
      { name: 'Sam Rivera', img: 12, detail: 'Purchase primary residence · 5+ yrs', score: 88, joined: '12 days ago' },
      { name: 'Morgan Chen', img: 47, detail: 'Co-develop property · Flexible', score: 79, joined: '12 days ago' },
      { name: 'Taylor Kim', img: 33, detail: 'Purchase primary residence · 5+ yrs', score: 84, joined: '9 days ago' }
    ]
  },
  willow: {
    name: 'Willow Creek Pod',
    location: 'Denver, CO',
    formed: 'Today',
    photo: 'assets/pod_denver.png',
    avgReadiness: 78,
    health: 'Stable',
    matchPct: 79,
    origin: 'Matched via Engine',
    tags: ['Denver, CO', 'Rural', 'Remote-work friendly', '2+ year commitment'],
    members: [
      { name: 'Alex Rivera', img: 15, detail: 'Co-develop property · 5+ yrs', score: 81, joined: '2 days ago' },
      { name: 'Jamie Novak', img: 44, detail: 'Lifestyle-based co-living · Flexible', score: 76, joined: '2 days ago' },
      { name: 'Casey Blue', img: 29, detail: 'Purchase primary residence · 2+ yrs', score: 74, joined: 'today' }
    ]
  }
};

const INITIAL_CHAT_MESSAGES = [
  {
    sender: 'Sam Rivera',
    text: 'Excited to have you join our Pod, Jordan! 🎉',
    time: '9:12 AM',
    avatar: 'https://i.pravatar.cc/80?img=12',
    isMe: false
  },
  {
    sender: 'You',
    text: 'Thanks — looking forward to getting to know everyone and building together.',
    time: '9:15 AM',
    avatar: 'https://i.pravatar.cc/80?img=68',
    isMe: true
  },
  {
    sender: 'Morgan Chen',
    text: 'Should we set a time to talk through the agreement scaffolding doc this week?',
    time: '9:20 AM',
    avatar: 'https://i.pravatar.cc/80?img=47',
    isMe: false
  },
  {
    sender: 'Taylor Kim',
    text: 'Thursday evening works great for me! We can review decision voting and equity transfer.',
    time: '9:24 AM',
    avatar: 'https://i.pravatar.cc/80?img=33',
    isMe: false
  }
];

function App() {
  // Global screens states
  const [activeScreen, setActiveScreen] = useState(() => {
    const path = window.location.pathname;
    if (path === '/admin' || path.endsWith('/admin')) {
      return 'admin-login';
    }
    if (path === '/reset-password' || path.endsWith('/reset-password')) {
      return 'reset-password';
    }
    return 'landing';
  });
  const [userOnboarded, setUserOnboarded] = useState(false);
  const [activePodId, setActivePodId] = useState('cedar');
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

  useEffect(() => {
    if (currentUser) {
      setUserOnboarded(currentUser.user_onboarded || false);
    } else {
      setUserOnboarded(false);
    }
  }, [currentUser]);

  const [registeredEmail, setRegisteredEmail] = useState('');

  // Overlays / Modals States
  const [authOverlay, setAuthOverlay] = useState({ open: false, mode: 'login' });
  const [videoModal, setVideoModal] = useState({ open: false, title: '', iframeUrl: null, desc: '' });
  const [whatsBomaModalOpen, setWhatsBomaModalOpen] = useState(false);
  const [agreementDocModalOpen, setAgreementDocModalOpen] = useState(false);

  // Chat Log State
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT_MESSAGES);

  // Scroll to top of window on screen changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeScreen]);

  // Detect URL path changes and handle popstate routing
  const navigateTo = (screenId) => {
    let path = '/';
    if (screenId === 'how-it-works') path = '/howworks';
    else if (screenId === 'about') path = '/about';
    else if (screenId === 'contact') path = '/contact';
    else if (screenId === 'landing') path = '/';
    else if (screenId === 'verify-email') path = '/verify-email';
    else if (screenId === 'reset-password') path = '/reset-password';
    else if (screenId === 'learning') path = '/learning';
    else if (screenId === 'profile') path = '/profile';
    else if (screenId.startsWith('admin-')) path = '/admin';
    else path = '/' + screenId;

    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    setActiveScreen(screenId);
  };

  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      if (path === '/howworks') {
        setActiveScreen('how-it-works');
      } else if (path === '/about') {
        setActiveScreen('about');
      } else if (path === '/contact') {
        setActiveScreen('contact');
      } else if (path === '/admin') {
        if (adminUser) {
          setActiveScreen('admin-dashboard');
        } else {
          setActiveScreen('admin-login');
        }
      } else if (path === '/verify-email') {
        setActiveScreen('verify-email');
      } else if (path === '/reset-password') {
        setActiveScreen('reset-password');
      } else if (path === '/learning') {
        setActiveScreen('learning');
      } else if (path === '/profile') {
        setActiveScreen('profile');
      } else if (path === '/') {
        setActiveScreen('landing');
      } else {
        const screenId = path.substring(1);
        if (screenId) {
          setActiveScreen(screenId);
        } else {
          setActiveScreen('landing');
        }
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    handleUrlChange();

    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [adminUser]);

  // Determine active shell mode
  const shellMode = SHELL_MODES[activeScreen] || 'marketing';

  // Dynamic layout wrappers to match index.html styling hierarchy
  let shellFrameClass = "flex-1 w-full flex flex-col md:flex-row relative";
  let mainContentClass = "flex-1 w-full min-h-[500px]";

  if (shellMode === 'app' || shellMode === 'admin') {
    shellFrameClass = "flex-1 w-full max-w-[1180px] mx-auto grid grid-cols-1 md:grid-cols-[236px_1fr] items-start relative";
    mainContentClass = "flex-1 w-full min-h-[500px]";
  } else if (shellMode === 'onboarding') {
    shellFrameClass = "flex-1 w-full grid grid-cols-1 md:grid-cols-[400px_1fr] items-stretch min-h-[calc(100vh-64px)] relative";
    mainContentClass = "flex-1 w-full min-h-[500px] flex items-center";
  } else {
    // marketing
    shellFrameClass = "flex-1 w-full relative";
    mainContentClass = "flex-1 w-full max-w-[1180px] mx-auto min-h-[500px]";
  }

  // Modal actions helpers
  const openAuthModal = (mode) => {
    setAuthOverlay({ open: true, mode });
  };



  const handleOpenVideo = (title, iframeUrl, desc) => {
    setVideoModal({ open: true, title, iframeUrl, desc });
  };

  const handleLogout = () => {
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
    <div className="min-h-screen bg-bg flex flex-col text-ink font-sans">


      {/* 2. Main Site Navigation */}
      {(!activeScreen.startsWith('admin-') || !!adminUser) && (
        <Header
          activeScreen={activeScreen}
          setActiveScreen={navigateTo}
          userOnboarded={userOnboarded}
          onLogout={handleLogout}
          openAuthModal={openAuthModal}
          adminUser={adminUser}
          currentUser={currentUser}
        />
      )}

      {/* 3. Core Shell Frame Layout */}
      <div className={shellFrameClass}>
        {/* Render Sidenav if in app/admin shells */}
        {(shellMode === 'app' || shellMode === 'admin') && (
          <Sidenav
            activeScreen={activeScreen}
            setActiveScreen={navigateTo}
            userOnboarded={userOnboarded}
            activePodId={activePodId}
            podData={INITIAL_POD_DATA}
            currentUser={currentUser}
          />
        )}

        {/* Render OnbPanel if in onboarding shell */}
        {shellMode === 'onboarding' && (
          <OnbPanel activeScreen={activeScreen} />
        )}

        {/* Renders screen content */}
        <main className={mainContentClass}>
          <MarketingScreens
            activeScreen={activeScreen}
            setActiveScreen={navigateTo}
            openAuthModal={openAuthModal}
            userOnboarded={userOnboarded}
            setUserOnboarded={setUserOnboarded}
            registeredEmail={registeredEmail}
          />

          <OnboardingScreens
            activeScreen={activeScreen}
            setActiveScreen={navigateTo}
            userOnboarded={userOnboarded}
            setUserOnboarded={setUserOnboarded}
          />

          <AppScreens
            activeScreen={activeScreen}
            setActiveScreen={navigateTo}
            userOnboarded={userOnboarded}
            setUserOnboarded={setUserOnboarded}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            activePodId={activePodId}
            setActivePodId={setActivePodId}
            suggestedPodId={suggestedPodId}
            setSuggestedPodId={setSuggestedPodId}
            podHistory={podHistory}
            setPodHistory={setPodHistory}
            podData={INITIAL_POD_DATA}
            openVideoModal={handleOpenVideo}
            openWhatsBomaModal={() => setWhatsBomaModalOpen(true)}
            openAgreementDocModal={() => setAgreementDocModalOpen(true)}
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            alignedAgreements={alignedAgreements}
            setAlignedAgreements={setAlignedAgreements}
          />

          <AdminScreens
            activeScreen={activeScreen}
            setActiveScreen={navigateTo}
            adminViewPodId={adminViewPodId}
            setAdminViewPodId={setAdminViewPodId}
            podData={INITIAL_POD_DATA}
            adminUser={adminUser}
            setAdminUser={setAdminUser}
          />
        </main>
      </div>

      {/* 4. Footer */}
      {shellMode === 'marketing' && activeScreen !== 'admin-login' && (
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
        setUserOnboarded={setUserOnboarded}
        registeredEmail={registeredEmail}
        setRegisteredEmail={setRegisteredEmail}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />
    </div>
  );
}

export default App;
