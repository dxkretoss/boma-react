import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, ShieldAlert, CheckCircle2, AlertTriangle, ShieldCheck, Info, Calendar, ArrowUpDown, RefreshCw, ArrowLeft } from 'lucide-react';
import { fetchAdminUsers, fetchUserOnboardingAnswers, submitProfileReview } from '../../../api/admin';
import { getReadinessScoreBreakdown } from '../../../api/onboarding';
import Avatar from '../../Avatar';
import Pagination from '../../Pagination';

export default function AdminUsers({ setActiveScreen, adminUser, showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [breakdown, setBreakdown] = useState(null);

  // Filters state
  const [profileStatus, setProfileStatus] = useState('ALL');
  const [onboardingStatus, setOnboardingStatus] = useState('ALL');
  const [entryPath, setEntryPath] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminUsers({ profileStatus, onboardingStatus, entryPath, search });
      setUsers(data);
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await fetchAdminUsers({ profileStatus, onboardingStatus, entryPath, search });
      setUsers(data);
      if (showToast) showToast('User list refreshed.', 'success');
    } catch (err) {
      console.error('Failed to refresh admin users:', err);
      if (showToast) showToast('Failed to refresh users.', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadUsers();
  }, [profileStatus, onboardingStatus, entryPath, search]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (sortBy === 'NEWEST') {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (timeB !== timeA) return timeB - timeA;
        return (b.id || '').localeCompare(a.id || '');
      }
      if (sortBy === 'OLDEST') {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (timeA !== timeB) return timeA - timeB;
        return (a.id || '').localeCompare(b.id || '');
      }
      if (sortBy === 'SCORE_DESC') {
        return (b.readiness_score || 0) - (a.readiness_score || 0);
      }
      if (sortBy === 'SCORE_ASC') {
        return (a.readiness_score || 0) - (b.readiness_score || 0);
      }
      if (sortBy === 'NAME_ASC') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'NAME_DESC') {
        return (b.name || '').localeCompare(a.name || '');
      }
      return 0;
    });
  }, [users, sortBy]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setRejectionReason('');
    setShowRejectForm(false);
    setBreakdown(null);
    try {
      setLoadingAnswers(true);
      const answers = await fetchUserOnboardingAnswers(user.id);
      setSelectedAnswers(answers);
      if (user.onboarding_status === 'COMPLETED') {
        const breakdownData = await getReadinessScoreBreakdown(user.id);
        setBreakdown(breakdownData);
      }
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
      const updatedUser = await submitProfileReview({
        userId: selectedUser.id,
        adminId: adminUser?.id || selectedUser.id,
        action,
        reason: action === 'REJECT' ? rejectionReason : null
      });

      if (action === 'APPROVE') {
        setSelectedUser(updatedUser || { ...selectedUser, profile_status: 'APPROVED' });
        if (showToast) showToast('Profile approved successfully.', 'success');
      } else {
        setSelectedUser(null);
        if (showToast) showToast('Profile rejected.', 'info');
      }
      loadUsers();
    } catch (err) {
      console.error('Failed to submit profile review:', err);
      if (showToast) showToast(err.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'UNDER_REVIEW':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'REJECTED':
        return 'bg-red-50 text-rust border-red-200';
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

  const totalPages = Math.ceil(sortedUsers.length / pageSize) || 1;
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full text-left ">
      {/* Header with Refresh button */}
      <div className="flex flex-col gap-2.5 mb-6">
        <button
          onClick={() => setActiveScreen('admin-dashboard')}
          className="inline-flex items-center gap-1.5 text-ink-dim hover:text-amber text-xs font-bold transition-colors cursor-pointer w-fit p-0 border-0 bg-transparent"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Admin / User Moderation</div>
            <h3 className="font-display font-extrabold text-2xl text-ink mb-1">User Moderation &amp; Profiles</h3>
            <p className="text-ink-dim text-sm leading-relaxed max-w-[560px]">
              Review member onboarding submissions, check compatibility scoring, and moderate access to the matching pool.
            </p>
          </div>
        <button
          onClick={handleManualRefresh}
          disabled={loading || refreshing}
          className="self-start sm:self-auto inline-flex items-center gap-2 bg-white hover:bg-panel-alt border border-border text-ink hover:text-amber text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-amber/50 active:scale-95 shrink-0"
          title="Refresh user list"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>
    </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-5 items-center justify-between bg-panel-alt/30 border border-border p-4 rounded-xl">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-wider text-ink-dim mb-1 font-bold">Profile Status</span>
            <select
              value={profileStatus}
              onChange={(e) => {
                setProfileStatus(e.target.value);
                setCurrentPage(1);
              }}
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
            <span className="font-mono text-[9px] uppercase tracking-wider text-ink-dim mb-1 font-bold">Onboarding Steps</span>
            <select
              value={onboardingStatus}
              onChange={(e) => {
                setOnboardingStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-border rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none focus:border-amber"
            >
              <option value="ALL">All Steps Status</option>
              <option value="COMPLETED">Completed (9/9)</option>
              <option value="INCOMPLETE">Incomplete</option>
            </select>
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-wider text-ink-dim mb-1 font-bold">Entry Path</span>
            <select
              value={entryPath}
              onChange={(e) => {
                setEntryPath(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-border rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none focus:border-amber"
            >
              <option value="ALL">All Paths</option>
              <option value="MATCHING_POOL">Matching Pool (Path A)</option>
              <option value="EXISTING_POD">Existing Pod (Path B)</option>
            </select>
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-wider text-ink-dim mb-1 font-bold">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-border rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none focus:border-amber text-ink"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="SCORE_DESC">Readiness (Highest)</option>
              <option value="SCORE_ASC">Readiness (Lowest)</option>
              <option value="NAME_ASC">Name (A → Z)</option>
              <option value="NAME_DESC">Name (Z → A)</option>
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
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-border rounded-lg text-xs px-3.5 py-2 pl-9 focus:outline-none focus:border-amber font-medium"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-border rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[980px] text-sm text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-border text-ink font-semibold text-xs uppercase tracking-wider">
                <th className="p-4 px-6 whitespace-nowrap">User Details</th>
                <th className="p-4 px-6 whitespace-nowrap">Entry Path</th>
                <th className="p-4 px-6 whitespace-nowrap">Readiness</th>
                <th className="p-4 px-6 whitespace-nowrap">Onboarding Steps</th>
                <th className="p-4 px-6 whitespace-nowrap">Profile Status</th>
                <th className="p-4 px-6 whitespace-nowrap">Joined Date</th>
                <th className="p-4 px-6 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                [...Array(6)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8.5 h-8.5 rounded-full bg-border/70 shrink-0" />
                        <div className="flex flex-col gap-1.5">
                          <div className="h-3.5 w-28 bg-border/70 rounded" />
                          <div className="h-2.5 w-36 bg-border/40 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <div className="h-5 w-24 bg-border/50 rounded-full" />
                    </td>
                    <td className="p-4 px-6">
                      <div className="h-4 w-12 bg-border/50 rounded" />
                    </td>
                    <td className="p-4 px-6">
                      <div className="h-5 w-20 bg-border/50 rounded" />
                    </td>
                    <td className="p-4 px-6">
                      <div className="h-5 w-20 bg-border/50 rounded" />
                    </td>
                    <td className="p-4 px-6">
                      <div className="h-4 w-20 bg-border/40 rounded" />
                    </td>
                    <td className="p-4 px-6 text-right">
                      <div className="h-7 w-20 bg-border/40 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-ink-dim font-medium whitespace-nowrap">
                    No users match current search criteria.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-panel-alt/30 transition-colors">
                    <td className="p-4 px-6 font-semibold text-ink flex items-center gap-3 whitespace-nowrap">
                      <Avatar user={user} className="w-8.5 h-8.5" />
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-ink leading-tight">{user.name || 'Anonymous'}</span>
                        <span className="text-[11px] text-ink-dim font-medium mt-0.5">{user.email}</span>
                        {user.podName && (
                          <span className="text-[10px] text-teal font-semibold font-mono mt-0.5">
                            Pod: {user.podName} ({user.podRole === 'CREATOR' ? 'admin' : 'member'})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${
                        user.entry_path === 'MATCHING_POOL'
                          ? 'bg-amber-soft text-amber border border-amber/25'
                          : user.entry_path === 'EXISTING_POD'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-panel-alt text-ink-dim border border-border'
                        }`}>
                        {user.entry_path === 'MATCHING_POOL'
                          ? 'Matching Pool'
                          : user.entry_path === 'EXISTING_POD'
                          ? 'Existing Pod'
                          : 'Not Decided'}
                      </span>
                    </td>
                    <td className="p-4 px-6 whitespace-nowrap">
                      {user.entry_path === 'EXISTING_POD' ? (
                        <span className="text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase bg-slate-100 text-ink-dim border-slate-200">
                          BYPASS
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-ink text-sm">
                          {user.onboarding_status === 'COMPLETED' ? `${user.readiness_score}/100` : '—'}
                        </span>
                      )}
                    </td>
                    <td className="p-4 px-6 whitespace-nowrap">
                      <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded border uppercase ${
                        user.entry_path === 'EXISTING_POD'
                          ? 'bg-slate-100 text-ink-dim border-slate-200 font-mono'
                          : user.onboarding_status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {user.entry_path === 'EXISTING_POD'
                          ? 'BYPASS'
                          : (user.onboarding_status === 'COMPLETED' ? 'COMPLETED' : 'INCOMPLETE')}
                      </span>
                    </td>
                    <td className="p-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded border uppercase ${getStatusBadge(user.entry_path === 'EXISTING_POD' ? 'APPROVED' : user.profile_status)}`}>
                          {user.entry_path === 'EXISTING_POD'
                            ? 'APPROVED'
                            : (user.profile_status ? user.profile_status.replace('_', ' ') : 'INCOMPLETE')}
                        </span>
                        {user.profile_status === 'REJECTED' && (
                          <div className="relative group/tooltip inline-flex items-center">
                            <Info className="w-4 h-4 text-rust hover:text-red-700 cursor-pointer transition-colors" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tooltip:flex flex-col w-60 bg-slate-900 text-white text-[11.5px] p-2.5 rounded-lg shadow-xl z-50 pointer-events-none animate-fade leading-snug font-medium text-left">
                              <span className="font-mono text-[9px] uppercase tracking-wider text-amber font-bold mb-1">Rejection Reason</span>
                              <p className="text-slate-200 whitespace-normal">{user.rejection_reason || 'No specific rejection reason provided.'}</p>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 px-6 text-xs font-mono text-ink-dim whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{formatDate(user.created_at)}</span>
                      </div>
                    </td>
                    <td className="p-4 px-6 text-right whitespace-nowrap">
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
        {!loading && (
          <div className="px-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={sortedUsers.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </div>

      <button
        onClick={() => setActiveScreen('admin-dashboard')}
        className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-6"
      >
        Back to dashboard
      </button>

      {/* Slide-in Detail Drawer / Modal for Profile Review */}
      {selectedUser && createPortal(
        <div
          onClick={() => setSelectedUser(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/60 backdrop-blur-sm animate-fade"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-custom-lg border border-border w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-left"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-soft text-amber flex items-center justify-center font-bold text-sm">
                  {selectedUser.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-ink flex items-center gap-2">
                    {selectedUser.name || 'Unnamed Member'}
                    <span className="text-[11px] font-mono font-medium text-ink-dim bg-panel-alt px-2 py-0.5 rounded">
                      ID: {selectedUser.id?.slice(0, 8)}...
                    </span>
                  </h3>
                  <p className="text-xs text-ink-dim font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-ink-dim hover:text-ink hover:bg-panel-alt transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with 2-Column Split */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Left Column: Questionnaire Answers */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 border-r border-border">
                <h4 className="font-display font-extrabold text-sm uppercase tracking-wider text-ink border-b border-border/60 pb-1.5 mb-2 flex items-center justify-between gap-1.5">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4.5 h-4.5 text-teal" />
                    {selectedUser.entry_path === 'EXISTING_POD' ? 'Onboarding & Group Status' : 'Onboarding Questionnaire Answers'}
                  </span>
                  {selectedUser.entry_path === 'EXISTING_POD' && (
                    <span className="text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-md font-bold">
                      Existing Pod (Path B)
                    </span>
                  )}
                </h4>

                {loadingAnswers ? (
                  <div className="py-12 text-center text-ink-dim text-xs font-semibold animate-pulse">
                    Loading member answers...
                  </div>
                ) : selectedUser.entry_path === 'EXISTING_POD' ? (
                  <div className="space-y-4">
                    {/* Existing Pod Info Banner */}
                    <div className="bg-gradient-to-br from-teal-soft/40 to-panel border border-teal/20 rounded-xl p-5 text-left space-y-2">
                      <div className="flex items-center gap-2.5 text-teal font-bold text-sm">
                        <ShieldCheck className="w-5 h-5 text-teal shrink-0" />
                        <span>Pre-Formed Group Registration (Matching Bypassed)</span>
                      </div>
                      <p className="text-ink-dim text-xs leading-relaxed">
                        This member registered via <strong>Path B (Existing Pod / Join as existing pool)</strong>. Algorithmic matching questions are bypassed because this member belongs to a self-formed community Pod. Group verification and member roster are managed in the Existing Pod Queue.
                      </p>
                      {selectedUser.podName && (
                        <div className="pt-2 border-t border-teal/15 flex items-center gap-2">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-teal font-bold">Registered Pod:</span>
                          <span className="text-xs font-bold text-ink">
                            {selectedUser.podName} ({selectedUser.podRole === 'CREATOR' ? 'admin' : 'member'})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Short Onboarding Answers if present */}
                    {selectedAnswers.length > 0 ? (
                      <div className="space-y-3">
                        <h5 className="font-display font-extrabold text-xs uppercase tracking-wider text-ink-dim border-b border-border/60 pb-1 mt-2">
                          Short Onboarding Responses ({selectedAnswers.length})
                        </h5>
                        {selectedAnswers.map((resp, idx) => (
                          <div key={resp.id} className="border border-border/80 rounded-xl p-4 bg-[#F8FAFC]/55">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-mono text-[9.5px] uppercase tracking-wider text-teal font-bold">
                                {resp.question?.title || resp.question_key}
                              </span>
                              <span className="text-[9px] font-mono text-ink-dim">{resp.question_key}</span>
                            </div>
                            <div className="text-xs font-semibold text-ink mt-1.5">
                              {formatAnswer(resp)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-panel/40 border border-border/60 rounded-xl p-4 text-xs text-ink-dim text-left">
                        <span className="font-bold text-ink block mb-1">Short Questionnaire Status:</span>
                        Member has not submitted the optional short questionnaire yet. Group membership is confirmed directly during Pod review.
                      </div>
                    )}
                  </div>
                ) : selectedUser.onboarding_status !== 'COMPLETED' ? (
                  <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-5 text-left">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Onboarding Questionnaire Incomplete</span>
                    </div>
                    <p className="text-amber-800 text-[12.5px] leading-relaxed font-medium">
                      This user has not submitted all 9 onboarding questions yet. Questionnaire answers and score metrics will be available once the user completes their onboarding survey.
                    </p>
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

              {/* Right Column: User Info Card (Wide, balanced) */}
              <div className="w-full md:w-[320px] lg:w-[350px] shrink-0 bg-slate-50/70 p-5 flex flex-col gap-4 overflow-y-auto">
                {/* User Badge */}
                <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-border shrink-0 shadow-xs">
                  <Avatar user={selectedUser} className="w-11 h-11 shrink-0" textClass="text-[16px]" />
                  <div className="flex flex-col overflow-hidden text-left min-w-0">
                    <span className="font-bold text-ink leading-tight text-sm truncate">{selectedUser.name || 'Anonymous'}</span>
                    <span className="text-[11px] text-ink-dim font-medium truncate mt-0.5">{selectedUser.email}</span>
                    {selectedUser.entry_path === 'EXISTING_POD' && (
                      <span className={`text-[10px] font-bold font-mono mt-1 px-2 py-0.5 rounded w-fit ${
                        selectedUser.podRole === 'CREATOR' 
                          ? 'bg-teal-soft text-teal border border-teal/20' 
                          : 'bg-amber-soft/80 text-[#9C5A3E] border border-amber/25'
                      }`}>
                        {selectedUser.podRole === 'CREATOR' ? 'Admin of Pod' : 'Co-Member of Pod'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Readiness Score Widget */}
                <div className="bg-white p-4 rounded-xl border border-border text-center flex flex-col items-center shrink-0 shadow-xs">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-ink-dim font-bold mb-2">
                    {selectedUser.entry_path === 'EXISTING_POD' ? 'Readiness Scoring' : 'Calculated Readiness'}
                  </span>
                  {selectedUser.entry_path === 'EXISTING_POD' ? (
                    <div className="py-2 flex flex-col items-center justify-center">
                      <span className="text-[11.5px] font-mono font-bold uppercase tracking-wider bg-teal-soft text-teal border border-teal/20 px-3 py-1.5 rounded-lg">
                        BYPASS (POD)
                      </span>
                      <span className="text-[11px] text-ink-dim mt-2 font-medium">Pre-formed group</span>
                    </div>
                  ) : (
                    <>
                      <AdminReadinessCircle
                        score={selectedUser.readiness_score}
                        completed={selectedUser.onboarding_status === 'COMPLETED'}
                      />
                      <span className="text-[10.5px] font-bold text-ink">Score Metrics Synced</span>
                      <button
                        onClick={() => {
                          setSelectedUser(null);
                          setActiveScreen('admin-readiness-logic');
                        }}
                        className="mt-2 text-[11px] font-bold text-amber hover:underline cursor-pointer flex items-center gap-1"
                      >
                        View Score Logic Rules &rarr;
                      </button>
                    </>
                  )}
                </div>

                {/* Score breakdown reference for admin */}
                {selectedUser.entry_path === 'EXISTING_POD' ? (
                  <div className="bg-white p-4 rounded-xl border border-border text-left shrink-0 space-y-2.5 shadow-xs">
                    <span className="font-mono text-[9.5px] uppercase tracking-wider text-ink-dim font-bold block border-b border-border/60 pb-1.5 mb-1 text-center">
                      Pod Alignment &amp; Timeline
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-ink-dim font-medium">Commitment Score:</span>
                        <span className="font-mono text-teal font-bold">{selectedUser.readiness_score || 90} pts</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ink-dim font-medium">Timeline Target:</span>
                        <span className="text-ink font-bold capitalize">
                          {selectedUser.commitment_timeline 
                            ? selectedUser.commitment_timeline.replace('timeline_', '').replace('yr', ' Years').replace('flex', 'Flexible')
                            : '5+ Years'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ink-dim font-medium">Matching Quiz:</span>
                        <span className="text-amber font-bold font-mono text-[10.5px]">Bypassed (Path B)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  breakdown && breakdown.appliedSteps && breakdown.appliedSteps.length > 0 && (
                    <div className="bg-white p-4 rounded-xl border border-border text-left shrink-0 space-y-2 shadow-xs">
                      <span className="font-mono text-[9.5px] uppercase tracking-wider text-ink-dim font-bold block border-b border-border/60 pb-1.5 mb-1 text-center">Step Points Breakdown</span>
                      <div className="space-y-2 text-xs">
                        {[3, 5, 7].map(stepNum => {
                          const steps = breakdown.appliedSteps.filter(s => s.stepNumber === stepNum);
                          const stepLabel = stepNum === 3 ? "Step 3 (Community)" : stepNum === 5 ? "Step 5 (Budget)" : "Step 7 (Commitment)";
                          const points = steps.length > 0 ? Math.round(steps.reduce((sum, s) => sum + s.points, 0) / steps.length) : 0;
                          return (
                            <div key={stepNum} className="flex justify-between items-center font-bold">
                              <span className="text-ink-dim font-medium">{stepLabel}:</span>
                              <span className="font-mono text-teal">{points} pts</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}

                {/* Info Details */}
                <div className="text-xs space-y-2.5 text-ink text-left bg-white p-4 rounded-xl border border-border shrink-0 shadow-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-ink-dim font-medium">Onboarding:</span>
                    <span className="font-bold text-ink capitalize">
                      {selectedUser.entry_path === 'EXISTING_POD'
                        ? 'Bypassed'
                        : selectedUser.onboarding_status === 'COMPLETED' ? 'Completed (9/9)' : 'Incomplete'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-dim font-medium">Review Status:</span>
                    <span className="font-bold text-ink capitalize">
                      {selectedUser.profile_status ? selectedUser.profile_status.replace('_', ' ').toLowerCase() : 'incomplete'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-dim font-medium">Entry Path:</span>
                    <span className="font-bold text-ink text-right">
                      {selectedUser.entry_path === 'EXISTING_POD'
                        ? 'Existing Pod'
                        : selectedUser.entry_path === 'MATCHING_POOL'
                        ? 'Matching Pool'
                        : 'Not Decided'}
                    </span>
                  </div>
                  {selectedUser.entry_path === 'EXISTING_POD' && (
                    <div className="flex justify-between items-center">
                      <span className="text-ink-dim font-medium">Pod Role:</span>
                      <span className="font-bold text-teal text-right font-mono text-[11px]">
                        {selectedUser.podRole === 'CREATOR' ? 'Admin (Coordinator)' : selectedUser.podRole === 'MEMBER' ? 'Co-Member' : 'Member'}
                      </span>
                    </div>
                  )}
                  {selectedUser.podName && (
                    <div className="flex justify-between items-center">
                      <span className="text-ink-dim font-medium">Pod Name:</span>
                      <span className="font-bold text-teal font-mono truncate max-w-[170px] text-right">
                        {selectedUser.podName}
                      </span>
                    </div>
                  )}
                  {selectedUser.created_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-ink-dim font-medium">Join Date:</span>
                      <span className="font-bold text-ink">
                        {new Date(selectedUser.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Rejection Reason Notice Box */}
                {selectedUser.profile_status === 'REJECTED' && (
                  <div className="bg-red-50/90 border border-red-200 rounded-xl p-3 text-left shrink-0">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-rust font-bold block mb-1">Rejection Reason / Feedback</span>
                    <p className="text-[11.5px] text-rust font-medium leading-relaxed">{selectedUser.rejection_reason || 'No specific feedback provided.'}</p>
                  </div>
                )}
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

              {selectedUser.entry_path === 'EXISTING_POD' ? (
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  <div className="inline-flex items-center gap-2 bg-teal-soft text-teal border border-teal/20 px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-teal" /> Pre-Formed Pod (Reviewed in Existing Pod Queue)
                  </div>
                </div>
              ) : selectedUser.onboarding_status !== 'COMPLETED' ? (
                <div className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Onboarding Incomplete — Action Buttons Disabled</span>
                </div>
              ) : selectedUser.profile_status === 'APPROVED' ? (
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Approved
                  </div>
                </div>
              ) : !showRejectForm ? (
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => handleReviewAction('APPROVE')}
                    className="bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl py-2 px-4.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    disabled={submittingReview}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Profile
                  </button>

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
