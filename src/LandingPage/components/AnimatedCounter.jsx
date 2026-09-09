import React, { useEffect, useState, useRef } from 'react';

export const AnimatedCounter = ({ value, className = "" }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateValue();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, value]);

  const animateValue = () => {
    // If text contains numbers like 64%, 1 in 3, $400K+
    if (value.includes("64%")) {
      let start = 0;
      const end = 64;
      const duration = 1500;
      const stepTime = duration / end;
      const timer = setInterval(() => {
        start += 1;
        setDisplayValue(`${start}%`);
        if (start >= end) clearInterval(timer);
      }, stepTime);
    } else if (value.includes("400K")) {
      let start = 100;
      const end = 400;
      const timer = setInterval(() => {
        start += 10;
        setDisplayValue(`$${start}K+`);
        if (start >= end) clearInterval(timer);
      }, 40);
    } else {
      // Default fallback
      setDisplayValue(value);
    }
  };

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
};

export default AnimatedCounter;
