export default defineNuxtRouteMiddleware((to, from) => {
  const { user, loading } = useAuth()
  
  // Wait for auth to initialize
  if (loading.value) {
    return
  }

  // If not logged in and trying to access protected route
  if (!user.value && to.path !== '/') {
    return navigateTo('/')
  }
  
  // If logged in and trying to access login page
  if (user.value && to.path === '/') {
    return navigateTo('/dashboard')
  }
})

