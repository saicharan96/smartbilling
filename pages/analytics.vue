<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Analytics</h2>
    
    <el-row :gutter="20" class="mb-6">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 border-0">
          <div class="text-sm text-gray-600 dark:text-gray-300 mb-2">Total Sales</div>
          <div class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{{ formatCurrency(totalSales) }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">All time</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 border-0">
          <div class="text-sm text-gray-600 dark:text-gray-300 mb-2">Total Expenses</div>
          <div class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{{ formatCurrency(totalExpenses) }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">All time</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 border-0">
          <div class="text-sm text-gray-600 dark:text-gray-300 mb-2">Net Profit</div>
          <div class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{{ formatCurrency(netProfit) }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Sales - Expenses</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 border-0">
          <div class="text-sm text-gray-600 dark:text-gray-300 mb-2">Profit Margin</div>
          <div class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{{ profitMargin }}%</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Percentage</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="bg-white dark:bg-gray-800">
          <template #header>
            <span class="text-lg font-semibold">Top Products</span>
          </template>
          <el-table 
            v-loading="productsStore.loading"
            :data="productsStore.products.slice(0, 5)" 
            style="width: 100%"
            :empty-text="'No products yet'"
          >
            <el-table-column prop="name" label="Product" />
            <el-table-column prop="price" label="Price" width="120">
              <template #default="{ row }">
                {{ formatCurrency(row.price) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="bg-white dark:bg-gray-800">
          <template #header>
            <span class="text-lg font-semibold">Top Customers</span>
          </template>
          <el-table 
            v-loading="customersStore.loading"
            :data="topCustomers" 
            style="width: 100%"
            :empty-text="'No customers yet'"
          >
            <el-table-column prop="name" label="Customer" />
            <el-table-column prop="totalAmount" label="Total Amount" width="140">
              <template #default="{ row }">
                {{ formatCurrency(row.totalAmount || 0) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useSalesStore } from '~/stores/sales'
import { useExpensesStore } from '~/stores/expenses'
import { useProductsStore } from '~/stores/products'
import { useCustomersStore } from '~/stores/customers'

const salesStore = useSalesStore()
const expensesStore = useExpensesStore()
const productsStore = useProductsStore()
const customersStore = useCustomersStore()

onMounted(async () => {
  await Promise.all([
    salesStore.fetchSales(),
    expensesStore.fetchExpenses(),
    productsStore.fetchProducts(),
    customersStore.fetchCustomers()
  ])
})

const totalSales = computed(() => {
  return salesStore.sales.reduce((sum, sale) => sum + (sale.total || 0), 0)
})

const totalExpenses = computed(() => {
  return expensesStore.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
})

const netProfit = computed(() => {
  return totalSales.value - totalExpenses.value
})

const profitMargin = computed(() => {
  if (totalSales.value === 0) return 0
  return ((netProfit.value / totalSales.value) * 100).toFixed(1)
})

const topCustomers = computed(() => {
  return [...customersStore.customers]
    .sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0))
    .slice(0, 5)
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0)
}
</script>
