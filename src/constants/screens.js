export const SCREENS_ORDER = [
  "landing", "how-it-works", "about", "contact", "signup", "login", "forgot-password", "reset-password", "verify-email", "join-pod", "learning",
  "entry-path", "onboarding-welcome", "onboarding-age", "onboarding-lifestyle", "onboarding-community", "onboarding-location", "onboarding-budget",
  "onboarding-intent", "onboarding-commitment", "onboarding-review", "onboarding-score", "onboarding-approval", "pod-create", "pod-invite",
  "pod-member-onboarding", "pod-review", "pod-pending", "profile", "profile-update", "profile-edit", "readiness-detail", "status-tracking", "pod-history",
  "matching-status", "pod-suggestion", "pod-preview", "confirm-join", "commons-dashboard", "commons-members", "commons-agreement",
  "commons-chat", "commons-settings", "admin-dashboard", "admin-users", "admin-matching", "admin-questions", "admin-pod-review",
  "admin-pod-management", "admin-pod-detail", "admin-existing-pod-queue"
];

export const SCREENS_LABELS = {
  "landing": "Landing Page", "how-it-works": "How It Works", "about": "About", "contact": "Contact",
  "signup": "Sign Up", "login": "Login", "forgot-password": "Forgot Password", "reset-password": "Reset Password", "verify-email": "Verify Email",
  "join-pod": "Accept Pod Invitation",
  "learning": "Learning Hub",
  "entry-path": "Choose Path", "onboarding-welcome": "Onboarding Welcome", "onboarding-age": "Onboarding — Age Group", "onboarding-lifestyle": "Onboarding — Lifestyle",
  "onboarding-community": "Onboarding — Community", "onboarding-location": "Onboarding — Location", "onboarding-budget": "Onboarding — Budget",
  "onboarding-intent": "Onboarding — Intent", "onboarding-commitment": "Onboarding — Commitment", "onboarding-review": "Onboarding — Review",
  "onboarding-score": "Onboarding — Score", "onboarding-approval": "Onboarding — Admin Review", "pod-create": "Create Pod Group", "pod-invite": "Invite Members",
  "pod-member-onboarding": "Member Onboarding", "pod-review": "Submission Review", "pod-pending": "Pending Verification",
  "profile": "My Profile", "profile-update": "Update Profile", "profile-edit": "Edit Preferences", "readiness-detail": "Readiness Detail", "status-tracking": "Status Tracking", "pod-history": "My Pods",
  "matching-status": "Matching Status", "pod-suggestion": "Pod Suggestion", "pod-preview": "Pod Preview", "confirm-join": "Confirm Join",
  "commons-dashboard": "Pod Dashboard", "commons-members": "Member Overview", "commons-agreement": "Agreement Scaffolding",
  "commons-chat": "Pod Chat", "commons-settings": "Pod Settings", "admin-dashboard": "Admin Dashboard", "admin-users": "User Management",
  "admin-matching": "Matching Engine Control", "admin-questions": "Question Management", "admin-pod-review": "Suggested Pod Review", "admin-pod-management": "Pod Management", "admin-pod-detail": "Pod Commons View (Admin)",
  "admin-existing-pod-queue": "Existing Pod Queue"
};

export const GATED_SCREENS = [
  'profile-update', 'profile-edit', 'matching-status', 'pod-suggestion', 'pod-preview', 'confirm-join',
  'commons-dashboard', 'commons-members', 'commons-agreement', 'commons-chat', 'commons-settings',
  'readiness-detail'
];

export const SHELL_MODES = {
  // map screens to their shell mode: marketing | onboarding | app | admin | auth
  landing: 'marketing', 'how-it-works': 'marketing', about: 'marketing', contact: 'marketing',
  signup: 'auth', login: 'auth', 'forgot-password': 'auth', 'reset-password': 'auth',
  'verify-email': 'onboarding',
  'join-pod': 'auth',
  learning: 'app',
  'entry-path': 'onboarding', 'onboarding-welcome': 'onboarding', 'onboarding-age': 'onboarding',
  'onboarding-lifestyle': 'onboarding', 'onboarding-community': 'onboarding', 'onboarding-location': 'onboarding',
  'onboarding-budget': 'onboarding', 'onboarding-intent': 'onboarding', 'onboarding-commitment': 'onboarding',
  'onboarding-review': 'onboarding', 'onboarding-score': 'onboarding', 'onboarding-approval': 'onboarding',
  'pod-create': 'onboarding', 'pod-invite': 'onboarding', 'pod-member-onboarding': 'onboarding',
  'pod-review': 'onboarding', 'pod-pending': 'onboarding',
  profile: 'app', 'profile-update': 'app', 'profile-edit': 'app', 'readiness-detail': 'app', 'status-tracking': 'app', 'pod-history': 'app',
  'matching-status': 'app', 'pod-suggestion': 'app', 'pod-preview': 'app', 'confirm-join': 'app',
  'commons-dashboard': 'app', 'commons-members': 'app', 'commons-agreement': 'app', 'commons-chat': 'app', 'commons-settings': 'app',
  'admin-dashboard': 'admin', 'admin-users': 'admin', 'admin-matching': 'admin', 'admin-questions': 'admin', 'admin-pod-review': 'admin',
  'admin-pod-management': 'admin', 'admin-pod-detail': 'admin', 'admin-existing-pod-queue': 'admin'
};

export const SCREEN_URLS = {
  landing: 'boma.app/', 'how-it-works': 'boma.app/how-it-works', about: 'boma.app/about', contact: 'boma.app/contact',
  signup: 'boma.app/signup', login: 'boma.app/login', 'forgot-password': 'boma.app/forgot', 'reset-password': 'boma.app/reset-password',
  'verify-email': 'boma.app/onboarding/verify',
  'join-pod': 'boma.app/join-pod',
  learning: 'boma.app/learning',
  'entry-path': 'boma.app/onboarding/start', 'onboarding-welcome': 'boma.app/onboarding/welcome',
  'onboarding-age': 'boma.app/onboarding/step-1', 'onboarding-lifestyle': 'boma.app/onboarding/step-2',
  'onboarding-community': 'boma.app/onboarding/step-3', 'onboarding-location': 'boma.app/onboarding/step-4',
  'onboarding-budget': 'boma.app/onboarding/step-5', 'onboarding-intent': 'boma.app/onboarding/step-6',
  'onboarding-commitment': 'boma.app/onboarding/step-7', 'onboarding-review': 'boma.app/onboarding/step-8',
  'onboarding-score': 'boma.app/onboarding/score', 'onboarding-approval': 'boma.app/onboarding/under-review',
  'pod-create': 'boma.app/onboarding/create-pod', 'pod-invite': 'boma.app/onboarding/invite',
  'pod-member-onboarding': 'boma.app/onboarding/member-onboard', 'pod-review': 'boma.app/onboarding/pod-review',
  'pod-pending': 'boma.app/onboarding/pod-pending',
  profile: 'boma.app/profile', 'profile-update': 'boma.app/profile/update', 'profile-edit': 'boma.app/profile/edit', 'readiness-detail': 'boma.app/profile/readiness',
  'status-tracking': 'boma.app/profile/status', 'pod-history': 'boma.app/profile/pods',
  'matching-status': 'boma.app/matching', 'pod-suggestion': 'boma.app/matching/suggestion',
  'pod-preview': 'boma.app/matching/preview', 'confirm-join': 'boma.app/matching/confirm',
  'commons-dashboard': 'boma.app/commons', 'commons-members': 'boma.app/commons/members',
  'commons-agreement': 'boma.app/commons/agreement', 'commons-chat': 'boma.app/commons/chat',
  'commons-settings': 'boma.app/commons/settings',
  'admin-dashboard': 'boma.app/admin', 'admin-users': 'boma.app/admin/users', 'admin-matching': 'boma.app/admin/matching',
  'admin-questions': 'boma.app/admin/questions', 'admin-pod-review': 'boma.app/admin/pod-review', 'admin-pod-management': 'boma.app/admin/pods',
  'admin-pod-detail': 'boma.app/admin/pods/detail', 'admin-existing-pod-queue': 'boma.app/admin/pods/existing-queue'
};
