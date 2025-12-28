import { defineStore } from 'pinia'
import { collection, query, where, orderBy, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'

export interface Product {
  id?: string
  name: string
  code?: string
  description?: string
  unit?: string
  costPrice: number
  price: number
  rate?: number
  quantity: number
  lowStockThreshold?: number // Individual threshold for each product
  categoryId?: string // Category reference
  imageUrl?: string // Product image URL
  userId: string
  createdAt?: any
  updatedAt?: any
}

// Configurable low stock threshold - can be moved to user settings later
export const LOW_STOCK_THRESHOLD = 10

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [] as Product[],
    loading: false,
    error: null as string | null,
    lowStockThreshold: LOW_STOCK_THRESHOLD // Configurable threshold
  }),

  getters: {
    lowStockProducts: (state) => state.products.filter(p => {
      const threshold = p.lowStockThreshold ?? LOW_STOCK_THRESHOLD
      return p.quantity <= threshold && p.quantity > 0
    }),
    totalProducts: (state) => state.products.length,
    productById: (state) => (id: string) => state.products.find(p => p.id === id)
  },

  actions: {
    async fetchProducts() {
      try {
        this.loading = true
        this.error = null
        
        const authStore = useAuthStore()
        
        // Wait for auth to initialize if needed
        if (authStore.loading) {
          await authStore.init()
        }
        
        // Wait a bit more if user is still not loaded
        if (!authStore.user && !authStore.loading) {
          // Try one more time
          await new Promise(resolve => setTimeout(resolve, 500))
          if (authStore.loading) {
            await authStore.init()
          }
        }
        
        if (!authStore.userId) {
          throw new Error('User not authenticated')
        }

        const { $firebase } = useNuxtApp()
        if (!$firebase || !$firebase.db) {
          throw new Error('Firebase not initialized')
        }
        
        // Query without orderBy to avoid index requirement, sort in memory instead
        const q = query(
          collection($firebase.db, 'products'),
          where('userId', '==', authStore.userId)
        )
        
        const snapshot = await getDocs(q)
        const allProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[]
        
        this.products = allProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      } catch (error: any) {
        console.error('Error fetching products:', error)
        if (error.code === 'permission-denied' || error.message?.includes('message channel closed')) {
          this.error = 'Permission denied. Please check Firestore security rules in Firebase Console.'
          console.error('❌ Firestore permission error. Make sure rules are deployed from firestore.rules file.')
        } else if (error.code === 'failed-precondition' || error.message?.includes('index')) {
          // This shouldn't happen now, but just in case
          console.error('❌ Index error. The query has been fixed to not require indexes.')
          this.error = 'Query error. Please refresh the page.'
        } else {
          this.error = error.message
        }
      } finally {
        this.loading = false
      }
    },

    async addProduct(product: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
      try {
        this.error = null
        
        const authStore = useAuthStore()
        if (!authStore.userId) throw new Error('User not authenticated')

        const { $firebase } = useNuxtApp()
        
        // Remove undefined values - Firestore doesn't allow undefined
        const cleanProduct: any = {}
        Object.keys(product).forEach(key => {
          const value = (product as any)[key]
          if (value !== undefined) {
            cleanProduct[key] = value
          }
        })
        
        const docRef = await addDoc(collection($firebase.db, 'products'), {
          ...cleanProduct,
          userId: authStore.userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        
        await this.fetchProducts()
        return { success: true, id: docRef.id }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async updateProduct(id: string, updates: Partial<Product>) {
      try {
        this.error = null
        
        const { $firebase } = useNuxtApp()
        const docRef = doc($firebase.db, 'products', id)
        
        // Remove undefined values - Firestore doesn't allow undefined
        const cleanUpdates: any = {}
        Object.keys(updates).forEach(key => {
          const value = (updates as any)[key]
          // Only include defined values (not undefined or null)
          // Firestore allows null but not undefined
          if (value !== undefined) {
            cleanUpdates[key] = value
          }
        })
        
        await updateDoc(docRef, {
          ...cleanUpdates,
          updatedAt: serverTimestamp()
        })
        
        await this.fetchProducts()
        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async deleteProduct(id: string) {
      try {
        this.error = null
        
        const { $firebase } = useNuxtApp()
        await deleteDoc(doc($firebase.db, 'products', id))
        
        await this.fetchProducts()
        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async getProduct(id: string) {
      try {
        const { $firebase } = useNuxtApp()
        const docRef = doc($firebase.db, 'products', id)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          return { success: true, data: { id: docSnap.id, ...docSnap.data() } }
        }
        return { success: false, error: 'Product not found' }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  }
})

