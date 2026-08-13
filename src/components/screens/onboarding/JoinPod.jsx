import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Loader2, ArrowRight, LogOut } from 'lucide-react';
import { verifyInvitationToken, acceptPodInvitation } from '../../../api/pods';
import Toast from '../../Toast';

export default function JoinPod({
  setActiveScreen,
  currentUser,
  setCurrentUser,
  openAuthModal,
  inviteToken,
  setInviteToken,
  isInvitationFlow,
  setIsInvitationFlow
}) {
  const [token, setToken] = useState('');
  const [verifying, setVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState('');
  const [inviteDetails, setInviteDetails] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [joinedPodName, setJoinedPodName] = useState('');
  const [step, setStep] = useState('verify'); // verify | prompt | success
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  // 1. Extract token and store in state
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let urlToken = urlParams.get('token');
    
    if (urlToken) {
      setInviteToken(urlToken);
      setIsInvitationFlow(true);
    } else {
      urlToken = inviteToken;
    }

    if (urlToken) {
      setToken(urlToken);
    } else {
      setVerificationError('No invitation token found. Please verify the URL link from your invitation email.');
      setVerifying(false);
    }
  }, [inviteToken]);

  // 2. Verify token on load
  useEffect(() => {
    if (!token) return;

    async function runVerification() {
      try {
        setVerifying(true);
        setVerificationError('');
        const details = await verifyInvitationToken(token);
        setInviteDetails(details);
        setStep('prompt');
      } catch (err) {
        setVerificationError(err.message || 'Verification failed');
        setInviteToken(null);
        setIsInvitationFlow(false);
      } finally {
        setVerifying(false);
      }
    }

    runVerification();
  }, [token]);

  // 3. Handle invitation acceptance
  const handleAcceptInvite = async () => {
    if (!inviteDetails || !currentUser) return;
    
    setAccepting(true);
    try {
      const podId = await acceptPodInvitation(
        inviteDetails.invitationId,
        currentUser.id,
        currentUser.email
      );

      // Clean local token storage state
      setInviteToken(null);
      setIsInvitationFlow(false);

      // Update local current user state to reflect joining a pod
      if (setCurrentUser) {
        setCurrentUser({
          ...currentUser,
          entry_path: 'EXISTING_POD'
        });
      }

      setJoinedPodName(inviteDetails.podName);
      setStep('success');
    } catch (err) {
      console.error('Failed to accept invitation:', err);
      setToast({ show: true, message: err.message || 'Failed to accept invitation', type: 'error' });
    } finally {
      setAccepting(false);
    }
  };

  // 4. Handle sign out
  const handleSignOut = () => {
    if (setCurrentUser) {
      setCurrentUser(null);
    }
    if (openAuthModal) {
      openAuthModal('login');
    }
  };

  // 5. Handle success continue action
  const handleSuccessContinue = () => {
    if (!currentUser) {
      setActiveScreen('landing');
      return;
    }

    const isProfileComplete = currentUser.onboarding_status === 'COMPLETED' || currentUser.user_onboarded === true;
    if (isProfileComplete) {
      setActiveScreen('profile');
    } else {
      // Direct them to the short onboarding questionnaire for existing pod members
      setActiveScreen('pod-member-onboarding');
    }
  };

  return (
    <div className="max-w-[480px] mx-auto py-20 px-6 animate-fade">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <div className="bg-white border border-border rounded-[22px] p-8 shadow-custom text-left ">
        {/* Loading Phase */}
        {verifying && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-teal animate-spin mb-4" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-dim font-bold">
              Verifying Secure Token...
            </span>
          </div>
        )}

        {/* Verification Error Phase */}
        {!verifying && verificationError && (
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-rust flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-display font-extrabold text-[20px] text-ink mb-3">
              Invitation Invalid
            </h3>
            <p className="text-ink-dim text-sm leading-relaxed mb-6">
              {verificationError}
            </p>
            <button 
              onClick={() => setActiveScreen('landing')}
              className="bg-ink text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#2450C4] transition-colors cursor-pointer w-full"
            >
              Go to Landing Page
            </button>
          </div>
        )}

        {/* Prompt Phase */}
        {!verifying && step === 'prompt' && inviteDetails && (
          <div>
            {/* Stage A: User not logged in */}
            {!currentUser && (
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-teal-soft text-teal flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-display font-extrabold text-[20px] text-ink mb-2">
                  You've Been Invited
                </h3>
                <p className="text-xs font-mono uppercase tracking-wider text-amber font-bold mb-4">
                  BOMA Existing Pod Invitation
                </p>
                <div className="bg-slate-50 border border-border/80 rounded-xl p-4.5 w-full text-left mb-6 space-y-3">
                  <div>
                    <span className="text-[11px] text-ink-dim font-mono uppercase block font-bold">Group Pod Name</span>
                    <span className="text-sm font-bold text-ink">{inviteDetails.podName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-dim font-mono uppercase block font-bold">Invited By</span>
                    <span className="text-sm font-bold text-ink">{inviteDetails.inviterName}</span>
                  </div>
                </div>
                <p className="text-ink-dim text-xs font-medium leading-relaxed mb-6">
                  BOMA helps groups align values, budget, and commitments. Please log in or register using your invited email address to accept this invitation.
                </p>
                <div className="flex flex-col gap-2.5 w-full">
                  <button 
                    onClick={() => openAuthModal('signup')}
                    className="bg-ink text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#2450C4] transition-all cursor-pointer shadow-md"
                  >
                    Create Account &amp; Join
                  </button>
                  <button 
                    onClick={() => openAuthModal('login')}
                    className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Sign In to Accept
                  </button>
                </div>
              </div>
            )}

            {/* Stage B: Logged in, Email Mismatch */}
            {currentUser && currentUser.email.toLowerCase().trim() !== inviteDetails.email.toLowerCase().trim() && (
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-rust flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-display font-extrabold text-[20px] text-ink mb-2">
                  Email Mismatch
                </h3>
                <p className="text-ink-dim text-xs font-medium leading-relaxed mb-5">
                  This invitation token was sent specifically to <span className="font-bold text-ink">{inviteDetails.email}</span>. You are currently logged in as <span className="font-bold text-ink">{currentUser.email}</span>.
                </p>
                <p className="text-ink-dim text-xs font-medium leading-relaxed mb-6">
                  Please log out and sign in with the invited email address to join this Pod.
                </p>
                <button 
                  onClick={handleSignOut}
                  className="bg-rust hover:bg-red-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer w-full flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <LogOut className="w-4 h-4" /> Sign In with Another Email
                </button>
              </div>
            )}

            {/* Stage C: Logged in, Email Match, Ready to Accept */}
            {currentUser && currentUser.email.toLowerCase().trim() === inviteDetails.email.toLowerCase().trim() && (
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-teal-soft text-teal flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-display font-extrabold text-[20px] text-ink mb-1">
                  You've Been Invited
                </h3>
                <p className="text-[11px] font-mono uppercase tracking-wider text-ink-dim font-bold mb-4">
                  Invitation Verified
                </p>
                <div className="bg-slate-50 border border-border/80 rounded-xl p-4 w-full text-left mb-6 space-y-3">
                  <div>
                    <span className="text-[11px] text-ink-dim font-mono uppercase block font-bold">Group Pod Name</span>
                    <span className="text-sm font-bold text-ink">{inviteDetails.podName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-dim font-mono uppercase block font-bold">Invited By</span>
                    <span className="text-sm font-bold text-ink">{inviteDetails.inviterName}</span>
                  </div>
                </div>
                <button 
                  onClick={handleAcceptInvite}
                  disabled={accepting}
                  className="bg-ink text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#2450C4] hover:-translate-y-[0.5px] transition-all cursor-pointer w-full flex items-center justify-center gap-2 shadow-md disabled:opacity-80"
                >
                  {accepting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Accepting...
                    </>
                  ) : (
                    'Accept & Join Pod'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Success Phase */}
        {!verifying && step === 'success' && (
          <div className="flex flex-col items-center text-center animate-fade">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-sage flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-extrabold text-[22px] text-ink mb-1">
              You're In!
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-wider text-sage font-bold mb-4">
              Joined Pod Successfully
            </span>
            <p className="text-ink-dim text-sm leading-relaxed mb-6">
              You are now officially a member of <span className="font-bold text-ink">{joinedPodName}</span>.
            </p>
            <div className="bg-amber-soft/30 border border-amber/20 rounded-xl p-4.5 text-left mb-6">
              <h4 className="text-xs font-bold text-teal mb-1">Next Step</h4>
              <p className="text-ink-dim text-[11.5px] leading-relaxed">
                Before your group can be submitted to administrators for review, you must complete your required BOMA profile information.
              </p>
            </div>
            <button 
              onClick={handleSuccessContinue}
              className="bg-ink text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#2450C4] hover:-translate-y-[0.5px] transition-all cursor-pointer w-full flex items-center justify-center gap-1.5 shadow-md animate-pulse"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
