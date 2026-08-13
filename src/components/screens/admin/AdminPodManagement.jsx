import React, { useState, useEffect } from 'react';
import { fetchAllPods, adminDissolvePod } from '../../../api/pods';
import { Loader2 } from 'lucide-react';

export default function AdminPodManagement({ 
  setActiveScreen, 
  handleViewAdminPod, 
  adminUser, 
  showToast, 
  showConfirm 
}) {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPods = async () => {
    try {
      setLoading(true);
      const data = await fetchAllPods();
      // Only display APPROVED (ACTIVE) pods here
      setPods(data.filter(pod => pod.status === 'ACTIVE'));
    } catch (err) {
      console.error('Failed to load pods:', err);
      if (showToast) {
        showToast(err.message || 'Failed to load pods.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPods();
  }, []);

  const handleDeletePod = async (podId, podName) => {
    if (!showConfirm) return;
    
    showConfirm(
      'Delete Pod Group',
      `Are you sure you want to delete/dissolve "${podName}"? This will permanently dissolve the pod and return matched members back to the matching pool.`,
      async () => {
        try {
          setLoading(true);
          await adminDissolvePod(podId, adminUser?.id);
          if (showToast) {
            showToast(`Pod "${podName}" dissolved successfully!`, 'success');
          }
          await loadPods();
        } catch (err) {
          console.error('Failed to delete pod:', err);
          if (showToast) {
            showToast(err.message || 'Failed to delete pod.');
          }
        } finally {
          setLoading(false);
        }
      },
      'danger',
      'Delete Pod'
    );
  };

  return (
    <div className="w-full text-left animate-fade">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Admin / Pod Management</div>
      <h3 className="font-display font-extrabold text-2xl text-ink mb-2">Pod management</h3>
      <p className="text-ink-dim text-sm leading-relaxed mb-5 max-w-[520px]">
        The <b className="text-ink">Origin</b> column shows whether a Pod formed through the matching engine or was self-registered by a group that already knew each other.
      </p>

      <div className="border border-border rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-border text-ink font-semibold text-xs uppercase tracking-wider">
                <th className="p-4 px-6">Pod</th>
                <th className="p-4 px-6">Origin</th>
                <th className="p-4 px-6">Members</th>
                <th className="p-4 px-6">Status</th>
                <th className="p-4 px-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-ink-dim font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber" />
                      Loading pods...
                    </div>
                  </td>
                </tr>
              ) : pods.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-ink-dim font-medium">
                    No active pods found in the database.
                  </td>
                </tr>
              ) : (
                pods.map(pod => (
                  <tr key={pod.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 px-6 font-bold text-ink">{pod.name}</td>
                    <td className="p-4 px-6 font-medium text-ink-dim">
                      {pod.group_type === 'Community Group' ? 'Matched via Engine' : 'Self-Registered'}
                    </td>
                    <td className="p-4 px-6 font-mono text-xs font-bold text-ink">
                      {pod.membersCount} members
                    </td>
                    <td className="p-4 px-6">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                        pod.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-teal border-emerald-100' 
                          : pod.status === 'UNDER_REVIEW' 
                          ? 'bg-amber-soft/50 text-[#8A5300] border-amber/10'
                          : pod.status === 'REJECTED'
                          ? 'bg-red-50 text-rust border-red-100'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {pod.status}
                      </span>
                    </td>
                    <td className="p-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewAdminPod(pod.id)}
                          className="bg-transparent border border-border text-ink hover:bg-slate-50 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeletePod(pod.id, pod.name)}
                          className="bg-transparent border border-rust text-rust hover:bg-red-50 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
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
    </div>
  );
}
