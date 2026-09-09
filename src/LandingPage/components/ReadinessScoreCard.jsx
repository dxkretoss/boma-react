import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';

export const ReadinessScoreCard = ({ className = "" }) => {
  const metrics = [
    { label: "Financial Readiness", score: 84, color: "bg-[#C46A4A]" },
    { label: "Community Alignment", score: 92, color: "bg-[#B87333]" },
    { label: "Governance Fit", score: 76, color: "bg-[#D7A27A]" },
    { label: "Lifestyle Compatibility", score: 88, color: "bg-[#7A746B]" }
  ];

  return (
    <div className={`relative bg-[#2E2330] rounded-3xl p-6 sm:p-8 text-[#F5F1EA] shadow-2xl border border-[#E7DED0]/15 overflow-hidden ${className}`}>
      {/* Decorative background glow */}
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#B87333]/15 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-[#C46A4A]/15 blur-3xl pointer-events-none"></div>

      {/* Header Badge */}
      <div className="flex items-center justify-between mb-6 pb-5 border-b border-[#E7DED0]/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#B87333]/20 border border-[#B87333]/40 flex items-center justify-center text-[#D7A27A]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#D7A27A] font-semibold">BOMA Readiness Score</h4>
            <p className="text-xs text-[#F5F1EA]/60">Verified Assessment</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-[#B87333]/20 text-[#D7A27A] px-3 py-1 rounded-full border border-[#B87333]/30">
          <Sparkles className="w-3 h-3" /> Pod-Ready
        </span>
      </div>

      {/* Overall Score Dial / Big Number */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 bg-[#1F1721] p-6 rounded-2xl border border-[#E7DED0]/10">
        <div className="relative flex items-center justify-center w-28 h-28 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              className="stroke-[#E7DED0]/10"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              className="stroke-[#C46A4A]"
              strokeWidth="8"
              fill="none"
              strokeDasharray="251.2"
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset: 251.2 * (1 - 0.78) }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <span className="font-serif text-4xl font-bold text-[#F5F1EA]">78</span>
            <span className="text-[10px] block text-[#D7A27A] uppercase tracking-wider font-semibold">/100</span>
          </div>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="font-serif text-xl font-semibold text-[#F5F1EA] mb-1">Collaborative Ownership Readiness</h3>
          <p className="text-xs text-[#F5F1EA]/70 leading-relaxed mb-3">
            High compatibility for 3–5 member co-housing Pods in suburban/urban WA markets.
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#D7A27A] font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> High Matching Probability
          </div>
        </div>
      </div>

      {/* Sub-Metrics Progress Bars */}
      <div className="space-y-4">
        {metrics.map((item, index) => (
          <div key={index} className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[#F5F1EA]/80 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C46A4A]" />
                {item.label}
              </span>
              <span className="text-[#D7A27A] font-semibold">{item.score}%</span>
            </div>
            <div className="w-full h-2 bg-[#1F1721] rounded-full overflow-hidden p-0.5 border border-[#E7DED0]/10">
              <motion.div
                className={`h-full rounded-full ${item.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${item.score}%` }}
                transition={{ duration: 1.2, delay: 0.2 + index * 0.15 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReadinessScoreCard;
