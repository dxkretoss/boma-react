import React from 'react';

export default function CommonsSettings({
  isCreator,
  showConfirm,
  deletePod,
  leavePod,
  setActiveScreen
}) {
  return (
    <div className="pad py-12 px-6 md:px-8 text-left animate-fade">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">The Commons / Settings</div>
      <h3 className="font-display font-extrabold text-2xl text-ink mb-5">Pod settings</h3>

      <div className="space-y-4 max-w-[480px]">
        <div className="border border-border rounded-xl p-5 bg-white shadow-sm">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-2 font-semibold">Notifications</label>
          <select className="w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-amber cursor-pointer font-semibold">
            <option>All activity</option>
            <option>Mentions only</option>
            <option>Off</option>
          </select>
        </div>

        <div className="border border-border rounded-xl p-5 bg-white shadow-sm">
          <h4 className="font-display font-bold text-base text-rust mb-1">
            {isCreator ? 'Dissolve/Delete Pod' : 'Leave this Pod'}
          </h4>
          <p className="text-ink-dim text-xs leading-relaxed my-2">
            {isCreator
              ? 'As the group creator, dissolving this Pod will remove all members and invitations, returning everyone to the matching pool.'
              : "If this isn't the right fit, you can exit and return to the matching pool for another opportunity."}
          </p>
          {isCreator ? (
            <button
              onClick={() => {
                showConfirm(
                  'Dissolve Pod Group',
                  'Are you sure you want to delete/dissolve this Pod? This will remove all members and invitations, returning everyone to the matching pool.',
                  deletePod,
                  'danger',
                  'Dissolve Pod'
                );
              }}
              className="bg-transparent border border-rust text-rust rounded-lg px-4 py-2 text-xs font-bold hover:bg-red-50 transition-colors cursor-pointer mt-1"
            >
              Dissolve Pod
            </button>
          ) : (
            <button
              onClick={() => {
                showConfirm(
                  'Leave Pod Group',
                  'Are you sure you want to leave this Pod? You will be returned to the matching pool.',
                  leavePod,
                  'danger',
                  'Leave Pod'
                );
              }}
              className="bg-transparent border border-rust text-rust rounded-lg px-4 py-2 text-xs font-bold hover:bg-red-50 transition-colors cursor-pointer mt-1"
            >
              Exit Pod
            </button>
          )}
        </div>
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
