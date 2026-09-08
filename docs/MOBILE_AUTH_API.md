# BOMA Mobile App & Web — Custom Authentication API Reference

This document describes the unified backend API for user authentication and account management. Both the React Web application and Mobile applications (Flutter, React Native, iOS Swift, Android Kotlin) use this exact same endpoint.

---

## Base Configuration

* **Edge Function URL:** `https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co/functions/v1/custom-auth`
* **HTTP Method:** `POST`
* **Headers:**
  ```http
  Content-Type: application/json
  apikey: <YOUR_SUPABASE_ANON_KEY>
  Authorization: Bearer <YOUR_SUPABASE_ANON_KEY>
  ```

---

## Endpoints & Payloads

### 1. User Registration (`register`)
Creates a new user account with `email_verified: false`, generates a 6-digit verification code, and automatically sends a verification email.

**Request Body:**
```json
{
  "action": "register",
  "name": "Alex Mercer",
  "email": "alex@example.com",
  "password": "mySecurePassword123"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "c1f7b0a8-3691-49e3-82b5-31f0d367f08c",
    "email": "alex@example.com",
    "name": "Alex Mercer",
    "role": "user",
    "user_onboarded": false,
    "email_verified": false
  }
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "error": "Email already registered"
}
```

---

### 2. User Login (`login`)
Validates user credentials and returns the user profile.

**Request Body:**
```json
{
  "action": "login",
  "email": "alex@example.com",
  "password": "mySecurePassword123"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "c1f7b0a8-3691-49e3-82b5-31f0d367f08c",
    "email": "alex@example.com",
    "name": "Alex Mercer",
    "role": "user",
    "user_onboarded": false,
    "email_verified": true
  }
}
```

**Response (Error - 401 Unauthorized / 404 Not Found):**
```json
{
  "error": "Incorrect password"
}
```

---

### 3. Verify Email (`verify-email`)
Validates the 6-digit OTP code entered by the user and sets `email_verified: true`.

**Request Body:**
```json
{
  "action": "verify-email",
  "email": "alex@example.com",
  "code": "481920"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "c1f7b0a8-3691-49e3-82b5-31f0d367f08c",
    "email": "alex@example.com",
    "email_verified": true
  }
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "error": "Incorrect verification code"
}
```

---

### 4. Resend Verification Code (`resend-verification`)
Generates a new 6-digit code and resends the verification email.

**Request Body:**
```json
{
  "action": "resend-verification",
  "email": "alex@example.com"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true
}
```

---

### 5. Request Password Reset (`request-password-reset`)
Generates a password reset code and emails it to the user.

**Request Body:**
```json
{
  "action": "request-password-reset",
  "email": "alex@example.com"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true
}
```

---

### 6. Reset Password (`reset-password`)
Verifies the reset token/code and sets a new password.

**Request Body:**
```json
{
  "action": "reset-password",
  "email": "alex@example.com",
  "token": "481920",
  "newPassword": "newSecurePassword456"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true
}
```

---

### 7. Update Onboarding State (`update-onboarding`)
Saves the user's co-living lifestyle preferences and completes onboarding.

**Request Body:**
```json
{
  "action": "update-onboarding",
  "userId": "c1f7b0a8-3691-49e3-82b5-31f0d367f08c",
  "onboardingData": {
    "ageGroup": "25-34",
    "selectedLifestyles": ["remote-work", "sustainability"],
    "decisionStyle": "consensus",
    "podSize": "3-5",
    "locationCity": "Austin, TX",
    "locationRadius": "25 miles",
    "settingPreference": "suburban",
    "budgetRange": "$200k-$400k",
    "downPaymentTier": "10-20%",
    "financingPreference": "traditional-mortgage",
    "housingIntent": "purchase-primary",
    "commitmentTimeline": "5+ years",
    "readinessScore": 82
  }
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "c1f7b0a8-3691-49e3-82b5-31f0d367f08c",
    "user_onboarded": true,
    "readiness_score": 82
  }
}
```

---

## Code Examples for Mobile Developers

### JavaScript / React Native / Flutter (Using Supabase SDK)
```js
import { supabase } from './supabase';

// Login Example
const { data, error } = await supabase.functions.invoke('custom-auth', {
  body: {
    action: 'login',
    email: 'alex@example.com',
    password: 'myPassword',
  },
});

if (error) {
  console.error('Login failed:', error);
} else {
  console.log('Logged in user:', data.user);
}
```

### Standard HTTP / REST (Fetch / Axios / Dart / Swift / Kotlin)
```js
const response = await fetch('https://<PROJECT_ID>.supabase.co/functions/v1/custom-auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': '<SUPABASE_ANON_KEY>',
    'Authorization': 'Bearer <SUPABASE_ANON_KEY>',
  },
  body: JSON.stringify({
    action: 'login',
    email: 'alex@example.com',
    password: 'myPassword',
  }),
});

const data = await response.json();
```
