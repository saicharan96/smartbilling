<template>
  <div class="global-search-container">
    <!-- Search Trigger Button -->
    <button 
      @click="openSearch"
      class="search-trigger"
      :class="{ 'dark': themeStore.isDark }"
    >
      <MagnifyingGlassIcon class="search-icon" />
      <span class="search-placeholder">Search customers, products...</span>
      <kbd class="search-shortcut">⌘K</kbd>
    </button>

    <!-- Search Modal/Overlay -->
    <Teleport to="body">
      <Transition name="search-fade">
        <div 
          v-if="isOpen" 
          class="search-overlay"
          @click.self="closeSearch"
        >
          <div class="search-modal" :class="{ 'dark': themeStore.isDark }">
            <!-- Search Input -->
            <div class="search-input-wrapper">
              <MagnifyingGlassIcon class="search-input-icon" />
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                placeholder="Search customers, products, vendors..."
                class="search-input"
                @input="performSearch"
                @keydown.esc="closeSearch"
                @keydown.down.prevent="navigateResults(1)"
                @keydown.up.prevent="navigateResults(-1)"
                @keydown.enter="selectResult"
              />
              <button 
                v-if="searchQuery"
                @click="clearSearch"
                class="clear-search-btn"
              >
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>

            <!-- Search Results -->
            <div v-if="searchQuery && (isSearching || hasResults)" class="search-results">
              <div v-if="isSearching" class="search-loading">
                <div class="loading-spinner"></div>
                <span>Searching...</span>
              </div>

              <div v-else-if="hasResults" class="results-container">
                <!-- Products Results -->
                <div v-if="results.products.length > 0" class="result-section">
                  <div class="result-section-header">
                    <CubeIcon class="section-icon" />
                    <span>Products ({{ results.products.length }})</span>
                  </div>
                  <div 
                    v-for="(product, index) in results.products" 
                    :key="`product-${product.id}`"
                    class="result-item"
                    :class="{ 'active': selectedIndex === index }"
                    @click="goToProduct(product)"
                    @mouseenter="selectedIndex = index"
                  >
                    <div class="result-item-content">
                      <div class="result-item-title">{{ product.name }}</div>
                      <div class="result-item-meta">
                        <span>Code: {{ product.code || 'N/A' }}</span>
                        <span>•</span>
                        <span>Price: {{ formatCurrency(product.price) }}</span>
                        <span>•</span>
                        <span>Stock: {{ product.quantity }}</span>
                      </div>
                    </div>
                    <ArrowRightIcon class="result-arrow" />
                  </div>
                </div>

                <!-- Customers Results -->
                <div v-if="results.customers.length > 0" class="result-section">
                  <div class="result-section-header">
                    <UserGroupIcon class="section-icon" />
                    <span>Customers ({{ results.customers.length }})</span>
                  </div>
                  <div 
                    v-for="(customer, index) in results.customers" 
                    :key="`customer-${customer.id}`"
                    class="result-item"
                    :class="{ 'active': selectedIndex === results.products.length + index }"
                    @click="goToCustomer(customer)"
                    @mouseenter="selectedIndex = results.products.length + index"
                  >
                    <div class="result-item-content">
                      <div class="result-item-title">{{ customer.name }}</div>
                      <div class="result-item-meta">
                        <span v-if="customer.email">{{ customer.email }}</span>
                        <span v-if="customer.contact">{{ customer.contact }}</span>
                        <span v-if="customer.totalAmount">• Total: {{ formatCurrency(customer.totalAmount) }}</span>
                      </div>
                    </div>
                    <ArrowRightIcon class="result-arrow" />
                  </div>
                </div>

                <!-- No Results -->
                <div v-if="!hasResults && searchQuery" class="no-results">
                  <MagnifyingGlassIcon class="no-results-icon" />
                  <p>No results found for "{{ searchQuery }}"</p>
                  <p class="no-results-hint">Try searching for product names, customer names, or codes</p>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="!searchQuery" class="search-empty">
              <MagnifyingGlassIcon class="empty-icon" />
              <p>Start typing to search...</p>
              <div class="search-tips">
                <div class="tip-item">
                  <kbd>⌘K</kbd>
                  <span>Open search</span>
                </div>
                <div class="tip-item">
                  <kbd>↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div class="tip-item">
                  <kbd>Enter</kbd>
                  <span>Select</span>
                </div>
                <div class="tip-item">
                  <kbd>Esc</kbd>
                  <span>Close</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  CubeIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/vue/24/outline'
import { useProductsStore } from '~/stores/products'
import { useCustomersStore } from '~/stores/customers'
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()
const productsStore = useProductsStore()
const customersStore = useCustomersStore()
const router = useRouter()

const isOpen = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const isSearching = ref(false)
const selectedIndex = ref(-1)

interface SearchResults {
  products: any[]
  customers: any[]
}

const results = ref<SearchResults>({
  products: [],
  customers: []
})

const hasResults = computed(() => {
  return results.value.products.length > 0 || results.value.customers.length > 0
})

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    results.value = { products: [], customers: [] }
    return
  }

  isSearching.value = true
  selectedIndex.value = -1

  // Debounce search
  await new Promise(resolve => setTimeout(resolve, 200))

  const query = searchQuery.value.toLowerCase().trim()
  
  // Search products
  const productMatches = productsStore.products.filter(product => {
    const name = (product.name || '').toLowerCase()
    const code = (product.code || '').toLowerCase()
    const description = (product.description || '').toLowerCase()
    return name.includes(query) || code.includes(query) || description.includes(query)
  })

  // Search customers
  const customerMatches = customersStore.customers.filter(customer => {
    const name = (customer.name || '').toLowerCase()
    const email = (customer.email || '').toLowerCase()
    const contact = (customer.contact || '').toLowerCase()
    return name.includes(query) || email.includes(query) || contact.includes(query)
  })

  results.value = {
    products: productMatches.slice(0, 5), // Limit to 5 results per category
    customers: customerMatches.slice(0, 5)
  }

  isSearching.value = false
}

const openSearch = () => {
  isOpen.value = true
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

const closeSearch = () => {
  isOpen.value = false
  searchQuery.value = ''
  results.value = { products: [], customers: [] }
  selectedIndex.value = -1
}

const clearSearch = () => {
  searchQuery.value = ''
  results.value = { products: [], customers: [] }
  searchInputRef.value?.focus()
}

const navigateResults = (direction: number) => {
  const totalResults = results.value.products.length + results.value.customers.length
  if (totalResults === 0) return

  selectedIndex.value += direction
  if (selectedIndex.value < 0) selectedIndex.value = totalResults - 1
  if (selectedIndex.value >= totalResults) selectedIndex.value = 0
}

const selectResult = () => {
  const totalResults = results.value.products.length + results.value.customers.length
  if (selectedIndex.value < 0 || selectedIndex.value >= totalResults) return

  if (selectedIndex.value < results.value.products.length) {
    goToProduct(results.value.products[selectedIndex.value])
  } else {
    const customerIndex = selectedIndex.value - results.value.products.length
    goToCustomer(results.value.customers[customerIndex])
  }
}

const goToProduct = (product: any) => {
  closeSearch()
  router.push('/inventory')
}

const goToCustomer = (customer: any) => {
  closeSearch()
  router.push('/customers')
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0)
}

// Keyboard shortcut handler
onMounted(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Cmd+K or Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      if (isOpen.value) {
        closeSearch()
      } else {
        openSearch()
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
})

// Load data when search opens
watch(isOpen, (open) => {
  if (open) {
    if (productsStore.products.length === 0) {
      productsStore.fetchProducts()
    }
    if (customersStore.customers.length === 0) {
      customersStore.fetchCustomers()
    }
  }
})
</script>

<style scoped>
.global-search-container {
  position: relative;
}

.search-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 280px;
  max-width: 400px;
}

.search-trigger:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-trigger.dark {
  background: #1e293b;
  border-color: #475569;
}

.search-trigger.dark:hover {
  border-color: #64748b;
}

.search-icon {
  width: 18px;
  height: 18px;
  color: #6b7280;
  flex-shrink: 0;
}

.dark .search-icon {
  color: #94a3b8;
}

.search-placeholder {
  flex: 1;
  text-align: left;
  color: #9ca3af;
  font-size: 14px;
}

.dark .search-placeholder {
  color: #64748b;
}

.search-shortcut {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  line-height: 1;
  color: #6b7280;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.dark .search-shortcut {
  background: #0f172a;
  border-color: #334155;
  color: #94a3b8;
}

.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
}

.search-modal {
  width: 100%;
  max-width: 640px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.search-modal.dark {
  background: #1e293b;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.dark .search-input-wrapper {
  border-bottom-color: #334155;
}

.search-input-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
  margin-right: 12px;
  flex-shrink: 0;
}

.dark .search-input-icon {
  color: #94a3b8;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: #111827;
}

.dark .search-input {
  color: #f1f5f9;
}

.search-input::placeholder {
  color: #9ca3af;
}

.dark .search-input::placeholder {
  color: #64748b;
}

.clear-search-btn {
  padding: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.clear-search-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.dark .clear-search-btn {
  color: #94a3b8;
}

.dark .clear-search-btn:hover {
  background: #334155;
  color: #f1f5f9;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  max-height: calc(80vh - 80px);
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #6b7280;
}

.dark .search-loading {
  color: #94a3b8;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.dark .loading-spinner {
  border-color: #334155;
  border-top-color: #3b82f6;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.results-container {
  padding: 8px;
}

.result-section {
  margin-bottom: 16px;
}

.result-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
}

.dark .result-section-header {
  color: #94a3b8;
}

.section-icon {
  width: 16px;
  height: 16px;
}

.result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 4px;
}

.result-item:hover,
.result-item.active {
  background: #f3f4f6;
}

.dark .result-item:hover,
.dark .result-item.active {
  background: #334155;
}

.result-item-content {
  flex: 1;
  min-width: 0;
}

.result-item-title {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
}

.dark .result-item-title {
  color: #f1f5f9;
}

.result-item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
  flex-wrap: wrap;
}

.dark .result-item-meta {
  color: #94a3b8;
}

.result-arrow {
  width: 16px;
  height: 16px;
  color: #9ca3af;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.result-item:hover .result-arrow,
.result-item.active .result-arrow {
  opacity: 1;
}

.search-empty {
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
}

.dark .search-empty {
  color: #94a3b8;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #d1d5db;
}

.dark .empty-icon {
  color: #475569;
}

.search-tips {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.tip-item kbd {
  padding: 4px 8px;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  color: #6b7280;
}

.dark .tip-item kbd {
  background: #0f172a;
  border-color: #334155;
  color: #94a3b8;
}

.no-results {
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
}

.dark .no-results {
  color: #94a3b8;
}

.no-results-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #d1d5db;
}

.dark .no-results-icon {
  color: #475569;
}

.no-results-hint {
  font-size: 12px;
  margin-top: 8px;
  color: #9ca3af;
}

.dark .no-results-hint {
  color: #64748b;
}

/* Transitions */
.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity 0.2s ease;
}

.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .search-trigger {
    min-width: 150px;
    max-width: 200px;
    padding: 6px 12px;
  }

  .search-shortcut {
    display: none;
  }

  .search-placeholder {
    font-size: 12px;
  }

  .search-icon {
    width: 16px;
    height: 16px;
  }

  .search-modal {
    max-width: 95%;
    margin: 0 auto;
  }
}
</style>

