import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Info,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Play,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  Layers,
  Sparkles,
  Link2,
  Image as ImageIcon,
  ArrowLeft,
  Video
} from 'lucide-react';
import {
  fetchLearningVideos,
  createLearningVideo,
  updateLearningVideo,
  deleteLearningVideo
} from '../../../api/learning';
import Pagination from '../../Pagination';

export default function AdminAboutBoma({ setActiveScreen, adminUser, showToast, showConfirm }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (isModalOpen || previewVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, previewVideo]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    category: 'GETTING_STARTED',
    sort_order: 1,
    is_published: true
  });

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await fetchLearningVideos();
      setVideos(data || []);
    } catch (err) {
      console.error('Error fetching learning videos:', err);
      if (showToast) showToast('Failed to load learning videos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleOpenAddModal = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      video_url: '',
      category: 'GETTING_STARTED',
      sort_order: videos.length + 1,
      is_published: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title || '',
      description: video.description || video.desc || '',
      video_url: video.video_url || video.url || '',
      category: video.category || video.tag || 'GETTING_STARTED',
      sort_order: video.sort_order ?? video.order_index ?? 1,
      is_published: video.is_published !== false
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVideo(null);
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.video_url.trim()) {
      if (showToast) showToast('Title and Video URL are required.');
      return;
    }

    try {
      setSaving(true);
      if (editingVideo && !editingVideo.id.startsWith('default-')) {
        await updateLearningVideo(editingVideo.id, formData);
        if (showToast) showToast('Learning video updated successfully!', 'success');
      } else {
        await createLearningVideo(formData);
        if (showToast) showToast('New learning video added successfully!', 'success');
      }
      handleCloseModal();
      await loadVideos();
    } catch (err) {
      console.error('Error saving video:', err);
      if (showToast) showToast(err.message || 'Failed to save video.');
    } finally {
      setSaving(false);
    }
  };
  const handleSubmit = handleSaveVideo;

  const handleDelete = (video) => {
    if (showConfirm) {
      showConfirm(
        'Delete Learning Video',
        `Are you sure you want to delete "${video.title}"? This video will be removed from the Member Learning Center.`,
        async () => {
          try {
            if (!video.id.startsWith('default-')) {
              await deleteLearningVideo(video.id);
            }
            if (showToast) showToast('Video deleted successfully.', 'success');
            await loadVideos();
          } catch (err) {
            console.error('Failed to delete video:', err);
            if (showToast) showToast(err.message || 'Failed to delete video.');
          }
        },
        'danger',
        'Delete Video'
      );
    }
  };

  const handleTogglePublished = async (video) => {
    try {
      if (!video.id.startsWith('default-')) {
        await updateLearningVideo(video.id, {
          is_published: !video.is_published
        });
        if (showToast) {
          showToast(`Video ${!video.is_published ? 'published' : 'unpublished'} successfully!`, 'success');
        }
        await loadVideos();
      } else {
        if (showToast) showToast('Please create this video guide before updating its status.', 'info');
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      if (showToast) showToast(err.message || 'Failed to update video status.');
    }
  };

  const totalPages = Math.ceil(videos.length / pageSize) || 1;
  const paginatedVideos = videos.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full text-left animate-fade">
      {/* Header */}
      <div className="flex flex-col gap-2.5 mb-6">
        <button
          onClick={() => setActiveScreen('admin-dashboard')}
          className="inline-flex items-center gap-1.5 text-ink-dim hover:text-amber text-xs font-bold transition-colors cursor-pointer w-fit p-0 border-0 bg-transparent"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber" />
              Admin / About BOMA
            </div>
            <h3 className="font-display font-extrabold text-2xl text-ink mb-1">
              About BOMA
            </h3>
            <p className="text-ink-dim text-sm leading-relaxed max-w-[620px]">
              Manage educational tutorial guides and video walkthroughs displayed dynamically in the Member Learning Hub and Mobile App.
            </p>
          </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            onClick={loadVideos}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white border border-border text-ink font-bold text-xs px-3.5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-ink-dim ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-amber text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#b05d3e] hover:-translate-y-0.5 transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Video Guide
          </button>
        </div>
      </div>
    </div>

      {/* Stats and Quick Info Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim font-semibold">Total Guides</span>
            <div className="font-display font-extrabold text-2xl text-ink mt-0.5">{videos.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-soft text-amber flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim font-semibold">Published to App</span>
            <div className="font-display font-extrabold text-2xl text-sage mt-0.5">
              {videos.filter(v => v.is_published !== false).length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-soft text-teal flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim font-semibold">Draft Guides</span>
            <div className="font-display font-extrabold text-2xl text-ink-dim mt-0.5">
              {videos.filter(v => v.is_published === false).length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-panel-alt text-ink-dim flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Video Cards Grid */}
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {loading ? (
            <div className="col-span-2 text-center py-16 bg-white border border-border rounded-2xl shadow-sm">
              <RefreshCw className="w-8 h-8 text-amber animate-spin mx-auto mb-3" />
              <p className="text-ink-dim font-medium text-sm">Loading learning videos...</p>
            </div>
          ) : paginatedVideos.length === 0 ? (
            <div className="col-span-2 text-center py-16 bg-white border border-border rounded-2xl shadow-sm">
              <BookOpen className="w-12 h-12 text-ink-dim/40 mx-auto mb-3" />
              <h4 className="font-display font-bold text-lg text-ink mb-1">No videos added yet</h4>
              <p className="text-ink-dim text-sm max-w-sm mx-auto mb-5">
                Click the button below to add your first tutorial or educational video.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="bg-amber text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#b05d3e] transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add First Video
              </button>
            </div>
          ) : (
            paginatedVideos.map((video, idx) => {
              const videoUrl = video.video_url || video.url || '';
              const thumbUrl = video.thumbnail_url || video.thumb || '/assets/pod_community_realistic.png';
              const desc = video.description || video.desc || '';
              const tag = video.tag || 'Getting Started';
              const isPublished = video.is_published !== false;

              return (
                <div
                  key={video.id || idx}
                  className="border border-border rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    {/* Thumbnail / Video header */}
                    <div className="relative h-48 bg-navy-deep overflow-hidden group">
                      <img
                        src={thumbUrl}
                        alt={video.title}
                        className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/pod_community_realistic.png';
                        }}
                      />
                      <div
                        onClick={() => setPreviewVideo({ title: video.title, url: videoUrl, desc })}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 text-navy-deep fill-navy-deep ml-0.5" />
                        </div>
                      </div>

                      <div className="absolute top-3 left-3">
                        <span className="bg-navy-deep/80 backdrop-blur-md text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                          {tag}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono flex items-center gap-1 ${
                            isPublished
                              ? 'bg-sage/90 text-white'
                              : 'bg-rust/90 text-white'
                          }`}
                        >
                          {isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4 className="font-display font-bold text-base text-ink leading-snug">
                          {video.title}
                        </h4>
                        <span className="text-[11px] font-mono text-ink-dim bg-panel-alt px-2 py-0.5 rounded shrink-0">
                          Order #{video.order_index ?? idx + 1}
                        </span>
                      </div>

                      <p className="text-xs text-ink-dim leading-relaxed mb-4 line-clamp-2">
                        {desc}
                      </p>

                      <div className="flex items-center gap-2 text-xs font-mono text-ink-dim bg-panel-alt/60 p-2 rounded-lg border border-border/60 overflow-hidden">
                        <Link2 className="w-3.5 h-3.5 text-amber shrink-0" />
                        <span className="truncate text-[11px]">{videoUrl}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-4 border-t border-border/80 bg-[#FAFCFF] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewVideo({ title: video.title, url: videoUrl, desc })}
                        className="inline-flex items-center gap-1 text-xs font-bold text-ink hover:text-navy-deep px-2.5 py-1.5 rounded-lg hover:bg-panel-alt transition-colors cursor-pointer"
                        title="Preview Video"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleTogglePublished(video)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-ink-dim hover:text-ink px-2.5 py-1.5 rounded-lg hover:bg-panel-alt transition-colors cursor-pointer"
                        title="Toggle Publish Status"
                      >
                        {isPublished ? (
                          <span className="text-rust flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Unpublish
                          </span>
                        ) : (
                          <span className="text-sage flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Publish
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(video)}
                        className="p-1.5 text-ink-dim hover:text-amber rounded-lg hover:bg-amber-soft/50 transition-colors cursor-pointer"
                        title="Edit Video"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(video)}
                        className="p-1.5 text-ink-dim hover:text-rust rounded-lg hover:bg-rust/10 transition-colors cursor-pointer"
                        title="Delete Video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!loading && videos.length > 0 && (
          <div className="bg-white border border-border rounded-2xl px-4 py-2 shadow-xs">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={videos.length}
              pageSize={pageSize}
              pageSizeOptions={[4, 6, 10, 20]}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Video Modal */}
      {isModalOpen && createPortal(
        <div
          onClick={handleCloseModal}
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 bg-navy-deep/60 backdrop-blur-sm animate-fade"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-custom-lg border border-border w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col text-left"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-soft text-amber flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-lg text-ink leading-tight">
                    {editingVideo ? 'Edit Learning Video' : 'Add New Learning Video'}
                  </h4>
                  <p className="text-xs text-ink-dim">
                    Configure tutorial details and video URL for web and mobile learning center.
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-ink-dim hover:text-ink hover:bg-panel-alt transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-ink mb-1.5">
                  Video Title <span className="text-rust">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Intro to BOMA Co-housing"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
                />
              </div>

              {/* Video Link */}
              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-ink mb-1.5">
                  Video Link (Embed URL / Video URL) <span className="text-rust">*</span>
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ or MP4 link"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 pl-9 text-sm font-medium text-ink focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
                  />
                </div>
                <p className="text-[11px] text-ink-dim mt-1">
                  Tip: Use embed format (e.g. <code>https://www.youtube.com/embed/VIDEO_ID</code>) or direct video URL.
                </p>
              </div>

              {/* Thumbnail Image */}
              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-ink mb-1.5">
                  Thumbnail Image URL <span className="text-rust">*</span>
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="/assets/pod_austin.png or https://images.unsplash.com/..."
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 pl-9 text-sm font-medium text-ink focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
                  />
                </div>
                {formData.thumbnail_url && (
                  <div className="mt-2 h-20 w-36 rounded-lg overflow-hidden border border-border relative bg-panel-alt">
                    <img
                      src={formData.thumbnail_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/pod_community_realistic.png';
                      }}
                    />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1 rounded">
                      Preview
                    </span>
                  </div>
                )}
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-ink mb-1.5">
                  Short Description <span className="text-rust">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what the member will learn in this quick video guide..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-border rounded-xl p-3 text-sm font-medium text-ink focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
                />
              </div>

              {/* Tag & Order Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold font-mono uppercase tracking-wider text-ink mb-1.5">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    placeholder="Getting Started"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm font-medium text-ink focus:outline-none focus:border-amber"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono uppercase tracking-wider text-ink mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm font-medium text-ink focus:outline-none focus:border-amber"
                  />
                </div>
              </div>

              {/* Published Switch */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 text-amber rounded border-border focus:ring-amber cursor-pointer"
                />
                <label htmlFor="is_published" className="text-xs font-bold text-ink cursor-pointer">
                  Publish to Member Learning Hub and Mobile App immediately
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-border text-ink font-bold text-xs hover:bg-panel-alt transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-amber text-white font-bold text-xs hover:bg-[#b05d3e] transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {editingVideo ? 'Save Changes' : 'Create Video'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Video Preview Modal */}
      {previewVideo && createPortal(
        <div
          onClick={() => setPreviewVideo(null)}
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 bg-navy-deep/75 backdrop-blur-md animate-fade"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-custom-lg border border-border w-full max-w-2xl overflow-hidden text-left"
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-[#F8FAFC]">
              <h4 className="font-display font-bold text-base text-ink truncate pr-4">
                {previewVideo.title}
              </h4>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1 rounded-lg text-ink-dim hover:text-ink hover:bg-panel-alt transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-navy-deep">
              {previewVideo.url ? (
                <iframe
                  src={previewVideo.url}
                  title={previewVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/70 p-6 text-center">
                  <Video className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm">No valid video URL specified.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white">
              <p className="text-xs text-ink-dim leading-relaxed">
                {previewVideo.desc}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
