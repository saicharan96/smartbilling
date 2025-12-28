<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">Expenses</h2>
      <el-button type="primary" @click="showAddModal = true">
        <PlusIcon class="w-4 h-4 mr-1" />
        Add Expense
      </el-button>
    </div>

    <DataTable
      :data="expensesStore.expenses"
      :columns="tableColumns"
      :loading="expensesStore.loading"
      search-placeholder="Search expenses..."
      empty-text="No expenses yet. Add your first expense!"
      :show-actions="true"
      :show-index="true"
      :page-size="20"
    >
      <template #date="{ row }">
        {{ formatDate(row.date) }}
      </template>

      <template #amount="{ row }">
        {{ formatCurrency(row.amount) }}
      </template>

      <template #actions="{ row }">
        <el-button type="primary" size="small" text @click="editExpense(row)">
          Edit
        </el-button>
        <el-button type="danger" size="small" text @click="deleteExpense(row.id!)">
          Delete
        </el-button>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useExpensesStore } from '~/stores/expenses'
import { ElMessageBox } from 'element-plus'

const expensesStore = useExpensesStore()
const showAddModal = ref(false)

const tableColumns = [
  { prop: 'date', label: 'Date', width: 120, sortable: true },
  { prop: 'category', label: 'Category', minWidth: 120, sortable: true, filterable: true },
  { prop: 'description', label: 'Description', minWidth: 200, sortable: true, filterable: true },
  { prop: 'amount', label: 'Amount', width: 120, sortable: true },
  { prop: 'paymentMethod', label: 'Payment Method', width: 140, sortable: true, filterable: true }
]

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
