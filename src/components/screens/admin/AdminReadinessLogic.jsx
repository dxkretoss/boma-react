import React, { useState, useEffect } from 'react';
import {
  Gauge,
  CheckCircle2,
  HelpCircle,
  Calculator,
  Code2,
  Database,
  Info,
  Sliders,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { fetchReadinessRules } from '../../../api/onboarding';

export default function AdminReadinessLogic({ setActiveScreen, isAdminView = true }) {
  const [dbRules, setDbRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(true);

  // Simulator choices state
  const [simDecision, setSimDecision] = useState('consensus');
  const [simDownPayment, setSimDownPayment] = useState('dp_5_10');
  const [simTimeline, setSimTimeline] = useState('timeline_5yr');

  useEffect(() => {
    async function loadRules() {
      try {
        setLoadingRules(true);
        const data = await fetchReadinessRules();
        setDbRules(data);
      } catch (err) {
        console.error('Failed to fetch DB scoring rules:', err);
      } finally {
        setLoadingRules(false);
      }
    }
    loadRules();
  }, []);

  // Preset option point maps
  const decisionOptions = [
    { key: 'consensus', label: 'Consensus', points: 85, reasoning: 'Pods favoring full group input maintain high alignment, though decision speed requires patience.' },
    { key: 'flexible', label: 'Flexible', points: 75, reasoning: 'Adaptive and practical compromise style suitable for most group dynamics.' },
    { key: 'delegated', label: 'Delegated', points: 60, reasoning: 'High execution speed but lower overall focus on shared group consensus.' }
  ];

  const downPaymentOptions = [
    { key: 'dp_20+', label: '20%+', points: 95, reasoning: 'High financial readiness for traditional lending without mortgage insurance.' },
    { key: 'dp_10_20', label: '10–20%', points: 85, reasoning: 'Solid down payment ready to proceed with conventional loans.' },
    { key: 'dp_5_10', label: '5–10%', points: 70, reasoning: 'Moderate readiness; may require private mortgage insurance (PMI).' },
    { key: 'dp_0_5', label: '0–5%', points: 50, reasoning: 'Early financial savings stage; limited equity buffer.' }
  ];

  const timelineOptions = [
    { key: 'timeline_5yr', label: '5+ years', points: 90, reasoning: 'High community stability index; minimal turnover risk.' },
    { key: 'timeline_2yr', label: '2+ years', points: 75, reasoning: 'Standard medium-term commitment for co-housing projects.' },
    { key: 'timeline_flexible', label: 'Flexible', points: 60, reasoning: 'High exit tolerance; lower stability guarantee for long-term pods.' }
  ];

  // Calculate simulated score
  const selectedDecision = decisionOptions.find(o => o.key === simDecision) || decisionOptions[0];
  const selectedDP = downPaymentOptions.find(o => o.key === simDownPayment) || downPaymentOptions[2];
  const selectedTimeline = timelineOptions.find(o => o.key === simTimeline) || timelineOptions[0];

  const simSum = selectedDecision.points + selectedDP.points + selectedTimeline.points;
  const simAvg = simSum / 3;
  const simFinalScore = Math.round(simAvg);

  const getScoreBadgeColor = (score) => {
    if (score >= 85) return 'bg-emerald-500 text-white border-emerald-400';
    if (score >= 75) return 'bg-ink text-white border-ink';
    return 'bg-amber text-white border-amber';
  };

  return (
    <div className="w-full text-left space-y-8 animate-fade">
      {/* Header Banner */}
      <div className="bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] text-white p-6 md:p-8 rounded-3xl shadow-custom-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber/20 border border-amber/30 text-amber-soft px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <Gauge className="w-3.5 h-3.5" /> Readiness Scoring Engine
            </div>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white mb-2">
              Profile Readiness Score Logic
            </h2>
            <p className="text-slate-300 text-sm max-w-[640px] leading-relaxed">
              BOMA calculates a user's profile Readiness Score (0–100) dynamically based on their onboarding choices across scored financial, governance, and commitment categories.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 shrink-0">
            <div className="text-center">
              <span className="font-mono text-[10px] uppercase text-slate-300 block font-bold">Calculation Type</span>
              <span className="font-display font-bold text-white text-base">Arithmetic Mean</span>
            </div>
            <div className="h-8 w-[1px] bg-white/20" />
            <div className="text-center">
              <span className="font-mono text-[10px] uppercase text-slate-300 block font-bold">Default Fallback</span>
              <span className="font-display font-extrabold text-amber text-base">82 Points</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-dim font-bold">Scored Categories</span>
            <div className="w-8 h-8 rounded-xl bg-teal-soft text-teal flex items-center justify-center font-bold">
              3
            </div>
          </div>
          <div className="font-display font-extrabold text-xl text-ink">Steps 3, 5 &amp; 7</div>
          <p className="text-[12px] text-ink-dim mt-1 font-medium">Single-choice questions with point weights</p>
        </div>

        <div className="bg-white border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-dim font-bold">Unscored Steps</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
              5
            </div>
          </div>
          <div className="font-display font-extrabold text-xl text-ink">Qualitative Steps</div>
          <p className="text-[12px] text-ink-dim mt-1 font-medium">Informational checklist &amp; location filters</p>
        </div>

        <div className="bg-white border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-dim font-bold">Max Point Range</span>
            <div className="w-8 h-8 rounded-xl bg-amber-soft text-amber flex items-center justify-center font-bold">
              100
            </div>
          </div>
          <div className="font-display font-extrabold text-xl text-ink">50 to 95 Points</div>
          <p className="text-[12px] text-ink-dim mt-1 font-medium">Per matched category rule</p>
        </div>
      </div>

      {/* Applied Steps Breakdown */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-amber font-mono text-[11px] uppercase tracking-wider font-bold mb-1">
            <CheckCircle2 className="w-4 h-4 text-teal" /> Applied Onboarding Steps
          </div>
          <h3 className="font-display font-extrabold text-xl text-ink">
            Which Onboarding Steps Determine the Readiness Score?
          </h3>
          <p className="text-ink-dim text-sm mt-1 font-medium">
            The readiness score is calculated strictly from questions that have point weights registered in <code className="bg-slate-100 px-1.5 py-0.5 rounded text-ink font-mono text-xs">readiness_scoring_rules</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 3 */}
          <div className="border border-border/80 rounded-2xl p-5 bg-[#F8FAFC]/60 space-y-4 hover:border-amber/50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <span className="bg-amber/10 text-amber font-mono font-extrabold text-[11px] px-2.5 py-1 rounded-md whitespace-nowrap">
                STEP 3
              </span>
              <span className="text-xs font-mono font-bold text-ink-dim">Rule Category: Governance</span>
            </div>
            <div>
              <h4 className="font-display font-extrabold text-base text-ink">Decision-Making Style</h4>
              <p className="text-xs text-ink-dim mt-0.5 font-medium">How decisions should be made in your Pod.</p>
            </div>
            <div className="space-y-2 border-t border-border/60 pt-3">
              {decisionOptions.map(opt => (
                <div key={opt.key} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-border/60 text-xs">
                  <div className="flex flex-col">
                    <span className="font-bold text-ink">{opt.label}</span>
                    <span className="text-[10px] text-ink-dim font-mono">Option: {opt.key}</span>
                  </div>
                  <span className="font-mono font-extrabold text-teal bg-teal-soft/80 px-2 py-0.5 rounded">
                    {opt.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 5 */}
          <div className="border border-border/80 rounded-2xl p-5 bg-[#F8FAFC]/60 space-y-4 hover:border-amber/50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <span className="bg-amber/10 text-amber font-mono font-extrabold text-[11px] px-2.5 py-1 rounded-md whitespace-nowrap">
                STEP 5
              </span>
              <span className="text-xs font-mono font-bold text-ink-dim">Rule Category: Financial</span>
            </div>
            <div>
              <h4 className="font-display font-extrabold text-base text-ink">Down Payment Tier</h4>
              <p className="text-xs text-ink-dim mt-0.5 font-medium">Capital ready for home purchase/co-investment.</p>
            </div>
            <div className="space-y-2 border-t border-border/60 pt-3">
              {downPaymentOptions.map(opt => (
                <div key={opt.key} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-border/60 text-xs">
                  <div className="flex flex-col">
                    <span className="font-bold text-ink">{opt.label}</span>
                    <span className="text-[10px] text-ink-dim font-mono">Option: {opt.key}</span>
                  </div>
                  <span className="font-mono font-extrabold text-teal bg-teal-soft/80 px-2 py-0.5 rounded">
                    {opt.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 7 */}
          <div className="border border-border/80 rounded-2xl p-5 bg-[#F8FAFC]/60 space-y-4 hover:border-amber/50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <span className="bg-amber/10 text-amber font-mono font-extrabold text-[11px] px-2.5 py-1 rounded-md whitespace-nowrap">
                STEP 7
              </span>
              <span className="text-xs font-mono font-bold text-ink-dim">Rule Category: Stability</span>
            </div>
            <div>
              <h4 className="font-display font-extrabold text-base text-ink">Minimum Commitment</h4>
              <p className="text-xs text-ink-dim mt-0.5 font-medium">Expected timeline for staying in community.</p>
            </div>
            <div className="space-y-2 border-t border-border/60 pt-3">
              {timelineOptions.map(opt => (
                <div key={opt.key} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-border/60 text-xs">
                  <div className="flex flex-col">
                    <span className="font-bold text-ink">{opt.label}</span>
                    <span className="text-[10px] text-ink-dim font-mono">Option: {opt.key}</span>
                  </div>
                  <span className="font-mono font-extrabold text-teal bg-teal-soft/80 px-2 py-0.5 rounded">
                    {opt.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Unscored Steps Registry */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
              Unscored / Qualitative Steps
            </span>
            <h3 className="font-display font-extrabold text-lg text-ink">
              Excluded Onboarding Steps (Not Counted in Average)
            </h3>
          </div>
          <span className="bg-slate-100 text-slate-600 text-xs font-mono font-bold px-3 py-1 rounded-full">
            Informational Matching Filters
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { step: 'Step 1', title: 'Age Group', desc: 'Demographic filter' },
            { step: 'Step 2', title: 'Lifestyle Checklist', desc: 'Multi-choice tags' },
            { step: 'Step 4', title: 'Preferred Location', desc: 'City & radius bounds' },
            { step: 'Step 6', title: 'Housing Intent', desc: 'Purchase vs Rent' },
            { step: 'Step 8', title: 'Review & Submit', desc: 'Final confirmation' }
          ].map((item, idx) => (
            <div key={idx} className="border border-border/70 p-3.5 rounded-xl bg-slate-50/50 flex flex-col">
              <span className="font-mono text-[10px] text-amber font-bold uppercase">{item.step}</span>
              <span className="font-bold text-ink text-xs mt-1">{item.title}</span>
              <span className="text-[11px] text-ink-dim mt-0.5 font-medium">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Simulator Section */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-amber font-mono text-[11px] uppercase tracking-wider font-bold mb-1">
          <Calculator className="w-4 h-4 text-teal" /> Live Score Simulator
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/60 pb-4">
          <div>
            <h3 className="font-display font-extrabold text-xl text-ink">
              Interactive Readiness Calculator
            </h3>
            <p className="text-ink-dim text-sm mt-0.5 font-medium">
              Select choices below to observe how the readiness score engine sums step points and computes the arithmetic mean.
            </p>
          </div>

          {/* Live Calculated Badge */}
          <div className="flex items-center gap-3 bg-panel-alt/60 border border-border p-3 px-5 rounded-2xl shrink-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl shadow-sm border ${getScoreBadgeColor(simFinalScore)}`}>
              {simFinalScore}
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase text-ink-dim font-bold">Calculated Readiness</span>
              <span className="text-xs font-bold text-ink">
                {simFinalScore >= 85 ? 'High Compatibility' : simFinalScore >= 75 ? 'Solid Readiness' : 'Moderate Readiness'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Choice 1: Decision Style */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink font-bold">
              Step 3: Decision-Making Style
            </label>
            <div className="space-y-2">
              {decisionOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSimDecision(opt.key)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${simDecision === opt.key
                    ? 'bg-amber-soft/40 border-amber text-ink shadow-sm'
                    : 'bg-white border-border hover:bg-slate-50 text-ink-dim'
                    }`}
                >
                  <div>
                    <span className="font-bold text-xs block text-ink">{opt.label}</span>
                    <span className="text-[10.5px] text-ink-dim font-medium">{opt.reasoning}</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-amber bg-white px-2 py-0.5 rounded border border-amber/20 ml-2">
                    +{opt.points}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Choice 2: Down Payment */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink font-bold">
              Step 5: Down Payment Tier
            </label>
            <div className="space-y-2">
              {downPaymentOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSimDownPayment(opt.key)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${simDownPayment === opt.key
                    ? 'bg-amber-soft/40 border-amber text-ink shadow-sm'
                    : 'bg-white border-border hover:bg-slate-50 text-ink-dim'
                    }`}
                >
                  <div>
                    <span className="font-bold text-xs block text-ink">{opt.label}</span>
                    <span className="text-[10.5px] text-ink-dim font-medium">{opt.reasoning}</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-amber bg-white px-2 py-0.5 rounded border border-amber/20 ml-2">
                    +{opt.points}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Choice 3: Timeline */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink font-bold">
              Step 7: Minimum Commitment
            </label>
            <div className="space-y-2">
              {timelineOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSimTimeline(opt.key)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${simTimeline === opt.key
                    ? 'bg-amber-soft/40 border-amber text-ink shadow-sm'
                    : 'bg-white border-border hover:bg-slate-50 text-ink-dim'
                    }`}
                >
                  <div>
                    <span className="font-bold text-xs block text-ink">{opt.label}</span>
                    <span className="text-[10.5px] text-ink-dim font-medium">{opt.reasoning}</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-amber bg-white px-2 py-0.5 rounded border border-amber/20 ml-2">
                    +{opt.points}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Calculation Formula Card */}
        <div className="bg-[#F8FAFC] border border-border/80 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-bold">
              Formula Derivation
            </span>
            <span className="text-xs font-mono text-ink-dim font-bold">
              Score = round( ({selectedDecision.points} + {selectedDP.points} + {selectedTimeline.points}) / 3 )
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
            <div className="bg-white p-3 rounded-xl border border-border">
              <span className="text-[10px] font-mono text-ink-dim uppercase block">Step 3 Points</span>
              <span className="font-display font-extrabold text-lg text-ink">{selectedDecision.points}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-border">
              <span className="text-[10px] font-mono text-ink-dim uppercase block">Step 5 Points</span>
              <span className="font-display font-extrabold text-lg text-ink">{selectedDP.points}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-border">
              <span className="text-[10px] font-mono text-ink-dim uppercase block">Step 7 Points</span>
              <span className="font-display font-extrabold text-lg text-ink">{selectedTimeline.points}</span>
            </div>
            <div className="bg-amber-soft/50 p-3 rounded-xl border border-amber/20">
              <span className="text-[10px] font-mono text-amber-900 uppercase block">Arithmetic Mean</span>
              <span className="font-display font-extrabold text-lg text-amber">{simAvg.toFixed(2)} → {simFinalScore}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
