<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-header">
        <h1><i class="fas fa-calculator"></i> Smart Billing</h1>
        <p>Inventory & Sales Management</p>
      </div>

      <div class="login-body">
        <form @submit.prevent="handleLogin">
          <div v-if="loginError" class="alert alert-error">{{ loginError }}</div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <div class="input-wrapper">
              <i class="fas fa-envelope"></i>
              <input 
                v-model="email" 
                type="email" 
                id="email" 
                placeholder="your@email.com" 
                required 
                autocomplete="email"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <i class="fas fa-lock"></i>
              <input 
                v-model="password" 
                type="password" 
                id="password" 
                placeholder="Enter password" 
                required 
                autocomplete="current-password"
              >
            </div>
          </div>

          <div class="options">
            <label class="remember">
              <input v-model="remember" type="checkbox">
              Remember me
            </label>
            <a href="#" class="forgot-link" @click.prevent="showResetModal = true">Forgot Password?</a>
          </div>

          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div class="divider">or</div>

        <div class="signup-text">
          Don't have an account? <a href="#" @click.prevent="showRegisterModal = true">Sign Up</a>
        </div>
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
                <i class="fas fa-user"></i>
                <input v-model="regName" type="text" placeholder="Your full name" required>
              </div>
            </div>

            <div class="form-group">
              <label>Email</label>
              <div class="input-wrapper">
                <i class="fas fa-envelope"></i>
                <input v-model="regEmail" type="email" placeholder="your@email.com" required>
              </div>
            </div>

            <div class="form-group">
              <label>Password</label>
              <div class="input-wrapper">
                <i class="fas fa-lock"></i>
                <input v-model="regPassword" type="password" placeholder="Min 6 characters" required minlength="6">
              </div>
            </div>

            <button type="submit" class="btn-primary" :disabled="loading">
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
                <i class="fas fa-envelope"></i>
                <input v-model="resetEmail" type="email" placeholder="your@email.com" required>
              </div>
              <small style="color: #666; font-size: 12px; margin-top: 5px; display: block;">
                We'll send you a password reset link
              </small>
            </div>

            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Sending...' : 'Send Reset Link' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { login, register, resetPassword } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(false)
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

const handleLogin = async () => {
  loading.value = true
  loginError.value = ''
  
  const result = await login(email.value, password.value)
  
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
  
  const result = await register(regName.value, regEmail.value, regPassword.value)
  
  if (result.success) {
    showRegisterModal.value = false
    router.push('/dashboard')
  } else {
    registerError.value = result.error || 'Error creating account'
  }
  
  loading.value = false
}

const handleReset = async () => {
  loading.value = true
  resetError.value = ''
  resetSuccess.value = ''
  
  const result = await resetPassword(resetEmail.value)
  
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
</script>

<style scoped>
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
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 25px;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h4 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 25px;
}
</style>

