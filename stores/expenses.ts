import { defineStore } from 'pinia'
import { collection, query, where, orderBy, getDocs, doc, addDoc, updateDoc, deleteDoc, Timestamp, serverTimestamp } from 'firebase/firestore'

export interface Expense {
  id?: string
  date: any
  category: string
  description: string
  amount: number
  paymentMethod: string
  userId: string
  createdAt?: any
  updatedAt?: any
}

export const useExpensesStore = defineStore('expenses', {
  state: () => ({
    expenses: [] as Expense[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    totalExpenses: (state) => state.expenses.reduce((sum, exp) => sum + exp.amount, 0),
    todayExpenses: (state) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return state.expenses.filter(exp => {
        const expDate = exp.date?.toDate ? exp.date.toDate() : new Date(exp.date)
        return expDate >= today
      }).reduce((sum, exp) => sum + exp.amount, 0)
    },
    monthlyExpenses: (state) => {
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      return state.expenses.filter(exp => {
        const expDate = exp.date?.toDate ? exp.date.toDate() : new Date(exp.date)
        return expDate >= monthStart
      }).reduce((sum, exp) => sum + exp.amount, 0)
    },
    expensesByCategory: (state) => {
      const categories: Record<string, number> = {}
      state.expenses.forEach(exp => {
        categories[exp.category] = (categories[exp.category] || 0) + exp.amount
      })
      return categories
    }
  },

  actions: {
    async fetchExpenses() {
      try {
        this.loading = true
        this.error = null
        
        const authStore = useAuthStore()
        if (!authStore.userId) throw new Error('User not authenticated')

        const { $firebase } = useNuxtApp()
        // Query without orderBy to avoid index requirement, sort in memory instead
        const q = query(
          collection($firebase.db, 'expenses'),
          where('userId', '==', authStore.userId)
        )
        
        const snapshot = await getDocs(q)
        const allExpenses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Expense[]
        
        this.expenses = allExpenses.sort((a, b) => {
          // Sort by date descending
          const aDate = a.date?.toMillis?.() || a.date?.seconds * 1000 || (a.date instanceof Date ? a.date.getTime() : 0)
          const bDate = b.date?.toMillis?.() || b.date?.seconds * 1000 || (b.date instanceof Date ? b.date.getTime() : 0)
          return bDate - aDate
        })
      } catch (error: any) {
        console.error('Error fetching expenses:', error)
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

    async addExpense(expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
      try {
        this.error = null
        
        const authStore = useAuthStore()
        if (!authStore.userId) throw new Error('User not authenticated')

        const { $firebase } = useNuxtApp()
        const date = expense.date instanceof Date 
          ? Timestamp.fromDate(expense.date)
          : expense.date

        const docRef = await addDoc(collection($firebase.db, 'expenses'), {
          ...expense,
          date,
          userId: authStore.userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        
        await this.fetchExpenses()
        return { success: true, id: docRef.id }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async updateExpense(id: string, updates: Partial<Expense>) {
      try {
        this.error = null
        
        const { $firebase } = useNuxtApp()
        const docRef = doc($firebase.db, 'expenses', id)
        
        const updateData: any = {
          ...updates,
          updatedAt: serverTimestamp()
        }
        
        if (updates.date) {
          updateData.date = updates.date instanceof Date 
            ? Timestamp.fromDate(updates.date)
            : updates.date
        }
        
        await updateDoc(docRef, updateData)
        
        await this.fetchExpenses()
        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async deleteExpense(id: string) {
      try {
        this.error = null
        
        const { $firebase } = useNuxtApp()
        await deleteDoc(doc($firebase.db, 'expenses', id))
        
        await this.fetchExpenses()
        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    }
  }
})

