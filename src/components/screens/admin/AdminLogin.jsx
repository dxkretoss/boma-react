import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { customLogin } from '../../../auth';

export default function AdminLogin({ setActiveScreen, setAdminUser, currentScreen }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await customLogin(email, password);
      if (user.role !== 'admin' || user.email.toLowerCase().trim() !== 'boma@admin.com') {
        throw new Error('Access denied. Only the master admin account can access this panel.');
      }
      localStorage.setItem('boma_admin_user', JSON.stringify(user));
      setAdminUser(user);
      if (currentScreen && currentScreen !== 'admin-login') {
        setActiveScreen(currentScreen);
      } else {
        setActiveScreen('admin-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Incorrect credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-12 bg-white animate-fade">
      {/* Left Side: Editorial Image & Brand Narrative (Full Screen Left Half) */}
      <div className="md:col-span-5 lg:col-span-5 relative bg-aubergine text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden min-h-[360px] md:min-h-screen">
        {/* Background Image with Warm Aubergine Gradient Overlay */}
        <img
          src="/assets/hero_bg.jpg"
          alt="BOMA Living Architecture"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-45 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2E2330] via-[#2E2330]/80 to-[#2E2330]/50" />

        {/* Top Brand Logo & Portal Badge */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <img
            src="/assets/logo1.png"
            alt="BOMA Living"
            className="h-8 sm:h-9 w-auto max-w-[140px] object-contain brightness-0 invert opacity-95"
          />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#D7A27A] font-mono text-[10px] font-bold uppercase tracking-widest">
            <Shield className="w-3 h-3 text-[#C46A4A]" />
            Admin Console
          </div>
        </div>

        {/* Center Editorial Quote & Heading */}
        <div className="relative z-10 my-auto py-10 max-w-[440px]">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#D7A27A] font-bold mb-3">
            BOMA Central Management
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.15] text-[#F5F1EA] mb-4">
            Governance &amp; Community Operations
          </h1>
          <p className="text-sm sm:text-base text-[#E7DED0]/85 leading-relaxed font-light">
            Review member applications, manage readiness scoring guidelines, and support pod formations.
          </p>
        </div>

        {/* Bottom Assurance */}
        <div className="relative z-10 pt-6 border-t border-white/15 flex items-center justify-between text-xs text-[#E7DED0]/75 font-mono">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#D7A27A]" />
            <span>Administrative Workspace</span>
          </div>
          <span>BOMA Living</span>
        </div>
      </div>

      {/* Right Side: Authentication Box (Full Screen Right Half) */}
      <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 bg-white min-h-[500px] md:min-h-screen">
        <div className="max-w-[420px] w-full mx-auto">
          {/* Header */}
          <div className="mb-8 text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-soft flex items-center justify-center text-amber mb-4 shadow-xs">
              <Lock className="w-6 h-6 text-[#C46A4A]" />
            </div>
            <h2 className="font-serif text-3xl sm:text-[34px] font-bold text-ink leading-tight mb-2">
              Admin Sign In
            </h2>
            <p className="text-sm text-ink-dim font-medium leading-relaxed">
              Enter your administrator credentials below to access the console.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full bg-[#FDE8E8] text-rust border border-rust/20 p-4 rounded-xl text-xs font-semibold mb-6 animate-fade text-left">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-dim mb-2 font-bold">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="boma@admin.com"
                required
                className="w-full bg-[#FBF9F5] border border-border rounded-xl px-4 py-3.5 text-sm text-ink placeholder:text-ink-dim/50 focus:bg-white focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/15 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-dim mb-2 font-bold">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#FBF9F5] border border-border rounded-xl pl-4 pr-11 py-3.5 text-sm text-ink placeholder:text-ink-dim/50 focus:bg-white focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/15 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink cursor-pointer focus:outline-none p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber hover:bg-[#b05d3e] text-white font-semibold py-4 px-6 rounded-full shadow-md hover:shadow-lg hover:shadow-amber/25 hover:-translate-y-[1px] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {loading ? (
                  'Signing in...'
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer note */}
          <div className="mt-10 pt-6 border-t border-border flex items-center justify-between text-xs text-ink-dim">
            <span>BOMA Living</span>
            <span>Admin Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
}

