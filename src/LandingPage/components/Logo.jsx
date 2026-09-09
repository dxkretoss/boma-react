import React from 'react';
import logo1Img from '../assets/logo1.png';
import transparentLogo from '../assets/boma-transparent-logo.png';

/**
 * Logo component:
 * On dark backgrounds (variant="light"): Uses mix-blend-mode: screen for a crisp white/gold logo.
 * On light backgrounds (variant="dark"): Uses CSS filter to render a crisp dark aubergine (#2E2330) logo.
 */
export const Logo = ({ variant = "dark", useLogo1 = true, className = "h-10 w-auto", onClick }) => {
  const isLightLogo = variant === "light";
  const selectedImg = useLogo1 ? logo1Img : transparentLogo;

  return (
    <div 
      className={`inline-flex items-center cursor-pointer transition-all duration-300 ${onClick ? 'hover:opacity-90' : ''}`}
      onClick={onClick}
    >
      <img
        src={selectedImg}
        alt="BOMA Living"
        className={`${className} object-contain transition-all duration-300`}
        style={
          isLightLogo
            ? { mixBlendMode: 'screen' }
            : { filter: "brightness(0) sepia(1) saturate(5) hue-rotate(240deg) brightness(0.25)" }
        }
      />
    </div>
  );
};

export default Logo;
