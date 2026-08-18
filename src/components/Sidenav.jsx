import React from 'react';
import {
  Sparkles,
  User,
  Edit3,
  Gauge,
  List,
  Search,
  Users,
  CheckCircle,
  Home,
  FileText,
  MessageSquare,
  Settings
} from 'lucide-react';

const ICON_MAP = {
  spark: Sparkles,
  user: User,
  edit: Edit3,
  gauge: Gauge,
  list: List,
  search: Search,
  users: Users,
  check: CheckCircle,
  home: Home,
  doc: FileText,
  chat: MessageSquare,
  gear: Settings,
  settings: Settings
};

const SIDENAV_CONFIG = {
  learning: {
    title: 'Learning Hub',
    items: [
      { id: 'learning', label: 'Learning Center', icon: 'spark' }
    ]
  },
  profile: {
    title: 'Profile',
    items: [
      { id: 'profile', label: 'Overview', icon: 'user' },
      { id: 'profile-edit', label: 'Edit Preferences', icon: 'edit' },
      { id: 'readiness-detail', label: 'Readiness Breakdown', icon: 'gauge' },
      { id: 'status-tracking', label: 'Status Tracker', icon: 'list' },
      { id: 'pod-history', label: 'My Pods', icon: 'home' },
      { id: 'profile-update', label: 'Profile', icon: 'settings' }
    ]
  },
  matching: {
    title: 'Matching',
    items: [
      { id: 'matching-status', label: 'Match Status', icon: 'search' },
      { id: 'pod-suggestion', label: 'Pod Suggestion', icon: 'spark' },
      { id: 'pod-preview', label: 'Pod Preview', icon: 'users' },
      { id: 'confirm-join', label: 'Confirmation', icon: 'check' }
    ]
  },
  commons: {
    title: 'The Commons',
    items: [
      { id: 'commons-dashboard', label: 'Dashboard', icon: 'home' },
      { id: 'commons-members', label: 'Members', icon: 'users' },
      { id: 'commons-agreement', label: 'Agreement', icon: 'doc' },
      { id: 'commons-chat', label: 'Chat', icon: 'chat' },
      { id: 'commons-settings', label: 'Settings', icon: 'gear' }
    ]
  },
  admin: {
    title: 'Admin Console',
    items: [
      { id: 'admin-dashboard', label: 'Dashboard', icon: 'home' },
      { id: 'admin-users', label: 'Users', icon: 'users' },
      { id: 'admin-matching', label: 'Matching Engine', icon: 'gauge' },
      { id: 'admin-pod-review', label: 'Pod Review', icon: 'spark' },
      { id: 'admin-existing-pod-queue', label: 'Existing Pod Queue', icon: 'list' },
      { id: 'admin-pod-management', label: 'Pods', icon: 'doc' },
      { id: 'admin-questions', label: 'Questions', icon: 'edit' },
      { id: 'admin-readiness-logic', label: 'Readiness Score Logic', icon: 'gauge' },
      { id: 'admin-waitlist', label: 'Waitlist', icon: 'list' },
      { id: 'admin-village-test', label: 'Village Test List', icon: 'doc' }
    ]
  }
};

export default function Sidenav({
  activeScreen,
  setActiveScreen,
  userOnboarded,
  currentUser
}) {
  // Determine which section we are in
  const getSectionKey = () => {
    if (activeScreen === 'learning') return 'learning';
    if (['profile', 'profile-update', 'profile-edit', 'readiness-detail', 'status-tracking', 'pod-history'].includes(activeScreen)) return 'profile';
    if (['matching-status', 'pod-suggestion', 'pod-preview', 'confirm-join'].includes(activeScreen)) return 'matching';
    if (activeScreen.startsWith('commons-')) return 'commons';
    if (activeScreen.startsWith('admin-')) return 'admin';
    return null;
  };

  const sectionKey = getSectionKey();
  const cfg = SIDENAV_CONFIG[sectionKey];

  if (!cfg) return null;

  return (
    <aside className="w-full md:w-[236px] p-3 md:p-6 border-b md:border-b-0 md:border-r border-border flex-shrink-0 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto whitespace-nowrap md:whitespace-normal gap-1.5 md:gap-0 md:h-full pb-8">
      <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim mb-4.5 font-semibold hidden md:block">
        {cfg.title}
      </div>

      <nav className="flex flex-row md:flex-col gap-1 flex-1 md:flex-initial">
        {(sectionKey === 'matching' && currentUser?.matching_status !== 'POD_ASSIGNED'
          ? cfg.items.filter(item => item.id === 'matching-status')
          : cfg.items
        ).map(item => {
          const Icon = ICON_MAP[item.icon];
          const isActive = item.id === activeScreen;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`flex items-center gap-3 px-3.5 py-2 md:py-2.5 rounded-lg text-[13.5px] font-semibold transition-all duration-120 cursor-pointer text-left flex-shrink-0 ${isActive
                ? 'bg-teal-soft text-teal'
                : 'text-ink-dim hover:bg-panel-alt hover:text-ink'
                }`}
            >
              {Icon && <Icon className="w-[16px] h-[16px] flex-shrink-0" />}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
