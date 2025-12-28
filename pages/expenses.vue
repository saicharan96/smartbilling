<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">Expenses</h2>
      <el-button type="danger" @click="showAddModal = true">
        <PlusIcon class="w-4 h-4 mr-1" />
        Add Expense
      </el-button>
    </div>

    <el-card shadow="never" class="bg-white">
      <template #header>
        <span class="text-lg font-semibold">Expense List</span>
      </template>

      <el-table 
        v-loading="expensesStore.loading"
        :data="expensesStore.expenses" 
        style="width: 100%"
        :empty-text="'No expenses yet. Add your first expense!'"
      >
        <el-table-column prop="date" label="Date" width="120">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="category" label="Category" />
        <el-table-column prop="description" label="Description" />
        <el-table-column prop="amount" label="Amount" width="120">
          <template #default="{ row }">
            {{ formatCurrency(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="Payment Method" width="140" />
        <el-table-column label="Actions" width="180">
          <template #default="{ row }">
            <el-button type="primary" size="small" text @click="editExpense(row)">
              Edit
            </el-button>
            <el-button type="danger" size="small" text @click="deleteExpense(row.id!)">
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useExpensesStore } from '~/stores/expenses'
import { ElMessageBox } from 'element-plus'

const expensesStore = useExpensesStore()
const showAddModal = ref(false)

onMounted(async () => {
  await expensesStore.fetchExpenses()
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0)
}

const formatDate = (date: any) => {
  if (!date) return 'N/A'
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-IN')
}

const editExpense = (expense: any) => {
  // TODO: Implement edit modal
  console.log('Edit expense:', expense)
}

const deleteExpense = async (id: string) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to delete this expense?', 'Confirm Delete', {
      type: 'warning',
    })
    await expensesStore.deleteExpense(id)
  } catch {
    // User cancelled
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  transition: color 0.3s ease;
}

.dark .page-title {
  color: #f1f5f9;
}
</style>
