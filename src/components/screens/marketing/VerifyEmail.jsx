import React, { useState } from 'react';
import { customResendVerification, customVerifyEmail } from '../../../auth';
import Toast from '../../Toast';

export default function VerifyEmail({ registeredEmail, setActiveScreen }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const handleResend = async () => {
    if (!registeredEmail) {
      setToast({ show: true, message: 'No registered email found. Please sign up again.', type: 'error' });
      return;
    }
    setResending(true);
    try {
      await customResendVerification(registeredEmail);
      setToast({ show: true, message: 'Verification code resent successfully!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: err.message || 'Resend failed.', type: 'error' });
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (!registeredEmail) {
      setToast({ show: true, message: 'No registered email found.', type: 'error' });
      return;
    }
    setVerifying(true);
    try {
      await customVerifyEmail(registeredEmail, verificationCode);
      setToast({ show: true, message: 'Email verified successfully!', type: 'success' });
      setTimeout(() => {
        setActiveScreen('learning');
      }, 1500);
    } catch (err) {
      setToast({ show: true, message: err.message || 'Verification failed.', type: 'error' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="animate-fade py-16 px-6 max-w-[800px] mx-auto text-center select-none">
      <div className="w-full bg-white border border-border rounded-2xl p-12 shadow-custom flex flex-col items-center justify-center">
        <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-3 font-semibold">One More Step</div>
        <h1 className="font-display text-[28px] font-extrabold text-ink mb-3">Check your inbox</h1>
        <p className="text-ink-dim text-sm leading-relaxed mb-6 max-w-[400px]">
          We sent a 6-digit verification code to <span className="font-bold text-ink">{registeredEmail || 'your email'}</span>.
        </p>

        {/* Code Input */}
        <div className="mb-6 w-full max-w-[280px]">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold text-left">Enter Code</label>
          <input 
            type="text" 
            maxLength={6}
            placeholder="123456" 
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            className="w-full text-center bg-panel border border-border rounded-lg px-3.5 py-2.5 text-lg font-bold font-mono tracking-[8px] text-ink focus:outline-none focus:border-amber transition-colors" 
          />
        </div>

        <div className="flex items-center gap-3.5 justify-center flex-wrap">
          <button
            disabled={resending}
            onClick={handleResend}
            className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-all cursor-pointer disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend email'}
          </button>
          <button
            disabled={verifying || verificationCode.length !== 6}
            onClick={handleVerify}
            className="bg-amber text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md hover:bg-[#2450C4] hover:-translate-y-[0.5px] transition-all cursor-pointer disabled:opacity-50"
          >
            {verifying ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </div>
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
