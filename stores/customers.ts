import { defineStore } from 'pinia'
import { collection, query, where, orderBy, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'

export interface Customer {
  id?: string
  name: string
  contact?: string
  email?: string
  address?: string
  customFields?: Record<string, any> // JSON object for custom key-value pairs
  userId: string
  totalPurchases?: number
  totalAmount?: number
  lastPurchaseDate?: any
  createdAt?: any
  updatedAt?: any
}

export const useCustomersStore = defineStore('customers', {
  state: () => ({
    customers: [] as Customer[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    totalCustomers: (state) => state.customers.length,
    customerById: (state) => (id: string) => state.customers.find(c => c.id === id)
  },

  actions: {
    async fetchCustomers() {
      try {
        this.loading = true
        this.error = null
        
        const authStore = useAuthStore()
        if (!authStore.userId) throw new Error('User not authenticated')

        const { $firebase } = useNuxtApp()
        // Query without orderBy to avoid index requirement, sort in memory instead
        const q = query(
          collection($firebase.db, 'customers'),
          where('userId', '==', authStore.userId)
        )
        
        const snapshot = await getDocs(q)
        const allCustomers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Customer[]
        
        this.customers = allCustomers.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      } catch (error: any) {
        console.error('Error fetching customers:', error)
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

    async addCustomer(customer: Omit<Customer, 'id' | 'userId' | 'totalPurchases' | 'totalAmount' | 'createdAt' | 'updatedAt' | 'lastPurchaseDate'>) {
      try {
        this.error = null
        
        const authStore = useAuthStore()
        if (!authStore.userId) throw new Error('User not authenticated')

        const { $firebase } = useNuxtApp()
        const docRef = await addDoc(collection($firebase.db, 'customers'), {
          ...customer,
          userId: authStore.userId,
          totalPurchases: 0,
          totalAmount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        
        await this.fetchCustomers()
        return { success: true, id: docRef.id }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async updateCustomer(id: string, updates: Partial<Customer>) {
      try {
        this.error = null
        
        const { $firebase } = useNuxtApp()
        const docRef = doc($firebase.db, 'customers', id)
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp()
        })
        
        await this.fetchCustomers()
        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async deleteCustomer(id: string) {
      try {
        this.error = null
        
        const { $firebase } = useNuxtApp()
        await deleteDoc(doc($firebase.db, 'customers', id))
        
        await this.fetchCustomers()
        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    }
  }
})

