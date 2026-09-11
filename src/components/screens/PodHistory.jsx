import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  ArrowRight, 
  ArrowLeft,
  Home, 
  Calendar, 
  AlertCircle, 
  Trash2, 
  LogOut, 
  Mail, 
  Plus, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  XCircle, 
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import Avatar from '../Avatar';
import Toast from '../Toast';
import podThumbnailImg from '../../assets/who_friends.jpg';
import { 
  fetchPodMembers, 
  fetchPodInvitations, 
  createAndSendInvitation, 
  resendInvitation, 
  cancelInvitation 
} from '../../api/pods';

export default function PodHistory({
  currentPod,
  userPod,
  podMembersList = [],
  currentUser,
  isExistingPod,
  isCreator,
  podHistory = [],
  deletePod,
  leavePod,
  showConfirm,
  setActiveScreen
}) {
  const isExisting = isExistingPod || currentUser?.entry_path === 'EXISTING_POD';
  const activePod = userPod || currentPod;
  
  // For Existing Pod (Path B): Show self-formed pod in My Pods (FORMING, UNDER_REVIEW, ACTIVE)
  // For Matching Pool (Path A): Tentative suggestions/proposals belong in Matching tab, not My Pods
  const hasPod = isExisting 
    ? Boolean(activePod) 
    : Boolean(activePod && activePod.status === 'ACTIVE');

  const podName = activePod?.name || 'My Pod Group';
  const podStatus = activePod?.status || (currentPod ? 'ACTIVE' : 'CREATING');
  const groupType = activePod?.group_type || (isExisting ? 'Self-Registered' : 'Matched via Engine');
  const description = activePod?.description || 'No description provided for this Pod.';

  // View state: false = card summary (Screenshot 2), true = full rich view (Screenshot 1 & 3)
  const [isFullView, setIsFullView] = useState(false);

  // Local state for live members & invitations
  const [members, setMembers] = useState(podMembersList || []);
  const [invitations, setInvitations] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Sync / Load live members and invitations
  const loadPodDetails = async () => {
    if (!activePod?.id) return;
    try {
      setLoadingDetails(true);
      const [mems, invites] = await Promise.all([
        fetchPodMembers(activePod.id),
        fetchPodInvitations(activePod.id)
      ]);
      if (mems && mems.length > 0) setMembers(mems);
      if (invites) setInvitations(invites);
    } catch (err) {
      console.error('Failed to load pod members/invitations:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (podMembersList && podMembersList.length > 0) {
      setMembers(podMembersList);
    }
    loadPodDetails();
  }, [activePod?.id, podMembersList.length]);

  // Determine if current user is Pod Admin/Creator (Only for pre-formed EXISTING_POD groups)
  const isExistingPodGroup = activePod?.group_type === 'EXISTING_POD' || activePod?.group_type === 'Friends' || activePod?.group_type === 'Family' || activePod?.group_type === 'Workforce' || currentUser?.entry_path === 'EXISTING_POD';
  const isUserAdmin = Boolean(
    isExistingPodGroup && (
      isCreator ||
      activePod?.created_by === currentUser?.id ||
      activePod?.memberRole === 'CREATOR' ||
      members.some(m => m.userId === currentUser?.id && m.role === 'CREATOR')
    )
  );

  const pendingInvites = invitations.filter(inv => inv.status === 'PENDING');
  const memberCount = members.length > 0 ? members.length : (activePod?.memberCount || 1);

  // Send quick invitation
  const handleSendInvite = async (e) => {
    if (e) e.preventDefault();
    if (!inviteEmail.trim()) return;

    const emailVal = inviteEmail.trim().toLowerCase();
    if (!/\S+@\S+\.\S+/.test(emailVal)) {
      setToast({ show: true, message: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    setSendingInvite(true);
    try {
      await createAndSendInvitation(
        activePod.id,
        emailVal,
        currentUser.id,
        currentUser.name || 'Group Coordinator',
        activePod.name
      );
      setToast({ show: true, message: `Invitation sent to ${emailVal}!`, type: 'success' });
      setInviteEmail('');
      setShowInviteModal(false);
      await loadPodDetails();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to send invitation.', type: 'error' });
    } finally {
      setSendingInvite(false);
    }
  };

  // Resend invitation
  const handleResend = async (inviteId) => {
    setActionId(inviteId);
    try {
      await resendInvitation(inviteId, currentUser.name || 'Group Coordinator', activePod.name);
      setToast({ show: true, message: 'Invitation resent successfully!', type: 'success' });
      await loadPodDetails();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to resend invitation.', type: 'error' });
    } finally {
      setActionId(null);
    }
  };

  // Cancel invitation
  const handleCancel = async (inviteId) => {
    setActionId(inviteId);
    try {
      await cancelInvitation(inviteId);
      setToast({ show: true, message: 'Invitation cancelled.', type: 'success' });
      await loadPodDetails();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to cancel invitation.', type: 'error' });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="pad py-12 px-6 md:px-8 text-left animate-fade">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Top Back Navigation when in full view */}
      {hasPod && isFullView && (
        <div className="mb-4">
          <button
            onClick={() => setIsFullView(false)}
            className="text-xs font-bold text-amber hover:text-[#b05d3e] flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-amber-soft/40 transition-colors inline-flex"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Pods Overview
          </button>
        </div>
      )}

      {/* Screen Header */}
      <div className="mb-6">
        <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">
          Profile / My Pods
        </div>
        <h3 className="font-serif font-extrabold text-[28px] text-ink leading-tight">
          My Pods
        </h3>
        <p className="text-sm text-ink-dim leading-relaxed max-w-[640px] mt-1">
          View your active pod membership, collaborate with members, manage invitations, and monitor group status.
        </p>
      </div>

      {hasPod && !isFullView ? (
        /* Summary Card View (Screenshot 2) */
        <div className="bg-white border border-border rounded-[22px] p-6 sm:p-7 shadow-sm text-left max-w-[640px] transition-all hover:border-amber/30">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="font-serif font-extrabold text-[22px] text-ink leading-tight">
                {podName}
              </h3>
              <div className="mt-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider font-mono border ${
                  podStatus === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : podStatus === 'UNDER_REVIEW'
                      ? 'bg-amber-soft text-amber border-amber/30'
                      : podStatus === 'REJECTED'
                        ? 'bg-red-50 text-rust border-red-200'
                        : 'bg-teal-50 text-teal border-teal-200'
                }`}>
                  {podStatus === 'ACTIVE'
                    ? 'ACTIVE IN COMMONS'
                    : podStatus === 'UNDER_REVIEW'
                      ? 'UNDER BOARD REVIEW'
                      : podStatus === 'REJECTED'
                        ? 'REVIEW FEEDBACK'
                        : 'FORMING'}
                </span>
              </div>
            </div>
            <div className="w-[104px] h-[66px] sm:w-[114px] sm:h-[72px] rounded-xl overflow-hidden border border-border/70 shadow-sm shrink-0">
              <img
                src={podThumbnailImg}
                alt={podName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <p className="text-ink-dim text-xs font-medium mb-6">
            {currentUser?.location_city || activePod?.location || 'Austin, TX'} · {memberCount} {memberCount === 1 ? 'member' : 'members'} · {groupType}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-border/60 flex-wrap gap-3">
            <div className="text-xs text-ink-dim font-medium">
              {podStatus === 'UNDER_REVIEW' ? (
                <span className="flex items-center gap-1.5 text-amber font-semibold">
                  <Clock className="w-3.5 h-3.5 animate-pulse" /> Under Board Review · Pending Approval
                </span>
              ) : podStatus === 'ACTIVE' ? (
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active in Commons
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-teal font-semibold">
                  <Users className="w-3.5 h-3.5" /> Forming Pod · Inviting Members
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsFullView(true)}
                className="bg-amber hover:bg-[#b05d3e] text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                View Pod <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {isUserAdmin ? (
                <button
                  onClick={() => {
                    if (showConfirm) {
                      showConfirm(
                        'Delete Pod Group',
                        'Are you sure you want to delete this Pod group? This will remove all members and invitations.',
                        deletePod,
                        'danger',
                        'Delete Pod'
                      );
                    }
                  }}
                  className="bg-transparent border border-rust/40 text-rust hover:bg-red-50 rounded-xl py-2 px-3.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  Delete Pod
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (showConfirm) {
                      showConfirm(
                        'Leave Pod Group',
                        'Are you sure you want to leave this Pod? You will be returned to the open matching pool.',
                        leavePod,
                        'danger',
                        'Leave Pod'
                      );
                    }
                  }}
                  className="bg-transparent border border-rust/40 text-rust hover:bg-red-50 rounded-xl py-2 px-3.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  Leave Pod
                </button>
              )}
            </div>
          </div>
        </div>
      ) : hasPod && isFullView ? (
        <div className="space-y-6">
          {/* Top Hero Banner */}
          <div
            className="rounded-[20px] p-[28px] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-custom-lg text-white"
          >
            {/* Background Image */}
            <img
              src={activePod?.photo || podThumbnailImg}
              alt={podName}
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
            />

            {/* Dark Gradient Overlay for optimal contrast and readability */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#2E2330]/95 via-[#2E2330]/85 to-[#2E2330]/65 pointer-events-none" 
            />

            {/* Ambient decorative glow */}
            <div className="absolute top-0 right-1/4 w-[300px] h-[300px] rounded-full bg-radial from-[#C46A4A]/25 via-[#B87333]/15 to-transparent blur-3xl pointer-events-none" />

            <div className="flex items-start gap-4 relative z-10 flex-1">
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="bg-amber/30 backdrop-blur-sm text-amber-200 border border-amber/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    {groupType}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono border backdrop-blur-sm ${
                    podStatus === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : podStatus === 'UNDER_REVIEW'
                        ? 'bg-amber/20 text-[#D7A27A] border-amber/40'
                        : podStatus === 'REJECTED'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : 'bg-teal-500/20 text-teal-200 border-teal-500/40'
                  }`}>
                    {podStatus === 'ACTIVE'
                      ? 'Active in Commons'
                      : podStatus === 'UNDER_REVIEW'
                        ? 'Under Board Review'
                        : podStatus === 'REJECTED'
                          ? 'Review Feedback'
                          : 'Forming & Inviting'}
                  </span>
                </div>
                <h2 className="font-serif font-bold text-[24px] text-white leading-tight">
                  {podName}
                </h2>
                <p className="text-white/75 text-xs mt-1 leading-relaxed max-w-[520px]">
                  {description}
                </p>
              </div>
            </div>

            {/* Quick Action CTA inside Hero */}
            <div className="flex items-center gap-3 relative z-10 shrink-0 w-full md:w-auto flex-wrap sm:flex-nowrap">
              {podStatus === 'ACTIVE' ? (
                <button
                  onClick={() => setActiveScreen('commons-dashboard')}
                  className="bg-amber hover:bg-[#b05d3e] text-white text-xs font-semibold py-3 px-5 rounded-full shadow-md hover:shadow-lg hover:shadow-[#C46A4A]/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Open Pod Commons <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : podStatus === 'CREATING' ? (
                <>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-amber hover:bg-[#b05d3e] text-white text-xs font-semibold py-3 px-5 rounded-full shadow-md hover:shadow-lg hover:shadow-[#C46A4A]/25 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Invite Members
                  </button>
                  {isUserAdmin && (
                    <button
                      onClick={() => setActiveScreen('pod-invite')}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold py-3 px-4 rounded-full transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      Manage Roster &rarr;
                    </button>
                  )}
                </>
              ) : podStatus === 'UNDER_REVIEW' ? (
                <button
                  onClick={() => setActiveScreen('pod-pending')}
                  className="bg-amber hover:bg-[#b05d3e] text-white text-xs font-semibold py-3 px-5 rounded-full shadow-md hover:shadow-lg hover:shadow-[#C46A4A]/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" /> Check Review Status &rarr;
                </button>
              ) : null}
            </div>
          </div>

          {/* KPI Stat Cards (Matching Profile Grid Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="border border-border rounded-2xl p-5 bg-panel shadow-sm flex flex-col justify-between">
              <div className="font-serif text-[28px] font-bold text-ink leading-tight">
                {memberCount} <span className="text-sm font-normal text-ink-dim font-sans">/ 4 max</span>
              </div>
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim mt-1 font-semibold flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-teal" /> Current Members
              </div>
            </div>

            <div className="border border-border rounded-2xl p-5 bg-panel shadow-sm flex flex-col justify-between">
              <div className="font-serif text-[24px] font-bold text-ink leading-tight pt-1">
                {podStatus === 'ACTIVE' ? 'Active' : podStatus === 'UNDER_REVIEW' ? 'In Review' : 'Forming'}
              </div>
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim mt-1.5 font-semibold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-amber" /> Group Status
              </div>
            </div>

            <div className="border border-border rounded-2xl p-5 bg-panel shadow-sm flex flex-col justify-between">
              <div className="font-serif text-[24px] font-bold text-ink leading-tight pt-1">
                {isUserAdmin ? 'Admin (Creator)' : 'Co-Member'}
              </div>
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim mt-1.5 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-gold" /> Your Role
              </div>
            </div>

            <div className="border border-border rounded-2xl p-5 bg-panel shadow-sm flex flex-col justify-between">
              <div className="font-serif text-[22px] font-bold text-ink leading-tight truncate pt-1">
                {currentUser?.location_city || activePod?.location || 'New York, NY'}
              </div>
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim mt-1.5 font-semibold flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-sage" /> Metro Region
              </div>
            </div>
          </div>

          {/* Inline Quick Invite Box (Expandable / Toggleable) */}
          {showInviteModal && (
            <div className="border border-amber/30 rounded-2xl p-5 bg-amber-soft/40 shadow-sm animate-fade">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber" />
                  <span className="font-serif font-bold text-base text-ink">Invite a Neighbor to Join this Pod</span>
                </div>
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="text-ink-dim hover:text-ink text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={handleSendInvite} className="flex gap-2.5 flex-wrap sm:flex-nowrap">
                <input
                  type="email"
                  placeholder="neighbor@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-white border border-border rounded-xl px-4 py-2.5 text-xs text-ink placeholder:text-ink-dim focus:outline-none focus:border-amber"
                  disabled={sendingInvite}
                />
                <button
                  type="submit"
                  disabled={sendingInvite || !inviteEmail.trim()}
                  className="bg-amber hover:bg-[#b05d3e] disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  {sendingInvite ? 'Sending...' : 'Send Invitation'}
                </button>
              </form>
            </div>
          )}

          {/* Members List Section */}
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-5 flex-wrap gap-2">
              <div>
                <h4 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
                  Pod Members <span className="text-xs font-mono font-normal text-ink-dim bg-panel px-2.5 py-0.5 rounded-full border border-border">{members.length} Confirmed</span>
                </h4>
                <p className="text-xs text-ink-dim mt-0.5">
                  Confirmed co-living neighbors currently part of this Pod group.
                </p>
              </div>

              {isUserAdmin && (
                <button
                  onClick={() => {
                    if (setActiveScreen) {
                      setActiveScreen('pod-invite');
                    } else {
                      setShowInviteModal(!showInviteModal);
                    }
                  }}
                  className="bg-amber hover:bg-[#b05d3e] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-white" /> Invite Member
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((m, idx) => {
                const isCurrent = m.userId === currentUser?.id || (!m.userId && m.email === currentUser?.email);
                const isMemAdmin = isExistingPodGroup && m.role === 'CREATOR';
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border/70 bg-panel/30 hover:bg-panel/60 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-200 text-ink font-bold flex items-center justify-center text-sm shrink-0 border border-border">
                        {m.name ? m.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex flex-col min-w-0 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-ink truncate">{m.name || 'Anonymous Member'}</span>
                          {isCurrent && (
                            <span className="bg-amber/15 text-amber text-[9.5px] font-bold px-1.5 py-0.2 rounded font-mono uppercase">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-ink-dim truncate">{m.email || 'Member'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono uppercase tracking-wider border ${
                        isMemAdmin
                          ? 'bg-amber-soft text-amber border-amber/20'
                          : 'bg-slate-100 text-ink-dim border-slate-200'
                      }`}>
                        {isMemAdmin ? 'Coordinator' : 'Co-Member'}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Invitations Section (If any exist or if Admin) */}
          {(pendingInvites.length > 0 || (isUserAdmin && podStatus === 'CREATING')) && (
            <div className="border border-border rounded-2xl p-6 bg-white shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-4 flex-wrap gap-2">
                <div>
                  <h4 className="font-serif font-bold text-base text-ink flex items-center gap-2">
                    Pending Invitations <span className="text-xs font-mono font-normal text-ink-dim bg-panel px-2.5 py-0.5 rounded-full border border-border">{pendingInvites.length} Pending</span>
                  </h4>
                  <p className="text-xs text-ink-dim mt-0.5">
                    Invited neighbors who have not yet accepted their invitation link.
                  </p>
                </div>
              </div>

              {pendingInvites.length === 0 ? (
                <div className="text-center py-6 bg-panel/20 rounded-xl border border-dashed border-border text-ink-dim text-xs">
                  No pending invitations. Click <strong>Invite Member</strong> above to add more people to your Pod.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingInvites.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3.5 rounded-xl border border-amber/20 bg-amber-soft/20 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-amber/15 text-amber flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-left min-w-0">
                          <span className="text-xs font-bold text-ink truncate">{inv.email}</span>
                          <span className="text-[10.5px] text-ink-dim">
                            Sent {new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · Expires in 7 days
                          </span>
                        </div>
                      </div>

                      {isUserAdmin && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleResend(inv.id)}
                            disabled={actionId === inv.id}
                            className="bg-white hover:bg-panel border border-border text-ink text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <RefreshCw className={`w-3 h-3 ${actionId === inv.id ? 'animate-spin' : ''}`} /> Resend
                          </button>
                          <button
                            onClick={() => handleCancel(inv.id)}
                            disabled={actionId === inv.id}
                            className="text-rust hover:bg-red-50 border border-transparent hover:border-red-200 text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pod Management Danger Zone */}
          <div className="border border-border/80 rounded-2xl p-5 bg-panel/30 flex items-center justify-between flex-wrap gap-4">
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-ink">
                {isUserAdmin ? 'Pod Lifecycle & Dissolution' : 'Leave Pod Group'}
              </span>
              <span className="text-[11.5px] text-ink-dim max-w-[480px]">
                {isUserAdmin
                  ? 'Dissolving this Pod will remove all member records, invitations, and restore members to the matching pool.'
                  : 'Leaving this Pod will remove your membership and restore your profile to the open matching pool.'}
              </span>
            </div>

            {isUserAdmin ? (
              <button
                onClick={() => {
                  showConfirm(
                    'Dissolve Pod Group',
                    'Are you sure you want to delete/dissolve this Pod? This will remove all members and invitations, returning everyone to the matching pool.',
                    deletePod,
                    'danger',
                    'Dissolve Pod'
                  );
                }}
                className="bg-transparent border border-rust/40 text-rust hover:bg-red-50 rounded-xl py-2 px-4 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Dissolve Pod
              </button>
            ) : (
              <button
                onClick={() => {
                  showConfirm(
                    'Leave Pod Group',
                    'Are you sure you want to leave this Pod? You will be returned to the open matching pool.',
                    leavePod,
                    'danger',
                    'Leave Pod'
                  );
                }}
                className="bg-transparent border border-rust/40 text-rust hover:bg-red-50 rounded-xl py-2 px-4 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Leave Pod
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="border border-border rounded-2xl p-10 bg-white shadow-sm flex flex-col text-center items-center justify-center animate-fade">
          <div className="w-16 h-16 rounded-2xl bg-amber-soft/50 text-amber flex items-center justify-center mb-4 border border-amber/20">
            <Users className="w-8 h-8" />
          </div>
          <h4 className="font-serif font-bold text-xl text-ink mb-2">You're not currently in a Pod</h4>
          <p className="text-ink-dim text-xs leading-relaxed mb-6 max-w-[420px]">
            {isExistingPod
              ? "You haven't formed or joined an existing pod group yet. Create your pod to invite friends and start drafting agreements."
              : "Ready to find your co-living match? Explore the transparent matching pool and connect with compatible neighbors."}
          </p>
          {isExistingPod ? (
            <button
              onClick={() => setActiveScreen('pod-create')}
              className="bg-amber hover:bg-[#b05d3e] text-white font-semibold text-xs px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:shadow-[#C46A4A]/25 transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Pod Group
            </button>
          ) : (
            <button
              onClick={() => setActiveScreen('matching-status')}
              className="bg-amber hover:bg-[#b05d3e] text-white font-semibold text-xs px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:shadow-[#C46A4A]/25 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Find a Pod via Matching Pool
            </button>
          )}
        </div>
      )}

      {/* Past Pods History Section */}
      {podHistory && podHistory.length > 0 && (
        <div className="mt-10 flex flex-col text-left">
          <div className="font-mono text-[11px] uppercase tracking-wider text-ink-dim mb-3 font-semibold">
            Past Pod Memberships
          </div>
          <div className="border border-border rounded-2xl p-5 bg-white shadow-sm space-y-3.5">
            {podHistory.map((hist, idx) => (
              <div key={idx} className="flex justify-between items-center gap-3 border-b border-border/70 last:border-b-0 pb-3 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-panel text-ink-dim flex items-center justify-center font-bold text-xs border border-border">
                    <Home className="w-4 h-4 text-ink-dim" />
                  </div>
                  <div className="flex flex-col">
                    <b className="text-xs font-bold text-ink leading-tight">Pod #{(hist.id || '').substring(0, 8)}</b>
                    <span className="text-[11px] text-ink-dim font-medium mt-0.5">Left {hist.when || 'recently'}</span>
                  </div>
                </div>
                <span className="bg-red-50 text-rust border border-rust/10 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider font-mono">
                  Left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
