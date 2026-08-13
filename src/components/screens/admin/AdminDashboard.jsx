import React, { useState, useEffect } from 'react';
import { Users, Sparkles, FileText, Activity, HelpCircle, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../../supabaseClient';

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
        // 1. Total users (excluding admins)
        const { count: totalCount, error: err1 } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .neq('role', 'admin');
        if (err1) throw err1;

        // 2. Under Review
        const { count: underReviewCount, error: err2 } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('profile_status', 'UNDER_REVIEW')
          .neq('role', 'admin');
        if (err2) throw err2;

        // 3. Approved
        const { count: approvedCount, error: err3 } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('profile_status', 'APPROVED')
          .neq('role', 'admin');
        if (err3) throw err3;

        // 4. In Matching Pool
        const { count: poolCount, error: err4 } = await supabase
          .from('matching_pool_entries')
          .select('*', { count: 'exact', head: true });
        if (err4) throw err4;

        setStats({
          totalUsers: totalCount || 0,
          underReview: underReviewCount || 0,
          approved: approvedCount || 0,
          matchingPool: poolCount || 0
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
        className="rounded-[22px] p-7 border border-border/80 flex items-center justify-between gap-6 shadow-md relative overflow-hidden flex-wrap md:flex-nowrap"
        style={{ background: 'linear-gradient(135deg, var(--navy-deep) 0%, #0E4C8C 100%)' }}
      >
        <div className="flex items-center gap-5 relative z-10">
          <div className="flex flex-col text-left">
            <h3 className="font-display font-extrabold text-[22px] text-white leading-tight">Welcome back, {adminName}</h3>
            <span className="text-[12px] text-slate-300 font-medium mt-1">BOMA Administrator Portal · Systems &amp; Database Active</span>
          </div>
        </div>
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-teal/30 blur-3xl pointer-events-none" />
      </div>

      {/* Analytics/KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="border border-border rounded-2xl p-5 bg-white shadow-sm flex items-center justify-between border-l-4 border-l-[#2F5FE0] hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-ink-dim font-bold">Total Users</span>
            <span className="font-display text-3xl font-extrabold text-ink leading-none">
              {loading ? '...' : stats.totalUsers}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2F5FE0]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Under Review */}
        <div className="border border-border rounded-2xl p-5 bg-white shadow-sm flex items-center justify-between border-l-4 border-l-amber hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-ink-dim font-bold">Under Review</span>
              {!loading && stats.underReview > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-ping" />
              )}
            </div>
            <span className="font-display text-3xl font-extrabold text-amber leading-none">
              {loading ? '...' : stats.underReview}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-soft/40 flex items-center justify-center text-amber">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Approved Users */}
        <div className="border border-border rounded-2xl p-5 bg-white shadow-sm flex items-center justify-between border-l-4 border-l-teal hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-ink-dim font-bold">Approved Users</span>
            <span className="font-display text-3xl font-extrabold text-teal leading-none">
              {loading ? '...' : stats.approved}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-teal">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Matching Pool */}
        <div className="border border-border rounded-2xl p-5 bg-white shadow-sm flex items-center justify-between border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-ink-dim font-bold">Matching Pool</span>
            <span className="font-display text-3xl font-extrabold text-indigo-600 leading-none">
              {loading ? '...' : stats.matchingPool}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Panel Modules */}
      <div>
        <h4 className="font-display font-extrabold text-[15px] uppercase tracking-wider text-ink-dim border-b border-border pb-2 mb-5">
          System Control Modules
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Moderation */}
          <div className="border border-border rounded-[20px] p-6 bg-white shadow-sm flex flex-col justify-between hover:border-amber hover:shadow-md transition-all duration-200 group">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2F5FE0] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-display font-extrabold text-base text-ink">User Profile Moderation</h4>
              </div>
              <p className="text-ink-dim text-[13.5px] leading-relaxed mb-4">
                Evaluate detailed onboarding responses, review compatibility scores, flag incomplete/problematic profiles, and approve pool entry.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('admin-users')}
              className="bg-[#2F5FE0] hover:bg-[#1E45A8] text-white rounded-xl py-2.5 px-4.5 text-xs font-bold w-fit transition-all duration-150 hover:-translate-y-[0.5px] cursor-pointer mt-2 shadow flex items-center gap-1.5"
            >
              Open Moderation <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Matching Engine */}
          <div className="border border-border rounded-[20px] p-6 bg-white shadow-sm flex flex-col justify-between hover:border-amber hover:shadow-md transition-all duration-200 group">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="font-display font-extrabold text-base text-ink">Matching Engine Variables</h4>
              </div>
              <p className="text-ink-dim text-[13.5px] leading-relaxed mb-4">
                Configure weight percentages (Lifestyle, Location, Financials, Timelines) for the dynamic matching engine. Must sum to exactly 100%.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('admin-matching')}
              className="bg-[#2F5FE0] hover:bg-[#1E45A8] text-white rounded-xl py-2.5 px-4.5 text-xs font-bold w-fit transition-all duration-150 hover:-translate-y-[0.5px] cursor-pointer mt-2 shadow flex items-center gap-1.5"
            >
              Configure Weights <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Question Management */}
          <div className="border border-border rounded-[20px] p-6 bg-white shadow-sm flex flex-col justify-between hover:border-amber hover:shadow-md transition-all duration-200 group">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-soft/30 text-amber flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h4 className="font-display font-extrabold text-base text-ink">Questionnaire Manager</h4>
              </div>
              <p className="text-ink-dim text-[13.5px] leading-relaxed mb-4">
                Add, edit, reorder, or archive onboarding questions and individual answer scoring rules. Supports secure version publishing.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('admin-questions')}
              className="bg-[#2F5FE0] hover:bg-[#1E45A8] text-white rounded-xl py-2.5 px-4.5 text-xs font-bold w-fit transition-all duration-150 hover:-translate-y-[0.5px] cursor-pointer mt-2 shadow flex items-center gap-1.5"
            >
              Manage Questions <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Pod Commons Management */}
          <div className="border border-border rounded-[20px] p-6 bg-white shadow-sm flex flex-col justify-between hover:border-amber hover:shadow-md transition-all duration-200 group">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-display font-extrabold text-base text-ink">Pod Commons Monitor</h4>
              </div>
              <p className="text-ink-dim text-[13.5px] leading-relaxed mb-4">
                Monitor membership size, alignment metrics, chat active statuses, and agreement scaffolding documents for all active matched Pods.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('admin-pod-management')}
              className="bg-[#2F5FE0] hover:bg-[#1E45A8] text-white rounded-xl py-2.5 px-4.5 text-xs font-bold w-fit transition-all duration-150 hover:-translate-y-[0.5px] cursor-pointer mt-2 shadow flex items-center gap-1.5"
            >
              View Active Pods <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
