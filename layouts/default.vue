<template>
  <div>
    <nav class="navbar">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 style="margin: 0; font-size: 20px;">Smart Billing System</h2>
        <button v-if="isMobile" class="mobile-menu-toggle" @click="toggleMenu">
          <i class="fas fa-bars"></i>
        </button>
        <div v-else style="display: flex; gap: 15px; align-items: center;">
          <span>{{ user?.email }}</span>
          <button @click="handleLogout" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 15px; border-radius: 4px; cursor: pointer;">
            <i class="fas fa-power-off"></i> Logout
          </button>
        </div>
      </div>
    </nav>

    <div class="sidenav" :class="{ 'mobile-open': menuOpen }">
      <NuxtLink to="/dashboard" title="Dashboard">
        <img src="/images/home.png" alt="Dashboard">
      </NuxtLink>
      <NuxtLink to="/billing" title="Billing">
        <img src="/images/receipt.png" alt="Billing">
      </NuxtLink>
      <NuxtLink to="/inventory" title="Inventory">
        <img src="/images/inventory.png" alt="Inventory">
      </NuxtLink>
      <NuxtLink to="/customers" title="Customers">
        <img src="/images/company.png" alt="Customers">
      </NuxtLink>
      <NuxtLink to="/expenses" title="Expenses">
        <img src="/images/shopping-bag.png" alt="Expenses">
      </NuxtLink>
      <NuxtLink to="/analytics" title="Analytics">
        <img src="/images/analytics.png" alt="Analytics">
      </NuxtLink>
      <NuxtLink to="/settings" title="Settings">
        <img src="/images/settings%20(1).png" alt="Settings">
      </NuxtLink>
    </div>

    <div class="main-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
const router = useRouter()
const menuOpen = ref(false)
const isMobile = ref(false)

onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768
  }
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const handleLogout = async () => {
  await logout()
  router.push('/')
}

// Close mobile menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (isMobile.value && menuOpen.value) {
      const sidenav = document.querySelector('.sidenav')
      const toggle = document.querySelector('.mobile-menu-toggle')
      if (sidenav && !sidenav.contains(e.target as Node) && !toggle?.contains(e.target as Node)) {
        menuOpen.value = false
      }
    }
  })
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #21679e;
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
}

.sidenav {
  position: fixed;
  left: 0;
  top: 60px;
  width: 60px;
  height: calc(100vh - 60px);
  background: white;
  box-shadow: 2px 0 4px rgba(0,0,0,0.1);
  padding: 10px 0;
  z-index: 999;
  overflow-y: auto;
}

.sidenav a {
  display: block;
  padding: 15px;
  text-align: center;
  color: #333;
  text-decoration: none;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.sidenav a:hover,
.sidenav a.router-link-active {
  background: #f5f5f5;
}

.sidenav img {
  width: 24px;
  height: 24px;
}

.main-content {
  margin-left: 60px;
  margin-top: 60px;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.mobile-menu-toggle {
  display: none;
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
}

@media (max-width: 768px) {
  .sidenav {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidenav.mobile-open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }

  .mobile-menu-toggle {
    display: block;
  }
}
</style>

