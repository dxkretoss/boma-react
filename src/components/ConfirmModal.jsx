import React from 'react';
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info' // info | warning | danger
}) {
  if (!isOpen) return null;

  // Style helper based on type
  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-rust" />,
          iconBg: 'bg-red-50 text-rust border border-red-100',
          btnClass: 'bg-rust hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-6 h-6 text-amber" />,
          iconBg: 'bg-amber-soft/20 text-amber border border-amber/10',
          btnClass: 'bg-amber hover:bg-amber/90 text-white'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-6 h-6 text-ink" />,
          iconBg: 'bg-teal-soft text-ink border border-border',
          btnClass: 'bg-ink hover:bg-ink/90 text-white'
        };
    }
  };

  const cfg = getTypeConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/40 backdrop-blur-sm animate-fade text-left">
      {/* Modal Dialog Card */}
      <div 
        className="w-full max-w-[420px] bg-panel border border-border rounded-custom shadow-custom-lg overflow-hidden relative p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-ink-dim hover:text-navy-deep hover:bg-panel-alt rounded-lg p-1 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Row */}
        <div className="flex gap-4 items-start pt-2">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
            {cfg.icon}
          </div>
          <div className="flex flex-col text-left">
            <h4 className="font-display font-extrabold text-lg text-navy-deep leading-tight mb-2">
              {title}
            </h4>
            <p className="text-ink-dim text-[13.5px] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 justify-end mt-6">
          <button 
            onClick={onCancel}
            className="bg-transparent border border-border text-navy-deep hover:bg-panel-alt font-bold text-xs rounded-xl px-5 py-2.5 transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`font-bold text-xs rounded-xl px-5 py-2.5 transition-all cursor-pointer shadow-sm ${cfg.btnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
