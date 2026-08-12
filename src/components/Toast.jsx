import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ 
  message, 
  type = 'error', 
  onClose, 
  duration = 2500 
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3.5 bg-white border border-border rounded-xl p-4 shadow-custom-lg select-none min-w-[320px] max-w-[420px] animate-fade">
      {/* Icon Indicator */}
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isSuccess ? 'bg-[#EAFDF8] text-sage' : 'bg-red-50 text-red-600'
      }`}>
        {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      </div>

      {/* Content */}
      <div className="flex-1 text-left">
        <div className={`text-xs font-mono uppercase tracking-wider font-semibold ${
          isSuccess ? 'text-sage' : 'text-red-500'
        }`}>
          {isSuccess ? 'Success' : 'Error'}
        </div>
        <p className="text-ink-dim text-[13.5px] font-medium mt-0.5 leading-relaxed">
          {message}
        </p>
      </div>

      {/* Close Action */}
      <button 
        onClick={onClose}
        className="text-[#9CA3AF] hover:text-ink cursor-pointer p-0.5 hover:bg-panel-alt rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
