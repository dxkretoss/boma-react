import React, { useState, useEffect } from 'react';
import { Mail, Loader2, ShieldCheck, RefreshCw, XCircle, Users, ArrowRight, AlertCircle } from 'lucide-react';
import { 
  fetchPodDetails, 
  fetchPodMembers, 
  fetchPodInvitations, 
  createAndSendInvitation, 
  resendInvitation, 
  cancelInvitation,
  submitPodForReview
} from '../../../api/pods';
import Toast from '../../Toast';

export default function PodInvite({ setActiveScreen, currentUser }) {
  const [pod, setPod] = useState(null);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Forms & Actions states
  const [inviteEmail, setInviteEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [submittingPod, setSubmittingPod] = useState(false);
  const [actionId, setActionId] = useState(null); // tracking loading for specific resend/cancel actions
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  // Load all Pod details
  const loadPodData = async (showLoadingState = true) => {
    if (!currentUser?.id) return;
    if (showLoadingState) setLoading(true);
    try {
      const details = await fetchPodDetails(currentUser.id);
      if (details) {
        setPod(details);
        
        // Fetch members and invitations in parallel
        const [memList, invList] = await Promise.all([
          fetchPodMembers(details.id),
          fetchPodInvitations(details.id)
        ]);
        setMembers(memList);
        setInvitations(invList);
      }
    } catch (err) {
      console.error('Failed to load Pod data:', err);
      setToast({ show: true, message: err.message || 'Failed to sync group information.', type: 'error' });
    } finally {
      if (showLoadingState) setLoading(false);
    }
  };

  useEffect(() => {
    loadPodData();
  }, [currentUser]);

  // Handle invitation submission
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    // Validate email format
    const emailVal = inviteEmail.trim().toLowerCase();
    if (!/\S+@\S+\.\S+/.test(emailVal)) {
      setToast({ show: true, message: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    setSendingInvite(true);
    try {
      await createAndSendInvitation(
        pod.id,
        emailVal,
        currentUser.id,
        currentUser.name || 'Group Coordinator',
        pod.name
      );
      setToast({ show: true, message: `Invitation successfully sent to ${emailVal}!`, type: 'success' });
      setInviteEmail('');
      await loadPodData(false);
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to send invitation.', type: 'error' });
    } finally {
      setSendingInvite(false);
    }
  };

  // Handle resend invitation
  const handleResend = async (inviteId) => {
    setActionId(inviteId);
    try {
      await resendInvitation(inviteId, currentUser.name || 'Group Coordinator', pod.name);
      setToast({ show: true, message: 'Invitation resent with new token expiry.', type: 'success' });
      await loadPodData(false);
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to resend invitation.', type: 'error' });
    } finally {
      setActionId(null);
    }
  };

  // Handle cancel invitation
  const handleCancel = async (inviteId) => {
    setActionId(inviteId);
    try {
      await cancelInvitation(inviteId);
      setToast({ show: true, message: 'Invitation cancelled successfully.', type: 'success' });
      await loadPodData(false);
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to cancel invitation.', type: 'error' });
    } finally {
      setActionId(null);
    }
  };

  // Handle finalize and submit pod
  const handleSubmitPod = async () => {
    if (!pod) return;
    setSubmittingPod(true);
    try {
      await submitPodForReview(pod.id);
      setToast({ show: true, message: 'Pod submitted successfully for review.', type: 'success' });
      setTimeout(() => {
        setActiveScreen('pod-pending');
      }, 1000);
    } catch (err) {
      setToast({ show: true, message: err.message || 'Submission failed.', type: 'error' });
    } finally {
      setSubmittingPod(false);
    }
  };

  // Submission checks
  const pendingInvites = invitations.filter(inv => inv.status === 'PENDING');
  const hasPending = pendingInvites.length > 0;
  const otherMembersCount = members.filter(m => m.role === 'MEMBER').length;
  const hasNoMembers = otherMembersCount === 0;
  const incompleteMembers = members.filter(m => m.profileStatus !== 'APPROVED' && m.profileStatus !== 'COMPLETE');
  const hasIncompleteProfiles = incompleteMembers.length > 0;

  const canSubmit = !hasPending && !hasNoMembers && !hasIncompleteProfiles;

  // Render disabled reason description
  const getDisabledReason = () => {
    if (hasPending) {
      return `${pendingInvites.length} invited member${pendingInvites.length > 1 ? 's have' : ' has'} not joined yet.`;
    }
    if (hasNoMembers) {
      return 'Please invite at least one member to join your Pod.';
    }
    if (hasIncompleteProfiles) {
      return 'All joined members must complete their BOMA profile questionnaire before submitting.';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="py-24 text-center ">
        <Loader2 className="w-10 h-10 text-teal animate-spin mx-auto mb-4" />
        <span className="font-mono text-xs uppercase tracking-wider text-ink-dim font-bold">
          Loading invitation details...
        </span>
      </div>
    );
  }

  if (!pod) {
    return (
      <div className="max-w-[480px] mx-auto py-12 text-center">
        <AlertCircle className="w-12 h-12 text-rust mx-auto mb-4" />
        <h3 className="font-display font-extrabold text-lg text-ink mb-2">No Active Pod Group</h3>
        <p className="text-ink-dim text-sm mb-6">You need to set up a Pod group first before managing invitations.</p>
        <button 
          onClick={() => setActiveScreen('pod-create')}
          className="bg-ink text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#2450C4]"
        >
          Create Pod Group
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fade">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      {/* Premium Header Banner Card */}
      <div className="bg-gradient-to-r from-navy-deep to-teal rounded-custom p-8 text-white relative overflow-hidden shadow-custom-lg">
        <div className="absolute right-0 bottom-0 translate-y-12 translate-x-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative z-10 text-left">
          <span className="font-mono text-[10px] uppercase tracking-wider text-amber-soft font-bold bg-white/10 px-2.5 py-1 rounded-md">
            Existing Pod Manager
          </span>
          <h3 className="font-display font-extrabold text-3xl text-white mt-4 mb-2 tracking-tight">
            {pod.name}
          </h3>
          <p className="text-white/80 text-sm max-w-2xl leading-relaxed">
            {pod.description || "Establish your group co-ownership structure, invite members, and coordinate onboarding profile completions."}
          </p>
        </div>
      </div>

      {/* Main Form & Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Left Column: Forms & Roster (Spans 2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Add Members Form Card */}
          <div className="bg-panel border border-border rounded-custom p-8 shadow-custom">
            <h4 className="font-display font-extrabold text-lg text-navy-deep mb-1">Add Group Members</h4>
            <p className="text-ink-dim text-sm mb-6">Invite co-owners or friends who are buying this property with you. They will receive a link to join your group.</p>
            
            <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-dim/70" />
                <input 
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="co-owner@example.com" 
                  disabled={sendingInvite}
                  className="w-full bg-panel-alt/50 border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-navy-deep placeholder:text-ink-dim/50 focus:outline-none focus:border-ink focus:bg-panel transition-all font-medium"
                />
              </div>
              <button 
                type="submit"
                disabled={sendingInvite || !inviteEmail.trim()}
                className="bg-ink hover:bg-ink/90 text-white rounded-xl px-6 py-3 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {sendingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invitation'}
              </button>
            </form>
          </div>

          {/* Members & Invitations Roster Card */}
          <div className="bg-panel border border-border rounded-custom p-8 shadow-custom space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h4 className="font-display font-extrabold text-lg text-navy-deep flex items-center gap-2.5">
                <Users className="w-5 h-5 text-teal" /> Pod Members &amp; Invitations
              </h4>
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-dim bg-panel-alt px-2.5 py-1 rounded-md font-bold">
                Roster ({members.length + invitations.filter(i => i.status === 'PENDING').length})
              </span>
            </div>
            
            <div className="divide-y divide-border/60">
              {/* Creator (You) */}
              <div className="py-4 flex items-center justify-between first:pt-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-soft flex items-center justify-center text-teal font-extrabold text-sm font-display shadow-sm">
                    {(currentUser.name || currentUser.email).substring(0, 1).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-navy-deep">{currentUser.name || 'You'} (Group Admin)</span>
                    <span className="text-xs text-ink-dim">{currentUser.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-emerald-50 text-sage border border-sage/10 text-[9.5px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                    ✓ Joined
                  </span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md ${
                    currentUser.onboarding_status === 'COMPLETED' 
                      ? 'text-sage bg-emerald-50/50' 
                      : 'text-amber bg-amber-soft/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${currentUser.onboarding_status === 'COMPLETED' ? 'bg-sage' : 'bg-amber'}`} />
                    Profile: {currentUser.onboarding_status === 'COMPLETED' ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
              </div>

              {/* Joined Members */}
              {members.filter(m => m.role === 'MEMBER').map(mem => (
                <div key={mem.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {mem.avatarUrl ? (
                      <img src={mem.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-border" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-teal-soft flex items-center justify-center text-teal font-extrabold text-sm font-display shadow-sm">
                        {(mem.name || mem.email).substring(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-navy-deep">{mem.name}</span>
                      <span className="text-xs text-ink-dim">{mem.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-50 text-sage border border-sage/10 text-[9.5px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                      ✓ Joined
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md ${
                      mem.profileStatus === 'APPROVED' || mem.profileStatus === 'COMPLETE' 
                        ? 'text-sage bg-emerald-50/50' 
                        : 'text-amber bg-amber-soft/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${mem.profileStatus === 'APPROVED' || mem.profileStatus === 'COMPLETE' ? 'bg-sage' : 'bg-amber'}`} />
                      Profile: {mem.profileStatus === 'APPROVED' || mem.profileStatus === 'COMPLETE' ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                </div>
              ))}

              {/* Pending Invitations */}
              {invitations.filter(inv => inv.status === 'PENDING').map(invite => {
                const isActionLoading = actionId === invite.id;
                return (
                  <div key={invite.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-soft/20 flex items-center justify-center text-amber font-bold text-sm font-mono shadow-sm">
                        ?
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-bold text-navy-deep leading-tight truncate max-w-[180px] md:max-w-none">{invite.email}</span>
                        <span className="text-[10px] font-mono text-amber font-bold mt-0.5">Invitation Pending</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResend(invite.id)}
                        disabled={isActionLoading || submittingPod}
                        className="bg-panel hover:bg-panel-alt text-navy-deep border border-border text-xs font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm disabled:opacity-50"
                      >
                        {isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        Resend
                      </button>
                      <button
                        onClick={() => handleCancel(invite.id)}
                        disabled={isActionLoading || submittingPod}
                        className="bg-transparent hover:bg-red-50 text-rust border border-rust/10 text-xs font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      >
                        {isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Empty State */}
              {members.filter(m => m.role === 'MEMBER').length === 0 && invitations.filter(inv => inv.status === 'PENDING').length === 0 && (
                <div className="py-8 text-center text-ink-dim text-sm font-medium">
                  No group members invited yet. Use the form above to add your first member.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Info & Finalize Submission Panel */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="bg-panel border border-border rounded-custom p-6 shadow-custom space-y-4">
            <h5 className="font-display font-extrabold text-[13px] text-navy-deep uppercase tracking-wider font-mono">Existing Pod Bypass</h5>
            <div className="space-y-3 text-ink-dim text-xs leading-relaxed">
              <p>
                Because you are registering an already established group, your Pod completely bypasses matching suggestions and matching pool scoring rules.
              </p>
              <p>
                However, to ensure group alignment and readiness verification, all group members must register and complete the BOMA onboarding profiles.
              </p>
            </div>
          </div>

          {/* Submission Gate Card */}
          <div className="bg-panel border border-border rounded-custom p-6 shadow-custom space-y-5">
            <h5 className="font-display font-extrabold text-sm text-navy-deep">Submission Checklist</h5>
            
            <div className="space-y-3.5 text-xs text-ink-dim">
              <div className="flex items-start gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${otherMembersCount > 0 ? 'bg-sage' : 'bg-slate-300'}`} />
                <div className="flex flex-col text-left">
                  <span className="font-bold text-navy-deep">Invite Member</span>
                  <span>At least 1 member joined ({otherMembersCount} active)</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${!hasPending ? 'bg-sage' : 'bg-slate-300'}`} />
                <div className="flex flex-col text-left">
                  <span className="font-bold text-navy-deep">No Pending Invites</span>
                  <span>All invited members must accept or cancel pending invites</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${!hasIncompleteProfiles ? 'bg-sage' : 'bg-slate-300'}`} />
                <div className="flex flex-col text-left">
                  <span className="font-bold text-navy-deep">Profiles Complete</span>
                  <span>All joined members must finish onboarding profiles</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveScreen('pod-review')}
                disabled={!canSubmit}
                className="w-full bg-ink hover:bg-ink/90 text-white rounded-xl py-3 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Submission <ArrowRight className="w-4 h-4" />
              </button>

              {!canSubmit && getDisabledReason() && (
                <div className="mt-4 flex items-start gap-2 text-rust bg-rust/5 p-3.5 rounded-xl border border-rust/10 text-xs font-semibold leading-normal text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{getDisabledReason()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
