import React, { useState, useEffect } from 'react';
import { fetchPodById, fetchPodMembers } from '../../../api/pods';
import { Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import Avatar from '../../Avatar';

export default function AdminPodDetail({ setActiveScreen, adminViewPodId }) {
  const [pod, setPod] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPodData = async (isManual = false) => {
    if (!adminViewPodId) return;
    try {
      if (!isManual) setLoading(true);
      const podData = await fetchPodById(adminViewPodId);
      setPod(podData);
      if (podData) {
        const membersData = await fetchPodMembers(adminViewPodId);
        setMembers(membersData);
      }
    } catch (err) {
      console.error('Failed to load pod details:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadPodData(true);
  };

  useEffect(() => {
    loadPodData();
  }, [adminViewPodId]);

  if (loading) {
    return (
      <div className="w-full text-center py-20">
        <div className="flex items-center justify-center gap-2 text-ink-dim font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-amber" />
          Loading pod details...
        </div>
      </div>
    );
  }

  if (!pod) {
    return (
      <div className="w-full text-center py-20">
        <p className="text-ink-dim font-medium">Pod not found.</p>
        <button 
          onClick={() => setActiveScreen('admin-pod-management')}
          className="bg-white border border-border text-ink font-bold text-xs px-4 py-2 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-4 inline-flex items-center gap-1.5 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Pod Management
        </button>
      </div>
    );
  }

  const formedDate = new Date(pod.created_at).toLocaleDateString();
  const avgReadiness = members.length
    ? Math.round(members.reduce((acc, m) => acc + (m.readinessScore || m.readiness_score || 85), 0) / members.length)
    : 0;

  return (
    <div className="w-full text-left animate-fade">
      <div className="flex flex-col gap-2.5 mb-5">
        <button
          onClick={() => setActiveScreen('admin-pod-management')}
          className="inline-flex items-center gap-1.5 text-ink-dim hover:text-amber text-xs font-bold transition-colors cursor-pointer w-fit p-0 border-0 bg-transparent"
          title="Back to Pod Management"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber font-bold">Admin / Pod Management / Commons View</div>
            <h3 className="font-display font-extrabold text-xl text-ink leading-tight">{pod.name}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={handleManualRefresh}
            disabled={loading || refreshing}
            className="bg-white hover:bg-panel-alt border border-border text-ink hover:text-amber text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            title="Refresh pod details"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    </div>
      
      <div className="w-full text-left ">
        <div className="relative w-full rounded-2xl overflow-hidden h-[240px] mb-6 shadow-custom border border-border/5">
          <img src="/assets/pod_austin.png" className="w-full h-full object-cover" alt={pod.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/40 to-transparent p-6 md:p-8 flex items-end">
            <div className="text-white">
              <h1 className="font-display font-extrabold text-[26px] md:text-[32px] leading-tight mb-1">
                {pod.name}
              </h1>
              <span className="text-[13px] text-[#A3B3C8] font-semibold">
                Formed {formedDate} · {pod.group_type === 'EXISTING_POD' ? 'Self-Registered' : 'Matched via Engine'} · <span className="text-amber-soft font-bold">Admin View</span>
              </span>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6  text-center">
          <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
            <div className="font-display text-[26px] font-extrabold text-ink leading-tight">{members.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Members</div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
            <div className="font-display text-[26px] font-extrabold text-ink leading-tight">{avgReadiness}</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Avg. Readiness</div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
            <div className="font-display text-[26px] font-extrabold text-ink leading-tight text-sage">Stable</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Pod Health</div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
            <div className="font-display text-[18px] font-extrabold text-ink leading-[32px] overflow-hidden truncate px-1">{formedDate}</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Formed</div>
          </div>
        </div>

        {/* Members & Agreements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-6">
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col">
            <h4 className="font-display font-extrabold text-base text-ink mb-4">Members</h4>
            <div className="space-y-4">
              {members.map((m, i) => (
                <div key={i} className="flex justify-between items-center gap-3 border-b border-border/70 last:border-b-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Avatar user={m} className="w-9 h-9 shadow-sm border border-border" textClass="text-xs" />
                    <div className="flex flex-col">
                      <b className="text-sm font-bold text-ink leading-tight">{m.name}</b>
                      <span className="text-xs text-ink-dim font-medium mt-0.5">
                        {m.role === 'CREATOR' ? 'Coordinator' : 'Member'} · Joined {new Date(m.joinedAt).toLocaleDateString()}
                      </span>
                      {(m.housingIntent || m.commitmentTimeline) && (
                        <span className="text-[10px] text-teal font-semibold mt-0.5">
                          {m.housingIntent === 'co-develop' ? 'Co-develop' : m.housingIntent === 'purchase' ? 'Purchase' : m.housingIntent === 'investment' ? 'Investment' : m.housingIntent}
                          {m.commitmentTimeline ? ` · ${m.commitmentTimeline === 'timeline_2yr' ? '2+ yrs' : m.commitmentTimeline === 'timeline_5yr' ? '5+ yrs' : m.commitmentTimeline}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="bg-[#EAFDF8] text-sage border border-sage/10 text-[10.5px] font-bold px-2 py-0.5 rounded">
                    {m.readinessScore}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-border rounded-2xl p-6 bg-white shadow-sm">
              <h4 className="font-display font-extrabold text-base text-ink mb-3.5">Agreement progress</h4>
              {(() => {
                const allAgreementTitles = [
                  "Decision-making style",
                  "Membership terms",
                  "Exit terms",
                  "Communication expectations",
                  "Timeline expectations"
                ];
                const alignedCount = pod.aligned_agreements ? pod.aligned_agreements.length : 0;
                const alignedPercent = (alignedCount / 5) * 100;
                
                const alignedTitles = allAgreementTitles.filter((_, idx) => pod.aligned_agreements?.includes(idx));
                const openTitles = allAgreementTitles.filter((_, idx) => !pod.aligned_agreements?.includes(idx));
                
                let summaryText = "";
                if (alignedCount === 5) {
                  summaryText = "All 5 core governance draft sections are aligned and agreed upon by the members.";
                } else if (alignedCount === 0) {
                  summaryText = "No agreement sections have been aligned yet. The group is still discussing the social draft.";
                } else {
                  summaryText = `${alignedTitles.slice(0, 2).join(" and ")}${alignedTitles.length > 2 ? ", etc." : ""} are aligned — ${openTitles.slice(0, 2).join(" and ")} are still open.`;
                }

                return (
                  <>
                    <div className="flex flex-col mb-4">
                      <div className="flex justify-between items-center text-sm font-bold text-ink mb-1.5">
                        <span>Completion</span>
                        <span className="font-mono text-xs">{alignedCount} / 5</span>
                      </div>
                      <div className="h-1 bg-border rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber transition-all duration-300" 
                          style={{ width: `${alignedPercent}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-ink-dim leading-relaxed">
                      {summaryText}
                    </p>
                  </>
                );
              })()}
            </div>

            <div className="border border-border rounded-2xl p-6 bg-white shadow-sm">
              <h4 className="font-display font-extrabold text-base text-ink mb-3">Recent chat activity</h4>
              <div className="border border-border rounded-xl bg-[#FAFCFF] overflow-hidden">
                <div className="p-3 space-y-2 h-[100px] overflow-y-auto text-xs leading-normal">
                  <div className="bg-white border border-border/80 p-2.5 rounded-lg rounded-tl-none max-w-[90%] text-left">
                    <span className="block font-bold text-ink-dim mb-0.5">System</span>
                    Pod was formed successfully.
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-ink-dim font-medium italic mt-2.5">
                Admin view is read-only — messages can't be sent from here.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => setActiveScreen('admin-pod-management')}
        className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-6"
      >
        Back to Pod Management
      </button>
    </div>
  );
}
