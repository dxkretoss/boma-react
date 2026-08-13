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

  return (
    <div className="w-full text-left  animate-fade space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Pods List (Spans 2 cols if a pod is selected, otherwise 3) */}
        <div className={`${selectedPod ? 'lg:col-span-1.5' : 'lg:col-span-3'} space-y-4`}>
          {loading ? (
            <div className="py-16 text-center">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4.5">
              {pods.map(pod => (
                <div 
                  key={pod.id}
                  onClick={() => setSelectedPod(pod)}
                  className={`border rounded-2xl p-5 bg-white cursor-pointer transition-all hover:shadow-custom hover:border-teal/50 ${
                    selectedPod?.id === pod.id ? 'border-teal ring-1 ring-teal/30 shadow-custom' : 'border-border'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="bg-amber-soft text-amber text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                        {pod.group_type || 'Group'}
                      </span>
                      <h4 className="font-display font-extrabold text-[16px] text-ink mt-1.5 leading-tight">{pod.name}</h4>
                      <p className="text-[12px] text-ink-dim mt-1.5 line-clamp-2">{pod.description}</p>
                    </div>
                    <span className="bg-teal-soft text-teal border border-teal/10 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                      Review Pending
                    </span>
                  </div>
                  
                  <div className="border-t border-border/60 mt-4 pt-3 flex justify-between items-center text-[11px] text-ink-dim">
                    <span>Registered {new Date(pod.created_at).toLocaleDateString()}</span>
                    <span className="font-semibold text-ink flex items-center gap-1">
                      Inspect Details &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button 
            onClick={() => setActiveScreen('admin-dashboard')}
            className="bg-transparent border border-border text-ink font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-2"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Right Column: selected Pod Details Panel */}
        {selectedPod && (
          <div className="lg:col-span-1.5 bg-white border border-border rounded-2xl p-6 shadow-custom space-y-6">
            {/* Header info */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[9.5px] font-mono text-amber uppercase block font-bold">Inspecting Pod</span>
                <h4 className="font-display font-extrabold text-[20px] text-ink leading-snug mt-0.5">{selectedPod.name}</h4>
              </div>
              <button 
                onClick={() => setSelectedPod(null)}
                className="text-ink-dim hover:text-ink transition-colors cursor-pointer"
              >
                <XCircle className="w-5.5 h-5.5" />
              </button>
            </div>

            {/* Description & Type info */}
            <div className="bg-slate-50 border border-border/80 rounded-xl p-4.5 space-y-2 text-xs text-ink-dim">
              <div>
                <span className="font-bold text-ink uppercase tracking-wider font-mono text-[9.5px] block mb-0.5">Description</span>
                <span>{selectedPod.description || 'No description provided.'}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="font-bold text-ink uppercase tracking-wider font-mono text-[9.5px] block mb-0.5">Group Type</span>
                  <span className="font-semibold text-ink">{selectedPod.group_type || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-bold text-ink uppercase tracking-wider font-mono text-[9.5px] block mb-0.5">Avg Readiness</span>
                  <span className="font-bold text-teal text-sm">{loadingMembers ? '...' : `${avgReadiness}/100`}</span>
                </div>
              </div>
            </div>

            {/* Members Section */}
            <div className="space-y-3.5">
              <h5 className="font-display font-extrabold text-sm text-ink flex items-center gap-1.5 border-b border-border/60 pb-2">
                <Users className="w-4.5 h-4.5 text-teal" /> Members &amp; Readiness Scores
              </h5>

              {loadingMembers ? (
                <div className="py-8 text-center flex items-center justify-center gap-2 text-xs text-ink-dim font-mono font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-teal" /> Loading member files...
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {selectedPodMembers.map((m, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-2 bg-panel/35 border border-border/40 rounded-xl p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-ink-dim font-display">
                          {m.name.substring(0, 1).toUpperCase()}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[11.5px] font-bold text-ink leading-tight">{m.name}</span>
                          <span className="text-[9.5px] text-ink-dim font-mono">{m.role === 'CREATOR' ? 'Coordinator' : 'Member'} · {m.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
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

            {/* Review form controls */}
            {!showRejectForm ? (
              <div className="flex gap-3 border-t border-border/60 pt-5">
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={processingAction || loadingMembers}
                  className="flex-1 bg-transparent hover:bg-red-50 text-rust border border-rust/10 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Flag / Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={processingAction || loadingMembers}
                  className="flex-1 bg-[#2F5FE0] hover:bg-[#2450C4] text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {processingAction ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Approve &amp; Activate
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="border-t border-border/60 pt-5 space-y-4">
                <div>
                  <label className="block text-[10.5px] font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-bold">
                    Rejection Feedback / Reason
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide specific feedback on why this group cannot be approved (e.g. member profiles incomplete, low readiness scores, etc.)"
                    rows="3.5"
                    disabled={processingAction}
                    className="w-full bg-panel border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-amber transition-colors resize-none font-medium"
                  ></textarea>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRejectForm(false)}
                    disabled={processingAction}
                    className="flex-1 bg-transparent border border-border text-ink py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={processingAction || !rejectionReason.trim()}
                    className="flex-1 bg-rust hover:bg-red-700 text-white py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1"
                  >
                    {processingAction ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Confirm Rejection'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
