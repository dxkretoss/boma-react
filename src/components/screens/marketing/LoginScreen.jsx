import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { customLogin } from '../../../auth';
import Toast from '../../Toast';

export default function LoginScreen({ setActiveScreen, setUserOnboarded, setCurrentUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setToast({ show: true, message: 'Please enter email and password.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const user = await customLogin(email, password);
      if (user.role === 'admin') {
        throw new Error('Invalid credentials');
      }
      setToast({ show: true, message: `Welcome back, ${user.name}!`, type: 'success' });
      
      if (setCurrentUser) {
        setCurrentUser(user);
      }
      if (setUserOnboarded) {
        setUserOnboarded(user.user_onboarded || false);
      }
      
      setTimeout(() => {
        setActiveScreen('profile');
        setEmail('');
        setPassword('');
      }, 1500);
    } catch (err) {
      setToast({ show: true, message: err.message || 'Login failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade py-16 px-4">
      <div className="max-w-[440px] mx-auto p-8 border border-border rounded-2xl bg-white shadow-custom flex flex-col text-left select-none">
        <div className="font-mono text-[10px] uppercase tracking-wider text-amber mb-1.5 font-bold">Welcome Back</div>
        <h3 className="font-display font-extrabold text-[22px] text-ink mb-5">
          Log in to BOMA
        </h3>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Email</label>
            <input 
              type="email" 
              placeholder="jordan@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-panel border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" 
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-panel border border-border rounded-lg pl-3.5 pr-10 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" 
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

          <p className="text-[13px] text-right">
            <span onClick={() => setActiveScreen('forgot-password')} className="text-teal underline font-medium hover:text-ink cursor-pointer">
              Forgot password?
            </span>
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-white rounded-lg px-4 py-2.5 text-sm font-bold hover:bg-[#2450C4] hover:-translate-y-[1px] transition-all cursor-pointer shadow-md mb-4"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-[12.5px] font-semibold text-ink-dim mt-4">
          New to BOMA?{' '}
          <span onClick={() => setActiveScreen('signup')} className="text-teal underline cursor-pointer hover:text-ink">
            Sign up
          </span>
        </p>
      </div>

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}
    </div>
  );
}
