import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { fetchPodDetails, fetchPodMembers, submitPodForReview } from '../../../api/pods';
import Toast from '../../Toast';

export default function PodReview({ podRegName, podRegType, setActiveScreen, currentUser }) {
  const [pod, setPod] = useState(null);
  const [memberCount, setMemberCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  useEffect(() => {
    async function loadPod() {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }
      try {
        const details = await fetchPodDetails(currentUser.id);
        setPod(details);
        if (details) {
          const members = await fetchPodMembers(details.id);
          setMemberCount(members.length);
        }
      } catch (err) {
        console.error('Error loading pod details for review:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPod();
  }, [currentUser]);

  const handleSubmit = async () => {
    if (!pod?.id) return;
    setSubmitting(true);
    try {
      await submitPodForReview(pod.id);
      setToast({ show: true, message: 'Pod submitted successfully for review.', type: 'success' });
      setTimeout(() => {
        setActiveScreen('pod-pending');
      }, 1000);
    } catch (err) {
      setToast({ show: true, message: err.message || 'Submission failed.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-10 h-10 text-teal animate-spin mx-auto mb-4" />
        <span className="font-mono text-xs uppercase tracking-wider text-ink-dim font-bold">
          Loading submission details...
        </span>
      </div>
    );
  }

  if (!pod) {
    return (
      <div className="max-w-[480px] mx-auto py-12 text-center bg-white border border-border rounded-2xl p-8 shadow-custom">
        <AlertCircle className="w-12 h-12 text-rust mx-auto mb-4" />
        <h3 className="font-display font-extrabold text-lg text-ink mb-2">No Active Pod Group</h3>
        <p className="text-ink-dim text-sm mb-6">You need to set up a Pod group first before submitting for review.</p>
        <button 
          onClick={() => setActiveScreen('pod-create')}
          className="bg-ink text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#2450C4]"
        >
          Create Pod Group
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[660px] mx-auto animate-fade">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <div className="w-full bg-white border border-border rounded-2xl p-8 shadow-custom">
        <h3 className="font-display font-extrabold text-[22px] text-ink mb-5 text-left">Review submission</h3>
        
        <div className="border border-border rounded-xl bg-white shadow-sm overflow-hidden mb-6">
          <div className="flex justify-between items-center border-b border-border/80 p-4 px-5 text-[13.5px]">
            <b className="text-ink-dim font-semibold">Pod name</b>
            <span className="text-ink font-bold">{pod.name || podRegName || 'The Fourplex Founders'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-border/80 p-4 px-5 text-[13.5px]">
            <b className="text-ink-dim font-semibold">Group type</b>
            <span className="text-ink font-bold">{pod.group_type || podRegType || 'Friends'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-border/80 p-4 px-5 text-[13.5px]">
            <b className="text-ink-dim font-semibold">Members onboarded</b>
            <span className="text-ink font-bold">{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between items-center p-4 px-5 text-[13.5px]">
            <b className="text-ink-dim font-semibold">Status</b>
            <span className="text-ink font-bold">Ready to submit</span>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => setActiveScreen('pod-invite')}
            disabled={submitting}
            className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-amber text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
              </>
            ) : (
              'Submit for review'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
