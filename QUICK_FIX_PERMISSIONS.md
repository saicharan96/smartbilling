# 🚨 QUICK FIX: Permission Errors

## The Problem
You're seeing "Missing or insufficient permissions" errors because Firestore security rules haven't been applied yet.

## ⚡ 2-Minute Fix

### Step 1: Open Firebase Console
1. Go to: **https://console.firebase.google.com/**
2. Select project: **smartbilling-a8a5e**

### Step 2: Navigate to Firestore Rules
1. Click **Firestore Database** in left sidebar
2. Click **Rules** tab (at the top)

### Step 3: Copy & Paste Rules
1. Open the file `firestore.rules` in this project
2. **Copy ALL the content** (Ctrl+C / Cmd+C)
3. **Paste it** into the Firebase Console Rules editor
4. Click **Publish** button (top right)

### Step 4: Wait & Refresh
1. Wait 30-60 seconds for rules to propagate
2. Refresh your app (Ctrl+R / Cmd+R)
3. Try again - errors should be gone!

## ✅ What This Does

The rules allow:
- ✅ Authenticated users to read/write their own data
- ✅ Queries with `where('userId', '==', userId)` to work
- ✅ Users can only access documents where `userId` matches their auth ID

## 🔍 Verify It Worked

After publishing:
- Go back to **Firestore Database → Rules**
- You should see your rules with a timestamp
- The rules should show as "Published"

## ❌ Still Not Working?

1. **Check you're logged in** - Look at the top right of your app, you should see your email
2. **Clear browser cache** - Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
3. **Wait longer** - Sometimes rules take 2-3 minutes to propagate
4. **Check Firebase Console** - Make sure rules show as "Published" (not "Draft")

## 📋 Rules File Location

The rules are in: `/firestore.rules` in your project root.

---

**That's it!** Once rules are published, all permission errors will disappear.

