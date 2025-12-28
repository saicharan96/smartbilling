# Firestore Security Rules Setup

## ⚠️ IMPORTANT: Apply These Rules to Fix Permission Errors

The "Missing or insufficient permissions" error means your Firestore security rules need to be updated.

## Quick Fix Steps:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `smartbilling-a8a5e`

2. **Navigate to Firestore Rules**
   - Click on **Firestore Database** in the left sidebar
   - Click on the **Rules** tab

3. **Copy and Paste These Rules**

Copy the entire content from `firestore.rules` file, or copy these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products collection - users can only access their own products
    match /products/{productId} {
      allow read: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
        resource.data.userId == request.auth.uid &&
        request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Customers collection - users can only access their own customers
    match /customers/{customerId} {
      allow read: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
        resource.data.userId == request.auth.uid &&
        request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Sales collection - users can only access their own sales
    match /sales/{saleId} {
      allow read: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
        resource.data.userId == request.auth.uid &&
        request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Expenses collection - users can only access their own expenses
    match /expenses/{expenseId} {
      allow read: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
        resource.data.userId == request.auth.uid &&
        request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Invoices collection (if used separately from sales)
    match /invoices/{invoiceId} {
      allow read: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
        resource.data.userId == request.auth.uid &&
        request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

4. **Click "Publish"**
   - After pasting the rules, click the **Publish** button
   - Wait for the confirmation message

5. **Test Again**
   - Refresh your app
   - Try logging in again
   - The permission error should be gone

## What These Rules Do:

- ✅ **Users collection**: Users can only read/write their own profile (document ID = their user ID)
- ✅ **Products collection**: Users can only access products where `userId` matches their auth ID
- ✅ **Customers collection**: Users can only access customers where `userId` matches their auth ID
- ✅ **Sales collection**: Users can only access sales where `userId` matches their auth ID
- ✅ **Expenses collection**: Users can only access expenses where `userId` matches their auth ID

## Key Changes:

The rules now properly handle:
- **List queries** (reading multiple documents): `allow read: if resource == null || resource.data.userId == request.auth.uid`
- **Individual document reads**: Same rule works for both
- **Create operations**: Checks that new document has correct userId
- **Update operations**: Ensures userId matches and can't be changed
- **Delete operations**: Ensures userId matches before allowing delete

## Troubleshooting:

**If you still get permission errors:**
1. Make sure you clicked "Publish" after updating the rules
2. Wait 1-2 minutes for rules to propagate
3. Clear browser cache and refresh
4. Check that you're logged in (authentication is working)
5. Verify the user document was created in the `users` collection

**To verify rules are active:**
- Go to Firestore Database → Rules
- You should see the rules you just pasted
- The timestamp should show when they were last published

**Common Issues:**
- If rules show as "invalid", check for syntax errors (missing semicolons, brackets)
- Make sure `rules_version = '2';` is at the top
- Ensure all collection names match exactly (case-sensitive)
