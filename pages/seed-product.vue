<script setup lang="ts">
// Redirect to seed-products (plural)
definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'Redirecting...'
})

onMounted(() => {
  navigateTo('/seed-products')
})
</script>

<template>
  <div class="redirecting">
    <p>Redirecting...</p>
  </div>
</template>

<style scoped>
.redirecting {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: 18px;
  color: #6b7280;
}
</style>

