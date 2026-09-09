import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Calendar, ExternalLink } from 'lucide-react';
import Logo from '../components/Logo';
import CTAButton from '../components/CTAButton';

// Pixel-perfect SVG Brand Icons
const LinkedInIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24Z" />
  </svg>
);

const InstagramIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
  </svg>
);

const TwitterIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const Footer = () => {
  const contactLinks = [
    { label: "hello@boma-living.com", href: "mailto:hello@boma-living.com", icon: Mail },
    { label: "King County, WA — Pilot Region", href: "#", icon: MapPin }
  ];

  const socials = [
    { name: "LinkedIn", href: "https://linkedin.com", icon: LinkedInIcon },
    { name: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
    { name: "Twitter / X", href: "https://x.com", icon: TwitterIcon }
  ];

  return (
    <footer className="bg-[#2E2330] text-[#F5F1EA] border-t border-[#B87333]/30 data-theme='dark'">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 lg:py-20">

        <div className="grid md:grid-cols-12 gap-10 lg:gap-12 mb-16">

          {/* Brand Col */}
          <div className="md:col-span-5 space-y-6">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <img
                src="/assets/logo1.png"
                alt="BOMA Living"
                className="h-12 w-auto object-contain rounded"
              />
            </Link>
            <p className="text-[#F5F1EA]/70 text-sm leading-relaxed max-w-sm font-light mt-3">
              BOMA Living makes collaborative homeownership real — matching aligned communities, structuring shared ownership, and guiding Pods from first conversation to keys in hand.
            </p>
            {/* <div className="pt-2">
              <CTAButton size="sm" variant="copper">
                Take the Village Test
              </CTAButton>
            </div> */}
          </div>

          {/* Platform Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#D7A27A]">
              Platform
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/#how-it-works" className="text-xs text-[#F5F1EA]/70 hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#village-test" className="text-xs text-[#F5F1EA]/70 hover:text-white transition-colors">
                  The Village Test
                </a>
              </li>
              <li>
                <a href="/#who" className="text-xs text-[#F5F1EA]/70 hover:text-white transition-colors">
                  Who It's For
                </a>
              </li>
              <li>
                <a href="/#faq" className="text-xs text-[#F5F1EA]/70 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#D7A27A]">
              Get in Touch
            </h4>
            <ul className="space-y-3">
              {contactLinks.map((link, idx) => {
                const IconComponent = link.icon;
                return (
                  <li key={idx}>
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-xs text-[#F5F1EA]/70 hover:text-white transition-colors flex items-center gap-2.5"
                    >
                      <IconComponent className="w-4 h-4 text-[#C46A4A] flex-shrink-0" />
                      <span>{link.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>

            <h4 className="font-bold text-xs uppercase tracking-widest text-[#D7A27A] pt-4">
              Follow BOMA
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {socials.map((soc, idx) => {
                const IconComponent = soc.icon;
                return (
                  <a
                    key={idx}
                    href={soc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={soc.name}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs text-[#F5F1EA]/90 hover:bg-[#B87333] hover:text-white transition-all duration-300 border border-white/10 hover:border-[#B87333] shadow-xs"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-[#D7A27A]" />
                    {/* <span>{soc.name}</span>  */}
                  </a>
                );
              })}
            </div>
          </div>

        </div>

        {/* Thin Copper Divider Line */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#B87333]/40 to-transparent my-8" />

        {/* Bottom Legal Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F5F1EA]/50 font-medium">
          <p>© {new Date().getFullYear()} BOMA Living, Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#F5F1EA]/80 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#F5F1EA]/80 transition-colors">Terms of Use</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
