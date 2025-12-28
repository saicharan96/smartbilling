export default defineNuxtPlugin(() => {
  if (process.client) {
    const themeStore = useThemeStore()
    themeStore.init()
  }
})

