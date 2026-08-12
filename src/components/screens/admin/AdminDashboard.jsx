import React, { useState, useEffect } from 'react';
import { Users, Sparkles, FileText, Activity } from 'lucide-react';
import { supabase } from '../../../supabaseClient';

export default function AdminDashboard({ adminUser, setActiveScreen, handleViewAdminPod, podData }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePods: 0,
    avgReadiness: 0,
    pendingReviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // 1. Total users (excluding admins)
        const { count: totalCount, error: err1 } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .neq('role', 'admin');
        if (err1) throw err1;

        // 2. Active Pods
        const activePodsCount = 0;

        // 3. Avg Readiness score (excluding admins)
        const { data: usersData, error: err2 } = await supabase
          .from('users')
          .select('readiness_score')
          .eq('user_onboarded', true)
          .neq('role', 'admin');
        if (err2) throw err2;

        let avgReadinessScore = 0;
        if (usersData && usersData.length > 0) {
          const totalReadiness = usersData.reduce((acc, curr) => acc + (curr.readiness_score || 0), 0);
          avgReadinessScore = Math.round(totalReadiness / usersData.length);
        }

        // 4. Pending Reviews (suggested pods waiting for approval - currently 0)
        const pendingCount = 0;

        setStats({
          totalUsers: totalCount || 0,
          activePods: activePodsCount,
          avgReadiness: avgReadinessScore || '—',
          pendingReviews: pendingCount
        });
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [podData]);

  const adminName = adminUser?.name || adminUser?.email?.split('@')[0] || 'Admin';

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 border border-border rounded-2xl p-5 bg-gradient-to-r from-panel-alt to-white shadow-sm mb-6 flex-wrap sm:flex-nowrap">
        <div className="w-14 h-14 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] border border-border flex items-center justify-center text-white font-extrabold text-[22px] font-display">
          {adminName.substring(0, 1).toUpperCase()}
        </div>
        <div className="flex flex-col text-left">
          <h3 className="font-display font-extrabold text-[19px] text-ink leading-tight">Welcome back, {adminName}</h3>
          <span className="text-xs text-ink-dim font-medium mt-0.5">Admin Console · Last login today</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 select-none text-center">
        <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
          <div className="font-display text-[26px] font-extrabold text-ink leading-tight">
            {loading ? '...' : stats.totalUsers}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Total Users</div>
        </div>
        <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
          <div className="font-display text-[26px] font-extrabold text-ink leading-tight">
            {loading ? '...' : stats.activePods}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Active Pods</div>
        </div>
        <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
          <div className="font-display text-[26px] font-extrabold text-ink leading-tight">
            {loading ? '...' : stats.avgReadiness}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Avg. Readiness</div>
        </div>
        <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
          <div className="font-display text-[26px] font-extrabold text-ink leading-tight text-amber">
            {loading ? '...' : stats.pendingReviews}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Pending Reviews</div>
        </div>
      </div>

      {/* Admin Navigation Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-ink">
              <Users className="w-5 h-5" />
              <h4 className="font-display font-extrabold text-base text-ink">User management</h4>
            </div>
            <p className="text-ink-dim text-sm leading-relaxed mb-4">
              View profiles, monitor readiness, flag incomplete accounts.
            </p>
          </div>
          <button 
            onClick={() => setActiveScreen('admin-users')}
            className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-2"
          >
            Manage users
          </button>
        </div>

        <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-ink">
              <Activity className="w-5 h-5" />
              <h4 className="font-display font-extrabold text-base text-ink">Matching engine</h4>
            </div>
            <p className="text-ink-dim text-sm leading-relaxed mb-4">
              Adjust variable weighting and run the matching engine.
            </p>
          </div>
          <button 
            onClick={() => setActiveScreen('admin-matching')}
            className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-2"
          >
            Open controls
          </button>
        </div>

        <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-ink">
              <Sparkles className="w-5 h-5" />
              <h4 className="font-display font-extrabold text-base text-ink">Pod review queue</h4>
            </div>
            <p className="text-ink-dim text-sm leading-relaxed mb-4">
              {stats.pendingReviews} suggested Pods waiting for approval.
            </p>
          </div>
          <button 
            onClick={() => setActiveScreen('admin-pod-review')}
            className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-2"
          >
            Review Pods
          </button>
        </div>

        <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-ink">
              <FileText className="w-5 h-5" />
              <h4 className="font-display font-extrabold text-base text-ink">Pod management</h4>
            </div>
            <p className="text-ink-dim text-sm leading-relaxed mb-4">
              Monitor stability across all active Pods.
            </p>
          </div>
          <button 
            onClick={() => setActiveScreen('admin-pod-management')}
            className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-2"
          >
            View Pods
          </button>
        </div>
      </div>
    </div>
  );
}
