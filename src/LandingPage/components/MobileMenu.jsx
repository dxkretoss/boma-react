import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, ArrowRight, User } from 'lucide-react';
import Logo from './Logo';
import CTAButton from './CTAButton';
import { useLandingAuth } from '../context/LandingAuthContext';

export const MobileMenu = ({ isOpen, onClose }) => {
  const { openAuthModal, setActiveScreen, currentUser } = useLandingAuth();

  const menuItems = [
    { label: "How It Works", href: "/#how-it-works", isRoute: false },
    { label: "The Village Test", href: "/#village-test", isRoute: false },
    { label: "Who It's For", href: "/#who", isRoute: false },
    { label: "FAQ", href: "/#faq", isRoute: false }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-[#2E2330] text-[#F5F1EA] flex flex-col p-6 sm:p-10 overflow-y-auto"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-[#E7DED0]/10 pb-6 shrink-0">
            <Link to="/" onClick={onClose}>
              <Logo variant="light" className="h-10 w-auto" />
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Staggered Navigation Items — Starting from Top */}
          <div className="pt-6 pb-8 space-y-5 flex-1">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                {item.isRoute ? (
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className="font-serif text-3xl sm:text-4xl font-bold text-[#F5F1EA] hover:text-[#D7A27A] transition-colors flex items-center justify-between group"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 text-[#C46A4A]" />
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    onClick={onClose}
                    className="font-serif text-3xl sm:text-4xl font-bold text-[#F5F1EA] hover:text-[#D7A27A] transition-colors flex items-center justify-between group"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 text-[#C46A4A]" />
                  </a>
                )}
              </motion.div>
            ))}
          </div>

          {/* Bottom Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="pt-6 border-t border-[#E7DED0]/10 space-y-3"
          >
            {currentUser ? (
              <CTAButton
                fullWidth
                size="lg"
                onClick={() => {
                  onClose();
                  if (setActiveScreen) setActiveScreen('profile');
                }}
              >
                Go to Dashboard
              </CTAButton>
            ) : (
              <>
                <CTAButton
                  fullWidth
                  size="lg"
                  onClick={() => {
                    onClose();
                    if (openAuthModal) openAuthModal('signup');
                  }}
                >
                  Get Started
                </CTAButton>
                <button
                  onClick={() => {
                    onClose();
                    if (openAuthModal) openAuthModal('login');
                  }}
                  className="w-full py-3.5 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Log In
                </button>
              </>
            )}
            <p className="text-xs text-center text-[#F5F1EA]/60 font-medium">
              Pilot launching in King County, WA
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
