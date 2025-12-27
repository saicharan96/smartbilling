<template>
  <div>
    <h2>Dashboard</h2>
    <p>Last Updated: {{ lastUpdated }}</p>
    <hr style="margin: 15px 0;">

    <div class="stats-grid">
      <div class="stat-card color1">
        <h4>Today's Sales</h4>
        <h2>{{ formatCurrency(todaySales) }}</h2>
        <small>{{ todaySalesCount }} invoices</small>
      </div>
      <div class="stat-card color2">
        <h4>Total Products</h4>
        <h2>{{ totalProducts }}</h2>
        <small>in inventory</small>
      </div>
      <div class="stat-card color3">
        <h4>Total Customers</h4>
        <h2>{{ totalCustomers }}</h2>
        <small>registered</small>
      </div>
      <div class="stat-card color4">
        <h4>Monthly Expenses</h4>
        <h2>{{ formatCurrency(monthlyExpenses) }}</h2>
        <small>this month</small>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3>Recent Sales</h3>
        <div v-if="recentSales.length === 0">Loading...</div>
        <table v-else style="width: 100%;">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in recentSales" :key="sale.id">
              <td>{{ sale.invoiceId || sale.id }}</td>
              <td>{{ sale.customerName || 'N/A' }}</td>
              <td>{{ formatCurrency(sale.total || 0) }}</td>
              <td>{{ formatDate(sale.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h3>Low Stock Items</h3>
        <div v-if="lowStockItems.length === 0">No low stock items</div>
        <table v-else style="width: 100%;">
          <thead>
            <tr>
              <th>Product</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in lowStockItems" :key="item.id">
              <td>{{ item.name || 'N/A' }}</td>
              <td><span class="badge">{{ item.quantity || 0 }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { $firebase } = useNuxtApp()

const todaySales = ref(0)
const todaySalesCount = ref(0)
const totalProducts = ref(0)
const totalCustomers = ref(0)
const monthlyExpenses = ref(0)
const recentSales = ref<any[]>([])
const lowStockItems = ref<any[]>([])
const lastUpdated = ref('')

const formatCurrency = (amount: number) => {
  return '₹' + parseFloat(amount.toString()).toFixed(2)
}

const formatDate = (date: any) => {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const loadDashboard = async () => {
  try {
    const { collection, query, where, orderBy, limit, getDocs, Timestamp } = await import('firebase/firestore')
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    // Today's sales
    const salesQuery = query(
      collection($firebase.db, 'invoices'),
      where('createdAt', '>=', Timestamp.fromDate(today)),
      where('createdAt', '<=', Timestamp.fromDate(todayEnd))
    )
    const salesSnapshot = await getDocs(salesQuery)
    
    let todayTotal = 0
    salesSnapshot.forEach((doc: any) => {
      const data = doc.data()
      todayTotal += data.total || 0
    })
    todaySales.value = todayTotal
    todaySalesCount.value = salesSnapshot.size

    // Total products
    const productsSnapshot = await getDocs(collection($firebase.db, 'products'))
    totalProducts.value = productsSnapshot.size

    // Total customers
    const customersSnapshot = await getDocs(collection($firebase.db, 'customers'))
    totalCustomers.value = customersSnapshot.size

    // Monthly expenses
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const expensesQuery = query(
      collection($firebase.db, 'expenses'),
      where('date', '>=', Timestamp.fromDate(monthStart))
    )
    const expensesSnapshot = await getDocs(expensesQuery)
    
    let monthlyTotal = 0
    expensesSnapshot.forEach((doc: any) => {
      monthlyTotal += doc.data().amount || 0
    })
    monthlyExpenses.value = monthlyTotal

    // Recent sales
    const recentQuery = query(
      collection($firebase.db, 'invoices'),
      orderBy('createdAt', 'desc'),
      limit(5)
    )
    const recentSnapshot = await getDocs(recentQuery)
    recentSales.value = recentSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }))

    // Low stock items
    const lowStockQuery = query(
      collection($firebase.db, 'products'),
      where('quantity', '<=', 10),
      limit(10)
    )
    const lowStockSnapshot = await getDocs(lowStockQuery)
    lowStockItems.value = lowStockSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }))

    lastUpdated.value = new Date().toLocaleString()
  } catch (error) {
    console.error('Error loading dashboard:', error)
  }
}

onMounted(() => {
  loadDashboard()
  setInterval(loadDashboard, 30000) // Refresh every 30 seconds
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-card h4 {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.stat-card h2 {
  font-size: 28px;
  font-weight: 600;
  margin: 10px 0;
}

.stat-card small {
  color: #999;
  font-size: 12px;
}

.color1 { background: #bcffd0; }
.color2 { background: #c4c5ff; }
.color3 { background: #fdccbd; }
.color4 { background: #b2d0fb; }

.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card h3 {
  margin-bottom: 15px;
  font-size: 18px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

table th,
table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

table th {
  background: #f5f5f5;
  font-weight: 600;
  font-size: 13px;
}

.badge {
  background: #ffc107;
  color: #333;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>

