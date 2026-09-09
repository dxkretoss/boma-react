import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLandingAuth } from '../context/LandingAuthContext';

export const TYPEFORM_URL = "https://form.typeform.com/to/fPx9qMPQ";

export const CTAButton = ({
  children = "Get Started",
  href,
  onClick,
  variant = "primary",
  size = "md",
  showArrow = true,
  className = "",
  fullWidth = false,
  ...props
}) => {
  const { openAuthModal, setActiveScreen, currentUser } = useLandingAuth();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (href) {
      return;
    }
    // Default action for Get Started buttons:
    if (currentUser) {
      if (setActiveScreen) setActiveScreen('profile');
    } else {
      if (openAuthModal) openAuthModal('signup');
    }
  };

  const sizeClasses = {
    sm: "px-5 py-2.5 text-xs font-semibold tracking-wide",
    md: "h-[44px] px-6 text-sm font-semibold tracking-wide",
    lg: "h-[48px] px-8 text-sm font-semibold tracking-wide"
  };

  const variantClasses = {
    primary: "bg-[#C46A4A] hover:bg-[#b05d3e] text-white shadow-md hover:shadow-lg hover:shadow-[#C46A4A]/25 border border-transparent",
    copper: "bg-[#B87333] hover:bg-[#a36329] text-white shadow-md hover:shadow-lg hover:shadow-[#B87333]/25 border border-transparent",
    aubergine: "bg-[#2E2330] hover:bg-[#201822] text-white shadow-md hover:shadow-lg hover:shadow-[#2E2330]/30 border border-transparent",
    outlineLight: "border border-white/30 hover:border-white text-white hover:bg-white/10 backdrop-blur-xs",
    outlineDark: "border border-[#2E2330]/30 hover:border-[#2E2330] text-[#2E2330] hover:bg-[#2E2330]/5",
    secondary: "bg-[#E7DED0] hover:bg-[#ded1c0] text-[#2E2330] border border-[#2E2330]/10"
  };

  const combinedClasses = `
    inline-flex items-center justify-center gap-2.5 rounded-full cursor-pointer
    transition-all duration-300 transform active:scale-95 group
    ${sizeClasses[size] || sizeClasses.md}
    ${variantClasses[variant] || variantClasses.primary}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  if (href && !href.includes("typeform.com") && !href.startsWith("#village-test")) {
    return (
      <a href={href} className={combinedClasses} {...props}>
        <span>{children}</span>
        {showArrow && (
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </a>
    );
  }

  return (
    <button onClick={handleClick} className={combinedClasses} {...props}>
      <span>{children}</span>
      {showArrow && (
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </button>
  );
};

export default CTAButton;
