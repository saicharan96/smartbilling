<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">Customers</h2>
      <el-button type="primary" @click="openDrawer(null)">
        <PlusIcon class="w-4 h-4 mr-1" />
        Add Customer
      </el-button>
    </div>

    <DataTable
      :data="customersStore.customers"
      :columns="tableColumns"
      :loading="customersStore.loading"
      search-placeholder="Search customers..."
      empty-text="No customers yet. Add your first customer!"
      :show-actions="true"
      :show-index="true"
      :page-size="20"
    >
      <template #totalAmount="{ row }">
        {{ formatCurrency(row.totalAmount || 0) }}
      </template>

      <template #actions="{ row }">
        <el-dropdown trigger="click" @command="handleCommand">
          <el-button circle>
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu class="w-56 divide-y divide-gray-100">
              <el-dropdown-item :command="{ action: 'edit', row }" class="flex items-center px-4 py-2">
                <PencilSquareIcon class="mr-3 h-5 w-5 text-gray-400" />
                Edit
              </el-dropdown-item>
              <el-dropdown-item :command="{ action: 'delete', row }" divided class="flex items-center px-4 py-2 text-red-700 hover:bg-red-50">
                <TrashIcon class="mr-3 h-5 w-5 text-red-400" />
                Delete
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </DataTable>

    <!-- Customer Drawer -->
    <el-drawer
      v-model="drawerVisible"
      :title="isEditing ? 'Edit Customer' : 'Add Customer'"
      size="40%"
      direction="rtl"
    >
      <el-form
        ref="customerFormRef"
        :model="customerForm"
        :rules="formRules"
        label-position="top"
        class="customer-form"
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="customerForm.name" placeholder="Enter customer name" />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input v-model="customerForm.email" type="email" placeholder="Enter email address" />
        </el-form-item>

        <el-form-item label="Mobile Number" prop="contact">
          <el-input v-model="customerForm.contact" placeholder="Enter mobile number" />
        </el-form-item>

        <el-form-item label="Address" prop="address">
          <el-input
            v-model="customerForm.address"
            type="textarea"
            :rows="3"
            placeholder="Enter address"
          />
        </el-form-item>

        <el-divider>Custom Fields</el-divider>
        
        <div class="custom-fields-section">
          <div v-for="(field, index) in customFieldsArray" :key="index" class="custom-field-row">
            <el-input
              v-model="field.key"
              placeholder="Enter key (e.g., Notes, Special Instructions)"
              class="custom-field-key"
            />
            <el-input
              v-model="field.value"
              placeholder="Enter value"
              class="custom-field-value"
            />
            <el-button
              type="danger"
              circle
              @click="removeCustomField(index)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          
          <el-button
            type="primary"
            plain
            @click="addCustomField"
            class="w-full mt-2"
          >
            <el-icon class="mr-1"><Plus /></el-icon>
            Add Custom Field
          </el-button>
        </div>

        <el-form-item class="mt-6">
          <el-button type="primary" @click="saveCustomer" :loading="saving">
            {{ isEditing ? 'Update Customer' : 'Add Customer' }}
          </el-button>
          <el-button @click="drawerVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/20/solid'
import { MoreFilled, Delete, Plus } from '@element-plus/icons-vue'
import { useCustomersStore } from '~/stores/customers'
import { ElMessageBox, ElMessage, type FormInstance, type FormRules } from 'element-plus'

const customersStore = useCustomersStore()
const drawerVisible = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const customerFormRef = ref<FormInstance>()

const tableColumns = [
  { prop: 'name', label: 'Name', minWidth: 150, sortable: true, filterable: true },
  { prop: 'contact', label: 'Contact', width: 140, sortable: true, filterable: true },
  { prop: 'email', label: 'Email', minWidth: 200, sortable: true, filterable: true },
  { prop: 'address', label: 'Address', minWidth: 200, sortable: false },
  { prop: 'totalPurchases', label: 'Total Purchases', width: 180, sortable: true },
  { prop: 'totalAmount', label: 'Total Amount', width: 140, sortable: true }
]

const customerForm = ref({
  name: '',
  email: '',
  contact: '',
  address: ''
})

interface CustomField {
  key: string
  value: string
}

const customFieldsArray = ref<CustomField[]>([])

const formRules: FormRules = {
  name: [
    { required: true, message: 'Customer name is required', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
  ]
}

const resetForm = () => {
  customerForm.value = {
    name: '',
    email: '',
    contact: '',
    address: ''
  }
  customFieldsArray.value = []
  customerFormRef.value?.clearValidate()
}

const openDrawer = (customer: any) => {
  if (customer && customer.id) {
    // Edit mode
    isEditing.value = true
    currentCustomerId.value = customer.id
    customerForm.value = {
      name: customer.name || '',
      email: customer.email || '',
      contact: customer.contact || '',
      address: customer.address || ''
    }
    // Convert customFields object to array format
    if (customer.customFields && typeof customer.customFields === 'object') {
      customFieldsArray.value = Object.keys(customer.customFields).map(key => ({
        key: key,
        value: customer.customFields[key]
      }))
    } else {
      customFieldsArray.value = []
    }
  } else {
    // Add mode
    isEditing.value = false
    currentCustomerId.value = null
    resetForm()
  }
  drawerVisible.value = true
}

const addCustomField = () => {
  customFieldsArray.value.push({
    key: '',
    value: ''
  })
}

const removeCustomField = (index: number) => {
  customFieldsArray.value.splice(index, 1)
}

const handleCommand = (command: { action: string, row: any }) => {
  if (command.action === 'edit') {
    openDrawer(command.row)
  } else if (command.action === 'delete') {
    deleteCustomer(command.row.id!)
  }
}

const currentCustomerId = ref<string | null>(null)

const saveCustomer = async () => {
  if (!customerFormRef.value) return

  await customerFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        // Convert custom fields array to object, filtering out empty keys
        const cleanedCustomFields: Record<string, any> = {}
        customFieldsArray.value.forEach(field => {
          const trimmedKey = field.key?.trim()
          const trimmedValue = field.value?.trim()
          if (trimmedKey && trimmedValue) {
            cleanedCustomFields[trimmedKey] = trimmedValue
          }
        })

        const customerData = {
          name: customerForm.value.name,
          email: customerForm.value.email,
          contact: customerForm.value.contact,
          address: customerForm.value.address,
          customFields: Object.keys(cleanedCustomFields).length > 0 ? cleanedCustomFields : undefined
        }

        if (isEditing.value && currentCustomerId.value) {
          const result = await customersStore.updateCustomer(currentCustomerId.value, customerData)
          if (result.success) {
            ElMessage.success('Customer updated successfully')
            drawerVisible.value = false
          } else {
            ElMessage.error(result.error || 'Failed to update customer')
          }
        } else {
          const result = await customersStore.addCustomer(customerData)
          if (result.success) {
            ElMessage.success('Customer added successfully')
            drawerVisible.value = false
            resetForm()
          } else {
            ElMessage.error(result.error || 'Failed to add customer')
          }
        }
      } catch (error: any) {
        ElMessage.error(error.message || 'An error occurred')
      } finally {
        saving.value = false
      }
    }
  })
}

const deleteCustomer = async (id: string) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to delete this customer?', 'Confirm Delete', {
      type: 'warning',
    })
    await customersStore.deleteCustomer(id)
    ElMessage.success('Customer deleted successfully')
  } catch {
    // User cancelled
  }
}

onMounted(async () => {
  await customersStore.fetchCustomers()
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0)
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

.customer-form {
  padding: 20px 0;
}

.custom-fields-section {
  margin-top: 16px;
}

.custom-field-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}

.custom-field-key {
  flex: 1;
}

.custom-field-value {
  flex: 2;
}
</style>
