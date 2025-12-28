export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  
  // Initialize auth if not already done
  if (authStore.loading) {
    await authStore.init()
  }

  // If not logged in and trying to access protected route
  if (!authStore.user && to.path !== '/') {
    return navigateTo('/')
  }
  
  // If logged in and trying to access login page
  if (authStore.user && to.path === '/') {
    return navigateTo('/dashboard')
  }
})

