import { defineStore } from 'pinia'
import { collection, query, where, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore'

export interface Category {
  id?: string
  name: string
  pinned: boolean
  userId: string
  createdAt?: any
  updatedAt?: any
}

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [] as Category[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    pinnedCategories: (state) => state.categories.filter(c => c.pinned).sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0
      const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0
      return aTime - bTime
    }),
    unpinnedCategories: (state) => state.categories.filter(c => !c.pinned).sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0
      const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0
      return aTime - bTime
    }),
    allCategoriesSorted: (state) => {
      const pinned = state.categories.filter(c => c.pinned).sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0
        const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0
        return aTime - bTime
      })
      const unpinned = state.categories.filter(c => !c.pinned).sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0
        const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0
        return aTime - bTime
      })
      return [...pinned, ...unpinned]
    },
    categoryById: (state) => (id: string) => state.categories.find(c => c.id === id),
    categoryByName: (state) => (name: string) => state.categories.find(c => c.name.toLowerCase() === name.toLowerCase())
  },

  actions: {
    async fetchCategories() {
      try {
        this.loading = true
        this.error = null
        
        const authStore = useAuthStore()
        if (!authStore.userId) throw new Error('User not authenticated')

        const { $firebase } = useNuxtApp()
        
        const q = query(
          collection($firebase.db, 'categories'),
          where('userId', '==', authStore.userId)
        )
        
        const snapshot = await getDocs(q)
        this.categories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[]
        
        // Sort: pinned first, then by creation date
        this.categories.sort((a, b) => {
          if (a.pinned !== b.pinned) {
            return a.pinned ? -1 : 1
          }
          const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0
          const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0
          return aTime - bTime
        })
      } catch (error: any) {
        console.error('Error fetching categories:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async addCategory(category: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
      try {
        this.error = null
        
        const authStore = useAuthStore()
        if (!authStore.userId) throw new Error('User not authenticated')

        const { $firebase } = useNuxtApp()
        
        // Check if category with same name already exists
        const existing = this.categoryByName(category.name)
        if (existing) {
          throw new Error('Category with this name already exists')
        }
        
        const docRef = await addDoc(collection($firebase.db, 'categories'), {
          ...category,
          userId: authStore.userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        
        // Add to local state
        this.categories.push({
          id: docRef.id,
          ...category,
          userId: authStore.userId
        })
        
        // Re-sort
        this.categories.sort((a, b) => {
          if (a.pinned !== b.pinned) {
            return a.pinned ? -1 : 1
          }
          const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0
          const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0
          return aTime - bTime
        })
        
        return { success: true, id: docRef.id }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async updateCategory(id: string, updates: Partial<Category>) {
      try {
        this.error = null
        
        const authStore = useAuthStore()
        if (!authStore.userId) throw new Error('User not authenticated')

        const { $firebase } = useNuxtApp()
        
        // Check if name is being changed and if it conflicts
        if (updates.name) {
          const existing = this.categoryByName(updates.name)
          if (existing && existing.id !== id) {
            throw new Error('Category with this name already exists')
          }
        }
        
        await updateDoc(doc($firebase.db, 'categories', id), {
          ...updates,
          updatedAt: serverTimestamp()
        })
        
        // Update local state
        const index = this.categories.findIndex(c => c.id === id)
        if (index !== -1) {
          this.categories[index] = { ...this.categories[index], ...updates }
        }
        
        // Re-sort
        this.categories.sort((a, b) => {
          if (a.pinned !== b.pinned) {
            return a.pinned ? -1 : 1
          }
          const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0
          const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0
          return aTime - bTime
        })
        
        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async deleteCategory(id: string) {
      try {
        this.error = null
        
        const authStore = useAuthStore()
        if (!authStore.userId) throw new Error('User not authenticated')

        const { $firebase } = useNuxtApp()
        
        await deleteDoc(doc($firebase.db, 'categories', id))
        
        // Remove from local state
        this.categories = this.categories.filter(c => c.id !== id)
        
        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async togglePin(id: string) {
      const category = this.categoryById(id)
      if (!category) return { success: false, error: 'Category not found' }
      
      return await this.updateCategory(id, { pinned: !category.pinned })
    }
  }
})

