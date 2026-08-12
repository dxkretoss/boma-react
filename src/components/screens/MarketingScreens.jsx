import React from 'react';
import Landing from './marketing/Landing';
import HowItWorks from './marketing/HowItWorks';
import About from './marketing/About';
import Contact from './marketing/Contact';
import SignupScreen from './marketing/SignupScreen';
import LoginScreen from './marketing/LoginScreen';
import ForgotPasswordScreen from './marketing/ForgotPasswordScreen';
import ResetPasswordScreen from './marketing/ResetPasswordScreen';
import VerifyEmail from './marketing/VerifyEmail';

export default function MarketingScreens({
  activeScreen,
  setActiveScreen,
  openAuthModal,
  userOnboarded,
  setUserOnboarded,
  registeredEmail
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
    'verify-email'
  ].includes(activeScreen)) {
    return null;
  }

  return (
    <div className="w-full">
      {activeScreen === 'landing' && (
        <Landing openAuthModal={openAuthModal} setActiveScreen={setActiveScreen} />
      )}
      
      {activeScreen === 'how-it-works' && (
        <HowItWorks openAuthModal={openAuthModal} />
      )}

      {activeScreen === 'about' && (
        <About setActiveScreen={setActiveScreen} />
      )}

      {activeScreen === 'contact' && (
        <Contact setActiveScreen={setActiveScreen} />
      )}

      {activeScreen === 'signup' && (
        <SignupScreen setActiveScreen={setActiveScreen} />
      )}

      {activeScreen === 'login' && (
        <LoginScreen setActiveScreen={setActiveScreen} setUserOnboarded={setUserOnboarded} />
      )}

      {activeScreen === 'forgot-password' && (
        <ForgotPasswordScreen setActiveScreen={setActiveScreen} />
      )}

      {activeScreen === 'reset-password' && (
        <ResetPasswordScreen setActiveScreen={setActiveScreen} />
      )}

      {activeScreen === 'verify-email' && (
        <VerifyEmail registeredEmail={registeredEmail} setActiveScreen={setActiveScreen} />
      )}
    </div>
  );
}
