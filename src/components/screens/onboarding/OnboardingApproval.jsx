import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { fetchUserProfile } from '../../../api/users';

export default function OnboardingApproval({ setActiveScreen, currentUser, setCurrentUser }) {
  const isRejected = currentUser?.profile_status === 'REJECTED';
  const [checking, setChecking] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  useEffect(() => {
    async function syncStatus() {
      if (!currentUser?.id) return;
      try {
        const freshUser = await fetchUserProfile(currentUser.id);
        if (freshUser && freshUser.profile_status !== currentUser.profile_status) {
          if (setCurrentUser) {
            setCurrentUser(freshUser);
          }
          if (freshUser.profile_status === 'APPROVED') {
            setActiveScreen('profile');
          }
        }
      } catch (err) {
        console.error('Failed to sync user status in OnboardingApproval:', err);
      }
    }
    
    // Initial sync
    syncStatus();
    
    // Polling interval every 5 seconds to auto-approve without refresh
    const interval = setInterval(syncStatus, 5000);
    return () => clearInterval(interval);
  }, [currentUser, setCurrentUser, setActiveScreen]);

  const handleGoToDashboard = async () => {
    if (!currentUser?.id) return;
    setChecking(true);
    setSyncStatusMsg('');
    try {
      const freshUser = await fetchUserProfile(currentUser.id);
      if (setCurrentUser) {
        setCurrentUser(freshUser);
      }
      if (freshUser.profile_status === 'APPROVED') {
        setActiveScreen('profile');
      } else {
        setSyncStatusMsg("Your profile is still being reviewed by the BOMA board. We'll redirect you once approved!");
        setTimeout(() => setSyncStatusMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setSyncStatusMsg('Failed to check status. Please check your connection.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-[500px] mx-auto text-center  py-10 px-4 animate-fade">
      <div className="w-full bg-white border border-border rounded-2xl p-10 shadow-custom flex flex-col items-center">
        {isRejected ? (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 text-rust flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div className="font-mono text-[11px] uppercase tracking-wider text-rust mb-3 font-semibold">Needs Attention</div>
            
            <h1 className="font-display text-[24px] font-extrabold text-ink mb-4 leading-tight">Your profile needs attention</h1>
            
            <p className="text-ink-dim text-sm leading-relaxed mb-6 max-w-[420px]">
              Please review the feedback below and update your profile onboarding questions to resubmit.
            </p>
            
            <div className="w-full bg-[#FFF5F5] border border-red-100 rounded-xl p-4 text-left mb-8">
              <b className="block text-xs font-mono uppercase tracking-wider text-rust mb-1.5 font-bold">Feedback from BOMA Admin</b>
              <p className="text-xs text-ink font-medium leading-relaxed">
                {currentUser?.rejection_reason || 'Please provide more details on your lifestyle and values.'}
              </p>
            </div>
            
            <button 
              onClick={() => setActiveScreen('entry-path')}
              className="w-full bg-rust text-white rounded-lg py-3 text-sm font-bold shadow-md hover:bg-red-700 hover:-translate-y-[0.5px] transition-all cursor-pointer text-center"
            >
              Update Profile
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-teal-soft flex items-center justify-center text-teal mb-4">
              <RefreshCw className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-3 font-semibold">Under Review</div>
            
            <h1 className="font-display text-[24px] font-extrabold text-ink mb-4 leading-tight">Your profile is being reviewed</h1>
            
            <p className="text-ink-dim text-sm leading-relaxed mb-8 max-w-[420px]">
              An admin will review your onboarding responses and readiness score before you're added to the matching pool. This usually takes 1–2 business days — we'll notify you once you're approved.
            </p>

            {syncStatusMsg && (
              <div className="mb-6 p-3 text-xs bg-amber-soft/40 border border-amber/20 rounded-xl text-teal font-semibold animate-fade">
                {syncStatusMsg}
              </div>
            )}
            
            <button 
              onClick={handleGoToDashboard}
              disabled={checking}
              className="w-full bg-amber text-white rounded-lg py-3 text-sm font-bold shadow-md hover:bg-[#2450C4] hover:-translate-y-[0.5px] transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              {checking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Checking Status...
                </>
              ) : (
                'Go to Dashboard'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
