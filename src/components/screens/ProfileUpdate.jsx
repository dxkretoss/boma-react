import React from 'react';
import { Loader2, Upload } from 'lucide-react';
import { updateUser } from '../../api/users';

export default function ProfileUpdate({
  currentUser,
  setCurrentUser,
  editName,
  setEditName,
  fileInputRef,
  uploadingAvatar,
  handleAvatarChange,
  setActiveScreen,
  showToast
}) {
  return (
    <div className="pad py-12 px-6 md:px-8 text-left">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Profile / Edit Profile</div>
      <h3 className="font-display font-extrabold text-2xl text-ink mb-5">Profile</h3>

      <div className="border border-border rounded-2xl p-6 bg-white shadow-sm max-w-[520px]">
        {/* Avatar Upload Section */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border/60">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer w-[80px] h-[80px] rounded-full border border-border bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm"
            title="Change Profile Image"
          >
            {currentUser?.avatar_url && (currentUser.avatar_url.startsWith('http') || currentUser.avatar_url.startsWith('/') || currentUser.avatar_url.startsWith('assets/') || currentUser.avatar_url.startsWith('data:image/')) ? (
              <img
                src={currentUser.avatar_url}
                className="w-full h-full object-cover rounded-full"
                alt="Profile"
              />
            ) : (
              <div className="w-full h-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-2xl font-display">
                {(currentUser?.name || currentUser?.email || 'U').substring(0, 1).toUpperCase()}
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {uploadingAvatar ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <>
                  <Upload className="w-4 h-4 text-white mb-0.5" />
                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider">Change</span>
                </>
              )}
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex flex-col">
            <span className="text-sm font-bold text-ink mb-1">{currentUser?.name || 'User'}</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="text-[12px] text-[#2F5FE0] font-bold hover:underline cursor-pointer disabled:opacity-50 text-left flex items-center gap-1"
            >
              {uploadingAvatar ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="w-3 h-3" /> Upload new photo</>
              )}
            </button>
          </div>
        </div>

        {/* Display Name */}
        <div className="mb-6">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Display name</label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder={currentUser?.name || 'Your name'}
            className="w-full bg-panel border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-semibold"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setActiveScreen('profile')}
            className="bg-transparent border border-border text-ink rounded-lg py-2 px-5 text-sm font-bold hover:bg-panel-alt transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (currentUser?.id && editName.trim()) {
                try {
                  const updatedUser = await updateUser(currentUser.id, { name: editName.trim() });
                  if (setCurrentUser) {
                    setCurrentUser({ ...currentUser, name: editName.trim() });
                  }
                  showToast("Profile updated successfully!", "success");
                } catch (err) {
                  console.error('Error updating profile:', err);
                  showToast("Failed to save profile changes.", "error");
                }
              }
              setActiveScreen('profile');
            }}
            className="bg-ink text-white rounded-lg py-2 px-5 text-sm font-bold hover:bg-[#2450C4] transition-all cursor-pointer shadow-md"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
