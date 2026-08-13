import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, ShieldAlert, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { fetchAdminUsers, fetchUserOnboardingAnswers, submitProfileReview } from '../../../api/admin';

export default function AdminUsers({ setActiveScreen, adminUser, showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Filters state
  const [profileStatus, setProfileStatus] = useState('ALL');
  const [entryPath, setEntryPath] = useState('ALL');
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminUsers({ profileStatus, entryPath, search });
      setUsers(data);
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [profileStatus, entryPath, search]);

  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setRejectionReason('');
    setShowRejectForm(false);
    try {
      setLoadingAnswers(true);
      const answers = await fetchUserOnboardingAnswers(user.id);
      setSelectedAnswers(answers);
    } catch (err) {
      console.error('Error fetching onboarding responses:', err);
    } finally {
      setLoadingAnswers(false);
    }
  };

  const handleReviewAction = async (action) => {
    if (!selectedUser) return;
    if (action === 'REJECT' && !rejectionReason.trim()) {
      showToast('Please provide a rejection reason/feedback for the user.');
      return;
    }

    try {
      setSubmittingReview(true);
      await submitProfileReview({
        userId: selectedUser.id,
        adminId: adminUser?.id || selectedUser.id,
        action,
        reason: action === 'REJECT' ? rejectionReason : null
      });

      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      console.error('Failed to submit profile review:', err);
      showToast(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-teal border-emerald-100';
      case 'UNDER_REVIEW':
        return 'bg-amber-soft/50 text-[#8A5300] border-amber/10';
      case 'REJECTED':
        return 'bg-red-50 text-rust border-red-100';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const formatAnswer = (resp) => {
    if (!resp.answer_json) return '—';
    if (resp.answer_json.values) {
      return (
        <div className="flex flex-wrap gap-1 mt-1">
          {resp.answer_json.values.map((v, idx) => (
            <span key={idx} className="bg-slate-100 border border-slate-200 text-ink text-[11px] font-bold px-2 py-0.5 rounded">
              {v}
            </span>
          ))}
        </div>
      );
    }
    return <span className="text-ink font-semibold">{resp.answer_json.value}</span>;
  };

  return (
    <div className="w-full text-left ">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Admin / User Moderation</div>
      <h3 className="font-display font-extrabold text-2xl text-ink mb-2">User Moderation &amp; Profiles</h3>
      <p className="text-ink-dim text-sm leading-relaxed mb-6 max-w-[560px]">
        Review member onboarding submissions, check compatibility scoring, and moderate access to the matching pool.
      </p>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-5 items-center justify-between bg-panel-alt/30 border border-border p-4 rounded-xl">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-wider text-ink-dim mb-1 font-bold">Profile Status</span>
            <select
              value={profileStatus}
              onChange={(e) => setProfileStatus(e.target.value)}
              className="bg-white border border-border rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none focus:border-amber"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="INCOMPLETE">Incomplete</option>
            </select>
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-wider text-ink-dim mb-1 font-bold">Entry Path</span>
            <select
              value={entryPath}
              onChange={(e) => setEntryPath(e.target.value)}
              className="bg-white border border-border rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none focus:border-amber"
            >
              <option value="ALL">All Paths</option>
              <option value="MATCHING_POOL">Matching Pool (Path A)</option>
              <option value="EXISTING_POD">Existing Pod (Path B)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col w-full sm:w-64">
          <span className="font-mono text-[9px] uppercase tracking-wider text-ink-dim mb-1 font-bold">Search</span>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-border rounded-lg text-xs px-3.5 py-2 pl-9 focus:outline-none focus:border-amber font-medium"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-border rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-border text-ink font-semibold  text-xs uppercase tracking-wider">
                <th className="p-4 px-6">User Details</th>
                <th className="p-4 px-6">Entry Path</th>
                <th className="p-4 px-6">Readiness</th>
                <th className="p-4 px-6">Profile Status</th>
                <th className="p-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-ink-dim font-medium">
                    <span className="inline-block animate-pulse">Loading database users...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-ink-dim font-medium">
                    No users match current search criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-panel-alt/30 transition-colors">
                    <td className="p-4 px-6 font-semibold text-ink flex items-center gap-3">
                      {user.avatar_url && (user.avatar_url.startsWith('http') || user.avatar_url.startsWith('/') || user.avatar_url.startsWith('assets/')) ? (
                        <img
                          src={user.avatar_url}
                          className="w-8.5 h-8.5 rounded-full border border-border object-cover"
                          alt=""
                        />
                      ) : (
                        <div className="w-8.5 h-8.5 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[12px] font-display flex-shrink-0">
                          {(user.name || user.email || 'U').substring(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-ink leading-tight">{user.name || 'Anonymous'}</span>
                        <span className="text-[11px] text-ink-dim font-medium mt-0.5">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${user.entry_path === 'MATCHING_POOL' ? 'bg-sky-50 text-sky-700' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                        {user.entry_path === 'MATCHING_POOL' ? 'Matching Pool' : user.entry_path === 'EXISTING_POD' ? 'Existing Pod' : 'Not Decided'}
                      </span>
                    </td>
                    <td className="p-4 px-6 font-mono font-bold text-ink text-sm">
                      {user.onboarding_status === 'COMPLETED' ? `${user.readiness_score}/100` : '—'}
                    </td>
                    <td className="p-4 px-6">
                      <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded border uppercase ${getStatusBadge(user.profile_status)}`}>
                        {user.profile_status ? user.profile_status.replace('_', ' ') : 'INCOMPLETE'}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-right">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="bg-teal text-white rounded-lg py-1 px-3 text-xs font-bold hover:bg-teal-700 hover:-translate-y-[0.5px] transition-all cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={() => setActiveScreen('admin-dashboard')}
        className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-6"
      >
        Back to dashboard
      </button>

      {/* Review Modal */}
      {selectedUser && createPortal(
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade">
          <div className="bg-white border border-border rounded-2xl w-full max-w-[840px] h-[85vh] max-h-[640px] shadow-2xl flex flex-col relative overflow-hidden text-left animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 p-6 shrink-0">
              <div>
                <h3 className="font-display font-extrabold text-lg text-ink">User Profile Submission Review</h3>
                <span className="text-xs text-ink-dim font-medium">Evaluate onboarding criteria and approve matching eligibility</span>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-ink-dim hover:text-ink cursor-pointer p-1 rounded-lg hover:bg-panel-alt transition-colors"
                disabled={submittingReview}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Columns */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Left Column: Onboarding Answers (Scrolls) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 border-r border-border">
                <h4 className="font-display font-extrabold text-sm uppercase tracking-wider text-ink border-b border-border/60 pb-1.5 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4.5 h-4.5 text-teal" /> Onboarding Questionnaire Answers
                </h4>

                {loadingAnswers ? (
                  <div className="py-12 text-center text-ink-dim text-xs font-semibold animate-pulse">
                    Loading answers from Supabase...
                  </div>
                ) : selectedAnswers.length === 0 ? (
                  <div className="py-12 text-center text-ink-dim text-xs font-semibold">
                    No onboarding answers found for this user.
                  </div>
                ) : (
                  selectedAnswers.map((resp, idx) => (
                    <div key={resp.id} className="border border-border/80 rounded-xl p-4 bg-[#F8FAFC]/55">
                      <div className="flex justify-between items-start mb-1 ">
                        <span className="font-mono text-[9.5px] uppercase tracking-wider text-amber font-bold">
                          Question {resp.question?.step_number || idx + 1}
                        </span>
                        <span className="text-[9px] font-mono text-ink-dim">{resp.question_key}</span>
                      </div>
                      <h5 className="text-[13px] font-bold text-ink leading-tight mb-2.5">
                        {resp.question?.title || resp.question_key}
                      </h5>
                      <div className="text-xs">
                        {formatAnswer(resp)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Right Column: User Info Card (Scrolls if needed) */}
              <div className="w-full md:w-64 bg-slate-50/70 p-6 flex flex-col gap-5 overflow-y-auto">
                {/* User Badge */}
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-border shrink-0">
                  {selectedUser.avatar_url && (selectedUser.avatar_url.startsWith('http') || selectedUser.avatar_url.startsWith('/') || selectedUser.avatar_url.startsWith('assets/')) ? (
                    <img src={selectedUser.avatar_url} className="w-10 h-10 rounded-full object-cover border border-border" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[15px] font-display">
                      {(selectedUser.name || selectedUser.email || 'U').substring(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col overflow-hidden text-left">
                    <span className="font-bold text-ink leading-tight text-[13.5px] truncate">{selectedUser.name || 'Anonymous'}</span>
                    <span className="text-[11px] text-ink-dim font-medium truncate mt-0.5">{selectedUser.email}</span>
                  </div>
                </div>

                {/* Readiness Score Widget */}
                <div className="bg-white p-4 rounded-xl border border-border text-center flex flex-col items-center shrink-0">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-ink-dim font-bold mb-2">Calculated Readiness</span>
                  <AdminReadinessCircle
                    score={selectedUser.readiness_score}
                    completed={selectedUser.onboarding_status === 'COMPLETED'}
                  />
                  <span className="text-[10.5px] font-bold text-ink">Score Metrics Synced</span>
                </div>

                {/* Info Details */}
                <div className="text-[11.5px] space-y-2 text-ink text-left bg-white p-3.5 rounded-xl border border-border shrink-0">
                  <div>
                    <span className="text-ink-dim font-medium">Profile Status:</span>
                    <span className="font-bold ml-1.5 text-xs text-ink capitalize">
                      {selectedUser.profile_status ? selectedUser.profile_status.toLowerCase() : 'incomplete'}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-dim font-medium">Entry Path:</span>
                    <span className="font-bold ml-1.5 text-xs text-ink capitalize">
                      {selectedUser.entry_path ? selectedUser.entry_path.replace('_', ' ').toLowerCase() : 'incomplete'}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-dim font-medium">Join Date:</span>
                    <span className="font-bold ml-1.5 text-ink">
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer: Sticky at bottom, contains all action controls */}
            <div className="border-t border-border p-4 px-6 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-transparent border border-border text-ink hover:bg-slate-100 px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer w-full md:w-auto text-center"
                disabled={submittingReview}
              >
                Close Review
              </button>

              {!showRejectForm ? (
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => handleReviewAction('APPROVE')}
                    className="bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl py-2 px-4.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    disabled={submittingReview}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Profile
                  </button>

                  {/* <button
                    onClick={() => handleReviewAction('FLAG')}
                    className="bg-amber hover:bg-[#2450C4] text-white rounded-xl py-2 px-4.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    disabled={submittingReview}
                  >
                    <ShieldAlert className="w-4 h-4" /> Flag Profile
                  </button> */}

                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="bg-transparent border border-rust text-rust hover:bg-red-50 rounded-xl py-2 px-4.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    disabled={submittingReview}
                  >
                    <AlertTriangle className="w-4 h-4" /> Reject Profile
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col md:flex-row items-end md:items-center gap-3 w-full">
                  <div className="flex-1 w-full">
                    <textarea
                      placeholder="Explain what needs to be updated (rejection feedback)..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full bg-white border border-red-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-rust"
                      rows={1.5}
                    />
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setShowRejectForm(false)}
                      className="bg-transparent border border-border text-ink rounded-lg py-2 px-3.5 text-xs font-bold hover:bg-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReviewAction('REJECT')}
                      className="bg-rust hover:bg-red-700 text-white rounded-lg py-2 px-4 text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Submit Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function AdminReadinessCircle({ score, completed }) {
  const [offset, setOffset] = useState(213.63);

  useEffect(() => {
    setOffset(213.63);
    if (!completed) return;

    const timer = setTimeout(() => {
      const targetOffset = 213.63 * (1 - score / 100);
      setOffset(targetOffset);
    }, 150);
    return () => clearTimeout(timer);
  }, [score, completed]);

  return (
    <div className="relative w-20 h-20 flex items-center justify-center mb-2 animate-fade">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="40"
          cy="40"
          r="34"
          className="stroke-amber-soft"
          strokeWidth="6"
          fill="transparent"
        />
        {completed && (
          <circle
            cx="40"
            cy="40"
            r="34"
            className="stroke-amber"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray="213.63"
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        )}
      </svg>
      <div className="absolute flex items-center justify-center">
        <span className="font-display text-xl font-extrabold text-ink leading-none">
          {completed ? score : '--'}
        </span>
      </div>
    </div>
  );
}
