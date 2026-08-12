import React from 'react';

export default function ForgotPassword({
  handleForgot,
  setAuthOverlay,
  forgotEmail,
  setForgotEmail,
  loading
}) {
  return (
    <form onSubmit={handleForgot}>
      <h3 className="font-display text-[22px] font-extrabold text-ink mb-1">
        Reset your password
      </h3>
      <p className="text-ink-dim text-[13px] font-medium mb-6">
        We'll email you a reset link.
      </p>

      <div className="mb-5">
        <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Email</label>
        <input 
          type="email" 
          placeholder="jordan@email.com" 
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
          required 
          className="w-full bg-panel border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" 
        />
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-ink text-white rounded-lg px-4 py-2.5 text-sm font-bold hover:bg-[#2450C4] hover:-translate-y-[1px] transition-all cursor-pointer shadow-md mb-4 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Sending link...</span>
          </>
        ) : (
          <span>Send reset link</span>
        )}
      </button>

      <p className="text-center text-[13px] font-medium text-ink-dim">
        <span onClick={() => setAuthOverlay({ open: true, mode: 'login' })} className="text-teal underline cursor-pointer hover:text-ink">
          Back to log in
        </span>
      </p>
    </form>
  );
}
