import React from 'react';

export default function CommonsChat({
  currentPod,
  currentUser,
  chatMessages,
  chatInput,
  setChatInput,
  chatLogRef,
  handleSendChatMessage,
  setActiveScreen
}) {
  return (
    <div className="pad py-12 px-6 md:px-8 text-left animate-fade">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">The Commons / Chat</div>
      <h3 className="font-display font-extrabold text-2xl text-ink mb-1">Pod chat</h3>
      <p className="text-ink-dim text-[14px] leading-relaxed mb-6 max-w-[560px]">
        Connect and stay aligned with your Pod members in real-time.
      </p>

      <div className="border border-border rounded-2xl bg-white shadow-custom max-w-[680px] overflow-hidden flex flex-col h-[520px]">
        {/* Header bar */}
        <div className="border-b border-border p-4.5 px-6 bg-[#F8FAFC] flex justify-between items-center">
          <div className="flex flex-col text-left">
            <h4 className="font-display font-extrabold text-[15.5px] text-ink leading-tight">
              {currentPod.name}
            </h4>
            <span className="text-[11px] text-ink-dim font-semibold mt-0.5">
              {currentPod.members.length + 1} Active Members • Online
            </span>
          </div>

          <div className="flex -space-x-1.5 overflow-hidden">
            {currentPod.members.map((m, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[9px] font-display border border-white flex-shrink-0">
                {(m.name || 'U').substring(0, 1).toUpperCase()}
              </div>
            ))}
            {currentUser?.avatar_url && (currentUser.avatar_url.startsWith('http') || currentUser.avatar_url.startsWith('/') || currentUser.avatar_url.startsWith('assets/') || currentUser.avatar_url.startsWith('data:image/')) ? (
              <img src={currentUser.avatar_url} className="w-7 h-7 rounded-full object-cover border border-white" alt="" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-amber flex items-center justify-center text-white font-extrabold text-[9px] font-display border border-white flex-shrink-0">
                {(currentUser?.name || 'U').substring(0, 1).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages Log */}
        <div
          ref={chatLogRef}
          className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#FAFCFF] scroll-smooth"
        >
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex gap-3 max-w-[85%] ${msg.isMe ? 'ml-auto flex-row-reverse text-right' : 'text-left'}`}>
              {msg.avatar ? (
                <img src={msg.avatar} className="w-8.5 h-8.5 rounded-full object-cover border border-border mt-0.5 flex-shrink-0" alt={msg.sender} />
              ) : (
                <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center text-white font-extrabold text-[11px] font-display border border-border mt-0.5 flex-shrink-0 ${msg.isMe ? 'bg-amber' : 'bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)]'
                  }`}>
                  {(msg.sender || 'U').substring(0, 1).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                {!msg.isMe && (
                  <span className="text-[11.5px] font-bold text-ink mb-1">
                    {msg.sender}
                  </span>
                )}
                <div className={`p-3 px-4 rounded-2xl text-[13px] leading-relaxed relative ${msg.isMe
                  ? 'bg-amber text-white rounded-tr-none'
                  : 'bg-white border border-border text-ink rounded-tl-none shadow-sm'
                  }`}>
                  {msg.text}
                  <span className={`block text-[9.5px] mt-1.5 font-mono ${msg.isMe ? 'text-white/60' : 'text-ink-dim/70'
                    }`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Row */}
        <form onSubmit={handleSendChatMessage} className="border-t border-border p-4.5 bg-white flex flex-col gap-2">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Type a message to ${currentPod.name}...`}
              className="flex-1 bg-panel border border-border rounded-full px-4.5 py-2.5 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium"
            />
            <button
              type="submit"
              className="bg-amber text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#2450C4] active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Send
            </button>
          </div>
          <span className="text-[10px] text-ink-dim font-mono text-center italic mt-0.5">
            Prototype Chat Simulation (Client-Only State • Phase 1 Scope)
          </span>
        </form>
      </div>

      <button
        onClick={() => setActiveScreen('commons-dashboard')}
        className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-6"
      >
        Back to dashboard
      </button>
    </div>
  );
}
