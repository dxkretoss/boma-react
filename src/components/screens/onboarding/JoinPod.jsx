import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Loader2, ArrowRight, LogOut, UserPlus, LogIn } from 'lucide-react';
import { verifyInvitationToken, acceptPodInvitation } from '../../../api/pods';
import { supabase } from '../../../supabaseClient';
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
  const [isUserRegistered, setIsUserRegistered] = useState(false);
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

  // 2. Verify token on load and check if email is registered
  useEffect(() => {
    if (!token) return;

    async function runVerification() {
      try {
        setVerifying(true);
        setVerificationError('');
        const details = await verifyInvitationToken(token);
        setInviteDetails(details);

        // Check if invited email is already registered in users table
        let registered = false;
        try {
          if (details?.email) {
            const { data: userRec } = await supabase
              .from('users')
              .select('id, email')
              .eq('email', details.email.toLowerCase().trim())
              .maybeSingle();
            if (userRec) registered = true;
          }
        } catch (checkErr) {
          console.warn('Could not check user registration status:', checkErr);
        }
        setIsUserRegistered(registered);
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
      setVerificationError('');
      setStep('success');
    } catch (err) {
      console.error('Failed to accept invitation:', err);
      setToast({ show: true, message: err.message || 'Failed to accept invitation', type: 'error' });
    } finally {
      setAccepting(false);
    }
  };

  // 4. Handle sign out and switch to auth modal
  const handleSignOutAndAuth = async (mode, emailToPrefill = '') => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('SignOut error:', e);
    }
    localStorage.removeItem('boma_current_user');
    if (setCurrentUser) {
      setCurrentUser(null);
    }
    if (openAuthModal) {
      openAuthModal(mode, emailToPrefill);
    }
  };

  // 5. Handle success continue action
  const handleSuccessContinue = () => {
    // Clean token state
    if (setInviteToken) setInviteToken(null);
    if (setIsInvitationFlow) setIsInvitationFlow(false);
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      window.history.replaceState({}, document.title, url.pathname + url.hash);
    }

    // Direct user to short onboarding questionnaire
    if (!currentUser?.housing_intent || currentUser?.onboarding_status !== 'COMPLETED') {
      setActiveScreen('pod-member-onboarding');
    } else {
      setActiveScreen('profile');
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

      <div className="bg-white border border-border rounded-[22px] p-8 shadow-custom text-left">
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
        {!verifying && verificationError && step !== 'success' && (
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
              className="bg-amber text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#b05d3e] transition-all cursor-pointer w-full shadow-md"
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
                  {isUserRegistered ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                </div>
                <h3 className="font-display font-extrabold text-[20px] text-ink mb-2">
                  {isUserRegistered ? 'Sign In to Join Pod' : 'Create an Account to Join'}
                </h3>
                <p className="text-xs font-mono uppercase tracking-wider text-amber font-bold mb-4">
                  BOMA Existing Pod Invitation
                </p>
                <div className="bg-slate-50 border border-border/80 rounded-xl p-4.5 w-full text-left mb-6 space-y-3">
                  <div>
                    <span className="text-[11px] text-ink-dim font-mono uppercase block font-bold">Group Pod Name</span>
                    <span className="text-sm font-bold text-ink">{inviteDetails.podName}</span>
                  </div>
                  {inviteDetails.podDescription && (
                    <div>
                      <span className="text-[11px] text-ink-dim font-mono uppercase block font-bold">Pod Description</span>
                      <p className="text-xs text-ink mt-0.5 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-border/60">
                        {inviteDetails.podDescription}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] text-ink-dim font-mono uppercase block font-bold">Invited By (Admin)</span>
                    <div className="flex flex-col text-left mt-0.5">
                      <span className="text-sm font-bold text-ink">{inviteDetails.inviterName}</span>
                      {inviteDetails.inviterEmail && (
                        <span className="text-xs text-ink-dim font-mono">{inviteDetails.inviterEmail}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-dim font-mono uppercase block font-bold">Invited Email</span>
                    <span className="text-sm font-bold text-teal font-mono">{inviteDetails.email}</span>
                  </div>
                </div>

                <p className="text-ink-dim text-xs font-medium leading-relaxed mb-6">
                  {isUserRegistered
                    ? `An account for ${inviteDetails.email} was found. Please sign in to accept your invitation.`
                    : `You've been invited to join this Pod. Please register a BOMA account with ${inviteDetails.email} to join.`}
                </p>

                <div className="flex flex-col gap-2.5 w-full">
                  {isUserRegistered ? (
                    <>
                      <button 
                        onClick={() => openAuthModal('login', inviteDetails.email)}
                        className="bg-amber text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#b05d3e] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" /> Sign In &amp; Accept
                      </button>
                      <button 
                        onClick={() => openAuthModal('signup', inviteDetails.email)}
                        className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Create a New Account
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => openAuthModal('signup', inviteDetails.email)}
                        className="bg-amber text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#b05d3e] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" /> Register &amp; Join Pod
                      </button>
                      <button 
                        onClick={() => openAuthModal('login', inviteDetails.email)}
                        className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Already have an account? Sign In
                      </button>
                    </>
                  )}
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
                <p className="text-ink-dim text-xs font-medium leading-relaxed mb-4">
                  This invitation token was sent specifically to <span className="font-bold text-ink">{inviteDetails.email}</span>. You are currently logged in as <span className="font-bold text-ink">{currentUser.email}</span>.
                </p>
                <div className="bg-amber-soft/20 border border-amber/20 rounded-xl p-3.5 w-full text-left mb-6 text-xs text-ink-dim leading-relaxed">
                  {isUserRegistered
                    ? `Please switch accounts and sign in with ${inviteDetails.email} to join ${inviteDetails.podName}.`
                    : `The invited email address (${inviteDetails.email}) is not yet registered. Please register with this email to join ${inviteDetails.podName}.`}
                </div>

                <div className="flex flex-col gap-2.5 w-full">
                  {isUserRegistered ? (
                    <button 
                      onClick={() => handleSignOutAndAuth('login', inviteDetails.email)}
                      className="bg-rust hover:bg-red-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer w-full flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <LogOut className="w-4 h-4" /> Sign In as {inviteDetails.email}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleSignOutAndAuth('signup', inviteDetails.email)}
                      className="bg-amber hover:bg-[#b05d3e] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer w-full flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <UserPlus className="w-4 h-4" /> Register as {inviteDetails.email}
                    </button>
                  )}

                  <button 
                    onClick={() => handleSignOutAndAuth('login')}
                    className="bg-transparent border border-border text-ink font-bold text-xs py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Sign In with Another Email
                  </button>
                </div>
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
                  {inviteDetails.podDescription && (
                    <div>
                      <span className="text-[11px] text-ink-dim font-mono uppercase block font-bold">Pod Description</span>
                      <p className="text-xs text-ink mt-0.5 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-border/60">
                        {inviteDetails.podDescription}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] text-ink-dim font-mono uppercase block font-bold">Invited By (Admin)</span>
                    <div className="flex flex-col text-left mt-0.5">
                      <span className="text-sm font-bold text-ink">{inviteDetails.inviterName}</span>
                      {inviteDetails.inviterEmail && (
                        <span className="text-xs text-ink-dim font-mono">{inviteDetails.inviterEmail}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleAcceptInvite}
                  disabled={accepting}
                  className="bg-amber text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#b05d3e] hover:-translate-y-[0.5px] transition-all cursor-pointer w-full flex items-center justify-center gap-2 shadow-md disabled:opacity-80"
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
            <div className="bg-[#FAF7F2] border border-[#ECDCC9] rounded-2xl p-5 text-left mb-6">
              <h4 className="text-[13px] font-bold text-amber mb-1.5 font-display">Next Step</h4>
              <p className="text-ink-dim text-xs leading-relaxed font-medium">
                Before your group can be submitted to administrators for review, you must complete your required BOMA profile information.
              </p>
            </div>
            <button 
              onClick={handleSuccessContinue}
              className="bg-amber text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#b05d3e] hover:-translate-y-[0.5px] transition-all cursor-pointer w-full flex items-center justify-center gap-1.5 shadow-md"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

