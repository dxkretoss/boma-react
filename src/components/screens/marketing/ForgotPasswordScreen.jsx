import React from 'react';

export default function ForgotPasswordScreen({ setActiveScreen }) {
  return (
    <div className="animate-fade py-16 px-4">
      <div className="max-w-[440px] mx-auto p-8 border border-border rounded-2xl bg-white shadow-custom flex flex-col text-left select-none">
        <h3 className="font-display font-extrabold text-[22px] text-ink mb-5">
          Reset your password
        </h3>
        <div className="mb-5">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Email</label>
          <input type="email" placeholder="jordan@email.com" className="w-full bg-panel border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" />
        </div>
        <button
          onClick={() => setActiveScreen('reset-password')}
          className="w-full bg-ink text-white rounded-lg px-4 py-2.5 text-sm font-bold hover:bg-[#2450C4] hover:-translate-y-[1px] transition-all cursor-pointer shadow-md"
        >
          Send reset link
        </button>
      </div>
    </div>
  );
}
