import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';
import { fetchMatchingWeights, updateMatchingWeights } from '../../../api/admin';

export default function AdminMatching({ adminUser, setActiveScreen }) {
  const [lifestyleWeight, setLifestyleWeight] = useState(30);
  const [locationWeight, setLocationWeight] = useState(30);
  const [budgetWeight, setBudgetWeight] = useState(20);
  const [commitmentWeight, setCommitmentWeight] = useState(20);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    async function loadWeights() {
      try {
        setLoading(true);
        const weights = await fetchMatchingWeights();

        weights.forEach(w => {
          if (w.variable_key === 'lifestyle') setLifestyleWeight(w.weight);
          else if (w.variable_key === 'location') setLocationWeight(w.weight);
          else if (w.variable_key === 'readiness') setBudgetWeight(w.weight);
          else if (w.variable_key === 'commitment') setCommitmentWeight(w.weight);
        });
      } catch (err) {
        console.error('Failed to load weights:', err);
        setErrorMsg('Failed to load matching weights from database.');
      } finally {
        setLoading(false);
      }
    }

    loadWeights();
  }, []);

  const total = lifestyleWeight + locationWeight + budgetWeight + commitmentWeight;

  const handleSaveWeights = async () => {
    if (total !== 100) {
      setErrorMsg(`Weights must sum to exactly 100%. Current sum: ${total}%`);
      setSuccessMsg('');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const payload = [
        { variable_key: 'lifestyle', weight: lifestyleWeight },
        { variable_key: 'location', weight: locationWeight },
        { variable_key: 'readiness', weight: budgetWeight },
        { variable_key: 'commitment', weight: commitmentWeight }
      ];

      await updateMatchingWeights(payload, adminUser?.id);
      setSuccessMsg('Matching weights saved successfully!');

      // Auto-transition to pod review screen after a short delay
      setTimeout(() => {
        setActiveScreen('admin-pod-review');
      }, 1500);
    } catch (err) {
      console.error('Failed to save weights:', err);
      setErrorMsg(err.message || 'Failed to save matching weights.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm font-medium py-10">Loading matching weight configurations...</div>;
  }

  return (
    <div className="w-full text-left  animate-fade">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Admin / Matching Engine</div>
      <h3 className="font-display font-extrabold text-2xl text-ink mb-2">Matching Engine Weight Controls</h3>
      <p className="text-ink-dim text-sm leading-relaxed mb-6 max-w-[480px]">
        Adjust weight variables across key onboarding criteria. The total sum of all weights must equal exactly 100%.
      </p>

      {errorMsg && (
        <div className="bg-red-50 border border-red-100 text-rust text-xs font-semibold p-4 rounded-xl mb-5">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-teal text-xs font-semibold p-4 rounded-xl mb-5">
          {successMsg}
        </div>
      )}

      <div className="border border-border rounded-2xl p-6 bg-white shadow-sm max-w-[520px] space-y-6">
        <div className="flex flex-col">
          <div className="flex justify-between items-center text-sm font-bold text-ink mb-1.5">
            <span>Lifestyle &amp; Values Weight</span>
            <span className="font-mono text-xs">{lifestyleWeight}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={lifestyleWeight}
            onChange={(e) => {
              setLifestyleWeight(parseInt(e.target.value));
              setErrorMsg('');
            }}
            className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-amber"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex justify-between items-center text-sm font-bold text-ink mb-1.5">
            <span>Location Alignment Weight</span>
            <span className="font-mono text-xs">{locationWeight}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={locationWeight}
            onChange={(e) => {
              setLocationWeight(parseInt(e.target.value));
              setErrorMsg('');
            }}
            className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-amber"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex justify-between items-center text-sm font-bold text-ink mb-1.5">
            <span>Financial Readiness Weight</span>
            <span className="font-mono text-xs">{budgetWeight}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={budgetWeight}
            onChange={(e) => {
              setBudgetWeight(parseInt(e.target.value));
              setErrorMsg('');
            }}
            className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-amber"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex justify-between items-center text-sm font-bold text-ink mb-1.5">
            <span>Commitment Alignment Weight</span>
            <span className="font-mono text-xs">{commitmentWeight}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={commitmentWeight}
            onChange={(e) => {
              setCommitmentWeight(parseInt(e.target.value));
              setErrorMsg('');
            }}
            className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-amber"
          />
        </div>

        {/* Sum indicator */}
        <div className="border-t border-border pt-4 flex justify-between items-center text-xs font-mono font-bold">
          <span className="text-ink-dim uppercase">Total Allocation</span>
          <span className={total === 100 ? "text-teal text-sm" : "text-rust text-sm"}>
            {total}% {total === 100 ? "✓" : `(must be 100%)`}
          </span>
        </div>
      </div>

      <div className="flex gap-3.5 mt-6 items-center">
        <button
          onClick={() => setActiveScreen('admin-dashboard')}
          className="bg-transparent border border-border text-ink rounded-lg py-2.5 px-5 text-sm font-bold hover:bg-panel-alt transition-colors cursor-pointer"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          onClick={handleSaveWeights}
          className={`rounded-lg py-2.5 px-5 text-sm font-bold transition-all cursor-pointer shadow-md text-white ${total === 100 ? "bg-amber hover:bg-[#2450C4]" : "bg-slate-400 cursor-not-allowed"
            }`}
          disabled={saving || total !== 100}
        >
          {saving ? 'Saving...' : 'Save & Run Matcher'}
        </button>

        <button
          type="button"
          onClick={() => setShowInfoModal(true)}
          className="p-2.5 rounded-lg text-ink-dim hover:text-ink hover:bg-panel-alt transition-colors cursor-pointer flex items-center justify-center border border-border/65"
          title="How does the Matching Engine work?"
        >
          <Info className="w-5 h-5 text-teal" />
        </button>
      </div>

      {showInfoModal && createPortal(
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade">
          <div className="bg-white border border-border rounded-2xl w-full max-w-[560px] max-h-[500px] shadow-2xl flex flex-col relative overflow-hidden text-left animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 p-6 shrink-0 bg-[#F8FAFC]">
              <div>
                <h3 className="font-display font-extrabold text-lg text-ink">BOMA Matching Engine Logic</h3>
                <span className="text-xs text-ink-dim font-medium">How user compatibility scores are dynamically calculated</span>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-ink-dim hover:text-ink cursor-pointer p-1 rounded-lg hover:bg-panel-alt transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm leading-relaxed text-ink">
              <div className="bg-teal-soft/20 border border-teal/10 rounded-xl p-4 text-xs">
                <h4 className="font-bold text-teal mb-1">Algorithmic Target Candidates</h4>
                <p className="text-ink-dim leading-relaxed">
                  Only candidates currently registered in the pool with <b>entry_path = 'MATCHING_POOL'</b>, an approved onboarding profile (<b>profile_status = 'APPROVED'</b>), and who are not already matched (<b>matching_status = 'IN_POOL'</b>) are evaluated.
                </p>
              </div>

              <div className="space-y-3.5">
                <h4 className="font-display font-bold text-sm text-ink border-b border-border/60 pb-1.5 mb-2">
                  Matching Weight Formulas
                </h4>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-ink">1. Location Alignment Weight</span>
                    <span className="font-mono text-ink-dim bg-panel px-2 py-0.5 rounded">{locationWeight}%</span>
                  </div>
                  <p className="text-xs text-ink-dim pl-3 leading-relaxed">
                    Assigned in full if both candidates select the exact same preferred city or metro region.
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-ink">2. Lifestyle &amp; Setting Weight</span>
                    <span className="font-mono text-ink-dim bg-panel px-2 py-0.5 rounded">{lifestyleWeight}%</span>
                  </div>
                  <p className="text-xs text-ink-dim pl-3 leading-relaxed">
                    Assigned in full if both candidates target the same setting preference (Urban, Suburban, or Rural).
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-ink">3. Financial Readiness Weight</span>
                    <span className="font-mono text-ink-dim bg-panel px-2 py-0.5 rounded">{budgetWeight}%</span>
                  </div>
                  <p className="text-xs text-ink-dim pl-3 leading-relaxed">
                    Assigned in full if both candidates select the exact same primary housing intent. If intents differ, a <b>partial alignment score</b> of exactly half the weight is given to account for housing option flexibility.
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-ink">4. Commitment Alignment Weight</span>
                    <span className="font-mono text-ink-dim bg-panel px-2 py-0.5 rounded">{commitmentWeight}%</span>
                  </div>
                  <p className="text-xs text-ink-dim pl-3 leading-relaxed">
                    Assigned in full if both candidates share the same target timeline preference (e.g. 5+ years vs 2+ years).
                  </p>
                </div>
              </div>

              <div className="bg-[#FFF9F6] border border-amber/15 rounded-xl p-4 text-xs">
                <h4 className="font-bold text-amber mb-1">Greedy Compatibility Grouping</h4>
                <p className="text-ink-dim leading-relaxed">
                  The engine scores candidate pairings. If a pair exceeds the compatibility threshold (<b>&gt;= 40%</b>), the top matching candidates (up to 3 neighbors) are grouped with the user to create a proposed Pod in <b>UNDER_REVIEW</b> state.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 bg-panel-alt flex justify-end shrink-0">
              <button
                onClick={() => setShowInfoModal(false)}
                className="bg-ink text-white font-bold text-xs px-5 py-2 rounded-lg hover:bg-[#2450C4] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
