import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, LogIn, User } from 'lucide-react';
import Logo from './Logo';
import CTAButton from './CTAButton';
import MobileMenu from './MobileMenu';
import { useLandingAuth } from '../context/LandingAuthContext';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkSection, setIsDarkSection] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { openAuthModal, setActiveScreen, currentUser } = useLandingAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);

      // On /partners page, if near top, it's dark
      if (location.pathname === '/partners' && scrollY < 300) {
        setIsDarkSection(true);
        return;
      }

      const darkElements = document.querySelectorAll('.bg-aubergine, [data-theme="dark"]');
      let currentIsDark = false;

      darkElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          currentIsDark = true;
        }
      });

      if (scrollY < 300) {
        currentIsDark = true;
      }

      setIsDarkSection(currentIsDark);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? isDarkSection
              ? 'bg-[#2E2330]/90 backdrop-blur-md shadow-xl py-3 border-b border-[#E7DED0]/10'
              : 'bg-[#F5F1EA]/90 backdrop-blur-md shadow-md py-3 border-b border-[#2E2330]/10'
            : 'bg-transparent py-5 md:py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <Logo
              useLogo1={true}
              variant={isDarkSection ? "light" : "dark"}
              className="h-9 md:h-11 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9">
            <a
              href="/#how-it-works"
              className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${
                isDarkSection
                  ? 'text-[#F5F1EA]/80 hover:text-white'
                  : 'text-[#2E2330]/80 hover:text-[#C46A4A]'
              }`}
            >
              How It Works
            </a>
            <a
              href="/#village-test"
              className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${
                isDarkSection
                  ? 'text-[#F5F1EA]/80 hover:text-white'
                  : 'text-[#2E2330]/80 hover:text-[#C46A4A]'
              }`}
            >
              The Village Test
            </a>
            <a
              href="/#who"
              className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${
                isDarkSection
                  ? 'text-[#F5F1EA]/80 hover:text-white'
                  : 'text-[#2E2330]/80 hover:text-[#C46A4A]'
              }`}
            >
              Who It's For
            </a>
            <a
              href="/#faq"
              className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${
                isDarkSection
                  ? 'text-[#F5F1EA]/80 hover:text-white'
                  : 'text-[#2E2330]/80 hover:text-[#C46A4A]'
              }`}
            >
              FAQ
            </a>
          </nav>

          {/* Auth & CTA Actions */}
          <div className="hidden md:flex items-center gap-3.5">
            {currentUser ? (
              <button
                onClick={() => setActiveScreen('profile')}
                className={`text-sm font-semibold tracking-wide px-3.5 py-2 rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                  isDarkSection
                    ? 'text-[#F5F1EA] hover:text-white hover:bg-white/10'
                    : 'text-[#2E2330] hover:text-[#C46A4A] hover:bg-[#2E2330]/5'
                }`}
              >
                <User className="w-4 h-4 text-[#C46A4A]" />
                <span>My Profile</span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className={`text-sm font-semibold tracking-wide px-3.5 py-2 rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                  isDarkSection
                    ? 'text-[#F5F1EA]/90 hover:text-white hover:bg-white/10'
                    : 'text-[#2E2330]/90 hover:text-[#C46A4A] hover:bg-[#2E2330]/5'
                }`}
              >
                <span>Log in</span>
              </button>
            )}

            <CTAButton
              size="sm"
              variant="primary"
              onClick={() => {
                if (currentUser) {
                  setActiveScreen('profile');
                } else {
                  openAuthModal('signup');
                }
              }}
            >
              {currentUser ? 'Dashboard' : 'Get Started'}
            </CTAButton>
          </div>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`md:hidden p-2 rounded-xl transition-colors ${
              isDarkSection ? 'text-[#F5F1EA] hover:bg-white/10' : 'text-[#2E2330] hover:bg-[#2E2330]/10'
            }`}
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isDarkSection={isDarkSection}
      />
    </>
  );
};

export default Header;
