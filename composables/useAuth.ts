// Legacy composable - now using Pinia store
// Keeping for backward compatibility
export const useAuth = () => {
  const authStore = useAuthStore()
  
  return {
    user: computed(() => authStore.user),
    loading: computed(() => authStore.loading),
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout,
    resetPassword: authStore.resetPassword,
    getUserProfile: authStore.loadUserProfile
  }
}
