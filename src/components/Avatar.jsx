import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

// Global in-memory cache to prevent re-fetching signed URLs on tab switches
const avatarUrlCache = new Map();

export default function Avatar({ user, className = "w-8 h-8", textClass = "text-[12px]", alt = "" }) {
  const avatarKey = typeof user === 'string' ? user : (user?.avatar_url || user?.avatarUrl || user?.avatar || '');
  const initialResolved = avatarUrlCache.get(avatarKey) || avatarKey;
  
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState(initialResolved);
  const imgRef = useRef(null);

  // Sync state when avatarKey changes
  useEffect(() => {
    setHasError(false);
    const cached = avatarUrlCache.get(avatarKey);
    const newSrc = cached || avatarKey;
    setResolvedSrc(newSrc);

    // If already cached/loaded, check image complete status
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [avatarKey]);

  // Check if image loaded from browser cache on mount or src change
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [resolvedSrc]);

  const userName = typeof user === 'object' ? (user?.name || user?.email || user?.sender || '') : '';
  const initial = (userName || 'U').substring(0, 1).toUpperCase();

  const handleImageError = async () => {
    // If public URL fails (e.g. private bucket), fallback to signed URL and cache it
    if (resolvedSrc && resolvedSrc.includes('/avatars/') && !resolvedSrc.includes('/sign/')) {
      try {
        const parts = resolvedSrc.split('/avatars/');
        const filePath = parts[1]?.split('?')[0];
        if (filePath) {
          const { data, error } = await supabase.storage
            .from('avatars')
            .createSignedUrl(decodeURIComponent(filePath), 60 * 60 * 24 * 7); // 7 days

          if (!error && data?.signedUrl) {
            avatarUrlCache.set(avatarKey, data.signedUrl);
            setResolvedSrc(data.signedUrl);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not generate signed avatar fallback:', err);
      }
    }
    setHasError(true);
    setIsLoaded(true);
  };

  // If user has an avatar URL and no unrecoverable error
  if (resolvedSrc && !hasError) {
    return (
      <div className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center ${className}`}>
        {/* Skeleton shimmer pulse placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#EAE6DF] via-[#F5F2EB] to-[#EAE6DF] animate-pulse rounded-full border border-border/40 z-0" />
        )}
        <img
          ref={imgRef}
          src={resolvedSrc}
          alt={alt || userName || "Avatar"}
          onLoad={() => setIsLoaded(true)}
          onError={handleImageError}
          className={`w-full h-full rounded-full object-cover border border-border relative z-10 transition-opacity duration-200 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full bg-[linear-gradient(135deg,#C46A4A_0%,#2E2330_100%)] flex items-center justify-center text-white font-extrabold font-display shrink-0 ${textClass} ${className}`}
    >
      {initial}
    </div>
  );
}
