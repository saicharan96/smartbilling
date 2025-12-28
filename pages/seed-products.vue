<template>
  <div class="seed-page">
    <div class="seed-container">
      <h1 class="seed-title">Seed Products</h1>
      <p class="seed-description">
        This will add 50 sample products with base64 images to your inventory.
      </p>
      
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Seeding products... Please wait.</p>
      </div>
      
      <div v-else-if="result" class="result-state" :class="{ success: result.success, error: !result.success }">
        <p v-if="result.success" class="success-message">
          ✅ {{ result.message }}
        </p>
        <p v-else class="error-message">
          ❌ {{ result.error }}
        </p>
      </div>
      
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="loading || (result?.success)"
        @click="handleSeed"
        class="seed-button"
      >
        {{ loading ? 'Seeding...' : (result?.success ? 'Products Seeded!' : 'Seed 50 Products') }}
      </el-button>
      
      <div v-if="result?.success" class="next-steps">
        <p>You can now:</p>
        <ul>
          <li>Go to <NuxtLink to="/inventory">Inventory</NuxtLink> to view the products</li>
          <li>Go to <NuxtLink to="/billing">Billing</NuxtLink> to start selling</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSeedProducts } from '~/composables/useSeedProducts'

definePageMeta({
  middleware: 'auth',
  alias: ['/seed-product', '/seed-products']
})

const { seedProducts } = useSeedProducts()
const loading = ref(false)
const result = ref<{ success: boolean; message?: string; error?: string } | null>(null)

const handleSeed = async () => {
  loading.value = true
  result.value = null
  
  try {
    const response = await seedProducts()
    result.value = response
  } catch (error: any) {
    result.value = {
      success: false,
      error: error.message || 'An error occurred'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.seed-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f5f5f5;
}

.dark .seed-page {
  background: #0f172a;
}

.seed-container {
  max-width: 600px;
  width: 100%;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.dark .seed-container {
  background: #1e293b;
}

.seed-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #111827;
}

.dark .seed-title {
  color: #f1f5f9;
}

.seed-description {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 32px;
  line-height: 1.6;
}

.dark .seed-description {
  color: #94a3b8;
}

.loading-state {
  margin: 32px 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #00ED64;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.dark .spinner {
  border-color: #334155;
  border-top-color: #00ED64;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.result-state {
  margin: 24px 0;
  padding: 16px;
  border-radius: 8px;
}

.result-state.success {
  background: #d1fae5;
  border: 1px solid #10b981;
}

.dark .result-state.success {
  background: #064e3b;
  border-color: #10b981;
}

.result-state.error {
  background: #fee2e2;
  border: 1px solid #ef4444;
}

.dark .result-state.error {
  background: #7f1d1d;
  border-color: #ef4444;
}

.success-message {
  color: #065f46;
  font-weight: 500;
  font-size: 16px;
  margin: 0;
}

.dark .success-message {
  color: #6ee7b7;
}

.error-message {
  color: #991b1b;
  font-weight: 500;
  font-size: 16px;
  margin: 0;
}

.dark .error-message {
  color: #fca5a5;
}

.seed-button {
  margin-top: 24px;
  padding: 12px 32px;
  font-size: 16px;
}

.next-steps {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  text-align: left;
}

.dark .next-steps {
  border-top-color: #334155;
}

.next-steps p {
  font-weight: 600;
  margin-bottom: 12px;
  color: #111827;
}

.dark .next-steps p {
  color: #f1f5f9;
}

.next-steps ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.next-steps li {
  padding: 8px 0;
  color: #6b7280;
}

.dark .next-steps li {
  color: #94a3b8;
}

.next-steps a {
  color: #00ED64;
  text-decoration: none;
  font-weight: 500;
}

.next-steps a:hover {
  text-decoration: underline;
}
</style>

