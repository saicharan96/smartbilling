<template>
  <div class="pos-container">
    <!-- Top Bar: Customer and Search -->
    <div class="top-bar">
      <!-- Customer Selection -->
      <div class="top-customer-section">
        <!-- Show select when no customer selected -->
        <div v-if="!selectedCustomerData" class="customer-selector">
          <el-select
            :model-value="selectedCustomer"
            @update:model-value="selectedCustomer = $event"
            filterable
            placeholder="Select or search customer"
            class="customer-select"
            clearable
            @change="onCustomerChange"
          >
            <el-option
              v-for="customer in customersStore.customers"
              :key="customer.id || ''"
              :label="customer.name"
              :value="customer.id || ''"
            >
              <div class="customer-option">
                <div class="customer-name">{{ customer.name }}</div>
                <div class="customer-details">
                  <span v-if="customer.contact">{{ customer.contact }}</span>
                  <span v-if="customer.email">{{ customer.email }}</span>
                </div>
              </div>
            </el-option>
          </el-select>
          <button @click="showAddCustomer = true" class="add-customer-btn">
            <PlusIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Show customer details card when customer is selected -->
        <div v-else class="customer-details-card">
          <div class="customer-details-flex">
            <span class="customer-detail-item customer-name-item">
              <UserIcon class="w-4 h-4" />
              <span class="customer-name-text">{{ selectedCustomerData.name }}</span>
            </span>
            <span v-if="selectedCustomerData.contact" class="customer-detail-item">
              <DevicePhoneMobileIcon class="w-3.5 h-3.5" />
              <span>{{ selectedCustomerData.contact }}</span>
            </span>
            <span v-if="selectedCustomerData.email" class="customer-detail-item">
              <span class="meta-icon">@</span>
              <span>{{ selectedCustomerData.email }}</span>
            </span>
            <span v-if="selectedCustomerData.address" class="customer-detail-item customer-address-item">
              <BuildingLibraryIcon class="w-3.5 h-3.5" />
              <span>{{ selectedCustomerData.address }}</span>
            </span>
          </div>
          <button @click="selectedCustomer = null" class="customer-clear-btn" title="Clear customer">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="top-search-section">
        <div class="search-wrapper">
          <MagnifyingGlassIcon class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search products (F5)"
            class="search-input"
            @keydown.f5.prevent="focusSearch"
          />
        </div>
      </div>
    </div>

    <!-- Main Content: Left (Products) and Right (Order) -->
    <div class="pos-main-content">
      <!-- Left Section: Product Grid -->
      <div class="pos-left">
        <!-- Category Filter -->
      <div class="category-section" v-if="availableCategories.length > 0">
        <div class="category-scroll">
          <button
            @click="selectedCategory = null"
            :class="['category-btn', { active: selectedCategory === null }]"
          >
            All Items
          </button>
          <button
            v-for="category in availableCategories"
            :key="category.id"
            @click="selectedCategory = category.id || null"
            :class="['category-btn', { active: selectedCategory === category.id }]"
          >
            <PinIcon v-if="category.pinned" class="w-3 h-3" />
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- Product Grid -->
      <div class="products-grid">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-card"
        >
          <div class="product-image">
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              :alt="product.name"
              class="product-img"
            />
            <CubeIcon v-else class="product-icon" />
          </div>
          <div class="product-info">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-price">{{ formatCurrency(product.price) }}</div>
            <div v-if="product.quantity <= 0" class="product-stock out-of-stock">Out of Stock</div>
            <div v-else-if="product.quantity <= (product.lowStockThreshold || 10)" class="product-stock low-stock">
              Stock: {{ product.quantity }}
            </div>
          </div>
          <button
            @click.stop="addToCart(product)"
            class="add-to-cart-btn"
            :disabled="product.quantity <= 0"
          >
            <PlusIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

        <div v-if="filteredProducts.length === 0" class="empty-products">
          <p>No products found</p>
        </div>
      </div>

      <!-- Right Section: Order Cart -->
      <div class="pos-right">
      <!-- Order Header -->
      <div class="order-header">
        <div class="order-title">
          <span>Current Order</span>
          <span class="order-count" v-if="cartItems.length > 0">({{ cartItems.length }} items)</span>
        </div>
        <div class="order-actions">
          <button @click="clearCart" class="action-btn clear-btn" :disabled="cartItems.length === 0">
            <TrashIcon class="w-4 h-4" />
            Clear
          </button>
          <button @click="holdOrder" class="action-btn hold-btn" :disabled="cartItems.length === 0">
            <ClockIcon class="w-4 h-4" />
            Hold
          </button>
        </div>
      </div>


      <!-- Cart Items -->
      <div class="cart-section">
        <div class="cart-header">
          <span>Items</span>
        </div>
        <div class="cart-items">
          <div v-if="cartItems.length === 0" class="empty-cart">
            <ShoppingCartIcon class="w-12 h-12" />
            <p>Cart is empty</p>
            <p class="empty-cart-hint">Click on products to add them</p>
          </div>
          <div
            v-for="(item, index) in cartItems"
            :key="index"
            class="cart-item"
          >
            <div class="cart-item-info">
              <div class="cart-item-name">{{ item.name }}</div>
              <div class="cart-item-price">{{ formatCurrency(item.price) }}</div>
            </div>
            <div class="cart-item-controls">
              <button @click="decreaseQuantity(index)" class="qty-btn">-</button>
              <span class="qty-value">{{ item.quantity }}</span>
              <button @click="increaseQuantity(index)" class="qty-btn">+</button>
              <button @click="removeFromCart(index)" class="remove-btn">
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
            <div class="cart-item-total">{{ formatCurrency(item.price * item.quantity) }}</div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="order-summary">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>{{ formatCurrency(subtotal) }}</span>
        </div>
        <div class="summary-row">
          <div class="tax-input-group">
            <span>Tax (%)</span>
            <input
              v-model.number="taxPercent"
              type="number"
              min="0"
              max="100"
              step="0.01"
              class="tax-input"
              @input="calculateTotal"
            />
          </div>
          <span>{{ formatCurrency(tax) }}</span>
        </div>
        <div class="summary-row">
          <div class="discount-input-group">
            <span>Discount</span>
            <input
              v-model.number="discount"
              type="number"
              min="0"
              :max="subtotal"
              step="0.01"
              class="discount-input"
              @input="calculateTotal"
            />
          </div>
          <span>{{ formatCurrency(discount) }}</span>
        </div>
        <div class="summary-row total-row">
          <span>Total</span>
          <span class="total-amount">{{ formatCurrency(total) }}</span>
        </div>
      </div>

      <!-- Payment Method -->
      <div class="payment-section">
        <div class="payment-header">
          <span>Payment Method</span>
        </div>
        <div class="payment-methods">
          <button
            v-for="method in paymentMethods"
            :key="method.name"
            @click="selectedPaymentMethod = method.name"
            :class="['payment-btn', 'shadow', { active: selectedPaymentMethod === method.name }]"
            :title="method.name"
          >
            <component :is="method.icon" class="payment-icon" />
          </button>
        </div>
      </div>

      <!-- Checkout Button -->
      <div class="checkout-section">
        <button
          @click="checkout"
          :disabled="cartItems.length === 0 || !selectedPaymentMethod"
          class="checkout-btn"
        >
          <ShoppingBagIcon class="w-5 h-5" />
          Checkout ({{ formatCurrency(total) }})
        </button>
      </div>
    </div>

    <!-- Add Customer Drawer -->
    <el-drawer
      v-model="showAddCustomer"
      title="Add Customer"
      :size="400"
      direction="rtl"
    >
      <el-form @submit.prevent="addCustomerQuick" label-position="top">
        <el-form-item label="Name" required>
          <el-input v-model="newCustomer.name" placeholder="Customer name" />
        </el-form-item>
        <el-form-item label="Contact">
          <el-input v-model="newCustomer.contact" placeholder="Phone number" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="newCustomer.email" type="email" placeholder="Email address" />
        </el-form-item>
        <el-form-item label="Address">
          <el-input v-model="newCustomer.address" type="textarea" placeholder="Address" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addCustomerQuick" :loading="addingCustomer">
            Add Customer
          </el-button>
        </el-form-item>
      </el-form>
    </el-drawer>

    <!-- Loading Overlay -->
    <div v-if="checkoutLoading" class="checkout-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-text">Processing Order...</p>
      </div>
    </div>

    <!-- Success Dialog -->
    <el-dialog
      v-model="showSuccessDialog"
      title="Order Placed Successfully!"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="success-content">
        <div class="success-icon">
          <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        <p class="success-message">Your order has been placed successfully!</p>
        <div v-if="lastInvoiceData" class="invoice-info">
          <p><strong>Invoice #:</strong> {{ lastInvoiceData.invoiceId }}</p>
          <p><strong>Total:</strong> {{ formatCurrency(lastInvoiceData.total) }}</p>
        </div>
      </div>
      
      <!-- Hidden Print Component -->
      <div v-if="lastInvoiceData" class="hidden-print">
        <InvoicePrint
          ref="invoicePrintRef"
          :invoice-id="lastInvoiceData.invoiceId"
          :invoice-date="lastInvoiceData.date"
          :business-logo="authStore.userProfile?.businessLogo"
          :business-name="authStore.userProfile?.businessName"
          :business-address="authStore.userProfile?.businessAddress"
          :business-contact="authStore.userProfile?.businessContact"
          :customer-name="lastInvoiceData.customerName"
          :customer-contact="lastInvoiceData.customerContact"
          :items="lastInvoiceData.items"
          :subtotal="lastInvoiceData.subtotal"
          :tax="lastInvoiceData.tax"
          :tax-percent="lastInvoiceData.taxPercent"
          :discount="lastInvoiceData.discount"
          :total="lastInvoiceData.total"
          :payment-method="lastInvoiceData.paymentMethod"
        />
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeSuccessDialog">Close</el-button>
          <el-button type="primary" @click="printInvoice">
            <PrinterIcon class="w-4 h-4 mr-1" />
            Print Invoice
          </el-button>
        </div>
      </template>
    </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  MagnifyingGlassIcon,
  CubeIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  PlusIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  XMarkIcon,
  PrinterIcon
} from '@heroicons/vue/24/outline'
import { PaperClipIcon as PinIcon } from '@heroicons/vue/24/solid'
import { useProductsStore } from '~/stores/products'
import { useCustomersStore } from '~/stores/customers'
import { useSalesStore } from '~/stores/sales'
import { useCategoriesStore } from '~/stores/categories'
import { useThemeStore } from '~/stores/theme'
import { useAuthStore } from '~/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'

definePageMeta({
  middleware: 'auth',
  layout: 'billing'
})

const productsStore = useProductsStore()
const customersStore = useCustomersStore()
const salesStore = useSalesStore()
const categoriesStore = useCategoriesStore()
const themeStore = useThemeStore()
const authStore = useAuthStore()

// Search and filter
const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)

// Cart
interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

const cartItems = ref<CartItem[]>([])

// Customer
const selectedCustomer = ref<string | null>(null)
const selectedCustomerData = computed(() => {
  if (!selectedCustomer.value) return null
  return customersStore.customers.find(c => c.id === selectedCustomer.value)
})

// Order calculations
const taxPercent = ref(0)
const discount = ref(0)
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})
const tax = computed(() => {
  return (subtotal.value * taxPercent.value) / 100
})
const total = computed(() => {
  return subtotal.value + tax.value - discount.value
})

// Payment
const paymentMethods = [
  { name: 'Cash', icon: BanknotesIcon },
  { name: 'Card', icon: CreditCardIcon },
  { name: 'UPI', icon: DevicePhoneMobileIcon },
  { name: 'Bank Transfer', icon: BuildingLibraryIcon }
]
const selectedPaymentMethod = ref<string | null>(null)

// Customer drawer
const showAddCustomer = ref(false)
const addingCustomer = ref(false)
const checkoutLoading = ref(false)
const showSuccessDialog = ref(false)
const lastInvoiceData = ref<any>(null)
const invoicePrintRef = ref<any>(null)
const newCustomer = ref({
  name: '',
  contact: '',
  email: '',
  address: ''
})

// Categories
const availableCategories = computed(() => {
  return categoriesStore.allCategoriesSorted
})

// Filtered products
const filteredProducts = computed(() => {
  let products = productsStore.products.filter(p => p.quantity > 0) // Only show in-stock items
  
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    products = products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.code?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    )
  }
  
  // Category filter
  if (selectedCategory.value) {
    products = products.filter(p => p.categoryId === selectedCategory.value)
  }
  
  return products
})

// Cart functions
const addToCart = (product: any) => {
  if (product.quantity <= 0) {
    ElMessage.warning('Product is out of stock')
    return
  }
  
  const existingItem = cartItems.value.find(item => item.productId === product.id)
  
  if (existingItem) {
    if (existingItem.quantity >= product.quantity) {
      ElMessage.warning('Not enough stock available')
      return
    }
    existingItem.quantity++
  } else {
    cartItems.value.push({
      productId: product.id!,
      name: product.name,
      price: product.price,
      quantity: 1
    })
  }
}

const increaseQuantity = (index: number) => {
  const item = cartItems.value[index]
  const product = productsStore.products.find(p => p.id === item.productId)
  
  if (product && item.quantity >= product.quantity) {
    ElMessage.warning('Not enough stock available')
    return
  }
  
  item.quantity++
}

const decreaseQuantity = (index: number) => {
  const item = cartItems.value[index]
  if (item.quantity > 1) {
    item.quantity--
  } else {
    removeFromCart(index)
  }
}

const removeFromCart = (index: number) => {
  cartItems.value.splice(index, 1)
}

const clearCart = async () => {
  try {
    await ElMessageBox.confirm('Are you sure you want to clear the cart?', 'Clear Cart', {
      confirmButtonText: 'Clear',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
    cartItems.value = []
    selectedCustomer.value = null
    taxPercent.value = 0
    discount.value = 0
    selectedPaymentMethod.value = null
  } catch {
    // User cancelled
  }
}

const holdOrder = () => {
  ElMessage.info('Hold order feature coming soon')
  // TODO: Implement hold order functionality
}

const calculateTotal = () => {
  // Reactive computed properties handle this
}

// Customer functions
const onCustomerChange = () => {
  // Customer changed
}

const addCustomerQuick = async () => {
  if (!newCustomer.value.name.trim()) {
    ElMessage.warning('Customer name is required')
    return
  }
  
  try {
    addingCustomer.value = true
    await customersStore.addCustomer({
      name: newCustomer.value.name,
      contact: newCustomer.value.contact || undefined,
      email: newCustomer.value.email || undefined,
      address: newCustomer.value.address || undefined
    })
    
    ElMessage.success('Customer added successfully')
    showAddCustomer.value = false
    newCustomer.value = { name: '', contact: '', email: '', address: '' }
    
    // Select the newly added customer
    const newCustomerId = customersStore.customers[customersStore.customers.length - 1]?.id
    if (newCustomerId) {
      selectedCustomer.value = newCustomerId
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'Failed to add customer')
  } finally {
    addingCustomer.value = false
  }
}

// Checkout
const checkout = async () => {
  if (cartItems.value.length === 0) {
    ElMessage.warning('Cart is empty')
    return
  }
  
  if (!selectedPaymentMethod.value) {
    ElMessage.warning('Please select a payment method')
    return
  }
  
  checkoutLoading.value = true
  
  try {
    const customer = selectedCustomerData.value
    const invoiceId = salesStore.generateInvoiceId()
    const currentDate = new Date().toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    const saleData = {
      invoiceId,
      customerName: customer?.name || 'Walk-in Customer',
      customerContact: customer?.contact || undefined,
      customerEmail: customer?.email || undefined,
      items: cartItems.value,
      subtotal: subtotal.value,
      taxPercent: taxPercent.value,
      tax: tax.value,
      total: total.value,
      paymentMethod: selectedPaymentMethod.value
    }
    
    const result = await salesStore.createSale(saleData)
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create sale')
    }
    
    // Store invoice data for print
    lastInvoiceData.value = {
      ...saleData,
      date: currentDate
    }
    
    // Clear cart
    cartItems.value = []
    selectedCustomer.value = null
    taxPercent.value = 0
    discount.value = 0
    selectedPaymentMethod.value = null
    
    // Refresh products to update stock
    await productsStore.fetchProducts()
    
    // Show success dialog
    checkoutLoading.value = false
    showSuccessDialog.value = true
  } catch (error: any) {
    checkoutLoading.value = false
    ElMessage.error(error.message || 'Failed to place order')
  }
}

const printInvoice = () => {
  if (!invoicePrintRef.value?.printContent) return
  
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  
  const printContent = invoicePrintRef.value.printContent.innerHTML
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${lastInvoiceData.value?.invoiceId || 'Invoice'}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; padding: 20px; }
          .invoice-print { width: 80mm; max-width: 300px; margin: 0 auto; padding: 20px; background: white; color: #000; font-size: 12px; line-height: 1.4; }
          .invoice-header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 15px; }
          .business-logo-img { max-width: 80px; max-height: 80px; object-fit: contain; }
          .business-name { font-size: 18px; font-weight: bold; margin: 10px 0 5px 0; text-transform: uppercase; }
          .business-address, .business-contact { font-size: 11px; margin: 5px 0; line-height: 1.3; }
          .invoice-details { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #ccc; }
          .invoice-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px; }
          .items-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; }
          .items-table thead { border-bottom: 1px solid #000; border-top: 1px solid #000; }
          .items-table th { padding: 8px 4px; text-align: left; font-weight: bold; text-transform: uppercase; }
          .items-table td { padding: 6px 4px; border-bottom: 1px dashed #ccc; }
          .col-item { width: 40%; }
          .col-qty { width: 15%; text-align: center; }
          .col-price { width: 25%; text-align: right; }
          .col-total { width: 20%; text-align: right; }
          .invoice-summary { margin-top: 15px; padding-top: 10px; border-top: 2px dashed #000; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; }
          .total-row { font-size: 14px; font-weight: bold; padding-top: 8px; border-top: 1px solid #000; margin-top: 8px; }
          .total-row .value { font-size: 16px; }
          .invoice-footer { margin-top: 20px; padding-top: 15px; border-top: 1px dashed #ccc; text-align: center; font-size: 10px; }
          @media print { @page { size: 80mm auto; margin: 0; } }
        </style>
      </head>
      <body>${printContent}</body>
    </html>
  `)
  printWindow.document.close()
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0)
}

const focusSearch = () => {
  const input = document.querySelector('.search-input') as HTMLInputElement
  input?.focus()
}

// Load data
onMounted(async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    customersStore.fetchCustomers(),
    categoriesStore.fetchCategories()
  ])
})

// Keyboard shortcuts
onMounted(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // F5 - Focus search
    if (e.key === 'F5') {
      e.preventDefault()
      focusSearch()
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
})
</script>

<style scoped>
.pos-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  background: #f5f5f5;
  overflow: hidden;
}

.dark .pos-container {
  background: #0f172a;
}

.top-bar {
  display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 5px;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;
}

.dark .top-bar {
  background: #1e293b;
  border-bottom-color: #334155;
}

.pos-main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.top-customer-section {
  min-width: 400px;
  max-width: 400px;
}


.top-search-section {
  flex-shrink: 0;
  width: 300px;
}

.top-search-section .search-wrapper {
  width: 100%;
}

.customer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;
  font-weight: 500;
}

.dark .customer-header {
  color: #f1f5f9;
}

.customer-selector {
  display: flex;
  gap: 8px;
}

.customer-select {
  flex: 1;
  min-width: 0;
}

.customer-details-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  min-width: 0;
  height: 40px;
}

.dark .customer-details-card {
  background: #1e293b;
  border-color: #334155;
}

.customer-details-flex {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.customer-details-flex::-webkit-scrollbar {
  display: none;
}

.customer-detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
  flex-shrink: 0;
}

.dark .customer-detail-item {
  color: #94a3b8;
}

.customer-detail-item svg {
  flex-shrink: 0;
  color: #6b7280;
}

.dark .customer-detail-item svg {
  color: #94a3b8;
}

.customer-name-item {
  font-weight: 600;
  color: #111827;
}

.dark .customer-name-item {
  color: #f1f5f9;
}

.customer-name-item svg {
  color: #3b82f6;
}

.dark .customer-name-item svg {
  color: #60a5fa;
}

.customer-name-text {
  font-weight: 600;
}

.meta-icon {
  font-size: 13px;
  font-weight: 500;
}

.customer-address-item {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.customer-clear-btn {
  padding: 6px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
}

.customer-clear-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #111827;
}

.dark .customer-clear-btn {
  background: #334155;
  border-color: #475569;
  color: #94a3b8;
}

.dark .customer-clear-btn:hover {
  background: #475569;
  border-color: #64748b;
  color: #f1f5f9;
}

/* Left Section */
.pos-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 1px solid #e5e7eb;
  overflow: hidden;
}

.dark .pos-left {
  background: #1e293b;
  border-right-color: #334155;
}


.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 20px;
  color: #6b7280;
  pointer-events: none;
}

.dark .search-icon {
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 6px 12px 6px 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.dark .search-input {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.category-section {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
  overflow-y: hidden;
}

.dark .category-section {
  border-bottom-color: #334155;
}

.category-scroll {
  display: flex;
  gap: 8px;
}

.category-btn {
  padding: 4px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.dark .category-btn {
  background: #0f172a;
  border-color: #334155;
  color: #cbd5e1;
}

.category-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.category-btn.active {
  background: #00ED64;
  border-color: #00ED64;
  color: #000000;
}

.products-grid {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  background: white;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.dark .products-grid {
  background: #1e293b;
  border-color: #334155;
}

.product-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  padding: 12px;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 240px;
  position: relative;
  overflow: hidden;
}

.dark .product-card {
  background: #0f172a;
  border-color: #334155;
}

.product-card:hover {
  border-color: #00ED64;
  box-shadow: 0 4px 12px rgba(0, 237, 100, 0.15);
  transform: translateY(-2px);
}

.add-to-cart-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: #00ED64;
  border: none;
  border-radius: 50%;
  color: #000000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 237, 100, 0.4);
  z-index: 10;
}

.add-to-cart-btn:hover:not(:disabled) {
  background: #00c952;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 237, 100, 0.6);
}

.add-to-cart-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.add-to-cart-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

.product-image {
  width: 100%;
  height: 140px;
  background: #F5F7FA;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
}

.dark .product-image {
  background: #334155;
}

.product-icon {
  width: 40px;
  height: 40px;
  color: #6b7280;
}

.dark .product-icon {
  color: #94a3b8;
}

.product-info {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-bottom: 40px;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  text-align: left;
}

.dark .product-name {
  color: #f1f5f9;
}

.product-price {
  font-size: 16px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 4px;
  text-align: left;
}

.product-stock {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 4px;
  text-align: left;
  display: inline-block;
  width: fit-content;
}

.product-stock.low-stock {
  background: #fef3c7;
  color: #92400e;
}

.dark .product-stock.low-stock {
  background: #78350f;
  color: #fbbf24;
}

.product-stock.out-of-stock {
  background: #fee2e2;
  color: #991b1b;
}

.dark .product-stock.out-of-stock {
  background: #7f1d1d;
  color: #fca5a5;
}

.empty-products {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
}

.dark .empty-products {
  color: #94a3b8;
}

/* Right Section */
.pos-right {
  width: 400px;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
  overflow: hidden;
}

.dark .pos-right {
  background: #0f172a;
}

.order-header {
  padding: 4px 12px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dark .order-header {
  background: #1e293b;
  border-bottom-color: #334155;
}

.order-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.dark .order-title {
  color: #f1f5f9;
}

.order-count {
  font-size: 14px;
  font-weight: normal;
  color: #6b7280;
}

.dark .order-count {
  color: #94a3b8;
}

.order-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.dark .action-btn {
  background: #0f172a;
  border-color: #334155;
  color: #cbd5e1;
}

.action-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn:hover:not(:disabled) {
  border-color: #ef4444;
  color: #ef4444;
}

.hold-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
}


.add-customer-btn {
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.dark .add-customer-btn {
  background: #0f172a;
  border-color: #334155;
  color: #cbd5e1;
}

.add-customer-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}


.customer-detail {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
}

.dark .customer-detail {
  color: #94a3b8;
}

.customer-address {
  font-size: 12px;
  color: #9ca3af;
}

.dark .customer-address {
  color: #64748b;
}

.cart-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-header {
  padding: 4px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 500;
  font-size: 12px;
  color: #111827;
}

.dark .cart-header {
  background: #1e293b;
  border-bottom-color: #334155;
  color: #f1f5f9;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  background: white;
}

.dark .cart-items {
  background: #1e293b;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  padding: 40px;
}

.dark .empty-cart {
  color: #64748b;
}

.empty-cart-hint {
  font-size: 12px;
  margin-top: 8px;
}

.cart-item {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dark .cart-item {
  background: #0f172a;
}

.cart-item-info {
  display: flex;
  justify-content: space-between;
  align-items: start;
}

.cart-item-name {
  font-weight: 500;
  color: #111827;
  flex: 1;
}

.dark .cart-item-name {
  color: #f1f5f9;
}

.cart-item-price {
  font-size: 14px;
  color: #6b7280;
}

.dark .cart-item-price {
  color: #94a3b8;
}

.cart-item-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}

.dark .qty-btn {
  background: #0f172a;
  border-color: #334155;
  color: #cbd5e1;
}

.qty-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.qty-value {
  min-width: 30px;
  text-align: center;
  font-weight: 500;
  color: #111827;
}

.dark .qty-value {
  color: #f1f5f9;
}

.remove-btn {
  padding: 4px;
  border: none;
  background: transparent;
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  color: #dc2626;
}

.cart-item-total {
  font-weight: 600;
  color: #3b82f6;
  text-align: right;
}

.order-summary {
  padding: 16px;
  background: white;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.dark .order-summary {
  background: #1e293b;
  border-top-color: #334155;
  border-bottom-color: #334155;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
  color: #374151;
}

.dark .summary-row {
  color: #cbd5e1;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.tax-input-group,
.discount-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tax-input,
.discount-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.dark .tax-input,
.dark .discount-input {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.total-row {
  padding-top: 6px;
  border-top: 1px solid #e5e7eb;
  margin-top: 6px;
  font-size: 14px;
  font-weight: 600;
}

.dark .total-row {
  border-top-color: #334155;
}

.total-amount {
  font-size: 20px;
  color: #3b82f6;
}

.payment-section {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.dark .payment-section {
  background: #1e293b;
  border-bottom-color: #334155;
}

.payment-header {
  margin-bottom: 12px;
  font-weight: 500;
  color: #111827;
}

.dark .payment-header {
  color: #f1f5f9;
}

.payment-methods {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.payment-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
}

.payment-icon {
  width: 24px;
  height: 24px;
}

.dark .payment-btn {
  background: #0f172a;
  border-color: #334155;
  color: #cbd5e1;
}

.payment-btn:hover:not(.active) {
  border-color: #3b82f6;
  background: #eff6ff;
}

.payment-btn:hover:not(.active) .payment-icon {
  color: #3b82f6;
}

.payment-btn.active {
  background: #00ED64;
  border-color: #00ED64;
}

.payment-btn.active .payment-icon {
  color: white;
}

.checkout-section {
  padding: 16px;
  background: white;
}

.dark .checkout-section {
  background: #1e293b;
}

.checkout-btn {
  width: 100%;
  padding: 16px;
  background: #00ED64;
  border: none;
  border-radius: 8px;
  color: #000000;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.checkout-btn:hover:not(:disabled) {
  background: #00c952;
}

.checkout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.customer-option {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 500;
}

.customer-details {
  font-size: 12px;
  color: #6b7280;
}

.dark .customer-details {
  color: #94a3b8;
}

@media (max-width: 1024px) {
  .pos-container {
    flex-direction: column;
  }
  
  .pos-left {
    height: 50vh;
  }
  
  .pos-right {
    width: 100%;
    height: 50vh;
  }
}

/* Checkout Overlay */
.checkout-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.dark .loading-spinner {
  background: #1e293b;
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

.loading-text {
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.dark .loading-text {
  color: #f1f5f9;
}

/* Success Dialog */
.success-content {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  margin-bottom: 20px;
}

.checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
  stroke-width: 2;
  stroke: #00ED64;
  stroke-miterlimit: 10;
  margin: 0 auto;
  box-shadow: inset 0px 0px 0px #00ED64;
  animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
}

.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: #00ED64;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes scale {
  0%, 100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}

@keyframes fill {
  100% {
    box-shadow: inset 0px 0px 0px 30px #00ED64;
  }
}

.success-message {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 20px;
}

.dark .success-message {
  color: #f1f5f9;
}

.invoice-info {
  background: #f3f4f6;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: left;
}

.dark .invoice-info {
  background: #334155;
}

.invoice-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #111827;
}

.dark .invoice-info p {
  color: #f1f5f9;
}

.hidden-print {
  display: none;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
