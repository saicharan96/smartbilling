/**
 * Firebase Configuration Test Utility
 * Use this to verify Firebase is properly configured
 */
export const useFirebaseTest = () => {
  const testFirebaseConfig = async () => {
    try {
      const { $firebase } = useNuxtApp()
      
      if (!$firebase) {
        return {
          success: false,
          error: 'Firebase plugin not loaded'
        }
      }

      const results = {
        app: !!$firebase.app,
        auth: !!$firebase.auth,
        db: !!$firebase.db,
        storage: !!$firebase.storage,
        config: {
          projectId: $firebase.app?.options?.projectId,
          authDomain: $firebase.app?.options?.authDomain,
          apiKey: $firebase.app?.options?.apiKey ? 'Present' : 'Missing'
        }
      }

      // Try to access auth settings
      try {
        const auth = $firebase.auth
        if (auth) {
          results.authReady = true
          results.authAppName = auth.app.name
        }
      } catch (e: any) {
        results.authError = e.message
      }

      console.log('🔍 Firebase Configuration Test:', results)
      
      return {
        success: true,
        results
      }
    } catch (error: any) {
      console.error('❌ Firebase test error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  return {
    testFirebaseConfig
  }
}

