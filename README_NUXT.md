# Smart Billing - Nuxt 3 Application

A modern, mobile-friendly billing and inventory management system built with Nuxt 3 and Firebase.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
NUXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NUXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

### 6. Generate Static Site (for Hostinger)

```bash
npm run generate
```

This creates a `.output/public` folder that you can upload to Hostinger.

## 📁 Project Structure

```
smartbilling/
├── assets/
│   └── css/
│       └── main.css          # Global styles
├── composables/
│   └── useAuth.ts           # Authentication composable
├── layouts/
│   └── default.vue          # Main layout with sidebar
├── middleware/
│   └── auth.ts              # Auth middleware
├── pages/
│   ├── index.vue            # Login page
│   ├── dashboard.vue        # Dashboard
│   ├── billing.vue          # Billing (to be created)
│   ├── inventory.vue        # Inventory (to be created)
│   ├── customers.vue        # Customers (to be created)
│   ├── expenses.vue         # Expenses (to be created)
│   ├── analytics.vue        # Analytics (to be created)
│   └── settings.vue         # Settings (to be created)
├── plugins/
│   └── firebase.client.ts   # Firebase initialization
├── nuxt.config.ts           # Nuxt configuration
└── package.json             # Dependencies
```

## 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create Firestore Database
4. Set security rules (see README.md)
5. Copy your config to `.env` file

## 📱 Features

- ✅ Modern Vue 3 / Nuxt 3
- ✅ TypeScript support
- ✅ Firebase Authentication
- ✅ Firestore Database
- ✅ Mobile Responsive
- ✅ Server-side rendering disabled (SPA mode)
- ✅ Ready for static hosting

## 🚢 Deployment to Hostinger

1. Run `npm run generate`
2. Upload contents of `.output/public` to your Hostinger hosting
3. Make sure `.htaccess` is uploaded (for routing)
4. Done!

## 📝 Next Steps

The following pages need to be created:
- `/pages/billing.vue` - Invoice creation
- `/pages/inventory.vue` - Product management
- `/pages/customers.vue` - Customer management
- `/pages/expenses.vue` - Expense tracking
- `/pages/analytics.vue` - Reports and analytics
- `/pages/settings.vue` - User settings

## 🛠️ Development

- Uses Vue 3 Composition API
- TypeScript enabled
- Firebase v10 (modular SDK)
- Font Awesome icons
- Inter font family

## 📦 Dependencies

- `nuxt`: ^3.8.0
- `firebase`: ^10.7.1

