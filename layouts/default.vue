<template>
  <div class="layout-wrapper">
    <!-- Header -->
    <header class="layout-header">
      <div class="header-title-section">
        <img 
          v-if="authStore.userProfile?.businessLogo" 
          :src="authStore.userProfile.businessLogo" 
          alt="Business Logo" 
          class="business-logo"
        />
        <h1 v-else class="header-title">XendPoS</h1>
      </div>
      <div class="header-right">
        <GlobalSearch />
        <button 
          @click="themeStore.toggle()" 
          class="theme-toggle-btn"
          :title="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <SunIcon v-if="themeStore.isDark" class="icon" />
          <MoonIcon v-else class="icon" />
        </button>
        <span class="user-email">{{ authStore.user?.email }}</span>
        <button class="logout-btn" @click="handleLogout">
          <ArrowRightOnRectangleIcon class="icon" />
          Logout
        </button>
      </div>
    </header>

    <div class="layout-body">
      <!-- Sidebar -->
      <aside class="sidebar" :class="{ 'mobile-hidden': isMobile && !menuOpen }">
        <nav class="sidebar-nav">
          <NuxtLink to="/dashboard" class="nav-item" :class="{ 'active': route.path === '/dashboard' }">
            <HomeIcon class="nav-icon" />
          </NuxtLink>
          <NuxtLink to="/billing" class="nav-item" :class="{ 'active': route.path === '/billing' }">
            <DocumentTextIcon class="nav-icon" />
          </NuxtLink>
          <NuxtLink to="/inventory" class="nav-item" :class="{ 'active': route.path === '/inventory' }">
            <CubeIcon class="nav-icon" />
          </NuxtLink>
          <NuxtLink to="/customers" class="nav-item" :class="{ 'active': route.path === '/customers' }">
            <UserGroupIcon class="nav-icon" />
          </NuxtLink>
          <NuxtLink to="/expenses" class="nav-item" :class="{ 'active': route.path === '/expenses' }">
            <ShoppingBagIcon class="nav-icon" />
          </NuxtLink>
          <NuxtLink to="/analytics" class="nav-item" :class="{ 'active': route.path === '/analytics' }">
            <ChartBarIcon class="nav-icon" />
          </NuxtLink>
          <NuxtLink to="/settings" class="nav-item" :class="{ 'active': route.path === '/settings' }">
            <Cog6ToothIcon class="nav-icon" />
          </NuxtLink>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Bars3Icon, 
  ArrowRightOnRectangleIcon,
  HomeIcon,
  DocumentTextIcon,
  CubeIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()
const route = useRoute()
const menuOpen = ref(false)
const isMobile = ref(false)

onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768
  }
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(async () => {
  themeStore.init()
  await authStore.init()
  await authStore.loadUserProfile()
})
</script>

<style scoped>
.layout-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  overflow: hidden;
  transition: background-color 0.3s ease;
}

.dark .layout-wrapper {
  background: #0f172a;
}

.layout-header {
  height: 64px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 100;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.dark .layout-header {
  background: #1e293b;
  border-bottom-color: #334155;
}

.header-title-section {
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  font-family: 'Sora', sans-serif;
  transition: color 0.3s ease;
}

.dark .header-title {
  color: #f1f5f9;
}

.business-logo {
  max-height: 40px;
  max-width: 200px;
  object-fit: contain;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-toggle-btn {
  background: transparent;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.theme-toggle-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.dark .theme-toggle-btn {
  border-color: #475569;
  color: #cbd5e1;
}

.dark .theme-toggle-btn:hover {
  background: #334155;
  border-color: #64748b;
}

.user-email {
  color: #6b7280;
  font-size: 14px;
  display: none;
  transition: color 0.3s ease;
}

.dark .user-email {
  color: #94a3b8;
}

@media (min-width: 768px) {
  .user-email {
    display: block;
  }
}

.logout-btn {
  background: #001f2a;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #001118;
}

.icon {
  width: 16px;
  height: 16px;
}

.layout-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 64px;
  background: #001f2a;
  flex-shrink: 0;
  border-right: 1px solid #001118;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.dark .sidebar {
  background: #0f172a;
  border-right-color: #1e293b;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  width: 100%;
  color: #B0CAD7;
  text-decoration: none;
  border-bottom: 1px solid rgba(176, 202, 215, 0.2);
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(176, 202, 215, 0.1);
  color: #B0CAD7;
}

.nav-item.active {
  background: rgba(176, 202, 215, 0.15);
  color: #B0CAD7;
  border-left: 3px solid #B0CAD7;
}

.nav-item.active .nav-icon {
  color: #B0CAD7;
}

.nav-item:hover .nav-icon {
  color: #B0CAD7;
}

.nav-icon {
  width: 24px;
  height: 24px;
  color: #B0CAD7;
  stroke: currentColor;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 24px;
  transition: background-color 0.3s ease;
}

.dark .main-content {
  background: #0f172a;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 64px;
    height: calc(100vh - 64px);
    z-index: 1000;
    transform: translateX(0);
    transition: transform 0.3s;
  }
  
  .sidebar.mobile-hidden {
    transform: translateX(-100%);
  }
}
</style>
