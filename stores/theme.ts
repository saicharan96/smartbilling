import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false
  }),

  getters: {
    theme: (state) => state.isDark ? 'dark' : 'light'
  },

  actions: {
    init() {
      if (process.client) {
        // Check localStorage for saved preference
        const saved = localStorage.getItem('theme')
        if (saved === 'dark' || saved === 'light') {
          this.isDark = saved === 'dark'
        } else {
          // Check system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          this.isDark = prefersDark
        }
        this.applyTheme()
      }
    },

    toggle() {
      this.isDark = !this.isDark
      this.applyTheme()
      if (process.client) {
        localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
      }
    },

    setDark(dark: boolean) {
      this.isDark = dark
      this.applyTheme()
      if (process.client) {
        localStorage.setItem('theme', dark ? 'dark' : 'light')
      }
    },

    applyTheme() {
      if (process.client) {
        const html = document.documentElement
        if (this.isDark) {
          html.classList.add('dark')
        } else {
          html.classList.remove('dark')
        }
      }
    }
  }
})

