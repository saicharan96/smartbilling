# Firebase Collections Structure

## Collections Created

### 1. `users` Collection
**Purpose:** Store user profile information

**Document Structure:**
```typescript
{
  name: string
  email: string
  businessName?: string
  gstNumber?: string
  businessAddress?: string
  businessContact?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes Required:**
- None (single document per user)

---

### 2. `products` Collection
**Purpose:** Store inventory products

**Document Structure:**
```typescript
{
  name: string
  description?: string
  costPrice: number
  price: number
  quantity: number
  userId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes Required:**
- `userId` (Ascending), `name` (Ascending)

**Queries:**
- Get all products for a user
- Get low stock products (quantity <= 10)
- Search products by name

---

### 3. `customers` Collection
**Purpose:** Store customer information

**Document Structure:**
```typescript
{
  name: string
  contact?: string
  email?: string
  address?: string
  userId: string
  totalPurchases: number
  totalAmount: number
  lastPurchaseDate?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes Required:**
- `userId` (Ascending), `name` (Ascending)

**Queries:**
- Get all customers for a user
- Search customers by name/contact/email

---

### 4. `sales` Collection
**Purpose:** Store sales/invoice records

**Document Structure:**
```typescript
{
  invoiceId: string
  customerName: string
  customerContact?: string
  customerEmail?: string
  items: Array<{
    productId: string
    name: string
    price: number
    quantity: number
  }>
  subtotal: number
  taxPercent: number
  tax: number
  total: number
  paymentMethod: string
  userId: string
  createdAt: Timestamp
}
```

**Indexes Required:**
- `userId` (Ascending), `createdAt` (Descending)
- `createdAt` (Descending) - for recent sales

**Queries:**
- Get all sales for a user
- Get today's sales
- Get sales by date range
- Get recent sales (last 5, 10, etc.)

---

### 5. `expenses` Collection
**Purpose:** Store business expenses

**Document Structure:**
```typescript
{
  date: Timestamp
  category: string
  description: string
  amount: number
  paymentMethod: string
  userId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes Required:**
- `userId` (Ascending), `date` (Descending)

**Queries:**
- Get all expenses for a user
- Get expenses by date range
- Get expenses by category
- Get today's/monthly/yearly expenses

---

## Pinia Stores

All collections are managed through Pinia stores:

1. **`useAuthStore`** - Authentication & user profile
2. **`useProductsStore`** - Product/inventory management
3. **`useCustomersStore`** - Customer management
4. **`useSalesStore`** - Sales/invoice management
5. **`useExpensesStore`** - Expense tracking

## Usage Example

```typescript
// In a Vue component
const productsStore = useProductsStore()
const salesStore = useSalesStore()

// Fetch products
await productsStore.fetchProducts()

// Add a product
await productsStore.addProduct({
  name: 'Product Name',
  price: 100,
  quantity: 50,
  costPrice: 80
})

// Create a sale
await salesStore.createSale({
  invoiceId: salesStore.generateInvoiceId(),
  customerName: 'John Doe',
  items: [...],
  subtotal: 1000,
  tax: 100,
  total: 1100,
  paymentMethod: 'cash'
})
```

## Security Rules

Make sure to set up Firestore security rules to ensure users can only access their own data. See `README.md` for security rules.

