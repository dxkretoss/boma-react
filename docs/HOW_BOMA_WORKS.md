# BOMA Living — Complete Platform Architecture & Flow Guide

This document provides a comprehensive, end-to-end breakdown of the **BOMA Platform**, covering the core architecture, the two onboarding paths, the algorithmic matching engine, pod creation & invitations, pod joining workflows, the collaborative Commons space, and the admin management portal.

---

## Table of Contents
1. [Platform Overview & Core Philosophy](#1-platform-overview--core-philosophy)
2. [User Journey & The Two Registration Paths](#2-user-journey--the-two-registration-paths)
   - [Path A: Join the Matching Pool (Individual Path)](#path-a-join-the-matching-pool-individual-path)
   - [Path B: Register an Existing Pod (Group Path)](#path-b-register-an-existing-pod-group-path)
3. [Algorithmic Pod Matching Engine](#3-algorithmic-pod-matching-engine)
   - [Readiness Scoring Calculation](#readiness-scoring-calculation)
   - [Compatibility Matching Algorithm](#compatibility-matching-algorithm)
   - [Pod Suggestions vs Active Pods](#pod-suggestions-vs-active-pods)
4. [Pod Membership & Joining Flows](#4-pod-membership--joining-flows)
   - [Joining a Matched Pod Proposal](#joining-a-matched-pod-proposal)
   - [Joining an Existing Pod via Invitation Token](#joining-an-existing-pod-via-invitation-token)
5. [Pod Invitations & Roster Management](#5-pod-invitations--roster-management)
   - [Sending Invitations by Email](#sending-invitations-by-email)
   - [Invitation Lifecycle (Pending, Resend, Cancel, Accept)](#invitation-lifecycle)
6. [The Commons (Collaborative Pod Space)](#6-the-commons-collaborative-pod-space)
   - [Commons Dashboard & Health Tracker](#commons-dashboard--health-tracker)
   - [Pod Group Chat & Channels](#pod-group-chat--channels)
   - [Governance & Operating Agreements](#governance--operating-agreements)
   - [Member Directory & Permissions](#member-directory--permissions)
7. [Admin Control Center](#7-admin-control-center)
   - [User Approval & Onboarding Queue](#user-approval--onboarding-queue)
   - [Existing Pod Verification Queue](#existing-pod-verification-queue)
   - [Questionnaire & Scoring Configuration](#questionnaire--scoring-configuration)
   - [Pod Lifecycle & Dissolution Management](#pod-lifecycle--dissolution-management)

---

## 1. Platform Overview & Core Philosophy

**BOMA** is a community-first co-living and co-development platform designed to make community-scale homeownership accessible, transparent, and legally sound. 

### Core Concepts:
- **Pod**: A close-knit group of 3 to 10 households collaborating to purchase, co-develop, or co-live in a residential community (e.g. duplex, fourplex, tiny-home village, co-housing building).
- **Readiness Score**: A 0–100 index assessing an individual's financial preparedness, lifestyle compatibility, timeline commitment, and governance alignment.
- **The Commons**: The shared digital space unlocked once a Pod is active, featuring chat, consensus decision-making, and operating agreements.

---

## 2. User Journey & The Two Registration Paths

When a user visits the platform and clicks **Get Started** (`entry-path`), they choose between two distinct onboarding journeys:

```
                              [ User Starts Registration ]
                                           │
                                  [ Screen: EntryPath ]
                                  "Choose Your Path"
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
          [ PATH A: Matching Pool ]                     [ PATH B: Existing Pod ]
          • Individual looking for neighbors            • Pre-formed group of friends/family
          • 9-step questionnaire                        • Group name, vision & type
          • Algorithmic Readiness Scoring               • Creator invites members by email
          • Admin review & matching pool                • Fast-track 2-question member setup
          • Dynamic Pod Suggestions                     • Admin verification & approval
```

---

### Path A: Join the Matching Pool (Individual Path)

Designed for individuals or single households seeking like-minded co-buyers.

```
[EntryPath] ──> [OnboardingWelcome] ──> [Step 1: Age] ──> [Step 2: Lifestyle]
                                                                   │
[Step 5: Budget] <── [Step 4: Location] <── [Step 3: Community] <──┘
       │
       └──> [Step 6: Intent] ──> [Step 7: Commitment] ──> [Step 8: Review]
                                                                │
[Approved: Matching/Profile] <── [OnboardingApproval] <── [Step 9: Score Reveal]
```

#### Step-by-Step Breakdown:
1. **Welcome Screen (`OnboardingWelcome`)**: Introduction to the 9-step readiness assessment (~8 minutes).
2. **Step 1 — Age Group (`OnboardingAge`)**: Selects demographic life stage (`18–30`, `31–60`, `61+`). Adapts tone without skewing base scoring.
3. **Step 2 — Lifestyle & Values (`OnboardingLifestyle`)**: Multi-select grid (Quiet evenings, Sustainable living, Shared cooking, Pet-friendly, WFH-friendly, Social events).
4. **Step 3 — Community Preferences (`OnboardingCommunity`)**: Decision-making model (Consensus, Delegated, Flexible) + Target Pod size (4–6, 7–10, 10+).
5. **Step 4 — Location & Search Radius (`OnboardingLocation`)**: City search with autocomplete, radius slider (5–150 miles), setting (Urban, Suburban, Rural).
6. **Step 5 — Budget & Financing Readiness (`OnboardingBudget`)**: Estimated price range, down payment tier (`0–5%`, `5–10%`, `10–20%`, `20%+`), financing mode (Traditional mortgage, Shared equity, Co-dev, Undecided).
7. **Step 6 — Primary Housing Intent (`OnboardingIntent`)**: Purchase primary home, Co-develop property, Investment hold, Lifestyle co-living.
8. **Step 7 — Commitment Duration (`OnboardingCommitment`)**: Minimum timeline (`2+ years`, `5+ years`, `Flexible`) and exit tolerance.
9. **Step 8 — Confirm & Review (`OnboardingReview`)**: Full summary review card with one-click edit links before submission.
10. **Step 9 — Readiness Score Reveal (`OnboardingScore`)**: Animated radial progress gauge revealing the user's score (0–100) with category-level breakdowns.
11. **Approval Gate (`OnboardingApproval`)**: Placed in `UNDER_REVIEW`. Polling checks for admin approval; once approved, unlocks **Matching** and **The Commons**.

---

### Path B: Register an Existing Pod (Group Path)

Designed for organic groups (friends, families, small development syndicates) who already know each other and wish to use BOMA's legal tools and Commons environment.

```
[EntryPath] ──> [PodCreate] ──> [PodInvite] ──> [PodReview] ──> [PodPending]
                     │                 │                               │
            (Sets Group Info &     (Emails sent;                  (Admin verifies
             Creator Profile)       invites managed)               & activates pod)
```

#### Step-by-Step Breakdown:
1. **Set Up Group Info (`PodCreate`)**:
   - Pod Name (e.g. *The Fourplex Founders*)
   - Description / Vision statement
   - Group Type (*Friends, Family, Small development group, Tiny-home village organizers, Workforce housing*)
   - Creator's Intent (*Co-develop, Purchase, Investment*)
   - Creator's Timeline (*2+ years, 5+ years, Flexible*)
2. **Invite Members & Manage Roster (`PodInvite`)**:
   - Creator sends email invitations to prospective co-members.
   - Live roster displays confirmed members (with role badges) and pending invitations.
   - Resend & cancel invitation capabilities.
3. **Pod Review & Submission (`PodReview`)**:
   - Verification summary showing Pod Name, Type, Member count, and status.
   - Creator submits the Pod to the BOMA Admin Board.
4. **Verification Pending (`PodPending`)**:
   - Pod status changes to `UNDER_REVIEW`.
   - Admin reviews the roster and activates the Pod into `ACTIVE` Commons status.

---

## 3. Algorithmic Pod Matching Engine

For Path A users, BOMA utilizes a multi-factor compatibility engine to automatically discover and propose balanced Pods.

### Readiness Scoring Calculation
Each user's individual score (0–100) is calculated from weighted questionnaire responses:
- **Community Preferences (Step 3)**: Alignment on decision styles (Consensus = high stability) + pod size expectation.
- **Financial Readiness (Step 5)**: Down payment readiness tier (`20%+` = higher readiness points) + realistic budget definitions.
- **Commitment Horizon (Step 7)**: Longer commitment duration (`5+ years` = 90 pts, `2+ years` = 85 pts, `Flexible` = 80 pts).

### Compatibility Matching Algorithm
When querying candidates for a user, BOMA compares profile vectors across 4 weighted pillars:

$$\text{Match Score} = \text{Location (30\%)} + \text{Setting (30\%)} + \text{Timeline (20\%)} + \text{Intent (20\%) }$$

1. **City / Metro Region (30%)**: Exact match on target metro (e.g. *Austin, TX*).
2. **Setting Preference (30%)**: Exact match on Urban, Suburban, or Rural.
3. **Commitment Timeline (20%)**: Matched duration expectations.
4. **Housing Intent (20%)**: Primary residence vs. co-development vs. investment alignment (Full match = 20%, partial = 10%).

### Pod Suggestions vs Active Pods
- **Matching Tab (`PodSuggestion` / `PodPreview`)**: Displays tentative algorithm-generated proposals. Users can inspect candidate profiles, match scores, readiness scores, and their own position with a **"YOU"** badge.
- **My Pods Tab (`PodHistory`)**: Only displays Pods where the user is an active participant (Path B self-registered pod or an officially accepted Path A pod).

---

## 4. Pod Membership & Joining Flows

### Joining a Matched Pod Proposal
1. User navigates to the **Matching** tab.
2. Views the proposed Pod Card: Name, Metro, Average Readiness, and Match Percentage.
3. Clicks **View Details / View Pod** to enter `PodPreview`:
   - Inspects the complete candidate roster with individual Readiness scores and intent tags.
   - The user sees themselves listed at the end with a gold **`YOU`** badge.
4. User clicks **Join Pod**:
   - System registers member record in `pod_members` table with role `MEMBER`.
   - Pod transition occurs and unlocks the Pod inside **My Pods** and **The Commons**.
5. Alternatively, clicking **Decline** returns the user to the matching pool to await the next suggested candidate group.

---

### Joining an Existing Pod via Invitation Token
1. Invitee receives an email with a secure link: `https://app.bomaliving.com/join-pod?token=<INVITATION_TOKEN>`.
2. The user registers or logs in with their email address.
3. The platform validates the token against `pod_invitations` table:
   - Validates that email matches and status is `PENDING`.
4. Invitee completes the 2-step fast-track onboarding (`PodMemberOnboarding`):
   - Selects Primary Housing Intent
   - Selects Commitment Timeline
5. System marks the invitation as `ACCEPTED`, adds the user as a confirmed member in `pod_members`, and redirects to **My Pods**.

---

## 5. Pod Invitations & Roster Management

### Sending Invitations by Email
- Pod Admins / Creators can send invites directly from:
  1. `PodInvite` (during initial onboarding)
  2. `PodHistory` (full pod view)
  3. `The Commons -> Members Directory`
- The system generates an invitation record with:
  - `pod_id`
  - `invitee_email`
  - `invited_by_user_id`
  - `token` (unique UUID)
  - `status` (`PENDING`)
  - `expires_at` (14 days validity)

### Invitation Lifecycle

```
[ Creator sends invite ] ──> Status: PENDING
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
    [ Invitee Accepts ]      [ Admin Resends ]       [ Admin Cancels ]
            │                       │                       │
     Status: ACCEPTED         Resets expiry;          Status: CANCELLED
   User added to roster      sends fresh email       Token invalidated
```

---

## 6. The Commons (Collaborative Pod Space)

Once a Pod is active, members gain access to **The Commons** (`/commons`), their private operating environment:

### 1. Commons Dashboard & Health Tracker
- **Hero Banner**: Pod background image, status badges (`ACTIVE IN COMMONS`), and metadata.
- **Readiness & Health Gauge**: Aggregated group score and member readiness average.
- **Next Steps & Milestones**: Action items (e.g. Schedule legal review, draft budget, review operating agreement).

### 2. Pod Group Chat & Channels (`CommonsChat`)
- Real-time messaging with image/file attachments.
- Pinned announcements from the Pod Admin.

### 3. Governance & Operating Agreements (`CommonsAgreement`)
- Multi-member sign-off on house rules, guest policies, noise ordinances, and shared chore rotations.
- Legal template downloads for LLC formation and Tenancy-in-Common (TIC) agreements.

### 4. Member Directory & Permissions (`CommonsMembers`)
- Full roster display with contact details, roles (`CREATOR / ADMIN` vs `MEMBER`), and invitations manager.

---

## 7. Admin Control Center

Admins have full visibility and governance over the ecosystem via the **Admin Portal** (`/admin`):

1. **User Queue Review (`AdminPodReview` / `AdminUsers`)**:
   - Inspects individual applicant onboarding answers, lifestyle tags, and calculated scores.
   - Actions: **Approve Profile** (moves user to `IN_POOL`) or **Reject Profile with Feedback** (notifies user to update responses).
2. **Existing Pod Queue (`AdminExistingPodQueue`)**:
   - Reviews self-formed groups from Path B.
   - Verifies group descriptions, member rosters, and readiness.
   - Actions: **Approve Pod** (activates Pod into Commons) or **Request Revisions**.
3. **Questionnaire Editor (`AdminQuestions`)**:
   - Dynamically add, reorder, edit, or archive questionnaire steps, question labels, descriptions, and point weightings.
4. **Pod Dissolution & Management (`AdminPodManagement`)**:
   - Monitor pod health, assign facilitators, or dissolve inactive pods (returning members back to open pool).

---

## Summary Reference Table

| Feature / Flow | Path A (Matching Pool) | Path B (Existing Pod) |
| :--- | :--- | :--- |
| **Target User** | Individual searching for co-buyers | Formed group of friends / family |
| **Onboarding Length** | 9 comprehensive steps (~8 min) | 1 group creation form (~2 min) |
| **Scoring Model** | Algorithmic (Community, Budget, Timeline) | Fast-track baseline (80–90 pts) |
| **Roster Formation** | Algorithmic compatibility match | Direct email invitations |
| **Approval Required** | Individual Profile Board Review | Group & Roster Board Review |
| **Target Destination** | Matching Tab &rarr; Accept Pod &rarr; Commons | My Pods &rarr; Verify &rarr; Commons |
