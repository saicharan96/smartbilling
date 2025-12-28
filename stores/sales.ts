import { defineStore } from 'pinia'
import { collection, query, where, orderBy, limit, getDocs, doc, addDoc, updateDoc, Timestamp, serverTimestamp, increment } from 'firebase/firestore'

export interface SaleItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export interface Sale {
  id?: string
  invoiceId: string
  customerName: string
  customerContact?: string
  customerEmail?: string
  items: SaleItem[]
  subtotal: number
  taxPercent: number
  tax: number
  total: number
  paymentMethod: string
  userId: string
  createdAt?: any
}

export const useSalesStore = defineStore('sales', {
  state: () => ({
    sales: [] as Sale[],
    todaySales: [] as Sale[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    totalSales: (state) => state.sales.reduce((sum, sale) => sum + sale.total, 0),
    todayTotal: (state) => state.todaySales.reduce((sum, sale) => sum + sale.total, 0),
    todayCount: (state) => state.todaySales.length
  },

  actions: {
    async fetchSales(limitCount?: number) {
      try {
        this.loading = true
        this.error = null
        
        const authStore = useAuthStore()
        if (!authStore.userId) throw new Error('User not authenticated')

        const { $firebase } = useNuxtApp()
        // Query without orderBy to avoid index requirement, sort in memory instead
        let q = query(
          collection($firebase.db, 'sales'),
          where('userId', '==', authStore.userId)
        )
        
        const snapshot = await getDocs(q)
        let sales = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Sale[]
        
        // Sort by createdAt descending in memory
        sales.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0
          const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0
          return bTime - aTime
        })
        
        // Apply limit if specified
        if (limitCount) {
          sales = sales.slice(0, limitCount)
        }
        
        this.sales = sales
      } catch (error: any) {
        console.error('Error fetching sales:', error)
        if (error.code === 'permission-denied' || error.message?.includes('message channel closed')) {
          this.error = 'Permission denied. Please check Firestore security rules in Firebase Console.'
          console.error('❌ Firestore permission error. Make sure rules are deployed from firestore.rules file.')
        } else if (error.code === 'failed-precondition' || error.message?.includes('index')) {
          console.error('❌ Index error. The query has been fixed to not require indexes.')
          this.error = 'Query error. Please refresh the page.'
        } else {
          this.error = error.message
        }
      } finally {
        this.loading = false
      }
    },

    async fetchTodaySales() {
      try {
        const authStore = useAuthStore()
        if (!authStore.userId) throw new Error('User not authenticated')

        const { $firebase } = useNuxtApp()
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayEnd = new Date(today)
        todayEnd.setHours(23, 59, 59, 999)
        const todayStartTime = today.getTime()
        const todayEndTime = todayEnd.getTime()

        // Query only by userId to avoid index requirement, filter by date in memory
        const q = query(
          collection($firebase.db, 'sales'),
          where('userId', '==', authStore.userId)
        )
        
        const snapshot = await getDocs(q)
        const allSales = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Sale[]
        
        this.todaySales = allSales
          .filter(sale => {
            // Filter by date in memory
            const saleTime = sale.createdAt?.toMillis?.() || sale.createdAt?.seconds * 1000 || 0
            return saleTime >= todayStartTime && saleTime <= todayEndTime
          })
          .sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0
            const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0
            return bTime - aTime
          })
      } catch (error: any) {
        console.error('Error fetching today sales:', error)
      }
    },

    async createSale(sale: Omit<Sale, 'id' | 'userId' | 'createdAt'>) {
      try {
        this.error = null
        
        const authStore = useAuthStore()
        if (!authStore.userId) throw new Error('User not authenticated')

        const { $firebase } = useNuxtApp()
        const productsStore = useProductsStore()
        const customersStore = useCustomersStore()

        // Create sale document
        const docRef = await addDoc(collection($firebase.db, 'sales'), {
          ...sale,
          userId: authStore.userId,
          createdAt: serverTimestamp()
        })

        // Update product quantities
        const batch = []
        for (const item of sale.items) {
          const product = productsStore.productById(item.productId)
          if (product) {
            const productRef = doc($firebase.db, 'products', item.productId)
            batch.push(updateDoc(productRef, {
              quantity: increment(-item.quantity),
              updatedAt: serverTimestamp()
            }))
          }
        }
        if (batch.length > 0) {
          await Promise.all(batch)
        }

        // Update or create customer
        if (sale.customerName) {
          const existingCustomer = customersStore.customers.find(
            c => c.name.toLowerCase() === sale.customerName.toLowerCase()
          )
          
          if (existingCustomer) {
            await updateDoc(doc($firebase.db, 'customers', existingCustomer.id!), {
              totalPurchases: increment(1),
              totalAmount: increment(sale.total),
              lastPurchaseDate: serverTimestamp(),
              updatedAt: serverTimestamp()
            })
          } else {
            await customersStore.addCustomer({
              name: sale.customerName,
              contact: sale.customerContact,
              email: sale.customerEmail
            })
            const newCustomer = customersStore.customers.find(
              c => c.name.toLowerCase() === sale.customerName.toLowerCase()
            )
            if (newCustomer) {
              await updateDoc(doc($firebase.db, 'customers', newCustomer.id!), {
                totalPurchases: 1,
                totalAmount: sale.total,
                lastPurchaseDate: serverTimestamp()
              })
            }
          }
        }

        // Refresh stores
        await productsStore.fetchProducts()
        await customersStore.fetchCustomers()
        await this.fetchTodaySales()
        
        return { success: true, id: docRef.id }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    generateInvoiceId() {
      return 'INV-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase()
    }
  }
})

