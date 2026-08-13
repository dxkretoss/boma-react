import React from 'react';

export default function SignupScreen({ setActiveScreen }) {
  return (
    <div className="animate-fade py-16 px-4">
      <div className="max-w-[440px] mx-auto p-8 border border-border rounded-2xl bg-white shadow-custom flex flex-col text-left ">
        <div className="font-mono text-[10px] uppercase tracking-wider text-amber mb-1.5 font-bold">Create Account</div>
        <h3 className="font-display font-extrabold text-[22px] text-ink mb-5">
          Join BOMA
        </h3>

        <div className="mb-3">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Full name</label>
          <input type="text" placeholder="Jordan Lee" className="w-full bg-panel border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Email</label>
          <input type="email" placeholder="jordan@email.com" className="w-full bg-panel border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Password</label>
          <input type="password" placeholder="••••••••" className="w-full bg-panel border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" />
        </div>
        <div className="mb-5">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Confirm password</label>
          <input type="password" placeholder="••••••••" className="w-full bg-panel border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" />
        </div>

        <button
          onClick={() => setActiveScreen('verify-email')}
          className="w-full bg-ink text-white rounded-lg px-4 py-2.5 text-sm font-bold hover:bg-[#2450C4] hover:-translate-y-[1px] transition-all cursor-pointer shadow-md mb-4"
        >
          Create account
        </button>
        <p className="text-center text-[12.5px] font-semibold text-ink-dim">
          Already have an account?{' '}
          <span onClick={() => setActiveScreen('login')} className="text-teal underline cursor-pointer hover:text-ink">
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}
