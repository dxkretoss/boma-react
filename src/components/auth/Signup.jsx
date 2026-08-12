import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Signup({
  signupName,
  setSignupName,
  signupEmail,
  setSignupEmail,
  signupPassword,
  setSignupPassword,
  signupConfirmPassword,
  setSignupConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  handleSignup,
  loginWithGoogle,
  setAuthOverlay
}) {
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );

  return (
    <form onSubmit={handleSignup}>
      <h3 className="font-display text-[22px] font-extrabold text-ink mb-1">
        Create your account
      </h3>
      <p className="text-ink-dim text-[13px] font-medium mb-6">
        Takes about a minute — onboarding comes next.
      </p>

      <button
        type="button"
        onClick={loginWithGoogle}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-border rounded-full bg-white text-ink text-[13.5px] font-bold shadow-sm hover:bg-panel-alt transition-all cursor-pointer mb-5"
      >
        <GoogleIcon />
        <span>Sign up with Google</span>
      </button>

      <div className="flex items-center gap-3 mb-5 select-none">
        <div className="flex-1 h-[1px] bg-border"></div>
        <span className="text-[10.5px] text-ink-dim font-semibold uppercase tracking-wider">
          or sign up with email
        </span>
        <div className="flex-1 h-[1px] bg-border"></div>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Full name</label>
        <input 
          type="text" 
          placeholder="Jordan Lee" 
          value={signupName}
          onChange={(e) => setSignupName(e.target.value)}
          required 
          className="w-full bg-panel border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" 
        />
      </div>
      <div className="mb-3">
        <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Email</label>
        <input 
          type="email" 
          placeholder="jordan@email.com" 
          value={signupEmail}
          onChange={(e) => setSignupEmail(e.target.value)}
          required 
          className="w-full bg-panel border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" 
        />
      </div>
      <div className="mb-3">
        <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Password</label>
        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••" 
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
            required 
            className="w-full bg-panel border border-border rounded-lg pl-3.5 pr-10 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink cursor-pointer flex items-center justify-center"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className="mb-5">
        <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Confirm password</label>
        <div className="relative">
          <input 
            type={showConfirmPassword ? "text" : "password"} 
            placeholder="••••••••" 
            value={signupConfirmPassword}
            onChange={(e) => setSignupConfirmPassword(e.target.value)}
            required 
            className="w-full bg-panel border border-border rounded-lg pl-3.5 pr-10 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" 
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink cursor-pointer flex items-center justify-center"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <button type="submit" className="w-full bg-ink text-white rounded-lg px-4 py-2.5 text-sm font-bold hover:bg-[#2450C4] hover:-translate-y-[1px] transition-all cursor-pointer shadow-md mb-4">
        Create account
      </button>
      <p className="text-center text-[13px] font-medium text-ink-dim">
        Already have an account?{' '}
        <span onClick={() => setAuthOverlay({ open: true, mode: 'login' })} className="text-teal underline cursor-pointer hover:text-ink">
          Log in
        </span>
      </p>
    </form>
  );
}
