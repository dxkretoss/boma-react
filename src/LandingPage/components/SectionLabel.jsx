import React from 'react';

export const SectionLabel = ({ children, light = false, className = "" }) => {
  return (
    <div className={`inline-flex items-center gap-2 mb-4 ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${light ? 'bg-[#B87333]' : 'bg-[#C46A4A]'}`}></span>
      <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${light ? 'text-[#D7A27A]' : 'text-[#C46A4A]'}`}>
        {children}
      </span>
    </div>
  );
};

export default SectionLabel;
