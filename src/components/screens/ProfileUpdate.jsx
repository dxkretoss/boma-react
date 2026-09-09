import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { updateUser, uploadUserAvatar } from '../../api/users';
import Avatar from '../Avatar';

export default function ProfileUpdate({
  currentUser,
  setCurrentUser,
  editName,
  setEditName,
  setActiveScreen,
  showToast
}) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAvatarPreview(null);
    setSelectedFile(null);
  }, [currentUser?.avatar_url]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Please select a valid image file (PNG, JPG, JPEG).", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB.", "error");
      return;
    }

    // Create a local preview for immediate visual feedback without saving to DB yet
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setAvatarPreview(null);
    setEditName(currentUser?.name || '');
    setActiveScreen('profile');
  };

  const handleSave = async () => {
    if (!currentUser?.id) return;
    setIsSaving(true);
    try {
      let finalAvatarUrl = currentUser?.avatar_url;

      // 1. If user selected a new avatar file, upload to storage bucket
      if (selectedFile) {
        finalAvatarUrl = await uploadUserAvatar(currentUser.id, selectedFile);
      }

      // 2. If name changed, update database
      const trimmedName = editName.trim() || currentUser?.name || 'User';
      const updatedUser = await updateUser(currentUser.id, {
        name: trimmedName,
        avatar_url: finalAvatarUrl
      });

      // 3. Update active session user state
      if (setCurrentUser) {
        setCurrentUser({
          ...currentUser,
          name: trimmedName,
          avatar_url: finalAvatarUrl
        });
      }

      showToast("Profile updated successfully!", "success");
      setActiveScreen('profile');
    } catch (err) {
      console.error('Error saving profile changes:', err);
      showToast(err.message || "Failed to save profile changes.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const previewUser = {
    ...currentUser,
    avatar_url: avatarPreview || currentUser?.avatar_url
  };

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
            <Avatar
              user={previewUser}
              className="w-full h-full"
              textClass="text-2xl"
              alt="Profile"
            />

            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Upload className="w-4 h-4 text-white mb-0.5" />
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider">Change</span>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />

          <div className="flex flex-col">
            <span className="text-sm font-bold text-ink mb-1">{currentUser?.name || 'User'}</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving}
              className="text-[12px] text-amber font-bold hover:underline cursor-pointer disabled:opacity-50 text-left flex items-center gap-1"
            >
              <Upload className="w-3 h-3" />
              Upload new photo
            </button>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Display name</label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder={currentUser?.name || 'Your name'}
            className="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-semibold"
          />
        </div>
      </div>

      {/* Standalone outside action buttons with standard rounded-xl radius */}
      <div className="flex items-center gap-3.5 mt-6">
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-amber hover:bg-[#b05d3e] text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-75"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving changes...
            </>
          ) : (
            'Save changes'
          )}
        </button>
      </div>
    </div>
  );
}
