import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { customResetPassword } from '../../../auth';
import Toast from '../../Toast';

export default function ResetPasswordPage({ setActiveScreen }) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [loading, setLoading] = useState(false);

  // Extract email and token query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email') || '';
    const tokenParam = params.get('token') || '';
    setEmail(emailParam);
    setToken(tokenParam);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setToast({ show: true, message: 'Missing email address from the reset link.', type: 'error' });
      return;
    }
    if (!token) {
      setToast({ show: true, message: 'Missing verification token from the reset link.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setToast({ show: true, message: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ show: true, message: 'Passwords do not match!', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await customResetPassword(email, token, newPassword);
      setToast({ show: true, message: 'Password reset successfully! Please log in.', type: 'success' });
      
      // Clean up URL search query parameters
      if (window.history.replaceState) {
        const urlWithoutParams = window.location.protocol + '//' + window.location.host + window.location.pathname;
        window.history.replaceState({ path: urlWithoutParams }, '', urlWithoutParams);
      }

      setTimeout(() => {
        setNewPassword('');
        setConfirmPassword('');
        setActiveScreen('landing');
      }, 2000);
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to reset password.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade py-16 px-6 max-w-[540px] mx-auto text-center select-none">
      <div className="w-full bg-white border border-border rounded-2xl p-10 shadow-custom flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-[14px] bg-amber-soft text-amber inline-flex items-center justify-center text-xl mb-4 shadow-sm">
          <Lock className="w-5 h-5" />
        </div>

        <h1 className="font-display text-[26px] font-extrabold text-ink mb-1.5">Reset password</h1>
        <p className="text-ink-dim text-sm leading-relaxed mb-6">
          Set a secure new password for your account associated with <span className="font-bold text-ink">{email || 'your email'}</span>.
        </p>

        <form onSubmit={handleSubmit} className="w-full text-left">
          <div className="mb-4">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

          <div className="mb-6">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-panel border border-border rounded-lg pl-3.5 pr-10 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink cursor-pointer focus:outline-none flex items-center justify-center"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-white rounded-lg py-2.5 text-sm font-bold hover:bg-[#2450C4] hover:-translate-y-[1px] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Resetting...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>
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
