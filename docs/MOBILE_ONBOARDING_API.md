# BOMA Mobile App — Onboarding & Pod Management API Reference

This document provides the complete API specification for the **Onboarding (Matching Pool)** and **Register Existing Pod** flows in the BOMA Mobile applications (Flutter, React Native, iOS Swift, Android Kotlin).

All requests communicate directly with the Supabase Edge Function: `custom-onboarding`.

---

## 1. Base Configuration

* **Endpoint URL:** `https://uasdswkgodhczlbqkira.supabase.co/functions/v1/custom-onboarding`
* **HTTP Method:** `POST`
* **Headers:**
  ```http
  Content-Type: application/json
  apikey: <SUPABASE_ANON_KEY>
  Authorization: Bearer <SUPABASE_ANON_KEY>
  ```

---

## 2. Dynamic Admin-Managed Questionnaire Flow

The onboarding questionnaire is **100% dynamically managed by BOMA Admins** in the Admin Dashboard. When admins create new questions, update labels, re-order steps, or publish new versions, the changes reflect **immediately** in the mobile app via this endpoint without requiring an app store update.

### Step 1: Fetch Dynamic Published Questionnaire (`get-questionnaire`)
Fetches all active questions, options, step metadata, and choices in the exact display order configured by the Admin.

**Request Body:**
```json
{
  "action": "get-questionnaire"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "questionnaire": {
    "id": "a1b2c3d4-...",
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
            "id": "q1-uuid",
            "questionnaire_id": "a1b2c3d4-...",
            "question_key": "age_group",
            "title": "Select your age group",
            "description": "BOMA adapts its communication style and question examples...",
            "question_type": "single_choice",
            "is_required": true,
            "step_number": 1,
            "display_order": 1,
            "options": [
              {
                "id": "opt-1",
                "option_key": "age_18_30",
                "label": "18–30 years",
                "description": "Gen Z / Millennials • Nomads & Professionals",
                "value": "age_18_30",
                "display_order": 1
              },
              {
                "id": "opt-2",
                "option_key": "age_31_60",
                "label": "31–60 years",
                "description": "Gen X / Millennials • Families & Builders",
                "value": "age_31_60",
                "display_order": 2
              }
            ]
          }
        ]
      }
    ],
    "questions": [ /* full flat list of questions */ ]
  }
}
```

#### Mobile UI Dynamic Widget Mapping Guide
| `question_type` from API | Mobile UI Widget | Answer Payload Format (`answerJson`) |
|---|---|---|
| `single_choice` | Radio buttons / Selectable Cards | `{ "value": "option_key" }` |
| `multiple_choice` | Checkboxes / Multi-select Tag Chips | `{ "values": ["opt1", "opt2"] }` |
| `text` | Single-line / Multi-line Text Input | `{ "value": "User entered string" }` |
| `range` | Slider / Stepper Component | `{ "value": 50 }` |
| `number` | Numeric Input Field | `{ "value": 250000 }` |

---

### Step 2: Fetch & Resume Progress (`get-progress`)
Retrieves the user's current step, progress status (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`), and all previously saved responses.

**Request Body:**
```json
{
  "action": "get-progress",
  "userId": "c1f7b0a8-3691-49e3-82b5-31f0d367f08c"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "progress": {
    "user_id": "c1f7b0a8-3691-49e3-82b5-31f0d367f08c",
    "current_step": 3,
    "total_steps": 9,
    "status": "IN_PROGRESS"
  },
  "responses": [
    {
      "question_key": "age_group",
      "answer_json": { "value": "25-34" }
    },
    {
      "question_key": "lifestyles",
      "answer_json": { "values": ["remote-work", "sustainability"] }
    }
  ]
}
```

---

### Step 3: Auto-Save Step Response (`save-response`)
Call this whenever the user answers or navigates between steps to ensure progress is never lost.

**Request Body (Single Choice):**
```json
{
  "action": "save-response",
  "userId": "c1f7b0a8-3691-49e3-82b5-31f0d367f08c",
  "questionnaireId": "a1b2c3d4-...",
  "questionnaireVersion": 1,
  "questionId": "q1-uuid",
  "questionKey": "age_group",
  "answerJson": { "value": "25-34" },
  "stepNumber": 1
}
```

**Request Body (Multiple Choice - e.g. Lifestyles):**
```json
{
  "action": "save-response",
  "userId": "c1f7b0a8-3691-49e3-82b5-31f0d367f08c",
  "questionnaireId": "a1b2c3d4-...",
  "questionnaireVersion": 1,
  "questionId": "q2-uuid",
  "questionKey": "lifestyles",
  "answerJson": { "values": ["remote-work", "creative", "family-friendly"] },
  "stepNumber": 2
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Response saved successfully.",
  "current_step": 2
}
```

---

### Step 4: Submit Onboarding Profile & Calculate Readiness Score (`submit-onboarding`)
Called after Step 8 review. Dynamically computes the user's readiness score using active database scoring rules, syncs all answers to the user's profile, and transitions their profile to `UNDER_REVIEW`.

**Request Body:**
```json
{
  "action": "submit-onboarding",
  "userId": "c1f7b0a8-3691-49e3-82b5-31f0d367f08c"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Onboarding completed successfully.",
  "readiness_score": 88,
  "user": {
    "id": "c1f7b0a8-3691-49e3-82b5-31f0d367f08c",
    "email": "alex@example.com",
    "name": "Alex Mercer",
    "user_onboarded": true,
    "onboarding_status": "COMPLETED",
    "profile_status": "UNDER_REVIEW",
    "readiness_status": "CALCULATED",
    "readiness_score": 88,
    "age_group": "25-34",
    "selected_lifestyles": ["remote-work", "sustainability"],
    "decision_style": "consensus",
    "pod_size": "3-5",
    "location_city": "Austin, TX",
    "location_radius": "25 miles",
    "setting_preference": "suburban",
    "budget_range": "$200k-$400k",
    "down_payment_tier": "10-20%",
    "financing_preference": "traditional-mortgage",
    "housing_intent": "purchase",
    "commitment_timeline": "timeline_5yr"
  }
}
```

---

### Step 5: Get Score Breakdown (`get-score-breakdown`)
Retrieves detailed breakdown points, category weights, and reasoning for transparency on the score results screen.

**Request Body:**
```json
{
  "action": "get-score-breakdown",
  "userId": "c1f7b0a8-3691-49e3-82b5-31f0d367f08c"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "totalScore": 88,
  "scoredCategoriesCount": 6,
  "appliedSteps": [
    {
      "stepNumber": 5,
      "questionTitle": "Down Payment Readiness Tier",
      "questionKey": "down_payment_tier",
      "selectedOption": "10-20%",
      "points": 85,
      "reasoning": "Strong financing readiness tier."
    }
  ],
  "unscoredSteps": []
}
```

---

## 3. Register Existing Pod Flow

### Step 1: Create Pod (`create-pod`)
Creates a self-registered pod and assigns the creator as `CREATOR` with `ACCEPTED` membership status.

**Request Body:**
```json
{
  "action": "create-pod",
  "creatorId": "c1f7b0a8-3691-49e3-82b5-31f0d367f08c",
  "name": "The Fourplex Founders",
  "description": "4 friends buying a fourplex in East Austin",
  "groupType": "Friends",
  "housingIntent": "Co-develop property",
  "commitmentTimeline": "5+ years"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Pod created successfully.",
  "pod": {
    "id": "pod-uuid-123",
    "name": "The Fourplex Founders",
    "description": "4 friends buying a fourplex in East Austin ||| [0,1]",
    "group_type": "Friends",
    "created_by": "c1f7b0a8-3691-49e3-82b5-31f0d367f08c",
    "status": "CREATING"
  },
  "user": {
    "id": "c1f7b0a8-3691-49e3-82b5-31f0d367f08c",
    "entry_path": "EXISTING_POD",
    "user_onboarded": true,
    "profile_status": "APPROVED",
    "readiness_score": 90
  }
}
```

---

### Step 2: Invite Pod Member (`invite-pod-member`)
Generates an invitation token and automatically sends a luxury BOMA invitation email to the member.

**Request Body:**
```json
{
  "action": "invite-pod-member",
  "podId": "pod-uuid-123",
  "inviterId": "c1f7b0a8-3691-49e3-82b5-31f0d367f08c",
  "email": "friend@example.com"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Invitation created and email sent.",
  "invitation": {
    "id": "inv-uuid",
    "pod_id": "pod-uuid-123",
    "email": "friend@example.com",
    "status": "PENDING",
    "inviteUrl": "https://boma.app/join-pod?token=SAMPLE_UUID_TOKEN"
  }
}
```

---

### Step 3: Get Pod Details & Members (`get-pod-details`)
Fetches the Pod's information, member roster, avatars, and membership statuses.

**Request Body:**
```json
{
  "action": "get-pod-details",
  "podId": "pod-uuid-123"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "pod": {
    "id": "pod-uuid-123",
    "name": "The Fourplex Founders",
    "status": "CREATING"
  },
  "members": [
    {
      "id": "mem-1",
      "role": "CREATOR",
      "membership_status": "ACCEPTED",
      "user": {
        "id": "c1f7b0a8-...",
        "name": "Alex Mercer",
        "email": "alex@example.com",
        "avatar_url": null,
        "readiness_score": 90
      }
    }
  ]
}
```

---

### Step 4: Submit Pod for Admin Review (`submit-pod-review`)
Submits the Pod for Board/Admin review once all member invitations are sent.

**Request Body:**
```json
{
  "action": "submit-pod-review",
  "podId": "pod-uuid-123"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Pod submitted for admin review.",
  "pod": {
    "id": "pod-uuid-123",
    "status": "PENDING_REVIEW"
  }
}
```

---

## 4. Mobile SDK Integration Example

### Flutter (Dart)
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<Map<String, dynamic>> submitOnboarding(String userId) async {
  final url = Uri.parse('https://uasdswkgodhczlbqkira.supabase.co/functions/v1/custom-onboarding');
  final response = await http.post(
    url,
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'YOUR_SUPABASE_ANON_KEY',
      'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY',
    },
    body: jsonEncode({
      'action': 'submit-onboarding',
      'userId': userId,
    }),
  );

  return jsonDecode(response.body);
}
```

### React Native / Swift / Kotlin (Fetch / REST)
```javascript
const response = await fetch('https://uasdswkgodhczlbqkira.supabase.co/functions/v1/custom-onboarding', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': '<YOUR_SUPABASE_ANON_KEY>',
    'Authorization': 'Bearer <YOUR_SUPABASE_ANON_KEY>',
  },
  body: JSON.stringify({
    action: 'save-response',
    userId: 'c1f7b0a8-...',
    questionnaireId: 'q-id',
    questionId: 'q-age',
    questionKey: 'age_group',
    answerJson: { value: '25-34' },
    stepNumber: 1,
  }),
});
const data = await response.json();
```
