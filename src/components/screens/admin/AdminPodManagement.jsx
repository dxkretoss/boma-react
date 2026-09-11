import React, { useState, useEffect } from 'react';
import { fetchAllPods, adminDissolvePod } from '../../../api/pods';
import { Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import Pagination from '../../Pagination';

export default function AdminPodManagement({ 
  setActiveScreen, 
  handleViewAdminPod, 
  adminUser, 
  showToast, 
  showConfirm 
}) {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadPods = async (showSuccessToast = false) => {
    try {
      if (!showSuccessToast) setLoading(true);
      const data = await fetchAllPods();
      // Display all non-dissolved pods
      setPods((data || []).filter(pod => pod.status !== 'DISSOLVED'));
      if (showSuccessToast && showToast) {
        showToast('Pod list refreshed.', 'success');
      }
    } catch (err) {
      console.error('Failed to load pods:', err);
      if (showToast) {
        showToast(err.message || 'Failed to load pods.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadPods(true);
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

  const filteredPods = pods.filter(pod => {
    if (statusFilter === 'ALL') return true;
    return pod.status === statusFilter;
  });

  const totalPages = Math.ceil(filteredPods.length / pageSize) || 1;
  const paginatedPods = filteredPods.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleFilterChange = (filterVal) => {
    setStatusFilter(filterVal);
    setCurrentPage(1);
  };

  return (
    <div className="w-full text-left animate-fade">
      <div className="flex flex-col gap-2.5 mb-5">
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
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Admin / Pod Management</div>
            <h3 className="font-display font-extrabold text-2xl text-ink mb-1">Pod management</h3>
            <p className="text-ink-dim text-sm leading-relaxed max-w-[520px]">
              The <b className="text-ink">Origin</b> column shows whether a Pod formed through the matching engine or was self-registered by a group that already knew each other.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <button
            onClick={handleManualRefresh}
            disabled={loading || refreshing}
            className="bg-white hover:bg-panel-alt border border-border text-ink hover:text-amber text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shrink-0"
            title="Refresh pods list"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-5 items-center justify-between bg-panel-alt/30 border border-border p-3.5 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-dim font-bold">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="bg-white border border-border rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none focus:border-amber text-ink cursor-pointer"
          >
            <option value="ALL">All Pods ({pods.length})</option>
            <option value="ACTIVE">Active in Commons ({pods.filter(p => p.status === 'ACTIVE').length})</option>
            <option value="CREATING">Forming / Awaiting Confirmations ({pods.filter(p => p.status === 'CREATING').length})</option>
            <option value="UNDER_REVIEW">Under Review ({pods.filter(p => p.status === 'UNDER_REVIEW').length})</option>
          </select>
        </div>
        <span className="text-xs font-bold text-ink-dim font-mono">
          Showing {filteredPods.length} of {pods.length} Pod(s)
        </span>
      </div>

      <div className="border border-border rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto w-full scrollbar-thin">
          <table className="w-full min-w-[960px] text-sm text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-border text-ink font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                <th className="py-4 px-6 whitespace-nowrap">Pod</th>
                <th className="py-4 px-6 whitespace-nowrap">Origin</th>
                <th className="py-4 px-6 whitespace-nowrap">Members</th>
                <th className="py-4 px-6 whitespace-nowrap">Status</th>
                <th className="py-4 px-6 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                [...Array(6)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse whitespace-nowrap">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="h-4 w-44 bg-border/70 rounded" />
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="h-4 w-32 bg-border/50 rounded" />
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="h-4 w-20 bg-border/50 rounded" />
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="h-5 w-36 bg-border/50 rounded-full" />
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <div className="h-7 w-20 bg-border/40 rounded-lg" />
                        <div className="h-7 w-16 bg-border/40 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : paginatedPods.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-6 text-center text-ink-dim font-medium whitespace-nowrap">
                    No pods found matching this filter.
                  </td>
                </tr>
              ) : (
                paginatedPods.map(pod => (
                  <tr key={pod.id} className="hover:bg-slate-50 transition-colors whitespace-nowrap">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="font-bold text-ink text-sm whitespace-nowrap">{pod.name}</span>
                        <span className="text-xs text-ink-dim font-normal whitespace-nowrap">· {pod.location || 'Austin, TX'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {pod.group_type === 'EXISTING_POD' || pod.group_type === 'Friends' || pod.group_type === 'Family' || pod.group_type === 'Workforce' ? (
                        <span className="inline-flex items-center text-slate-700 bg-slate-100 px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap">
                          Self-Registered
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-amber bg-amber-soft/60 border border-amber/15 px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap">
                          Matched via Engine
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs font-bold text-ink whitespace-nowrap">
                      {pod.membersCount || (pod.members ? pod.members.length : 0)} members
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap border ${
                        pod.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-teal border-emerald-200' 
                          : pod.status === 'CREATING'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : pod.status === 'UNDER_REVIEW' 
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : pod.status === 'REJECTED'
                          ? 'bg-red-50 text-rust border-red-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {pod.status === 'ACTIVE' ? 'Active in Commons' : pod.status === 'CREATING' ? 'Forming / Awaiting Confirmations' : pod.status === 'UNDER_REVIEW' ? 'Under Review' : pod.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <button
                          onClick={() => handleViewAdminPod(pod.id)}
                          className="bg-white border border-border text-ink hover:bg-panel-alt font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeletePod(pod.id, pod.name)}
                          className="bg-transparent border border-rust text-rust hover:bg-red-50 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
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
        {!loading && (
          <div className="px-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredPods.length}
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
    </div>
  );
}
