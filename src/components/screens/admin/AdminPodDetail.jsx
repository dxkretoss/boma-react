import React from 'react';


export default function AdminPodDetail({ setActiveScreen, adminViewPodId, podData }) {
  const pod = podData[adminViewPodId] || podData.cedar;
  if (!pod) return null;
  return (
    <div className="w-full text-left select-none">
          <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Admin / Pod Management / Commons View</div>
          
          <div className="w-full text-left select-none animate-fade">
        <div className="relative w-full rounded-2xl overflow-hidden h-[240px] mb-6 shadow-custom border border-border/5">
          <img src={`/${pod.photo}`} className="w-full h-full object-cover" alt={pod.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/40 to-transparent p-6 md:p-8 flex items-end">
            <div className="text-white">
              <h1 className="font-display font-extrabold text-[26px] md:text-[32px] leading-tight mb-1">
                {pod.name}
              </h1>
              <span className="text-[13px] text-[#A3B3C8] font-semibold">
                {pod.location} · Formed {pod.formed} · {pod.origin} · <span className="text-amber-soft font-bold">Admin View</span>
              </span>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 select-none text-center">
          <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
            <div className="font-display text-[26px] font-extrabold text-ink leading-tight">{pod.members.length + 1}</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Members</div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
            <div className="font-display text-[26px] font-extrabold text-ink leading-tight">{pod.avgReadiness}</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Avg. Readiness</div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
            <div className="font-display text-[26px] font-extrabold text-ink leading-tight text-sage">{pod.health}</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Pod Health</div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
            <div className="font-display text-[18px] font-extrabold text-ink leading-[32px] overflow-hidden truncate px-1">{pod.formed}</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Formed</div>
          </div>
        </div>

        {/* Members & Agreements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-6">
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col">
            <h4 className="font-display font-extrabold text-base text-ink mb-4">Members</h4>
            <div className="space-y-4">
              {pod.members.map((m, i) => (
                <div key={i} className="flex justify-between items-center gap-3 border-b border-border/70 last:border-b-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-3">
                    <img src={`https://i.pravatar.cc/80?img=${m.img}`} className="w-9 h-9 rounded-full object-cover border border-border" alt={m.name} />
                    <div className="flex flex-col">
                      <b className="text-sm font-bold text-ink leading-tight">{m.name}</b>
                      <span className="text-xs text-ink-dim font-medium mt-0.5">{m.detail}</span>
                    </div>
                  </div>
                  <span className="bg-[#EAFDF8] text-sage border border-sage/10 text-[10.5px] font-bold px-2 py-0.5 rounded">
                    {m.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-border rounded-2xl p-6 bg-white shadow-sm">
              <h4 className="font-display font-extrabold text-base text-ink mb-3.5">Agreement progress</h4>
              <div className="flex flex-col mb-4">
                <div className="flex justify-between items-center text-sm font-bold text-ink mb-1.5">
                  <span>Completion</span>
                  <span className="font-mono text-xs">2 / 5</span>
                </div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-amber w-[40%]" />
                </div>
              </div>
              <p className="text-xs text-ink-dim leading-relaxed">
                Decision-making style and membership terms are set — exit terms and communication expectations are still open.
              </p>
            </div>

            <div className="border border-border rounded-2xl p-6 bg-white shadow-sm">
              <h4 className="font-display font-extrabold text-base text-ink mb-3">Recent chat activity</h4>
              <div className="border border-border rounded-xl bg-[#FAFCFF] overflow-hidden">
                <div className="p-3 space-y-2 h-[100px] overflow-y-auto text-xs leading-normal">
                  <div className="bg-white border border-border/80 p-2.5 rounded-lg rounded-tl-none max-w-[90%] text-left">
                    <span className="block font-bold text-ink-dim mb-0.5">Sam Rivera</span>
                    Excited to have you here, Jordan!
                  </div>
                  <div className="bg-amber text-white p-2.5 rounded-lg rounded-tr-none max-w-[90%] ml-auto text-right">
                    Thanks — looking forward to getting to know everyone.
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
