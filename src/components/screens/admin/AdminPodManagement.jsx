import React from 'react';

export default function AdminPodManagement({ setActiveScreen }) {
  return (
    <div className="w-full text-left select-none">
          <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Admin / Pod Management</div>
          <h3 className="font-display font-extrabold text-2xl text-ink mb-2">Pod management</h3>
          <p className="text-ink-dim text-sm leading-relaxed mb-5 max-w-[520px]">
            The <b className="text-ink">Origin</b> column shows whether a Pod formed through the matching engine or was self-registered by a group that already knew each other.
          </p>

          <div className="border border-border rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-border text-ink font-semibold select-none text-xs uppercase tracking-wider">
                    <th className="p-4 px-6">Pod</th>
                    <th className="p-4 px-6">Origin</th>
                    <th className="p-4 px-6">Members</th>
                    <th className="p-4 px-6">Health</th>
                    <th className="p-4 px-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-ink-dim font-medium">
                      No active pods found.
                    </td>
                  </tr>
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
