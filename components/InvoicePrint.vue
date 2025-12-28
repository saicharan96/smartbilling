<template>
  <div ref="printContent" class="invoice-print">
    <!-- Header -->
    <div class="invoice-header">
      <div v-if="businessLogo" class="logo-container">
        <img :src="businessLogo" alt="Business Logo" class="business-logo-img" />
      </div>
      <div class="business-info">
        <h1 class="business-name">{{ businessName || 'Business Name' }}</h1>
        <div v-if="businessAddress" class="business-address">{{ businessAddress }}</div>
        <div v-if="businessContact" class="business-contact">Phone: {{ businessContact }}</div>
      </div>
    </div>

    <!-- Invoice Details -->
    <div class="invoice-details">
      <div class="invoice-row">
        <span class="label">Invoice #:</span>
        <span class="value">{{ invoiceId }}</span>
      </div>
      <div class="invoice-row">
        <span class="label">Date:</span>
        <span class="value">{{ invoiceDate }}</span>
      </div>
      <div v-if="customerName" class="invoice-row">
        <span class="label">Customer:</span>
        <span class="value">{{ customerName }}</span>
      </div>
      <div v-if="customerContact" class="invoice-row">
        <span class="label">Contact:</span>
        <span class="value">{{ customerContact }}</span>
      </div>
    </div>

    <!-- Items Table -->
    <div class="invoice-items">
      <table class="items-table">
        <thead>
          <tr>
            <th class="col-item">Item</th>
            <th class="col-qty">Qty</th>
            <th class="col-price">Price</th>
            <th class="col-total">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="index">
            <td class="col-item">{{ item.name }}</td>
            <td class="col-qty">{{ item.quantity }}</td>
            <td class="col-price">{{ formatCurrency(item.price) }}</td>
            <td class="col-total">{{ formatCurrency(item.price * item.quantity) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Summary -->
    <div class="invoice-summary">
      <div class="summary-row">
        <span class="label">Subtotal:</span>
        <span class="value">{{ formatCurrency(subtotal) }}</span>
      </div>
      <div v-if="tax > 0" class="summary-row">
        <span class="label">Tax ({{ taxPercent }}%):</span>
        <span class="value">{{ formatCurrency(tax) }}</span>
      </div>
      <div v-if="discount > 0" class="summary-row">
        <span class="label">Discount:</span>
        <span class="value">-{{ formatCurrency(discount) }}</span>
      </div>
      <div class="summary-row total-row">
        <span class="label">Total:</span>
        <span class="value">{{ formatCurrency(total) }}</span>
      </div>
      <div v-if="paymentMethod" class="summary-row">
        <span class="label">Payment Method:</span>
        <span class="value">{{ paymentMethod }}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="invoice-footer">
      <p>Thank you for your business!</p>
      <p class="footer-note">This is a computer-generated invoice.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  invoiceId: string
  invoiceDate: string
  businessLogo?: string
  businessName?: string
  businessAddress?: string
  businessContact?: string
  customerName?: string
  customerContact?: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  tax: number
  taxPercent: number
  discount: number
  total: number
  paymentMethod?: string
}

defineProps<Props>()

const printContent = ref<HTMLElement>()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

defineExpose({
  printContent
})
</script>

<style scoped>
.invoice-print {
  width: 80mm;
  max-width: 300px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  color: #000;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
}

.invoice-header {
  text-align: center;
  border-bottom: 2px dashed #000;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.logo-container {
  margin-bottom: 10px;
}

.business-logo-img {
  max-width: 80px;
  max-height: 80px;
  object-fit: contain;
}

.business-name {
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0 5px 0;
  text-transform: uppercase;
}

.business-address {
  font-size: 11px;
  margin: 5px 0;
  line-height: 1.3;
}

.business-contact {
  font-size: 11px;
  margin: 5px 0;
}

.invoice-details {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ccc;
}

.invoice-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 11px;
}

.invoice-row .label {
  font-weight: bold;
}

.invoice-items {
  margin-bottom: 15px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.items-table thead {
  border-bottom: 1px solid #000;
  border-top: 1px solid #000;
}

.items-table th {
  padding: 8px 4px;
  text-align: left;
  font-weight: bold;
  text-transform: uppercase;
}

.items-table td {
  padding: 6px 4px;
  border-bottom: 1px dashed #ccc;
}

.col-item {
  width: 40%;
}

.col-qty {
  width: 15%;
  text-align: center;
}

.col-price {
  width: 25%;
  text-align: right;
}

.col-total {
  width: 20%;
  text-align: right;
}

.invoice-summary {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 2px dashed #000;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.summary-row .label {
  font-weight: bold;
}

.total-row {
  font-size: 14px;
  font-weight: bold;
  padding-top: 8px;
  border-top: 1px solid #000;
  margin-top: 8px;
}

.total-row .value {
  font-size: 16px;
}

.invoice-footer {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed #ccc;
  text-align: center;
  font-size: 10px;
}

.footer-note {
  margin-top: 10px;
  font-style: italic;
  color: #666;
}

/* Print Styles */
@media print {
  body * {
    visibility: hidden;
  }
  
  .invoice-print,
  .invoice-print * {
    visibility: visible;
  }
  
  .invoice-print {
    position: absolute;
    left: 0;
    top: 0;
    width: 80mm;
    margin: 0;
    padding: 10px;
  }
  
  @page {
    size: 80mm auto;
    margin: 0;
  }
}
</style>

