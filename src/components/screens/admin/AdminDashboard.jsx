import React, { useState, useEffect } from 'react';
import { Users, Sparkles, FileText, Activity, HelpCircle, ArrowRight, ShieldAlert, CheckCircle2, Info, SlidersHorizontal } from 'lucide-react';
import { fetchAdminDashboardStats } from '../../../api/admin';

export default function AdminDashboard({ adminUser, setActiveScreen, handleViewAdminPod }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    underReview: 0,
    approved: 0,
    matchingPool: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await fetchAdminDashboardStats();
        setStats({
          totalUsers: data.totalUsers || 0,
          underReview: data.pendingReviewsCount || 0,
          approved: data.totalUsers || 0,
          matchingPool: data.activePods || 0
        });
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const adminName = adminUser?.name || adminUser?.email?.split('@')[0] || 'Admin';

  return (
    <div className="w-full text-left space-y-8 ">
      {/* Welcome Banner */}
      <div
        className="rounded-3xl p-7 border border-[#F5F1EA]/10 flex items-center justify-between gap-6 shadow-custom-lg relative overflow-hidden flex-wrap md:flex-nowrap"
        style={{ background: 'linear-gradient(135deg, #2E2330 0%, #201823 45%, #382430 100%)' }}
      >
        <div className="flex items-center gap-5 relative z-10">
          <div className="flex flex-col text-left">
            <h3 className="font-serif font-bold text-[26px] text-white leading-tight">Welcome back, {adminName}</h3>
            <span className="text-[12px] text-[#D7A27A] font-mono mt-1">BOMA Administrator Portal · Systems Active</span>
          </div>
        </div>
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[#C46A4A]/20 blur-3xl pointer-events-none" />
      </div>

      {/* Analytics/KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="border border-border rounded-2xl p-5 bg-white shadow-sm flex items-center justify-between border-l-4 border-l-amber hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-ink-dim font-bold font-mono">Total Users</span>
            {loading ? (
              <div className="h-8 w-14 bg-panel-alt/80 rounded-md animate-pulse my-0.5" />
            ) : (
              <span className="font-serif text-3xl font-bold text-ink leading-none">
                {stats.totalUsers}
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-soft/50 flex items-center justify-center text-amber">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Under Review */}
        <div className="border border-border rounded-2xl p-5 bg-white shadow-sm flex items-center justify-between border-l-4 border-l-amber hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-ink-dim font-bold font-mono">Under Review</span>
              {!loading && stats.underReview > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-ping" />
              )}
            </div>
            {loading ? (
              <div className="h-8 w-14 bg-panel-alt/80 rounded-md animate-pulse my-0.5" />
            ) : (
              <span className="font-serif text-3xl font-bold text-amber leading-none">
                {stats.underReview}
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-soft/50 flex items-center justify-center text-amber">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Approved Users */}
        <div className="border border-border rounded-2xl p-5 bg-white shadow-sm flex items-center justify-between border-l-4 border-l-sage hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-ink-dim font-bold font-mono">Approved Users</span>
            {loading ? (
              <div className="h-8 w-14 bg-panel-alt/80 rounded-md animate-pulse my-0.5" />
            ) : (
              <span className="font-serif text-3xl font-bold text-sage leading-none">
                {stats.approved}
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center text-sage">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Matching Pool */}
        <div className="border border-border rounded-2xl p-5 bg-white shadow-sm flex items-center justify-between border-l-4 border-l-teal hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-ink-dim font-bold font-mono">Matching Pool</span>
            {loading ? (
              <div className="h-8 w-14 bg-panel-alt/80 rounded-md animate-pulse my-0.5" />
            ) : (
              <span className="font-serif text-3xl font-bold text-teal leading-none">
                {stats.matchingPool}
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-soft flex items-center justify-center text-teal">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Panel Modules */}
      <div>
        <h4 className="font-mono text-xs uppercase tracking-[0.15em] text-ink-dim border-b border-border pb-2.5 mb-5 font-semibold">
          System Control Modules
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Moderation */}
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between hover:border-amber hover:shadow-md transition-all duration-200 group">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-soft/50 text-amber flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-lg text-ink">User Profile Moderation</h4>
              </div>
              <p className="text-ink-dim text-[13.5px] leading-relaxed mb-4 font-light">
                Evaluate detailed onboarding responses, review compatibility scores, flag incomplete/problematic profiles, and approve pool entry.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('admin-users')}
              className="bg-amber hover:bg-[#b05d3e] text-white rounded-full py-2.5 px-5 text-xs font-semibold w-fit transition-all duration-150 hover:-translate-y-[0.5px] cursor-pointer mt-2 shadow-sm hover:shadow-md hover:shadow-[#C46A4A]/25 flex items-center gap-1.5"
            >
              Open Moderation <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Matching Engine */}
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between hover:border-amber hover:shadow-md transition-all duration-200 group">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-soft text-teal flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-lg text-ink">Matching Engine Variables</h4>
              </div>
              <p className="text-ink-dim text-[13.5px] leading-relaxed mb-4 font-light">
                Configure weight percentages (Lifestyle, Location, Financials, Timelines) for the dynamic matching engine. Must sum to exactly 100%.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('admin-matching')}
              className="bg-amber hover:bg-[#b05d3e] text-white rounded-full py-2.5 px-5 text-xs font-semibold w-fit transition-all duration-150 hover:-translate-y-[0.5px] cursor-pointer mt-2 shadow-sm hover:shadow-md hover:shadow-[#C46A4A]/25 flex items-center gap-1.5"
            >
              Configure Weights <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Question Flow Builder */}
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between hover:border-amber hover:shadow-md transition-all duration-200 group">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-soft/50 text-amber flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-lg text-ink">Onboarding Question Editor</h4>
              </div>
              <p className="text-ink-dim text-[13.5px] leading-relaxed mb-4 font-light">
                Add, remove, or modify live user onboarding questions, options, point allocations, and answer choices.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('admin-questions')}
              className="bg-amber hover:bg-[#b05d3e] text-white rounded-full py-2.5 px-5 text-xs font-semibold w-fit transition-all duration-150 hover:-translate-y-[0.5px] cursor-pointer mt-2 shadow-sm hover:shadow-md hover:shadow-[#C46A4A]/25 flex items-center gap-1.5"
            >
              Manage Questions <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Pod Commons Management */}
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between hover:border-amber hover:shadow-md transition-all duration-200 group">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-panel-alt text-ink flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-lg text-ink">Pod Commons Monitor</h4>
              </div>
              <p className="text-ink-dim text-[13.5px] leading-relaxed mb-4 font-light">
                Monitor membership size, alignment metrics, chat active statuses, and agreement scaffolding documents for all active matched Pods.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('admin-pod-management')}
              className="bg-amber hover:bg-[#b05d3e] text-white rounded-full py-2.5 px-5 text-xs font-semibold w-fit transition-all duration-150 hover:-translate-y-[0.5px] cursor-pointer mt-2 shadow-sm hover:shadow-md hover:shadow-[#C46A4A]/25 flex items-center gap-1.5"
            >
              View Active Pods <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* About BOMA Management */}
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between hover:border-amber hover:shadow-md transition-all duration-200 group">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-soft/50 text-amber flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-lg text-ink">About BOMA</h4>
              </div>
              <p className="text-ink-dim text-[13.5px] leading-relaxed mb-4 font-light">
                Add, edit, or remove learning tutorials and educational guide links dynamically for the Member Learning Hub and Mobile App.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('admin-about-boma')}
              className="bg-amber hover:bg-[#b05d3e] text-white rounded-full py-2.5 px-5 text-xs font-semibold w-fit transition-all duration-150 hover:-translate-y-[0.5px] cursor-pointer mt-2 shadow-sm hover:shadow-md hover:shadow-[#C46A4A]/25 flex items-center gap-1.5"
            >
              Open About BOMA <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
