import React, { createContext, useContext } from 'react';

const LandingAuthContext = createContext({
  openAuthModal: () => {},
  setActiveScreen: () => {},
  currentUser: null
});

export const LandingAuthProvider = LandingAuthContext.Provider;

export const useLandingAuth = () => useContext(LandingAuthContext);

export default LandingAuthContext;
