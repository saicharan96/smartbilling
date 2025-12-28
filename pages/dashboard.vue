<template>
  <div class="w-full">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Dashboard</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">Last Updated: {{ lastUpdated }}</p>
    </div>

    <!-- Stats Cards -->
    <div class="mb-6">
      <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-5">Overview</h3>
      <dl class="dashboard-metrics grid grid-cols-1 divide-gray-200 dark:divide-gray-700 overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-sm md:grid-cols-4 md:divide-x md:divide-y-0">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-base font-normal text-gray-900 dark:text-gray-100">Today's Sales</dt>
          <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
            <div class="flex items-baseline text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {{ formatCurrency(todaySales) }}
            </div>
            <div class="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ todaySalesCount }} invoices
            </div>
          </dd>
        </div>

        <div class="px-4 py-5 sm:p-6">
          <dt class="text-base font-normal text-gray-900 dark:text-gray-100">Total Products</dt>
          <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
            <div class="flex items-baseline text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {{ totalProducts }}
            </div>
            <div class="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              in inventory
            </div>
          </dd>
        </div>

        <div class="px-4 py-5 sm:p-6">
          <dt class="text-base font-normal text-gray-900 dark:text-gray-100">Total Customers</dt>
          <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
            <div class="flex items-baseline text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {{ totalCustomers }}
            </div>
            <div class="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              registered
            </div>
          </dd>
        </div>

        <div class="px-4 py-5 sm:p-6">
          <dt class="text-base font-normal text-gray-900 dark:text-gray-100">Monthly Expenses</dt>
          <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
            <div class="flex items-baseline text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {{ formatCurrency(monthlyExpenses) }}
            </div>
            <div class="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              this month
            </div>
          </dd>
        </div>
      </dl>
    </div>

    <!-- Recent Sales and Low Stock -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Recent Sales -->
      <el-card shadow="never" class="bg-white dark:bg-gray-800">
        <template #header>
          <span class="text-lg font-semibold dark:text-gray-100">Recent Sales</span>
        </template>
        <el-table 
          v-loading="salesStore.loading"
          :data="recentSales" 
          style="width: 100%"
          :empty-text="'No recent sales'"
        >
          <el-table-column prop="invoiceId" label="Invoice" width="120" />
          <el-table-column prop="customerName" label="Customer" />
          <el-table-column prop="total" label="Amount" width="120">
            <template #default="{ row }">
              {{ formatCurrency(row.total || 0) }}
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="Date" width="120">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Low Stock Items -->
      <el-card shadow="never" class="bg-white dark:bg-gray-800">
        <template #header>
          <span class="text-lg font-semibold dark:text-gray-100">Low Stock Items</span>
        </template>
        <el-table 
          :data="lowStockItems" 
          style="width: 100%"
          :empty-text="'No low stock items'"
        >
          <el-table-column prop="name" label="Product" />
          <el-table-column prop="quantity" label="Stock" width="100">
            <template #default="{ row }">
              <el-tag type="warning">{{ row.quantity || 0 }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const productsStore = useProductsStore()
const customersStore = useCustomersStore()
const salesStore = useSalesStore()
const expensesStore = useExpensesStore()

const todaySales = computed(() => salesStore.todayTotal)
const todaySalesCount = computed(() => salesStore.todayCount)
const totalProducts = computed(() => productsStore.totalProducts)
const totalCustomers = computed(() => customersStore.totalCustomers)
const monthlyExpenses = computed(() => expensesStore.monthlyExpenses)
const recentSales = computed(() => salesStore.sales.slice(0, 5))
const lowStockItems = computed(() => productsStore.lowStockProducts)

const lastUpdated = ref('')

const loadDashboard = async () => {
  try {
    await Promise.all([
      productsStore.fetchProducts(),
      customersStore.fetchCustomers(),
      salesStore.fetchSales(5),
      salesStore.fetchTodaySales(),
      expensesStore.fetchExpenses()
    ])
    
    lastUpdated.value = new Date().toLocaleString()
  } catch (error) {
    console.error('Error loading dashboard:', error)
  }
}

onMounted(() => {
  loadDashboard()
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0)
}

const formatDate = (date: any) => {
  if (!date) return 'N/A'
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-IN')
}
</script>

<style scoped>
/* Force white background for metric cards in light mode */
.dashboard-metrics {
  background-color: white !important;
}

.dark .dashboard-metrics {
  background-color: #1e293b !important;
}

.dashboard-metrics > div {
  background-color: white !important;
}

.dark .dashboard-metrics > div {
  background-color: #1e293b !important;
}

/* Force dark text in light mode for metric cards */
.dashboard-metrics dt,
.dashboard-metrics dd,
.dashboard-metrics > div > dt,
.dashboard-metrics > div > dd,
.dashboard-metrics > div > dd > div {
  color: #111827 !important;
}

.dark .dashboard-metrics dt,
.dark .dashboard-metrics dd,
.dark .dashboard-metrics > div > dt,
.dark .dashboard-metrics > div > dd,
.dark .dashboard-metrics > div > dd > div {
  color: #f1f5f9 !important;
}

/* Specific text size classes */
.dashboard-metrics .text-2xl {
  color: #111827 !important;
}

.dark .dashboard-metrics .text-2xl {
  color: #f1f5f9 !important;
}

.dashboard-metrics .text-base {
  color: #111827 !important;
}

.dark .dashboard-metrics .text-base {
  color: #f1f5f9 !important;
}

.dashboard-metrics .text-sm.text-gray-500 {
  color: #6b7280 !important;
}

.dark .dashboard-metrics .text-sm.text-gray-500 {
  color: #94a3b8 !important;
}
</style>
