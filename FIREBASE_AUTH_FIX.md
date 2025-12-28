# Firebase Authentication 400 Error Fix

## Error: `auth/configuration-not-found`

This error means **Firebase Authentication is not properly configured** in your Firebase project.

## ✅ REQUIRED FIX - Enable Email/Password Authentication

### Step 1: Enable Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **smartbilling-a8a5e**
3. Click on **Authentication** in the left sidebar
4. If you see "Get started", click it
5. Go to the **Sign-in method** tab
6. Click on **Email/Password**
7. **Enable** the first toggle (Email/Password)
8. Click **Save**

### Step 2: Verify API Key Permissions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **smartbilling-a8a5e**
3. Go to **APIs & Services** → **Credentials**
4. Find your API key: `AIzaSyAvfhSrMHp0ELjejrAAI9tFV9kYjA7RJB4`
5. Click on it to edit
6. Under **API restrictions**, make sure:
   - Either "Don't restrict key" is selected, OR
   - "Restrict key" is selected AND **Identity Toolkit API** is enabled

### Step 3: Enable Identity Toolkit API

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **Identity Toolkit API**
3. Click on it and click **Enable**

### Step 4: Test Again

After completing the above steps:
1. Refresh your browser
2. Try registering a new account first (to test)
3. Then try logging in

## Common Causes

1. **Email/Password not enabled** ⚠️ **MOST COMMON**
   - Fix: Enable in Firebase Console → Authentication → Sign-in method

2. **Identity Toolkit API not enabled**
   - Fix: Enable in Google Cloud Console

3. **API Key restrictions**
   - Fix: Remove restrictions or add Identity Toolkit API to allowed APIs

4. **Wrong project selected**
   - Fix: Verify you're using the correct Firebase project

## Quick Verification

After enabling, check browser console for:
```
✅ Firebase services initialized: { auth: true, db: true, ... }
```

If you see errors, check:
- Firebase Console → Authentication → Sign-in method (should show Email/Password as enabled)
- Google Cloud Console → APIs & Services → Enabled APIs (should include Identity Toolkit API)
