import React, { useState, useEffect } from 'react';
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
      setSuccessMsg('Matching weights successfully saved to database!');
      
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

          <div className="flex gap-3.5 mt-6">
            <button 
              onClick={() => setActiveScreen('admin-dashboard')}
              className="bg-transparent border border-border text-ink rounded-lg py-2.5 px-5 text-sm font-bold hover:bg-panel-alt transition-colors cursor-pointer"
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveWeights}
              className={`rounded-lg py-2.5 px-5 text-sm font-bold transition-all cursor-pointer shadow-md text-white ${
                total === 100 ? "bg-amber hover:bg-[#2450C4]" : "bg-slate-400 cursor-not-allowed"
              }`}
              disabled={saving || total !== 100}
            >
              {saving ? 'Saving...' : 'Save & Run Matcher'}
            </button>
          </div>
        </div>
  );
}
