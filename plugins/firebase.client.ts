import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

export default defineNuxtPlugin((nuxtApp) => {
  // Firebase configuration - VERIFY THESE VALUES IN FIREBASE CONSOLE
  const firebaseConfig = {
    apiKey: 'AIzaSyAvfhSrMHp0ELjejrAAI9tFV9kYjA7RJB4',
    authDomain: 'smartbilling-a8a5e.firebaseapp.com',
    projectId: 'smartbilling-a8a5e',
    storageBucket: 'smartbilling-a8a5e.firebasestorage.app',
    messagingSenderId: '66323145680',
    appId: '1:66323145680:web:abbb39dae24cbccc860fd5',
    measurementId: 'G-LGLF57GCQK'
  }

  // Validate config before initializing
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.authDomain) {
    const error = '❌ Firebase config is incomplete! Missing required fields.'
    console.error(error, firebaseConfig)
    throw new Error(error)
  }

  try {
    // Initialize Firebase app (only if not already initialized)
    let app
    const existingApps = getApps()
    if (existingApps.length === 0) {
      app = initializeApp(firebaseConfig)
      console.log('✅ Firebase initialized successfully')
    } else {
      app = existingApps[0]
      console.log('✅ Using existing Firebase app')
    }

    // Initialize services
    const auth = getAuth(app)
    const db = getFirestore(app)
    const storage = getStorage(app)

    // Verify all services are initialized
    if (!auth) {
      throw new Error('Firebase Auth failed to initialize')
    }
    if (!db) {
      throw new Error('Firestore failed to initialize')
    }
    
    // Verify auth is ready
    if (auth.app.name !== '[DEFAULT]') {
      console.warn('Firebase Auth app name mismatch')
    }
    
    // Verify configuration
    if (!auth.app.options.apiKey) {
      console.error('⚠️ Firebase API key is missing!')
    }
    if (!auth.app.options.authDomain) {
      console.error('⚠️ Firebase Auth Domain is missing!')
    }
    
    console.log('✅ Firebase services initialized:', {
      auth: !!auth,
      db: !!db,
      storage: !!storage,
      projectId: app.options.projectId,
      authDomain: app.options.authDomain,
      apiKey: app.options.apiKey ? app.options.apiKey.substring(0, 10) + '...' : 'MISSING'
    })
    
    // Check if auth domain matches
    if (app.options.authDomain !== firebaseConfig.authDomain) {
      console.warn('⚠️ Auth domain mismatch:', {
        expected: firebaseConfig.authDomain,
        actual: app.options.authDomain
      })
    }

    // Verify auth service is available
    try {
      // This will throw if auth is not properly configured
      const authSettings = auth.settings
      console.log('✅ Auth service is properly configured')
    } catch (authError: any) {
      console.error('❌ Auth service configuration error:', authError)
      console.error('⚠️ Make sure:')
      console.error('   1. Go to Firebase Console → Authentication → Sign-in method')
      console.error('   2. Enable Email/Password authentication')
      console.error('   3. Go to Google Cloud Console → APIs & Services → Library')
      console.error('   4. Enable "Identity Toolkit API"')
    }

    return {
      provide: {
        firebase: {
          app,
          auth,
          db,
          storage
        }
      }
    }
  } catch (error: any) {
    console.error('❌ Firebase initialization error:', error)
    console.error('Config used:', {
      apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
      projectId: firebaseConfig.projectId
    })
    throw error
  }
})
