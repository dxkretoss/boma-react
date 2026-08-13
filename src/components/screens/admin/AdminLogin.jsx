import React, { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
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
      setAdminUser(user);
      localStorage.setItem('boma_admin_user', JSON.stringify(user));
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
    <div className="max-w-[420px] mx-auto py-20 px-6 animate-fade">
      <div className="bg-panel border border-border rounded-custom p-8 shadow-custom flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-teal-soft flex items-center justify-center text-teal mb-4">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="font-display font-extrabold text-[22px] text-ink mb-2">BOMA Admin Portal</h3>
        <p className="text-xs text-ink-dim font-medium text-center mb-6">Enter your administrator credentials below to access the console</p>

        {error && (
          <div className="w-full bg-[#FDE8E8] text-rust border border-rust/10 p-3 rounded-lg text-xs font-semibold text-center mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full text-left">
          <div className="mb-4">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Admin Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@boma.com" 
              required
              className="w-full bg-white border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" 
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
                className="w-full bg-white border border-border rounded-lg pl-3.5 pr-10 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink cursor-pointer focus:outline-none flex items-center justify-center"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-ink text-white rounded-lg px-4 py-2.5 text-sm font-bold hover:bg-[#2450C4] hover:-translate-y-[1px] transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Secure Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}
