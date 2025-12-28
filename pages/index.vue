<template>
  <div class="login-container">
    <!-- Left Side - Login Form -->
    <div class="login-left">
      <div class="login-content">

        <div class="login-form-card">
          <h2>Login</h2>
          
          <form @submit.prevent="handleLogin">
            <div v-if="loginError" class="alert alert-error">
              <ExclamationCircleIcon class="alert-icon" /> {{ loginError }}
            </div>
            
            <div class="form-group">
              <label for="email">Email Address</label>
              <div class="input-wrapper">
                <EnvelopeIcon class="input-icon-left" />
                <input 
                  v-model="email" 
                  type="email" 
                  id="email" 
                  placeholder="Enter your email address" 
                  required 
                  autocomplete="email"
                >
              </div>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <div class="input-wrapper">
                <LockClosedIcon class="input-icon-left" />
                <input 
                  v-model="password" 
                  type="password" 
                  id="password" 
                  placeholder="Enter your password" 
                  required 
                  autocomplete="current-password"
                >
              </div>
            </div>

            <div class="remember-section">
              <label class="toggle-switch">
                <input v-model="remember" type="checkbox">
                <span class="slider"></span>
                <span class="toggle-label">Keep me logged in</span>
              </label>
            </div>

            <button type="submit" class="btn-login" :disabled="loading">
              {{ loading ? 'Logging in...' : 'Log in' }}
            </button>
            
            <button type="button" @click="testFirebase" class="btn-test" style="margin-top: 10px; background: #6c757d; color: white; padding: 10px; border: none; border-radius: 8px; width: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <BeakerIcon class="icon-small" /> Test Firebase Connection
            </button>
          </form>

          <div class="touchid-section">
            <div class="touchid-icon">
              <FingerPrintIcon class="touchid-icon-svg" />
            </div>
            <p>Login With TouchId</p>
          </div>

          <div class="signup-link">
            Don't have an account? <a href="#" @click.prevent="showRegisterModal = true">Sign Up</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side - Illustration -->
    <div class="login-right">
      <div class="illustration-container">
        <img src="/images/pos-right.png" alt="POS System" class="illustration-image">
      </div>
    </div>

    <!-- Register Modal -->
    <div v-if="showRegisterModal" class="modal-overlay" @click="showRegisterModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>Create Account</h4>
          <button @click="showRegisterModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleRegister">
            <div v-if="registerError" class="alert alert-error">{{ registerError }}</div>
            
            <div class="form-group">
              <label>Full Name</label>
              <div class="input-wrapper">
                <UserIcon class="input-icon-left" />
                <input v-model="regName" type="text" placeholder="Enter your full name" required>
              </div>
            </div>

            <div class="form-group">
              <label>Email</label>
              <div class="input-wrapper">
                <EnvelopeIcon class="input-icon-left" />
                <input v-model="regEmail" type="email" placeholder="Enter your email address" required>
              </div>
            </div>

            <div class="form-group">
              <label>Password</label>
              <div class="input-wrapper">
                <LockClosedIcon class="input-icon-left" />
                <input v-model="regPassword" type="password" placeholder="Min 6 characters" required minlength="6">
              </div>
            </div>

            <button type="submit" class="btn-login" :disabled="loading">
              {{ loading ? 'Creating...' : 'Create Account' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div v-if="showResetModal" class="modal-overlay" @click="showResetModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>Reset Password</h4>
          <button @click="showResetModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleReset">
            <div v-if="resetError" class="alert alert-error">{{ resetError }}</div>
            <div v-if="resetSuccess" class="alert alert-success">{{ resetSuccess }}</div>
            
            <div class="form-group">
              <label>Email</label>
              <div class="input-wrapper">
                <EnvelopeIcon class="input-icon-left" />
                <input v-model="resetEmail" type="email" placeholder="Enter your email" required>
              </div>
            </div>

            <button type="submit" class="btn-login" :disabled="loading">
              {{ loading ? 'Sending...' : 'Send Reset Link' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ExclamationCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  BeakerIcon,
  FingerPrintIcon,
  UserIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(true)
const loading = ref(false)
const loginError = ref('')

const regName = ref('')
const regEmail = ref('')
const regPassword = ref('')
const registerError = ref('')
const showRegisterModal = ref(false)

const resetEmail = ref('')
const resetError = ref('')
const resetSuccess = ref('')
const showResetModal = ref(false)

// Test Firebase connection
const testFirebase = async () => {
  try {
    const { $firebase } = useNuxtApp()
    console.log('🔍 Testing Firebase connection...')
    
    if (!$firebase) {
      console.error('❌ Firebase plugin not loaded')
      loginError.value = 'Firebase not initialized. Please refresh the page.'
      return
    }
    
    const testResults = {
      app: !!$firebase.app,
      auth: !!$firebase.auth,
      db: !!$firebase.db,
      projectId: $firebase.app?.options?.projectId,
      authDomain: $firebase.app?.options?.authDomain,
      apiKey: $firebase.app?.options?.apiKey ? 'Present' : 'Missing'
    }
    
    console.log('📊 Firebase Status:', testResults)
    
    if (!testResults.auth) {
      loginError.value = 'Firebase Auth is not initialized. Check console for details.'
      return
    }
    
    // Try to access auth settings to verify it's configured
    try {
      const auth = $firebase.auth
      console.log('✅ Auth service available:', {
        appName: auth.app.name,
        projectId: auth.app.options.projectId
      })
      
      // Check if we can make a test request
      alert('✅ Firebase is connected!\n\nProject: ' + testResults.projectId + '\nAuth Domain: ' + testResults.authDomain + '\n\nIf login still fails, enable Email/Password auth in Firebase Console.')
    } catch (e: any) {
      console.error('❌ Auth configuration error:', e)
      loginError.value = 'Firebase Auth not configured. Enable Email/Password in Firebase Console → Authentication → Sign-in method'
    }
  } catch (error: any) {
    console.error('❌ Firebase test error:', error)
    loginError.value = 'Firebase connection test failed: ' + error.message
  }
}

const handleLogin = async () => {
  loading.value = true
  loginError.value = ''
  
  // Validate inputs
  if (!email.value || !email.value.includes('@')) {
    loginError.value = 'Please enter a valid email address'
    loading.value = false
    return
  }
  
  if (!password.value || password.value.length < 6) {
    loginError.value = 'Password must be at least 6 characters'
    loading.value = false
    return
  }
  
  // Verify Firebase is ready
  const { $firebase } = useNuxtApp()
  if (!$firebase || !$firebase.auth) {
    loginError.value = 'Firebase not initialized. Please refresh the page and try again.'
    loading.value = false
    return
  }
  
  const result = await authStore.login(email.value.trim(), password.value)
  
  if (result.success) {
    router.push('/dashboard')
  } else {
    loginError.value = result.error || 'Invalid email or password'
  }
  
  loading.value = false
}

const handleRegister = async () => {
  loading.value = true
  registerError.value = ''
  
  const result = await authStore.register(regName.value, regEmail.value, regPassword.value)
  
  if (result.success) {
    showRegisterModal.value = false
    router.push('/dashboard')
  } else {
    registerError.value = result.error || 'Error creating account'
  }
  
  loading.value = authStore.loading
}

const handleReset = async () => {
  loading.value = true
  resetError.value = ''
  resetSuccess.value = ''
  
  const result = await authStore.resetPassword(resetEmail.value)
  
  if (result.success) {
    resetSuccess.value = 'Reset link sent! Check your email.'
    setTimeout(() => {
      showResetModal.value = false
      resetEmail.value = ''
    }, 2000)
  } else {
    resetError.value = result.error || 'Error sending reset email'
  }
  
  loading.value = false
}

// Initialize auth store on mount
onMounted(async () => {
  await authStore.init()
})
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}

/* Left Side - Login Form */
.login-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
}

.login-content {
  width: 100%;
  max-width: 450px;
}

.login-header {
  margin-bottom: 40px;
}

.login-header h1 {
  font-family: var(--font-primary);
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.login-header p {
  font-family: var(--font-secondary);
  font-size: 16px;
  color: #666;
}

.login-form-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.login-form-card h2 {
  font-family: var(--font-primary);
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-family: var(--font-secondary);
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
}

.input-icon-left {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  width: 20px;
  height: 20px;
  pointer-events: none;
}

.alert-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  display: inline-block;
  vertical-align: middle;
}

.icon-small {
  width: 18px;
  height: 18px;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 16px 14px 50px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-family: var(--font-secondary);
  font-size: 15px;
  transition: all 0.3s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.remember-section {
  margin-bottom: 24px;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.toggle-switch input {
  display: none;
}

.slider {
  position: relative;
  width: 44px;
  height: 24px;
  background: #e0e0e0;
  border-radius: 12px;
  transition: background 0.3s;
}

.slider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  left: 3px;
  top: 3px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle-switch input:checked + .slider {
  background: var(--base-color);
}

.toggle-switch input:checked + .slider::before {
  transform: translateX(20px);
}

.toggle-label {
  font-family: var(--font-secondary);
  font-size: 14px;
  color: #666;
}

.btn-login {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--base-color) 0%, var(--base-color-dark) 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-family: var(--font-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 24px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 31, 42, 0.3);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.touchid-section {
  text-align: center;
  margin-bottom: 24px;
}

.touchid-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 12px;
  background: rgba(220, 38, 39, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--base-color);
}

.touchid-icon-svg {
  width: 28px;
  height: 28px;
}

.touchid-section p {
  font-family: var(--font-secondary);
  font-size: 14px;
  color: #666;
}

.signup-link {
  text-align: center;
  font-family: var(--font-secondary);
  font-size: 14px;
  color: #666;
}

.signup-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.signup-link a:hover {
  text-decoration: underline;
}

/* Right Side - Illustration */
.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
  position: relative;
  overflow: hidden;
}

.illustration-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration-image {
  width: 100%;
  max-width: 500px;
  height: auto;
  object-fit: contain;
  animation: fadeInUp 0.8s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Alert */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-family: var(--font-secondary);
  font-size: 14px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-error {
  background: #fee;
  color: #c33;
  border-left: 3px solid #c33;
}

.alert-success {
  background: #efe;
  color: #3c3;
  border-left: 3px solid #3c3;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px 30px;
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h4 {
  font-family: var(--font-primary);
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.modal-body {
  padding: 30px;
}

/* Responsive */
@media (max-width: 968px) {
  .login-container {
    flex-direction: column;
  }

  .login-right {
    display: none;
  }

  .login-left {
    padding: 20px;
  }
}
</style>
