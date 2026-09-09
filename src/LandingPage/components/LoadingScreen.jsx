import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import transparentLogo from '../assets/boma-transparent-logo.png';

export const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 0 -> 100% progress animation over ~1.4 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
          }, 300);
          return 100;
        }
        return prev + 5;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[9999] bg-[#2E2330] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Subtle Copper Ambient Radial Glow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.2 }}
            animate={{ scale: [0.8, 1.2, 1], opacity: [0.2, 0.45, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
            className="absolute w-[450px] h-[450px] rounded-full bg-radial from-[#B87333]/30 via-[#C46A4A]/10 to-transparent blur-3xl pointer-events-none"
          />

          {/* Centered Transparent Logo Container */}
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8 flex justify-center"
            >
              <img
                src={transparentLogo}
                alt="BOMA Living Full Logo"
                className="h-20 sm:h-28 w-auto object-contain max-w-xs sm:max-w-md"
                style={{ filter: "brightness(0) invert(1) drop-shadow(0px 2px 8px rgba(0,0,0,0.3))" }}
              />
            </motion.div>

            {/* Thin Progress Line Underneath */}
            <div className="w-48 sm:w-64 h-[2px] bg-[#E7DED0]/15 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-[#C46A4A] via-[#B87333] to-[#D7A27A]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              className="text-[11px] font-mono tracking-widest text-[#E7DED0] uppercase mt-3"
            >
              {progress}%
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
