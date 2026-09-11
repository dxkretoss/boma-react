# BOMA — Complete Mobile API & Workflow Specification (v4.0)

This document is the **single source of truth** for mobile application engineers building the **BOMA iOS & Android mobile apps** (Flutter, React Native, Swift, Kotlin).

All backend operations are powered by **Supabase Edge Functions** (Deno/TypeScript) hosted on the BOMA cloud infrastructure.

---

## 1. Global API Configuration

| Environment Variable | Value | Description |
|---|---|---|
| **Base Supabase URL** | `https://uasdswkgodhczlbqkira.supabase.co` | Remote Supabase API URL |
| **Functions Endpoint** | `https://uasdswkgodhczlbqkira.supabase.co/functions/v1/` | Base Edge Functions URL |
| **Anon Public API Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhc2Rzd2tnb2RoY3psYnFraXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mjc0MTMsImV4cCI6MjEwMjEwMzQxM30.ejdIeWoWHBg1En2PdGXj00rAm540P1iBpBz9-NykXGI` | Include in `apikey` & `Authorization: Bearer <key>` |

### Common Headers
```http
Content-Type: application/json
apikey: {{anonKey}}
Authorization: Bearer {{anonKey}}
```

---

## 2. End-to-End User Journeys (Mobile App Workflow)

```mermaid
flowchart TD
    A[Launch Mobile App] --> B[Register / Login via custom-auth]
    B --> C{Email Verified?}
    C -->|No| D[Verify 6-Digit Email OTP]
    D --> E[Onboarding Selection Screen]
    C -->|Yes| E
    
    E -->|Path A: Individual Seeking Pod| F[Questionnaire Flow - custom-onboarding]
    E -->|Path B: Already Have Group| G[Register Existing Pod - custom-onboarding]
    
    F --> H[Save Step Responses: Steps 1-9]
    H --> I[Submit Profile & Calculate Score]
    I --> J[Profile Status: UNDER_REVIEW]
    J --> K[BOMA Admin Approves Profile]
    K --> L[In Matching Pool: manage-matching]
    L --> M[Accept Proposed Pod Match: manage-pods]
    
    G --> N[Create Pod & Send Email Invites]
    N --> O[Friends Accept Invite Tokens]
    O --> P[Submit Pod for Admin Review]
    P --> Q[Pod Activated]
    
    M --> R[The Pod Commons: manage-pods]
    Q --> R
    R --> S[Pod Chat, Members Roster, Governance Agreements]
```

---

## 3. Detailed API Reference

---

### Module 1: Authentication & Password Reset (`custom-auth`)
**Endpoint:** `POST https://uasdswkgodhczlbqkira.supabase.co/functions/v1/custom-auth`

#### 1.1 User Registration (`register`)
Creates user account with bcrypt password hashing and generates a 6-digit OTP email.
```json
// Request
{
  "action": "register",
  "name": "Alex Mercer",
  "email": "alex@example.com",
  "password": "Password123!"
}

// Response (201 Created)
{
  "success": true,
  "message": "User registered successfully. Verification code sent to your email.",
  "user": {
    "id": "c89b43d2-28e4-4fa0-82a1-e0921021bc82",
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "email_verified": false,
    "user_onboarded": false,
    "profile_status": "INCOMPLETE",
    "matching_status": "NOT_ELIGIBLE",
    "role": "user"
  }
}
```

#### 1.2 Verify Email OTP (`verify-email`)
```json
// Request
{
  "action": "verify-email",
  "email": "alex@example.com",
  "code": "123456"
}

// Response (200 OK)
{
  "success": true,
  "message": "Email verified successfully.",
  "user": {
    "id": "c89b43d2-28e4-4fa0-82a1-e0921021bc82",
    "email": "alex@example.com",
    "email_verified": true
  }
}
```

#### 1.3 Resend Verification OTP (`resend-verification`)
```json
// Request
{
  "action": "resend-verification",
  "email": "alex@example.com"
}
```

#### 1.4 Login (`login`)
```json
// Request
{
  "action": "login",
  "email": "alex@example.com",
  "password": "Password123!"
}

// Response (200 OK)
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "c89b43d2-28e4-4fa0-82a1-e0921021bc82",
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "email_verified": true,
    "user_onboarded": false,
    "profile_status": "INCOMPLETE",
    "matching_status": "NOT_ELIGIBLE"
  }
}
```

#### 1.5 Request Password Reset OTP (`request-password-reset`)
```json
// Request
{
  "action": "request-password-reset",
  "email": "alex@example.com"
}
```

#### 1.6 Verify Password Reset OTP (`verify-reset-otp`)
```json
// Request
{
  "action": "verify-reset-otp",
  "email": "alex@example.com",
  "token": "123456"
}
```

#### 1.7 Set New Password (`reset-password`)
```json
// Request
{
  "action": "reset-password",
  "email": "alex@example.com",
  "token": "123456",
  "newPassword": "NewSecurePassword123!"
}
```

#### 1.8 User Logout (`logout`)
Clears user session on mobile and reports logout to server.
```json
// Request
{
  "action": "logout",
  "userId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82"
}

// Response (200 OK)
{
  "success": true,
  "message": "User logged out successfully.",
  "userId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82"
}
```

---

### Module 2: Onboarding & Questionnaire (`custom-onboarding`)
**Endpoint:** `POST https://uasdswkgodhczlbqkira.supabase.co/functions/v1/custom-onboarding`

#### 2.1 Get Dynamic Admin-Managed Questionnaire (`get-questionnaire`)
Returns all active questions, choices, step titles, dynamic ordering, and options managed by Admins in real-time.
```json
// Request
{
  "action": "get-questionnaire"
}

// Response (200 OK)
{
  "success": true,
  "questionnaire": {
    "id": "8f8b89f2-25e6cbb4-...",
    "name": "BOMA Core Compatibility Questionnaire",
    "version": 1,
    "status": "PUBLISHED",
    "total_steps": 9,
    "steps": [
      {
        "step_number": 1,
        "step_title": "Demographics & Life Stage",
        "question_count": 1,
        "questions": [
          {
            "id": "q-1",
            "question_key": "age_group",
            "title": "Select your age group",
            "description": "BOMA adapts its communication style...",
            "question_type": "single_choice",
            "is_required": true,
            "step_number": 1,
            "display_order": 1,
            "options": [
              { "id": "opt-1", "option_key": "age_18_30", "label": "18–30 years", "value": "age_18_30", "display_order": 1 },
              { "id": "opt-2", "option_key": "age_31_60", "label": "31–60 years", "value": "age_31_60", "display_order": 2 }
            ]
          }
        ]
      }
    ],
    "questions": [ /* flat list of all active questions */ ]
  }
}
```

#### 2.2 Get User Step Progress & Saved Answers (`get-progress`)
Use to resume where the mobile user left off.
```json
// Request
{
  "action": "get-progress",
  "userId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82"
}
```

#### 2.3 Save Step Responses (`save-response` / `save-step`)
Saves all answers for a given step in **1 single API call** when the user taps Continue.
```json
// Request (Multi-Question Step e.g. Step 3)
{
  "action": "save-response",
  "userId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82",
  "stepNumber": 3,
  "responses": [
    {
      "questionKey": "decision_style",
      "answerJson": { "value": "consensus" }
    },
    {
      "questionKey": "pod_size",
      "answerJson": { "value": "7–10 households" }
    }
  ]
}
```

#### 2.4 Complete Onboarding Profile (`submit-onboarding`)
Calculates the dynamic readiness score (0–100) using database scoring rules and sets `profile_status: "UNDER_REVIEW"`.
```json
// Request
{
  "action": "submit-onboarding",
  "userId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82"
}

// Response (200 OK)
{
  "success": true,
  "message": "Onboarding completed successfully. Profile submitted for review.",
  "user": {
    "id": "c89b43d2-28e4-4fa0-82a1-e0921021bc82",
    "onboarding_status": "COMPLETED",
    "profile_status": "UNDER_REVIEW",
    "readiness_score": 88,
    "user_onboarded": true
  }
}
```

#### 2.5 Get Readiness Score Breakdown (`get-score-breakdown`)
Returns detailed score contributions across categories (Lifestyle, Location, Financial, Commitment).
```json
// Request
{
  "action": "get-score-breakdown",
  "userId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82"
}
```

---

### Module 3: Existing Pod Registration (`custom-onboarding`)

#### 3.1 Create Existing Pod (`create-existing-pod` / `create-pod`)
```json
// Request
{
  "action": "create-existing-pod",
  "creatorId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82",
  "name": "The Fourplex Founders",
  "description": "4 friends co-purchasing property in Austin",
  "groupType": "Friends",
  "housingIntent": "co-develop",
  "commitmentTimeline": "timeline_5yr",
  "invites": ["friend1@example.com", "friend2@example.com"]
}
```

#### 3.2 Invite Pod Member via Email (`invite-pod-member`)
```json
// Request
{
  "action": "invite-pod-member",
  "podId": "pod-uuid-here",
  "inviterId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82",
  "email": "neighbor@example.com"
}
```

#### 3.3 Join Pod via Invitation Token (`join-pod-by-invite` / `join-by-token`)
```json
// Request
{
  "action": "join-pod-by-invite",
  "token": "raw-or-hashed-invitation-token",
  "userId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82"
}
```

---

### Module 4: User Profile Management (`manage-users`)
**Endpoint:** `POST https://uasdswkgodhczlbqkira.supabase.co/functions/v1/manage-users`

#### 4.1 Get Profile (`get-profile`)
```json
// Request
{
  "action": "get-profile",
  "userId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82"
}
```

#### 4.2 Update Profile / Preferences (`update-profile`)
```json
// Request
{
  "action": "update-profile",
  "userId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82",
  "updates": {
    "location_city": "Austin, TX",
    "setting_preference": "Suburban",
    "bio": "Software engineer looking for creative community."
  }
}
```

#### 4.3 Upload Avatar Profile Image (`upload-avatar`)
Mobile developers can upload base64-encoded profile photos directly. The Edge Function handles decoding, uploading to the `avatars` Supabase Storage bucket, generating a public URL, and saving `users.avatar_url`.

```json
// Request
{
  "action": "upload-avatar",
  "userId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82",
  "base64Image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
  "fileExt": "jpg"
}

// Response (200 OK)
{
  "success": true,
  "message": "Avatar uploaded and profile updated successfully.",
  "avatarUrl": "https://uasdswkgodhczlbqkira.supabase.co/storage/v1/object/public/avatars/c89b43d2-28e4-4fa0-82a1-e0921021bc82/1789104000000.jpg",
  "user": {
    "id": "c89b43d2-28e4-4fa0-82a1-e0921021bc82",
    "avatar_url": "https://uasdswkgodhczlbqkira.supabase.co/storage/v1/object/public/avatars/c89b43d2-28e4-4fa0-82a1-e0921021bc82/1789104000000.jpg"
  }
}
```

#### 4.4 Delete User Account (`delete-account`)
**Mandatory for Apple App Store (Guideline 5.1.1(v)) & Google Play Store.** Permanently deletes the user account, removes active pod memberships, deletes onboarding responses, and removes authentication records.

```json
// Request
{
  "action": "delete-account",
  "userId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82",
  "confirmationText": "DELETE"
}

// Response (200 OK)
{
  "success": true,
  "message": "Account and associated profile data deleted successfully.",
  "deletedUserId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82"
}
```

---

### Module 5: Neighbor Matching Engine (`manage-matching`)
**Endpoint:** `POST https://uasdswkgodhczlbqkira.supabase.co/functions/v1/manage-matching`

#### 5.1 Find Compatible Matches (`find-matches`)
Evaluates city, lifestyle, readiness score, and timeline weights to suggest top matches.
```json
// Request
{
  "action": "find-matches",
  "userId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82"
}

// Response (200 OK)
{
  "success": true,
  "suggestedPod": {
    "name": "Austin Commons Pod",
    "location": "Austin, TX",
    "matchPct": 88,
    "health": "Stable",
    "tags": ["Austin, TX", "Suburban", "Remote Work"],
    "members": [
      { "id": "u-2", "name": "Sarah Chen", "score": 85, "matchPct": 92 }
    ]
  }
}
```

---

### Module 6: Pod Commons, Chat & Agreements (`manage-pods`)
**Endpoint:** `POST https://uasdswkgodhczlbqkira.supabase.co/functions/v1/manage-pods`

#### 6.1 Get Active Pod Details (`get-pod`)
```json
// Request
{
  "action": "get-pod",
  "userId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82"
}
```

#### 6.2 Get Chat Messages (`get-messages`)
```json
// Request
{
  "action": "get-messages",
  "podId": "pod-uuid-here",
  "limit": 50
}
```

#### 6.3 Send Chat Message (`send-message`)
```json
// Request
{
  "action": "send-message",
  "podId": "pod-uuid-here",
  "userId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82",
  "message": "Looking forward to our weekly sync!"
}
```

#### 6.4 Update Aligned Agreements (`update-agreements`)
```json
// Request
{
  "action": "update-agreements",
  "podId": "pod-uuid-here",
  "currentDescription": "4 friends co-purchasing property in Austin",
  "alignedArray": [0, 1, 2, 4]
}
```

#### 6.5 Accept Pod Match Proposal (`accept-proposal`)
```json
// Request
{
  "action": "accept-proposal",
  "podId": "pod-uuid-here",
  "userId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82"
}
```

#### 6.6 Decline Pod Match Proposal (`decline-proposal`)
```json
// Request
{
  "action": "decline-proposal",
  "podId": "pod-uuid-here",
  "userId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82"
}
```

#### 6.7 Leave Pod (`leave-pod`)
```json
// Request
{
  "action": "leave-pod",
  "podId": "pod-uuid-here",
  "userId": "c89b43d2-28e4-4fa0-82a1-e0921021bc82"
}
```

---

### Module 7: Learning Videos (`manage-learning-videos`)
**Endpoint:** `GET https://uasdswkgodhczlbqkira.supabase.co/functions/v1/manage-learning-videos`

#### 7.1 List Educational Videos (HTTP GET)
```http
GET https://uasdswkgodhczlbqkira.supabase.co/functions/v1/manage-learning-videos
apikey: {{anonKey}}
```
```json
// Response (200 OK)
{
  "success": true,
  "videos": [
    {
      "id": "v-1",
      "title": "Intro to BOMA Co-housing",
      "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "thumbnail_url": "/assets/pod_community_realistic.png",
      "tag": "Getting Started",
      "order_index": 1,
      "is_published": true
    }
  ]
}
```

---

## 4. Postman Collection Files

1. **Consumer Mobile App Collection:** [`docs/BOMA_Full_Mobile_API.postman_collection.json`](file:///d:/Boma_react/docs/BOMA_Full_Mobile_API.postman_collection.json) (excludes web-only admin endpoints).
2. **Master Collection (Mobile + Web Admin):** [`docs/BOMA_Master_API.postman_collection.json`](file:///d:/Boma_react/docs/BOMA_Master_API.postman_collection.json).
