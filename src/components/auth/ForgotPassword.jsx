import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { customRequestPasswordReset, customResetPassword } from '../../auth';

export default function ForgotPassword({
  setAuthOverlay,
  forgotEmail,
  setForgotEmail,
  setToast,
  closeAuth
}) {
  const [step, setStep] = useState('request'); // 'request' | 'verify'
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  // Step 1: Request 6-digit OTP code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');

    const email = forgotEmail.trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await customRequestPasswordReset(email);
      setLocalSuccess(`Verification code sent to ${email}`);
      setStep('verify');
    } catch (err) {
      setLocalError(err.message || 'Failed to request reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP code
  const handleResendCode = async () => {
    setLocalError('');
    setResending(true);
    try {
      await customRequestPasswordReset(forgotEmail.trim());
      setLocalSuccess('A new verification code has been sent to your email.');
    } catch (err) {
      setLocalError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  // Step 2: Reset Password with OTP Code
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');

    const token = otpCode.trim();
    if (!token) {
      setLocalError('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await customResetPassword(forgotEmail.trim(), token, newPassword);
      if (setToast) {
        setToast({ show: true, message: 'Password reset successfully! Please sign in with your new password.', type: 'success' });
      }
      // Return to login screen
      setAuthOverlay({ open: true, mode: 'login' });
    } catch (err) {
      setLocalError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-left animate-fade">
      {step === 'request' ? (
        <form onSubmit={handleRequestCode}>
          <h3 className="font-serif text-[26px] font-bold text-ink mb-1">
            Reset your password
          </h3>
          <p className="text-ink-dim text-[13px] font-medium mb-6 font-light">
            Enter your email to receive a 6-digit verification code.
          </p>

          {localError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-rust text-xs rounded-xl p-3 font-medium">
              {localError}
            </div>
          )}

          <div className="mb-5">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">
              Email
            </label>
            <input 
              type="email" 
              placeholder="jordan@email.com" 
              value={forgotEmail}
              onChange={(e) => {
                setForgotEmail(e.target.value);
                setLocalError('');
              }}
              required 
              disabled={loading}
              className="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber text-white rounded-full px-4 py-3 text-sm font-semibold hover:bg-[#b05d3e] hover:shadow-lg hover:shadow-[#C46A4A]/25 hover:-translate-y-[1px] transition-all cursor-pointer shadow-md mb-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending code...</span>
              </>
            ) : (
              <span>Send verification code</span>
            )}
          </button>

          <p className="text-center text-[13px] font-medium text-ink-dim">
            <span onClick={() => setAuthOverlay({ open: true, mode: 'login' })} className="text-amber underline cursor-pointer hover:text-[#b05d3e]">
              Back to log in
            </span>
          </p>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={() => {
                setStep('request');
                setLocalError('');
                setLocalSuccess('');
              }}
              className="text-ink-dim hover:text-ink cursor-pointer p-1 -ml-1 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="font-serif text-[24px] font-bold text-ink">
              Enter verification code
            </h3>
          </div>

          <p className="text-ink-dim text-[12.5px] font-medium mb-4 leading-relaxed">
            We sent a 6-digit OTP code to <strong className="text-ink">{forgotEmail}</strong>.
          </p>

          {localSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-3 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{localSuccess}</span>
            </div>
          )}

          {localError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-rust text-xs rounded-xl p-3 font-medium">
              {localError}
            </div>
          )}

          {/* OTP Code Input */}
          <div className="mb-4">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">
              6-Digit Verification Code
            </label>
            <input 
              type="text" 
              placeholder="123456" 
              maxLength={6}
              value={otpCode}
              onChange={(e) => {
                setOtpCode(e.target.value.replace(/[^0-9]/g, ''));
                setLocalError('');
              }}
              required 
              disabled={loading}
              className="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-center font-mono text-lg font-extrabold tracking-[0.25em] text-ink focus:outline-none focus:border-amber transition-colors" 
            />
          </div>

          {/* New Password */}
          <div className="mb-3.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">
              New Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setLocalError('');
                }}
                required 
                disabled={loading}
                className="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 pr-10 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-5">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">
              Confirm New Password
            </label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setLocalError('');
                }}
                required 
                disabled={loading}
                className="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 pr-10 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber text-white rounded-full px-4 py-3 text-sm font-semibold hover:bg-[#b05d3e] hover:shadow-lg hover:shadow-[#C46A4A]/25 hover:-translate-y-[1px] transition-all cursor-pointer shadow-md mb-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Resetting password...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </button>

          <div className="flex items-center justify-between text-xs text-ink-dim pt-1">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending || loading}
              className="text-amber hover:underline font-semibold cursor-pointer disabled:opacity-50"
            >
              {resending ? 'Resending code...' : 'Resend code'}
            </button>
            <span 
              onClick={() => setAuthOverlay({ open: true, mode: 'login' })} 
              className="text-ink-dim hover:text-ink underline cursor-pointer"
            >
              Back to log in
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
