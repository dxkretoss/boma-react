import React from 'react';
import { Check } from 'lucide-react';

export default function CommonsAgreement({
  alignedAgreements,
  toggleAgreementItem,
  openAgreementDocModal,
  setActiveScreen
}) {
  return (
    <div className="pad py-12 px-6 md:px-8 text-left animate-fade">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">The Commons / Agreement</div>
      <h3 className="font-display font-extrabold text-2xl text-ink mb-1.5">Agreement scaffolding</h3>
      <p className="text-ink-dim text-[14px] leading-relaxed mb-6 max-w-[560px]">
        A working social draft — not a binding contract. Align on core rules here before formalizing with legal counsel in Phase 2.
      </p>

      <div className="border border-border rounded-2xl p-6 bg-white shadow-sm max-w-[560px]">
        {/* Progress Row */}
        <div className="flex flex-col mb-5">
          <div className="flex justify-between items-center text-sm font-bold text-ink mb-1.5">
            <span>Completion Status</span>
            <span className="font-mono text-xs">{alignedAgreements.length} / 5 Aligned</span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-amber transition-all duration-300"
              style={{ width: `${(alignedAgreements.length / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <ul className="divide-y divide-border">
          {[
            { title: "How we'll make group decisions", desc: "Consensus vote required for purchases > $1,000" },
            { title: "How new members can join later", desc: "75% Pod approval & readiness verification" },
            { title: "How someone can exit the Pod", desc: "60-day notice & equity transfer framework" },
            { title: "Shared expectations around communication", desc: "Weekly check-ins & shared Commons chat" },
            { title: "Timeline expectations before moving to Phase 2", desc: "90 days of Pod bonding prior to site selection" }
          ].map((item, idx) => {
            const isChecked = alignedAgreements.includes(idx);
            return (
              <li
                key={idx}
                onClick={() => toggleAgreementItem(idx)}
                className="flex gap-4 py-4.5 cursor-pointer first:pt-0 last:pb-0 group"
              >
                <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-amber border-amber text-white' : 'border-border bg-white group-hover:border-amber'
                  }`}>
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="flex flex-col text-left">
                  <b className="text-[13.5px] font-bold text-ink leading-snug">{item.title}</b>
                  <span className="text-[11.5px] text-ink-dim font-medium mt-1 leading-snug">{item.desc}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Document Preview card */}
      <div className="border border-dashed border-teal rounded-2xl p-6 bg-gradient-to-br from-bg to-white max-w-[560px] mt-5">
        <div className="flex gap-4 items-center mb-4 flex-wrap sm:flex-nowrap">
          <div className="w-11 h-11 rounded-xl bg-amber-soft text-amber flex items-center justify-center flex-shrink-0 text-xl font-bold">
            📄
          </div>
          <div className="text-left flex flex-col">
            <h4 className="font-display font-extrabold text-[15px] text-ink leading-tight">Draft Scaffolding Document</h4>
            <span className="text-xs text-ink-dim font-medium mt-0.5">Export as PDF or share with attorney before Phase 2</span>
          </div>
        </div>

        <button
          onClick={openAgreementDocModal}
          className="w-full bg-amber text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-[#2450C4] active:scale-95 transition-all text-center justify-center cursor-pointer shadow-md"
        >
          Preview &amp; Export Document (.PDF)
        </button>
      </div>

      <button
        onClick={() => setActiveScreen('commons-dashboard')}
        className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-6"
      >
        Back to dashboard
      </button>
    </div>
  );
}
