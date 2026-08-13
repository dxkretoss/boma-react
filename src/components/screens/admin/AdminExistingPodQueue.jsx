import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, Users, FileText, CheckCircle2, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { fetchPodsUnderReview, fetchPodMembers, approvePod, rejectPod } from '../../../api/pods';
import Toast from '../../Toast';

export default function AdminExistingPodQueue({ setActiveScreen }) {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPod, setSelectedPod] = useState(null);
  const [selectedPodMembers, setSelectedPodMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  // Review Action states
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  // Load pods under review
  const loadQueue = async () => {
    setLoading(true);
    try {
      const list = await fetchPodsUnderReview();
      setPods(list);
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to fetch pods queue.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  // When selected pod changes, fetch members
  useEffect(() => {
    if (!selectedPod) {
      setSelectedPodMembers([]);
      setShowRejectForm(false);
      setRejectionReason('');
      return;
    }

    async function loadMembers() {
      setLoadingMembers(true);
      try {
        const list = await fetchPodMembers(selectedPod.id);
        setSelectedPodMembers(list);
      } catch (err) {
        setToast({ show: true, message: err.message || 'Failed to fetch pod members.', type: 'error' });
      } finally {
        setLoadingMembers(false);
      }
    }
    loadMembers();
  }, [selectedPod]);

  // Handle Approve Action
  const handleApprove = async () => {
    if (!selectedPod) return;
    setProcessingAction(true);
    try {
      await approvePod(selectedPod.id);
      setToast({ show: true, message: `Pod "${selectedPod.name}" approved successfully!`, type: 'success' });
      setSelectedPod(null);
      await loadQueue();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to approve pod.', type: 'error' });
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle Reject Action
  const handleReject = async () => {
    if (!selectedPod) return;
    if (!rejectionReason.trim()) {
      setToast({ show: true, message: 'Please provide feedback/reason for rejection.', type: 'error' });
      return;
    }

    setProcessingAction(true);
    try {
      await rejectPod(selectedPod.id, rejectionReason.trim());
      setToast({ show: true, message: `Pod "${selectedPod.name}" rejected/flagged.`, type: 'success' });
      setSelectedPod(null);
      await loadQueue();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to reject pod.', type: 'error' });
    } finally {
      setProcessingAction(false);
    }
  };

  // Calculate Avg Readiness
  const avgReadiness = selectedPodMembers.length 
    ? Math.round(selectedPodMembers.reduce((acc, m) => acc + m.readinessScore, 0) / selectedPodMembers.length)
    : 0;

  if (selectedPod) {
    return (
      <div className="w-full text-left animate-fade space-y-6">
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({ ...toast, show: false })} 
          />
        )}

        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
          <div className="text-left">
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">
              Admin / Existing Pod Queue / Inspecting Group
            </div>
            <h3 className="font-display font-extrabold text-2.5xl text-ink">
              {selectedPod.name}
            </h3>
            <p className="text-ink-dim text-sm mt-1">
              Registered on {new Date(selectedPod.created_at).toLocaleDateString()}
            </p>
          </div>
          <button 
            onClick={() => setSelectedPod(null)}
            className="flex items-center gap-1.5 bg-transparent border border-border text-ink hover:bg-panel-alt rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Queue
          </button>
        </div>

        {/* Detailed Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          {/* Main Info (Left 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="font-display font-extrabold text-md text-ink border-b border-border pb-2">
                Group Description
              </h4>
              <p className="text-sm text-ink-dim leading-relaxed">
                {selectedPod.description || 'No description provided.'}
              </p>

              <div className="grid grid-cols-2 gap-6 pt-2">
                <div>
                  <span className="font-bold text-ink uppercase tracking-wider font-mono text-[10px] block mb-1">
                    Group Type
                  </span>
                  <span className="text-sm text-ink font-semibold bg-panel/60 px-3 py-1 rounded-lg border border-border/40 w-fit block">
                    {selectedPod.group_type || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-ink uppercase tracking-wider font-mono text-[10px] block mb-1">
                    Combined Average Readiness
                  </span>
                  <span className="text-sm font-extrabold text-teal bg-[#EAFDF8] px-3 py-1 rounded-lg border border-sage/10 w-fit block">
                    {loadingMembers ? '...' : `${avgReadiness}/100`}
                  </span>
                </div>
              </div>
            </div>

            {/* Members Card */}
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="font-display font-extrabold text-md text-ink flex items-center gap-2 border-b border-border pb-2">
                <Users className="w-5 h-5 text-teal" /> Members &amp; Readiness Breakdown
              </h4>

              {loadingMembers ? (
                <div className="py-12 text-center flex items-center justify-center gap-2 text-sm text-ink-dim font-mono font-medium">
                  <Loader2 className="w-5 h-5 animate-spin text-teal" /> Loading member files...
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPodMembers.map((m, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-4 bg-panel/35 border border-border/50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-ink-dim font-display">
                          {m.name.substring(0, 1).toUpperCase()}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-bold text-ink leading-tight">{m.name}</span>
                          <span className="text-xs text-ink-dim mt-0.5">{m.role === 'CREATOR' ? 'Coordinator' : 'Member'} · {m.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold font-mono px-3 py-1 rounded-lg ${
                          m.readinessScore >= 70 ? 'bg-emerald-50 text-sage border border-sage/10' : 'bg-amber-soft text-amber border border-amber/10'
                        }`}>
                          Score: {m.readinessScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Box (Right 1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-6 sticky top-6">
              <h4 className="font-display font-extrabold text-md text-ink border-b border-border pb-2">
                Moderation Action
              </h4>

              {!showRejectForm ? (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-ink-dim leading-relaxed">
                    Verify this self-formed group. Approving will activate their shared pod commons, allowing them to sign agreements, chat, and access project spaces.
                  </p>
                  <button
                    onClick={handleApprove}
                    disabled={processingAction || loadingMembers}
                    className="w-full bg-[#2F5FE0] hover:bg-[#2450C4] text-white py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {processingAction ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Approve &amp; Activate Pod
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={processingAction || loadingMembers}
                    className="w-full bg-transparent hover:bg-red-50 text-rust border border-rust/10 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                  >
                    Flag / Reject Group
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10.5px] font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-bold">
                      Rejection Feedback / Reason
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide specific feedback on why this group cannot be approved (e.g. member profiles incomplete, low readiness scores, etc.)"
                      rows="4"
                      disabled={processingAction}
                      className="w-full bg-panel border border-border rounded-xl px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-amber transition-colors resize-none font-medium"
                    ></textarea>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleReject}
                      disabled={processingAction || !rejectionReason.trim()}
                      className="w-full bg-rust hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      {processingAction ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Confirm Rejection'
                      )}
                    </button>
                    <button
                      onClick={() => setShowRejectForm(false)}
                      disabled={processingAction}
                      className="w-full bg-transparent border border-border text-ink py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-left animate-fade space-y-6">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      {/* Header section */}
      <div>
        <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Admin / Moderation</div>
        <h3 className="font-display font-extrabold text-2.5xl text-ink">Existing Pod Queue</h3>
        <p className="text-ink-dim text-sm mt-1">Review self-formed co-living groups waiting for Board activation.</p>
      </div>

      <div className="w-full space-y-4">
        {loading ? (
          <div className="py-16 text-center bg-white border border-border rounded-2xl shadow-sm">
            <Loader2 className="w-8 h-8 text-teal animate-spin mx-auto mb-2" />
            <span className="text-xs text-ink-dim font-semibold font-mono">Syncing review queue...</span>
          </div>
        ) : pods.length === 0 ? (
          <div className="border border-border border-dashed rounded-2xl p-10 bg-panel-alt/10 text-center max-w-[500px]">
            <CheckCircle2 className="w-10 h-10 text-sage mx-auto mb-3" />
            <p className="text-ink text-sm font-semibold mb-1">Queue is empty</p>
            <p className="text-xs text-ink-dim">No self-registered pods are currently pending verification approval.</p>
          </div>
        ) : (
          <div className="border border-border rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-border text-ink font-semibold text-xs uppercase tracking-wider">
                    <th className="p-4 px-6">Pod Group</th>
                    <th className="p-4 px-6">Group Type</th>
                    <th className="p-4 px-6">Registered Date</th>
                    <th className="p-4 px-6">Status</th>
                    <th className="p-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {pods.map(pod => (
                    <tr key={pod.id} className="hover:bg-panel/20 transition-colors">
                      <td className="p-4 px-6">
                        <div className="flex flex-col text-left max-w-[320px] md:max-w-[400px]">
                          <span className="font-bold text-ink leading-tight">{pod.name}</span>
                          <span className="text-xs text-ink-dim mt-1.5 truncate">{pod.description}</span>
                        </div>
                      </td>
                      <td className="p-4 px-6 font-medium text-ink">
                        <span className="bg-amber-soft/60 text-amber text-[9.5px] font-bold px-2.5 py-0.5 rounded font-mono uppercase tracking-wider border border-amber/10">
                          {pod.group_type || 'Group'}
                        </span>
                      </td>
                      <td className="p-4 px-6 text-ink-dim text-xs">
                        {new Date(pod.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 px-6 whitespace-nowrap">
                        <span className="bg-teal-soft text-teal border border-teal/10 text-[9.5px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider font-mono whitespace-nowrap">
                          Review Pending
                        </span>
                      </td>
                      <td className="p-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedPod(pod)}
                          className="bg-[#2F5FE0] hover:bg-[#2450C4] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Inspect Details &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button 
          onClick={() => setActiveScreen('admin-dashboard')}
          className="bg-transparent border border-border text-ink font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-2"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
