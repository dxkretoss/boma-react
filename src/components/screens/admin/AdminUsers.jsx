import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../../supabaseClient';

export default function AdminUsers({ setActiveScreen }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers((data || []).filter(u => u.role !== 'admin'));
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleViewDetails = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="w-full text-left select-none">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Admin / User Management</div>
      <h3 className="font-display font-extrabold text-2xl text-ink mb-2">User management</h3>
      <p className="text-ink-dim text-sm leading-relaxed mb-5 max-w-[560px]">
        The <b className="text-ink">Entry Path</b> column shows how each user came in — matched individually through the pool, or registered as part of an existing group.
      </p>

      <div className="border border-border rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-border text-ink font-semibold select-none text-xs uppercase tracking-wider">
                <th className="p-4 px-6">User</th>
                <th className="p-4 px-6">Entry Path</th>
                <th className="p-4 px-6">Readiness</th>
                <th className="p-4 px-6">Status</th>
                <th className="p-4 px-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-ink-dim font-medium">
                    Loading database users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-ink-dim font-medium">
                    No users found in database.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  // Compute Entry Path values
                  let pathTag = 'Registered';
                  let isPool = true;
                  if (user.role === 'admin') {
                    pathTag = 'Admin Portal';
                    isPool = false;
                  } else if (user.housing_intent) {
                    pathTag = 'Matching Pool';
                    isPool = true;
                  } else if (user.selected_lifestyles && user.selected_lifestyles.length > 0) {
                    pathTag = 'Matching Pool';
                    isPool = true;
                  }

                  // Compute Status metrics
                  let status = 'Incomplete';
                  let badgeClass = 'bg-[#FDE8E8] text-rust border-rust/10';

                  if (user.role === 'admin') {
                    status = 'Admin Account';
                    badgeClass = 'bg-[#F1F5F9] text-slate-700 border-slate-200';
                  } else if (user.user_onboarded) {
                    status = 'Matched';
                    badgeClass = 'bg-[#E0F2FE] text-sky-800 border-sky-100';
                  } else if (user.email_verified === false) {
                    status = 'Pending verification';
                    badgeClass = 'bg-amber-soft/50 text-[#8A5300] border-amber/10';
                  }

                  return (
                    <tr key={user.id} className="hover:bg-panel-alt/30 transition-colors">
                      <td className="p-4 px-6 font-semibold text-ink flex items-center gap-3">
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            className="w-8 h-8 rounded-full border border-border object-cover" 
                            alt={user.name || user.email} 
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[12px] font-display flex-shrink-0">
                            {(user.name || user.email || 'U').substring(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-ink leading-tight">{user.name || 'Anonymous'}</span>
                          <span className="text-[11px] text-ink-dim font-medium">{user.email}</span>
                        </div>
                      </td>
                      <td className="p-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                          isPool ? 'bg-sky-50 text-sky-700' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {pathTag}
                        </span>
                      </td>
                      <td className="p-4 px-6 font-mono font-bold text-ink">
                        {user.user_onboarded ? user.readiness_score : '—'}
                      </td>
                      <td className="p-4 px-6">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${badgeClass}`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-4 px-6">
                        <button 
                          onClick={() => handleViewDetails(user)}
                          className="text-teal font-bold hover:underline cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade">
          <div className="bg-white border border-border rounded-2xl w-full max-w-[500px] shadow-2xl p-6 relative overflow-hidden text-left animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="font-display font-extrabold text-lg text-ink">User Profile Details</h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-ink-dim hover:text-ink cursor-pointer p-1 rounded-lg hover:bg-panel-alt transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Content */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {/* Profile Card Header */}
              <div className="flex items-center gap-3.5 bg-panel-alt p-3.5 rounded-xl border border-border/50">
                {selectedUser.avatar_url ? (
                  <img src={selectedUser.avatar_url} className="w-12 h-12 rounded-full border border-border object-cover" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[18px] font-display">
                    {(selectedUser.name || selectedUser.email || 'U').substring(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="font-bold text-ink leading-tight text-[15px]">{selectedUser.name || 'Anonymous'}</span>
                  <span className="text-[12px] text-ink-dim font-medium">{selectedUser.email}</span>
                </div>
              </div>

              {/* Status and Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-border rounded-lg p-2.5 bg-white text-left">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-ink-dim">Account Role</div>
                  <div className="text-xs font-bold text-ink capitalize mt-0.5">{selectedUser.role}</div>
                </div>
                <div className="border border-border rounded-lg p-2.5 bg-white text-left">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-ink-dim">Readiness Score</div>
                  <div className="text-xs font-bold text-ink mt-0.5">{selectedUser.user_onboarded ? `${selectedUser.readiness_score}/100` : 'Not Onboarded'}</div>
                </div>
              </div>

              {/* Onboarding Details Section */}
              <div className="border border-border rounded-xl p-4 bg-[#F8FAFC]/50 text-left space-y-3">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-ink">Onboarding Preferences</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <span className="text-ink-dim font-semibold">Age Group:</span>
                    <span className="text-ink font-bold ml-1.5">{selectedUser.age_group || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-ink-dim font-semibold">Decision Style:</span>
                    <span className="text-ink font-bold ml-1.5 capitalize">{selectedUser.decision_style || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-ink-dim font-semibold">Budget Range:</span>
                    <span className="text-ink font-bold ml-1.5">{selectedUser.budget_range || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-ink-dim font-semibold">Location:</span>
                    <span className="text-ink font-bold ml-1.5">{selectedUser.location_city ? `${selectedUser.location_city} (+${selectedUser.location_radius || 0} mi)` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-ink-dim font-semibold">Setting Pref:</span>
                    <span className="text-ink font-bold ml-1.5 capitalize">{selectedUser.setting_preference || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-ink-dim font-semibold">Timeline:</span>
                    <span className="text-ink font-bold ml-1.5">{selectedUser.commitment_timeline || 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 text-xs">
                  <span className="block text-ink-dim font-semibold mb-1">Selected Lifestyles:</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {selectedUser.selected_lifestyles && selectedUser.selected_lifestyles.length > 0 ? (
                      selectedUser.selected_lifestyles.map((l, i) => (
                        <span key={i} className="bg-white border border-border/80 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-ink">
                          {l}
                        </span>
                      ))
                    ) : (
                      <span className="text-ink-dim">None selected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4 mt-5 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-ink hover:bg-[#2450C4] text-white text-xs font-bold rounded-lg px-4 py-2 hover:-translate-y-[1px] transition-all cursor-pointer shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
