import { defineStore } from 'pinia'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged, type User } from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    userProfile: null as any,
    loading: true,
    error: null as string | null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userId: (state) => state.user?.uid || null
  },

  actions: {
    async init() {
      if (!process.client) return
      
      // If already initialized and not loading, return
      if (!this.loading && this.user !== undefined) {
        return
      }
      
      try {
        this.loading = true
        const { $firebase } = useNuxtApp()
        
        if (!$firebase || !$firebase.auth) {
          console.error('Firebase not initialized')
          this.loading = false
          return
        }
        
        // Check if user is already available
        const currentUser = $firebase.auth.currentUser
        if (currentUser) {
          this.user = currentUser
          this.loading = false
          await this.loadUserProfile()
          return
        }
        
        // Set up auth state listener
        return new Promise<void>((resolve) => {
          const unsubscribe = onAuthStateChanged($firebase.auth, async (firebaseUser) => {
            this.user = firebaseUser
            this.loading = false
            
            if (firebaseUser) {
              await this.loadUserProfile()
            }
            
            unsubscribe() // Unsubscribe after first state change
            resolve()
          })
          
          // Timeout after 5 seconds
          setTimeout(() => {
            if (this.loading) {
              this.loading = false
              console.warn('Auth init timeout')
              resolve()
            }
          }, 5000)
        })
      } catch (error) {
        console.error('Auth init error:', error)
        this.loading = false
      }
    },

    async loadUserProfile() {
      if (!this.user) return
      
      try {
        const { $firebase } = useNuxtApp()
        if (!$firebase || !$firebase.db) {
          console.error('Firebase DB not initialized')
          return
        }
        
        const docRef = doc($firebase.db, 'users', this.user.uid)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          this.userProfile = docSnap.data()
        } else {
          // If user document doesn't exist, create it
          console.log('User document not found, creating...')
          await setDoc(docRef, {
            name: this.user.displayName || this.user.email?.split('@')[0] || 'User',
            email: this.user.email || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
          const newDocSnap = await getDoc(docRef)
          if (newDocSnap.exists()) {
            this.userProfile = newDocSnap.data()
          }
        }
      } catch (error: any) {
        console.error('Error loading user profile:', error)
        // Handle permission errors more gracefully
        if (error.code === 'permission-denied') {
          console.error('❌ Permission denied. Firestore security rules are blocking access.')
          console.error('📋 To fix this:')
          console.error('   1. Go to Firebase Console → Firestore Database → Rules')
          console.error('   2. Copy the rules from firestore.rules file')
          console.error('   3. Paste and click "Publish"')
          this.error = 'Database access denied. Please check Firestore security rules in Firebase Console.'
        } else if (error.message?.includes('message channel closed') || error.message?.includes('listener')) {
          console.error('❌ Firestore connection error. This is usually caused by security rules blocking access.')
          console.error('📋 Make sure Firestore rules are deployed correctly in Firebase Console.')
          this.error = 'Database connection error. Please check Firestore security rules.'
        } else {
          this.error = error.message
        }
      }
    },

    async login(email: string, password: string) {
      try {
        this.loading = true
        this.error = null
        
        // Wait a bit to ensure Firebase is ready
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const { $firebase } = useNuxtApp()
        if (!$firebase || !$firebase.auth) {
          throw new Error('Firebase not initialized. Please refresh the page.')
        }
        
        // Validate email format
        if (!email || !email.includes('@')) {
          throw new Error('Please enter a valid email address')
        }
        
        // Validate password
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }
        
        console.log('Attempting login with:', { 
          email, 
          authReady: !!$firebase.auth,
          authApp: $firebase.auth?.app?.name,
          projectId: $firebase.app?.options?.projectId
        })
        
        // Ensure auth is ready
        if (!$firebase.auth.currentUser && $firebase.auth.app.name !== '[DEFAULT]') {
          console.warn('Auth app name is not DEFAULT, reinitializing...')
        }
        
        const userCredential = await signInWithEmailAndPassword($firebase.auth, email.trim(), password)
        this.user = userCredential.user
        await this.loadUserProfile()
        
        return { success: true }
      } catch (error: any) {
        console.error('Login error:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        
        // Better error messages
        let errorMessage = error.message || 'Login failed'
        if (error.code === 'auth/invalid-credential') {
          errorMessage = 'Invalid email or password. Please check your credentials or sign up if you don\'t have an account.'
        } else if (error.code === 'auth/user-not-found') {
          errorMessage = 'No account found with this email. Please sign up first.'
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Incorrect password. Please try again.'
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address format.'
        } else if (error.code === 'auth/user-disabled') {
          errorMessage = 'This account has been disabled.'
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Too many failed attempts. Please try again later.'
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your connection.'
        } else if (error.code === 'auth/invalid-api-key') {
          errorMessage = 'Invalid Firebase API key. Please check your Firebase configuration.'
        } else if (error.code === 'auth/configuration-not-found') {
          errorMessage = 'Firebase Authentication is not configured. Please enable Email/Password authentication in Firebase Console.'
        } else if (error.message?.includes('400')) {
          errorMessage = 'Authentication service error. Please check your credentials.'
        }
        
        this.error = errorMessage
        return { success: false, error: errorMessage }
      } finally {
        this.loading = false
      }
    },

    async register(name: string, email: string, password: string) {
      try {
        this.loading = true
        this.error = null
        
        const { $firebase } = useNuxtApp()
        if (!$firebase || !$firebase.auth || !$firebase.db) {
          throw new Error('Firebase not initialized')
        }
        
        const userCredential = await createUserWithEmailAndPassword($firebase.auth, email, password)
        
        // Create user document
        await setDoc(doc($firebase.db, 'users', userCredential.user.uid), {
          name,
          email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        
        this.user = userCredential.user
        await this.loadUserProfile()
        
        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        const { $firebase } = useNuxtApp()
        if (!$firebase || !$firebase.auth) {
          throw new Error('Firebase not initialized')
        }
        await signOut($firebase.auth)
        this.user = null
        this.userProfile = null
        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async resetPassword(email: string) {
      try {
        this.error = null
        const { $firebase } = useNuxtApp()
        if (!$firebase || !$firebase.auth) {
          throw new Error('Firebase not initialized')
        }
        await sendPasswordResetEmail($firebase.auth, email)
        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async updateUserProfile(updates: any) {
      try {
        if (!this.user) throw new Error('User not authenticated')
        
        const { $firebase } = useNuxtApp()
        if (!$firebase || !$firebase.db) {
          throw new Error('Firebase not initialized')
        }
        
        const docRef = doc($firebase.db, 'users', this.user.uid)
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp()
        })
        
        // Reload profile
        await this.loadUserProfile()
        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    }
  }
})

