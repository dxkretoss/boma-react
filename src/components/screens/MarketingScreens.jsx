import React from 'react';
import LandingPage from '../../LandingPage/LandingPage';
import HowItWorks from './marketing/HowItWorks';
import About from './marketing/About';
import Contact from './marketing/Contact';
import SignupScreen from './marketing/SignupScreen';
import LoginScreen from './marketing/LoginScreen';
import ForgotPasswordScreen from './marketing/ForgotPasswordScreen';
import ResetPasswordPage from './marketing/ResetPasswordPage';
import VerifyEmail from './marketing/VerifyEmail';
import JoinPod from './onboarding/JoinPod';
import NotFound from './marketing/NotFound';

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
    'landing2',
    'how-it-works', 
    'about', 
    'contact', 
    'signup', 
    'login', 
    'forgot-password', 
    'reset-password', 
    'verify-email',
    'join-pod',
    'not-found'
  ].includes(activeScreen)) {
    return null;
  }

  return (
    <div className="w-full">
      {activeScreen === 'not-found' && (
        <NotFound setActiveScreen={setActiveScreen} />
      )}

      {(activeScreen === 'landing' || activeScreen === 'landing2' || activeScreen === 'how-it-works') && (
        <LandingPage openAuthModal={openAuthModal} setActiveScreen={setActiveScreen} currentUser={currentUser} />
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
