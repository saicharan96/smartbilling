# Smart Billing & Inventory Management System

A comprehensive, mobile-friendly billing and inventory management system with Firebase backend integration. Perfect for small to medium businesses.

## Features

- ✅ **Billing Management** - Create invoices, manage sales, track payments
- ✅ **Inventory Management** - Add, update, and track product stock
- ✅ **Customer Management** - Maintain customer database with purchase history
- ✅ **Expense Management** - Track business expenses by category
- ✅ **Dashboard** - Real-time statistics and insights
- ✅ **Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- ✅ **Firebase Backend** - Secure cloud database with real-time updates
- ✅ **User Authentication** - Secure login and registration system

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Hosting**: Compatible with Hostinger and other static hosting providers

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable the following services:
   - **Authentication**: 
     - Go to Authentication > Sign-in method
     - Enable Email/Password authentication
   - **Firestore Database**:
     - Go to Firestore Database
     - Create database in production mode
     - Start in test mode (we'll add security rules later)

### 2. Configure Firebase

1. Open `js/firebase-config.js`
2. Replace the placeholder values with your Firebase project configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

To find these values:
- Go to Firebase Console > Project Settings > General
- Scroll down to "Your apps" section
- Click on the web icon (`</>`) to get your config

### 3. Firebase Security Rules

Go to Firestore Database > Rules and paste the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /products/{productId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    match /customers/{customerId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    match /invoices/{invoiceId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### 4. Firestore Indexes

Create the following composite indexes in Firestore:

1. **products collection**:
   - Fields: `userId` (Ascending), `name` (Ascending)

2. **customers collection**:
   - Fields: `userId` (Ascending), `name` (Ascending)

3. **invoices collection**:
   - Fields: `createdAt` (Descending)
   - Fields: `userId` (Ascending), `createdAt` (Descending)

4. **expenses collection**:
   - Fields: `userId` (Ascending), `date` (Descending)

To create indexes:
- Go to Firestore Database > Indexes
- Click "Create Index"
- Add the fields as specified above

### 5. Deploy to Hostinger

1. **Upload Files**:
   - Upload all files to your Hostinger hosting directory (usually `public_html` or `www`)
   - Maintain the folder structure (css/, js/, images/)

2. **File Permissions**:
   - Ensure all files have read permissions (644 for files, 755 for directories)

3. **Access the Application**:
   - Visit your domain (e.g., `https://yourdomain.com/index.html`)
   - Create your first account by clicking "Sign Up" on the login page

## Usage Guide

### First Time Setup

1. **Register Account**:
   - Go to the login page
   - Click "Sign Up"
   - Enter your name, email, and password
   - Complete registration

2. **Add Products**:
   - Navigate to Inventory
   - Add your products with name, description, cost price, selling price, and quantity

3. **Add Customers** (Optional):
   - Go to Customers page
   - Add customer information for better tracking

4. **Configure Business Info**:
   - Go to Settings
   - Enter your business name, GST number, address, and contact

### Daily Operations

1. **Create Invoice**:
   - Go to Billing page
   - Enter customer details
   - Search and add products to cart
   - Set tax percentage
   - Select payment method
   - Click "Create Invoice"

2. **Track Expenses**:
   - Go to Expenses page
   - Add expenses with category, description, amount, and payment method

3. **Monitor Dashboard**:
   - View real-time statistics
   - Check recent sales
   - Monitor low stock items

## File Structure

```
smartbilling/
├── index.html          # Login/Registration page
├── dashboard.html      # Main dashboard
├── billing.html        # Invoice creation
├── inventory.html      # Product management
├── customers.html      # Customer management
├── expenses.html       # Expense tracking
├── settings.html       # User settings
├── css/
│   ├── style.css      # Main styles
│   ├── mobile.css      # Mobile responsive styles
│   ├── login.css       # Login page styles
│   └── ...
├── js/
│   ├── firebase-config.js  # Firebase configuration
│   ├── app.js             # Common functions
│   └── ...
└── images/            # Image assets
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Notes

- All data is stored securely in Firebase
- User authentication is handled by Firebase Auth
- Each user can only access their own data
- Passwords are encrypted by Firebase
- HTTPS is recommended for production use

## Troubleshooting

### Login Issues
- Ensure Firebase Authentication is enabled
- Check that Email/Password sign-in method is enabled
- Verify Firebase configuration in `firebase-config.js`

### Data Not Loading
- Check browser console for errors
- Verify Firestore security rules
- Ensure Firestore indexes are created
- Check Firebase project configuration

### Mobile Display Issues
- Clear browser cache
- Ensure viewport meta tag is present
- Check mobile.css is loaded

## Support

For issues or questions:
1. Check Firebase Console for errors
2. Review browser console (F12)
3. Verify all setup steps are completed

## License

This project is open source and available for personal and commercial use.

## Updates

- Version 1.0 - Initial release with full feature set
- Mobile-responsive design
- Firebase integration
- Real-time data synchronization

