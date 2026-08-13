import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createPod } from '../../../api/pods';
import Toast from '../../Toast';

export default function PodCreate({ 
  podRegName, 
  setPodRegName, 
  podRegDescription, 
  setPodRegDescription, 
  podRegType, 
  setPodRegType, 
  setActiveScreen,
  currentUser,
  setCurrentUser
}) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const handleCreate = async () => {
    if (!podRegName.trim()) {
      setToast({ show: true, message: 'Pod name is required.', type: 'error' });
      return;
    }
    if (!currentUser?.id) {
      setToast({ show: true, message: 'Please log in to register a Pod.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const pod = await createPod(currentUser.id, podRegName.trim(), podRegDescription.trim(), podRegType);
      
      // Update local user state
      if (setCurrentUser) {
        setCurrentUser({
          ...currentUser,
          entry_path: 'EXISTING_POD'
        });
      }

      setToast({ show: true, message: 'Pod created successfully!', type: 'success' });
      setTimeout(() => {
        setActiveScreen('pod-invite');
      }, 1000);
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to create pod.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[480px] mx-auto animate-fade">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <div className="w-full p-8 border border-border rounded-2xl bg-white shadow-custom flex flex-col text-left ">
        <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1.5 font-bold">Register an Existing Pod</div>
        <h3 className="font-display font-extrabold text-[22px] text-ink mb-6">
          Set up your group
        </h3>

        <div className="mb-4">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Pod name</label>
          <input 
            type="text"
            value={podRegName}
            onChange={(e) => setPodRegName(e.target.value)}
            placeholder="The Fourplex Founders" 
            disabled={loading}
            className="w-full bg-panel border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" 
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">What are you building together?</label>
          <textarea 
            value={podRegDescription}
            onChange={(e) => setPodRegDescription(e.target.value)}
            placeholder="4 friends buying a fourplex in East Austin" 
            rows="3"
            disabled={loading}
            className="w-full bg-panel border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium resize-none"
          ></textarea>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Group type</label>
          <select 
            value={podRegType}
            onChange={(e) => setPodRegType(e.target.value)}
            disabled={loading}
            className="w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-amber cursor-pointer font-semibold"
          >
            <option value="Friends">Friends</option>
            <option value="Family">Family</option>
            <option value="Small development group">Small development group</option>
            <option value="Tiny-home village organizers">Tiny-home village organizers</option>
            <option value="Workforce housing / nonprofit">Workforce housing / nonprofit</option>
          </select>
        </div>

        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => setActiveScreen('entry-path')}
            disabled={loading}
            className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button 
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 bg-ink text-white rounded-lg px-4 py-2.5 text-sm font-bold hover:bg-[#2450C4] hover:-translate-y-[0.5px] transition-all cursor-pointer shadow-md text-center flex items-center justify-center gap-2 disabled:opacity-80"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating...
              </>
            ) : (
              'Create Pod'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
