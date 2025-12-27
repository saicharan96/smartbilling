# Quick Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name (e.g., "SmartBilling")
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Click on **Email/Password**
5. Enable it and click **Save**

## Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode** (we'll add rules later)
4. Choose a location (closest to your users)
5. Click **Enable**

## Step 4: Get Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click the web icon (`</>`)
4. Register app with nickname (e.g., "Web App")
5. Copy the configuration object

## Step 5: Update Config File

Open `js/firebase-config.js` and replace:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",                    // ← Replace
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",  // ← Replace
  projectId: "YOUR_PROJECT_ID",              // ← Replace
  storageBucket: "YOUR_PROJECT_ID.appspot.com",   // ← Replace
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",  // ← Replace
  appId: "YOUR_APP_ID"                       // ← Replace
};
```

## Step 6: Set Security Rules

1. Go to **Firestore Database** > **Rules**
2. Replace with rules from README.md
3. Click **Publish**

## Step 7: Create Indexes

Firebase will prompt you to create indexes when needed. Click the links in error messages to create them automatically.

Or manually create in **Firestore Database** > **Indexes**:

1. **products**: `userId` (Ascending), `name` (Ascending)
2. **customers**: `userId` (Ascending), `name` (Ascending)
3. **invoices**: `createdAt` (Descending)
4. **expenses**: `userId` (Ascending), `date` (Descending)

## Step 8: Test

1. Upload files to Hostinger
2. Visit your domain
3. Click "Sign Up" to create first account
4. Login and start using!

## Troubleshooting

**"Permission denied" errors:**
- Check security rules are published
- Verify user is authenticated
- Check userId matches in queries

**"Index required" errors:**
- Click the link in error message
- Or create index manually in Firestore

**Login not working:**
- Verify Email/Password auth is enabled
- Check Firebase config values are correct
- Check browser console for errors

