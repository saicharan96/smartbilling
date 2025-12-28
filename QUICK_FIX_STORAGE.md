# 🚨 QUICK FIX: Firebase Storage CORS Error

## The Problem
You're getting CORS errors because **Firebase Storage is not enabled** or **Storage rules are not deployed**.

## ⚡ 2-Minute Fix

### Step 1: Enable Firebase Storage
1. Go to https://console.firebase.google.com/
2. Select project: **smartbilling-a8a5e**
3. Click **Storage** in left sidebar
4. If you see "Get Started", click it:
   - Choose **Start in production mode**
   - Select location (same as Firestore)
   - Click **Done**

### Step 2: Deploy Storage Rules
1. In Storage, click **Rules** tab
2. **DELETE** any existing rules
3. **PASTE** these rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /logos/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

4. Click **Publish**
5. Wait for "Rules published successfully"

### Step 3: Test
1. Refresh your app
2. Try uploading logo again
3. Should work now! ✅

## 🔍 If Still Not Working

Check:
- ✅ Storage is enabled (you see "Files" tab in Storage)
- ✅ Rules are published (no errors in Rules tab)
- ✅ You're logged in
- ✅ Browser console shows no other errors

## 💡 Temporary Workaround

The code now has a base64 fallback - if Storage fails, it will save the logo as base64 in Firestore. This works but is less efficient for large images.

