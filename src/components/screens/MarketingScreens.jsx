import React from 'react';
import Landing from './marketing/Landing';
import HowItWorks from './marketing/HowItWorks';
import About from './marketing/About';
import Contact from './marketing/Contact';
import SignupScreen from './marketing/SignupScreen';
import LoginScreen from './marketing/LoginScreen';
import ForgotPasswordScreen from './marketing/ForgotPasswordScreen';
import ResetPasswordPage from './marketing/ResetPasswordPage';
import VerifyEmail from './marketing/VerifyEmail';
import JoinPod from './onboarding/JoinPod';

export default function MarketingScreens({
  activeScreen,
  setActiveScreen,
  openAuthModal,
  userOnboarded,
  setUserOnboarded,
  registeredEmail,
  setCurrentUser,
  currentUser,
  showToast,
  inviteToken,
  setInviteToken,
  isInvitationFlow,
  setIsInvitationFlow
}) {
  if (![
    'landing', 
    'how-it-works', 
    'about', 
    'contact', 
    'signup', 
    'login', 
    'forgot-password', 
    'reset-password', 
    'verify-email',
    'join-pod'
  ].includes(activeScreen)) {
    return null;
  }

  return (
    <div className="w-full">
      {activeScreen === 'landing' && (
        <Landing openAuthModal={openAuthModal} setActiveScreen={setActiveScreen} currentUser={currentUser} />
      )}
      
      {activeScreen === 'how-it-works' && (
        <HowItWorks openAuthModal={openAuthModal} setActiveScreen={setActiveScreen} currentUser={currentUser} />
      )}

      {activeScreen === 'about' && (
        <About setActiveScreen={setActiveScreen} />
      )}

      {activeScreen === 'contact' && (
        <Contact setActiveScreen={setActiveScreen} showToast={showToast} />
      )}

      {activeScreen === 'signup' && (
        <SignupScreen setActiveScreen={setActiveScreen} />
      )}

      {activeScreen === 'login' && (
        <LoginScreen 
          setActiveScreen={setActiveScreen} 
          setUserOnboarded={setUserOnboarded} 
          setCurrentUser={setCurrentUser}
          inviteToken={inviteToken}
          isInvitationFlow={isInvitationFlow}
        />
      )}

      {activeScreen === 'forgot-password' && (
        <ForgotPasswordScreen setActiveScreen={setActiveScreen} />
      )}

      {activeScreen === 'reset-password' && (
        <ResetPasswordPage setActiveScreen={setActiveScreen} />
      )}

      {activeScreen === 'verify-email' && (
        <VerifyEmail 
          registeredEmail={registeredEmail} 
          setActiveScreen={setActiveScreen} 
          setCurrentUser={setCurrentUser}
          inviteToken={inviteToken}
          isInvitationFlow={isInvitationFlow}
        />
      )}

      {activeScreen === 'join-pod' && (
        <JoinPod 
          setActiveScreen={setActiveScreen} 
          currentUser={currentUser} 
          setCurrentUser={setCurrentUser} 
          openAuthModal={openAuthModal}
          inviteToken={inviteToken}
          setInviteToken={setInviteToken}
          isInvitationFlow={isInvitationFlow}
          setIsInvitationFlow={setIsInvitationFlow}
        />
      )}
    </div>
  );
}
