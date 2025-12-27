import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

export const useAuth = () => {
  const { $firebase } = useNuxtApp()
  const user = useState<any>('user', () => null)
  const loading = useState<boolean>('authLoading', () => true)

  // Watch auth state
  if (process.client) {
    onAuthStateChanged($firebase.auth, (firebaseUser) => {
      user.value = firebaseUser
      loading.value = false
    })
  }

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword($firebase.auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword($firebase.auth, email, password)
      await setDoc(doc($firebase.db, 'users', userCredential.user.uid), {
        name,
        email,
        createdAt: serverTimestamp()
      })
      return { success: true, user: userCredential.user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await signOut($firebase.auth)
      user.value = null
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail($firebase.auth, email)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const getUserProfile = async () => {
    if (!user.value) return null
    try {
      const docRef = doc($firebase.db, 'users', user.value.uid)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? docSnap.data() : null
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    login,
    register,
    logout,
    resetPassword,
    getUserProfile
  }
}
