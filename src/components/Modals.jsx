import React, { useState } from 'react';
import { X, Play, Pause, Download } from 'lucide-react';
import { customRegister, customLogin } from '../auth';
import Toast from './Toast';
import Login from './auth/Login';
import Signup from './auth/Signup';
import ForgotPassword from './auth/ForgotPassword';

export default function Modals({
  authOverlay,
  setAuthOverlay,
  videoModal,
  setVideoModal,
  whatsBomaModalOpen,
  setWhatsBomaModalOpen,
  agreementDocModalOpen,
  setAgreementDocModalOpen,
  setActiveScreen,
  setUserOnboarded,
  updateOnboardUI,
  registeredEmail,
  setRegisteredEmail
}) {
  // Video mock state
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Signup inputs & visibility states
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login inputs states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  if (!authOverlay.open && !videoModal.open && !whatsBomaModalOpen && !agreementDocModalOpen) {
    return null;
  }

  const closeAuth = () => {
    setAuthOverlay({ open: false, mode: 'login' });
  };



  const closeVideoModal = () => {
    setVideoModal({ open: false, title: '', iframeUrl: null, desc: '' });
    setIsVideoPlaying(false);
  };

  const closeWhatsBoma = () => {
    setWhatsBomaModalOpen(false);
  };

  const closeAgreementDoc = () => {
    setAgreementDocModalOpen(false);
  };

  const loginWithGoogle = () => {
    closeAuth();
    setUserOnboarded(true);
    if (updateOnboardUI) updateOnboardUI(true);
    setActiveScreen('profile');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setToast({ show: true, message: 'Please enter email and password.', type: 'error' });
      return;
    }

    try {
      const user = await customLogin(loginEmail, loginPassword);
      if (user.role === 'admin') {
        throw new Error('Invalid credentials');
      }
      setToast({ show: true, message: `Welcome back, ${user.name}!`, type: 'success' });

      setTimeout(() => {
        closeAuth();
        setUserOnboarded(user.user_onboarded || false);
        if (updateOnboardUI) updateOnboardUI(user.user_onboarded || false);

        if (user.role === 'admin') {
          setActiveScreen('admin-dashboard');
        } else {
          setActiveScreen('profile');
        }

        setLoginEmail('');
        setLoginPassword('');
      }, 1500);
    } catch (err) {
      setToast({ show: true, message: err.message || 'Login failed.', type: 'error' });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!signupName.trim()) {
      setToast({ show: true, message: 'Please enter your full name.', type: 'error' });
      return;
    }
    if (!signupEmail.trim() || !/\S+@\S+\.\S+/.test(signupEmail)) {
      setToast({ show: true, message: 'Please enter a valid email address.', type: 'error' });
      return;
    }
    if (signupPassword.length < 6) {
      setToast({ show: true, message: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setToast({ show: true, message: 'Passwords do not match!', type: 'error' });
      return;
    }

    try {
      await customRegister(signupEmail, signupPassword, signupName);
      setToast({ show: true, message: 'Account created successfully!', type: 'success' });

      setTimeout(() => {
        setRegisteredEmail(signupEmail);
        closeAuth();
        setActiveScreen('verify-email');
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
        setSignupConfirmPassword('');
      }, 1500);
    } catch (err) {
      setToast({ show: true, message: err.message || 'Registration failed.', type: 'error' });
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    closeAuth();
    setActiveScreen('reset-password');
  };
  return (
    <>
      {/* 1. AUTH MODAL (LOGIN/SIGNUP/FORGOT) */}
      {authOverlay.open && (
        <div
          onClick={closeAuth}
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-[920px]  overflow-hidden grid grid-cols-1 md:grid-cols-2 relative shadow-custom-lg select-none"
          >
            {/* Close Button */}
            <button
              onClick={closeAuth}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-panel-alt hover:bg-border text-ink cursor-pointer z-10 transition-colors"
            >
              <X className="w-[18px] h-[18px]" />
            </button>

            {/* Left Info Panel */}
            <div className="bg-[linear-gradient(160deg,#0B1E38_0%,#0E4C8C_100%)] text-white p-11 flex flex-col justify-between hidden md:flex">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[.12em] text-amber-soft mb-3.5 font-semibold">
                  Community-Matching for Real Estate
                </div>
                <h3 className="font-display text-[24px] font-extrabold leading-tight text-white mb-4">
                  Join 1,200+ people finding neighbors who actually fit.
                </h3>
                <p className="text-[#A3B3C8] text-sm leading-relaxed mb-6">
                  BOMA matches you on lifestyle, values, location, and housing intent — then gives your Pod a space to build real trust before anything is financial.
                </p>

                <div className="flex gap-4 border-t border-b border-white/10 py-5 my-6 justify-between">
                  <div>
                    <div className="font-display text-[22px] font-extrabold text-white">86</div>
                    <div className="text-[10px] uppercase tracking-wider text-[#7F92B0] font-semibold mt-0.5">Active Pods</div>
                  </div>
                  <div>
                    <div className="font-display text-[22px] font-extrabold text-white">94%</div>
                    <div className="text-[10px] uppercase tracking-wider text-[#7F92B0] font-semibold mt-0.5">Stability Rate</div>
                  </div>
                  <div>
                    <div className="font-display text-[22px] font-extrabold text-white">8 min</div>
                    <div className="text-[10px] uppercase tracking-wider text-[#7F92B0] font-semibold mt-0.5">Avg. Onboarding</div>
                  </div>
                </div>
              </div>

              {/* Sam Rivera Quote */}
              <div className="bg-white/5 border border-white/8 rounded-xl p-4.5 text-[13px] text-[#D7E2EE] leading-normal">
                <p className="italic text-[#D7E2EE] mb-2.5">
                  "We found three families who wanted exactly what we wanted, in six weeks."
                </p>
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://i.pravatar.cc/100?img=12"
                    className="w-7 h-7 rounded-full object-cover border border-white/10"
                    alt="Sam Rivera"
                  />
                  <div>
                    <b className="block text-white text-[11.5px]">Sam Rivera</b>
                    <span className="text-[10.5px] text-[#7F92B0] font-medium">Cedar Grove Pod</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="p-8 flex flex-col justify-center">
              {/* LOGIN MODE */}
              {authOverlay.mode === 'login' && (
                <Login
                  loginEmail={loginEmail}
                  setLoginEmail={setLoginEmail}
                  loginPassword={loginPassword}
                  setLoginPassword={setLoginPassword}
                  handleLogin={handleLogin}
                  loginWithGoogle={loginWithGoogle}
                  setAuthOverlay={setAuthOverlay}
                />
              )}

              {/* SIGNUP MODE */}
              {authOverlay.mode === 'signup' && (
                <Signup
                  signupName={signupName}
                  setSignupName={setSignupName}
                  signupEmail={signupEmail}
                  setSignupEmail={setSignupEmail}
                  signupPassword={signupPassword}
                  setSignupPassword={setSignupPassword}
                  signupConfirmPassword={signupConfirmPassword}
                  setSignupConfirmPassword={setSignupConfirmPassword}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                  handleSignup={handleSignup}
                  loginWithGoogle={loginWithGoogle}
                  setAuthOverlay={setAuthOverlay}
                />
              )}

              {/* FORGOT PASSWORD MODE */}
              {authOverlay.mode === 'forgot' && (
                <ForgotPassword
                  handleForgot={handleForgot}
                  setAuthOverlay={setAuthOverlay}
                />
              )}
            </div>
          </div>
        </div>
      )}



      {/* 3. VIDEO PLAYER MODAL OVERLAY */}
      {videoModal.open && (
        <div
          onClick={closeVideoModal}
          className="fixed inset-0 z-100 flex items-center justify-center bg-navy-deep/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-navy-deep border border-white/10 rounded-2xl w-full max-w-[760px] p-6 text-white shadow-custom-lg relative select-none"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-display font-extrabold text-lg leading-none">
                {videoModal.title}
              </h3>
              <button
                onClick={closeVideoModal}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 border border-white/20 hover:bg-white/25 text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Player Container */}
            <div className="relative pt-[56.25%] bg-black rounded-xl overflow-hidden mb-4">
              {videoModal.iframeUrl ? (
                <iframe
                  src={videoModal.iframeUrl}
                  className="absolute top-0 left-0 w-full h-full border-none"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={videoModal.title}
                />
              ) : (
                <div
                  className="absolute top-0 left-0 w-full h-full flex flex-col justify-between p-5 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%), url('/assets/pod_community_realistic.png')`
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="bg-white/20 text-white rounded px-2.5 py-1 font-mono text-[10.5px]">
                      BOMA Video Guide
                    </span>
                    <span className="font-mono text-[10.5px] text-[#DCE6FB]">HD 1080p</span>
                  </div>

                  <div className="text-center self-center flex flex-col items-center">
                    <button
                      onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                      className="w-16 h-16 rounded-full bg-amber border-none text-white cursor-pointer shadow-lg shadow-amber/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    >
                      {isVideoPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
                    </button>
                    <p className="text-[#DCE6FB] text-xs font-semibold mt-3">
                      {isVideoPlaying ? '▶ Playing Video Guide...' : 'Click play to watch guide'}
                    </p>
                  </div>

                  <div>
                    <div className="h-1 bg-white/30 rounded-full mb-2 overflow-hidden">
                      <div
                        className="height-full bg-amber h-full transition-all duration-300"
                        style={{ width: isVideoPlaying ? '75%' : '35%' }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-[#A5C4F3]">
                      <span>{isVideoPlaying ? '01:52' : '00:45'}</span>
                      <span>02:30</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-[#B9CDE9] text-sm leading-relaxed">
              {videoModal.desc}
            </p>
          </div>
        </div>
      )}

      {/* 4. WHAT'S BOMA FULL VISION MODAL OVERLAY */}
      {whatsBomaModalOpen && (
        <div
          onClick={closeWhatsBoma}
          className="fixed inset-0 z-100 flex items-center justify-center bg-navy-deep/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-[680px] p-8 border border-border shadow-custom-lg relative select-none"
          >
            {/* Close Button */}
            <button
              onClick={closeWhatsBoma}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-panel-alt hover:bg-border text-ink cursor-pointer z-10 transition-colors"
            >
              <X className="w-[18px] h-[18px]" />
            </button>

            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-2 font-semibold">
              Product Vision
            </div>

            <h2 className="font-display text-[26px] font-extrabold text-ink leading-tight mb-4">
              What is BOMA?
            </h2>

            <p className="text-ink-dim text-[15px] leading-relaxed mb-6">
              BOMA is a community-matching platform for real estate co-housing. Traditional real estate focuses entirely on property listings and mortgages first, forcing people to find neighbors after the fact. BOMA reverses this order.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="border border-border rounded-xl p-4 bg-panel-alt/50">
                <h4 className="font-display font-bold text-base text-ink mb-1.5">1. Values-First Matching</h4>
                <p className="text-ink-dim text-[13px] leading-relaxed">
                  Match with households who share your lifestyle, communication style, and location bounds.
                </p>
              </div>
              <div className="border border-border rounded-xl p-4 bg-panel-alt/50">
                <h4 className="font-display font-bold text-base text-ink mb-1.5">2. Pod Commons</h4>
                <p className="text-ink-dim text-[13px] leading-relaxed">
                  Collaborate in a shared workspace with draft agreement scaffolding before signing legal docs.
                </p>
              </div>
            </div>

            <button
              onClick={() => { closeWhatsBoma(); setActiveScreen('entry-path'); }}
              className="w-full bg-amber text-white rounded-lg py-3 text-sm font-bold shadow-md hover:bg-[#2450C4] hover:-translate-y-[1px] transition-all cursor-pointer text-center"
            >
              Start Onboarding Profile Now →
            </button>
          </div>
        </div>
      )}

      {/* 5. AGREEMENT DOCUMENT PREVIEW MODAL OVERLAY */}
      {agreementDocModalOpen && (
        <div
          onClick={closeAgreementDoc}
          className="fixed inset-0 z-120 flex items-center justify-center bg-navy-deep/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-[660px] p-8 border border-border shadow-custom-lg relative select-none"
          >
            {/* Close Button */}
            <button
              onClick={closeAgreementDoc}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-panel-alt hover:bg-border text-ink cursor-pointer z-10 transition-colors"
            >
              <X className="w-[18px] h-[18px]" />
            </button>

            {/* Header */}
            <div className="border-b border-border pb-3.5 mb-5 flex flex-col">
              <h3 className="font-display text-[22px] font-extrabold text-navy-deep leading-tight">
                Pod Agreement Scaffolding
              </h3>
              <span className="text-[13px] text-ink-dim font-medium mt-1">Official Phase 1 Draft Alignment Document</span>
            </div>

            {/* Content box */}
            <div className="bg-[#F8FAFC] border border-border rounded-2xl p-5 mb-5 text-[13.5px] leading-relaxed text-ink">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-3.5">
                <b className="text-base text-navy-deep font-bold">Cedar Grove Pod Alignment Draft</b>
                <span className="bg-[#EAFDF8] text-sage border border-sage/10 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Drafting in Progress
                </span>
              </div>

              <p className="text-ink-dim text-[12.5px] mb-4 font-medium">
                Prepared for: Sam Rivera, Morgan Chen, Taylor Kim, Jordan Lee
              </p>

              <ol className="list-decimal pl-4.5 space-y-2.5 font-medium">
                <li>
                  <b className="text-navy-deep">Group Decision-Making:</b> Consensus vote required for purchases &gt; $1,000.
                </li>
                <li>
                  <b className="text-navy-deep">Membership &amp; Additions:</b> 75% Pod approval &amp; readiness verification required for new members.
                </li>
                <li>
                  <b className="text-navy-deep">Exit Tolerance:</b> 60-day written notice &amp; equity transfer framework.
                </li>
                <li>
                  <b className="text-navy-deep">Communication Protocols:</b> Mandatory weekly check-ins &amp; active participation in shared Commons chat.
                </li>
                <li>
                  <b className="text-navy-deep">Phase 2 Transition:</b> Minimum 90 days of Pod bonding prior to property site selection and escrow.
                </li>
              </ol>
            </div>

            {/* Footnote */}
            <div className="flex justify-between border-t border-dashed border-border pt-3.5 mb-5 text-[12px] font-mono text-ink-dim">
              <span>4 Digital Signatures Pending</span>
              <span>BOMA Ref #BG-9482</span>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3.5 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => alert('Exporting Cedar_Grove_Pod_Agreement.pdf (demo)')}
                className="flex-1 flex items-center justify-center gap-2 bg-amber text-white rounded-lg px-4 py-2.5 text-sm font-bold shadow-md hover:bg-[#2450C4] hover:-translate-y-[1px] transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Document (.PDF)
              </button>
              <button
                onClick={closeAgreementDoc}
                className="bg-transparent border border-border text-ink rounded-lg px-5 py-2.5 text-sm font-bold hover:bg-panel-alt transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </>
  );
}
