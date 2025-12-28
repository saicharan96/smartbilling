import { useProductsStore } from '~/stores/products'
import { useCategoriesStore } from '~/stores/categories'
import { useAuthStore } from '~/stores/auth'

// Generate a simple base64 image (colored square) - using SVG data URI
const generateBase64Image = (color: string = '#4F46E5'): string => {
  // Use SVG data URI which works everywhere
  const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="${color}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">PROD</text>
  </svg>`
  
  // Encode SVG to base64
  if (typeof window !== 'undefined' && window.btoa) {
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
  }
  
  // Fallback: use URL-encoded SVG (works without btoa)
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// Sample product data
const sampleProducts = [
  { name: 'Rice 1kg', code: 'RICE001', unit: 'kg', costPrice: 45, price: 60, quantity: 100, category: 'Grocery' },
  { name: 'Wheat Flour 1kg', code: 'WHEAT001', unit: 'kg', costPrice: 35, price: 50, quantity: 80, category: 'Grocery' },
  { name: 'Sugar 1kg', code: 'SUGAR001', unit: 'kg', costPrice: 40, price: 55, quantity: 120, category: 'Grocery' },
  { name: 'Cooking Oil 1L', code: 'OIL001', unit: 'L', costPrice: 120, price: 150, quantity: 60, category: 'Grocery' },
  { name: 'Salt 1kg', code: 'SALT001', unit: 'kg', costPrice: 15, price: 25, quantity: 200, category: 'Grocery' },
  { name: 'Tea Powder 250g', code: 'TEA001', unit: 'g', costPrice: 80, price: 120, quantity: 50, category: 'Beverages' },
  { name: 'Coffee 200g', code: 'COFFEE001', unit: 'g', costPrice: 150, price: 200, quantity: 40, category: 'Beverages' },
  { name: 'Milk 1L', code: 'MILK001', unit: 'L', costPrice: 50, price: 65, quantity: 30, category: 'Dairy' },
  { name: 'Curd 500g', code: 'CURD001', unit: 'g', costPrice: 30, price: 45, quantity: 25, category: 'Dairy' },
  { name: 'Butter 100g', code: 'BUTTER001', unit: 'g', costPrice: 60, price: 80, quantity: 35, category: 'Dairy' },
  { name: 'Bread White', code: 'BREAD001', unit: 'pack', costPrice: 25, price: 35, quantity: 20, category: 'Bakery' },
  { name: 'Bread Brown', code: 'BREAD002', unit: 'pack', costPrice: 30, price: 40, quantity: 15, category: 'Bakery' },
  { name: 'Biscuits 200g', code: 'BISCUIT001', unit: 'g', costPrice: 40, price: 60, quantity: 45, category: 'Snacks' },
  { name: 'Chips 100g', code: 'CHIPS001', unit: 'g', costPrice: 20, price: 30, quantity: 60, category: 'Snacks' },
  { name: 'Chocolate Bar', code: 'CHOCO001', unit: 'pcs', costPrice: 25, price: 40, quantity: 50, category: 'Snacks' },
  { name: 'Onion 1kg', code: 'ONION001', unit: 'kg', costPrice: 30, price: 45, quantity: 70, category: 'Vegetables' },
  { name: 'Tomato 1kg', code: 'TOMATO001', unit: 'kg', costPrice: 40, price: 60, quantity: 55, category: 'Vegetables' },
  { name: 'Potato 1kg', code: 'POTATO001', unit: 'kg', costPrice: 25, price: 40, quantity: 90, category: 'Vegetables' },
  { name: 'Carrot 1kg', code: 'CARROT001', unit: 'kg', costPrice: 50, price: 70, quantity: 40, category: 'Vegetables' },
  { name: 'Cabbage 1kg', code: 'CABBAGE001', unit: 'kg', costPrice: 20, price: 35, quantity: 30, category: 'Vegetables' },
  { name: 'Apple 1kg', code: 'APPLE001', unit: 'kg', costPrice: 100, price: 150, quantity: 25, category: 'Fruits' },
  { name: 'Banana 1kg', code: 'BANANA001', unit: 'kg', costPrice: 40, price: 60, quantity: 35, category: 'Fruits' },
  { name: 'Orange 1kg', code: 'ORANGE001', unit: 'kg', costPrice: 80, price: 120, quantity: 20, category: 'Fruits' },
  { name: 'Mango 1kg', code: 'MANGO001', unit: 'kg', costPrice: 120, price: 180, quantity: 15, category: 'Fruits' },
  { name: 'Grapes 1kg', code: 'GRAPES001', unit: 'kg', costPrice: 150, price: 200, quantity: 12, category: 'Fruits' },
  { name: 'Chicken 1kg', code: 'CHICKEN001', unit: 'kg', costPrice: 200, price: 280, quantity: 10, category: 'Meat' },
  { name: 'Fish 1kg', code: 'FISH001', unit: 'kg', costPrice: 250, price: 350, quantity: 8, category: 'Meat' },
  { name: 'Eggs Dozen', code: 'EGG001', unit: 'dozen', costPrice: 60, price: 80, quantity: 20, category: 'Meat' },
  { name: 'Soap Bar', code: 'SOAP001', unit: 'pcs', costPrice: 30, price: 45, quantity: 100, category: 'Personal Care' },
  { name: 'Shampoo 200ml', code: 'SHAMPOO001', unit: 'ml', costPrice: 80, price: 120, quantity: 40, category: 'Personal Care' },
  { name: 'Toothpaste 100g', code: 'TOOTHPASTE001', unit: 'g', costPrice: 50, price: 75, quantity: 50, category: 'Personal Care' },
  { name: 'Detergent 1kg', code: 'DETERGENT001', unit: 'kg', costPrice: 100, price: 150, quantity: 30, category: 'Cleaning' },
  { name: 'Dish Soap 500ml', code: 'DISH001', unit: 'ml', costPrice: 40, price: 60, quantity: 45, category: 'Cleaning' },
  { name: 'Toilet Paper 4pk', code: 'TP001', unit: 'pack', costPrice: 80, price: 120, quantity: 25, category: 'Cleaning' },
  { name: 'Battery AA', code: 'BATTERY001', unit: 'pcs', costPrice: 20, price: 35, quantity: 80, category: 'Electronics' },
  { name: 'Bulb LED', code: 'BULB001', unit: 'pcs', costPrice: 50, price: 80, quantity: 35, category: 'Electronics' },
  { name: 'Pen Blue', code: 'PEN001', unit: 'pcs', costPrice: 5, price: 10, quantity: 200, category: 'Stationery' },
  { name: 'Notebook', code: 'NOTEBOOK001', unit: 'pcs', costPrice: 30, price: 50, quantity: 60, category: 'Stationery' },
  { name: 'Pencil', code: 'PENCIL001', unit: 'pcs', costPrice: 3, price: 5, quantity: 300, category: 'Stationery' },
  { name: 'Eraser', code: 'ERASER001', unit: 'pcs', costPrice: 5, price: 10, quantity: 150, category: 'Stationery' },
  { name: 'Water Bottle 1L', code: 'WATER001', unit: 'L', costPrice: 20, price: 30, quantity: 100, category: 'Beverages' },
  { name: 'Soft Drink 500ml', code: 'SOFTDRINK001', unit: 'ml', costPrice: 25, price: 40, quantity: 80, category: 'Beverages' },
  { name: 'Juice 1L', code: 'JUICE001', unit: 'L', costPrice: 80, price: 120, quantity: 40, category: 'Beverages' },
  { name: 'Noodles Pack', code: 'NOODLES001', unit: 'pack', costPrice: 15, price: 25, quantity: 120, category: 'Grocery' },
  { name: 'Pasta 500g', code: 'PASTA001', unit: 'g', costPrice: 60, price: 90, quantity: 50, category: 'Grocery' },
  { name: 'Spices Mix', code: 'SPICES001', unit: 'pack', costPrice: 40, price: 60, quantity: 70, category: 'Grocery' },
  { name: 'Garlic 250g', code: 'GARLIC001', unit: 'g', costPrice: 30, price: 50, quantity: 45, category: 'Vegetables' },
  { name: 'Ginger 250g', code: 'GINGER001', unit: 'g', costPrice: 50, price: 80, quantity: 30, category: 'Vegetables' },
  { name: 'Green Chilli 100g', code: 'CHILLI001', unit: 'g', costPrice: 20, price: 35, quantity: 25, category: 'Vegetables' },
  { name: 'Coriander 100g', code: 'CORIANDER001', unit: 'g', costPrice: 10, price: 20, quantity: 15, category: 'Vegetables' }
]

// Color palette for product images
const colors = [
  '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'
]

export const useSeedProducts = () => {
  const productsStore = useProductsStore()
  const categoriesStore = useCategoriesStore()
  const authStore = useAuthStore()

  const seedProducts = async () => {
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    try {
      // First, ensure categories exist
      await categoriesStore.fetchCategories()
      const existingCategories = categoriesStore.categories
      
      // Create categories if they don't exist
      const categoryNames = [...new Set(sampleProducts.map(p => p.category))]
      for (const catName of categoryNames) {
        const exists = existingCategories.find(c => c.name.toLowerCase() === catName.toLowerCase())
        if (!exists) {
          await categoriesStore.addCategory({
            name: catName,
            pinned: false
          })
        }
      }
      
      // Refresh categories
      await categoriesStore.fetchCategories()
      
      // Generate products
      const productsToAdd = sampleProducts.map((product, index) => {
        const category = categoriesStore.categories.find(
          c => c.name.toLowerCase() === product.category.toLowerCase()
        )
        
        // Generate base64 image with different colors
        const color = colors[index % colors.length]
        const imageUrl = generateBase64Image(color)
        
        // Generate product code if not provided
        const code = product.code || `PROD${String(index + 1).padStart(3, '0')}`
        
        // Vary quantities and prices slightly
        const quantity = product.quantity + Math.floor(Math.random() * 50)
        const lowStockThreshold = Math.floor(quantity * 0.2) // 20% of quantity
        
        return {
          name: product.name,
          code,
          description: `High quality ${product.name.toLowerCase()} for your daily needs`,
          unit: product.unit,
          costPrice: product.costPrice,
          rate: product.price,
          price: product.price,
          quantity,
          lowStockThreshold,
          categoryId: category?.id,
          imageUrl
        }
      })
      
      // Add products in batches to avoid overwhelming Firestore
      const batchSize = 10
      let added = 0
      
      for (let i = 0; i < productsToAdd.length; i += batchSize) {
        const batch = productsToAdd.slice(i, i + batchSize)
        
        await Promise.all(
          batch.map(product => productsStore.addProduct(product))
        )
        
        added += batch.length
        console.log(`Added ${added}/${productsToAdd.length} products...`)
        
        // Small delay between batches
        if (i + batchSize < productsToAdd.length) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      // Refresh products
      await productsStore.fetchProducts()
      
      return {
        success: true,
        message: `Successfully seeded ${productsToAdd.length} products!`
      }
    } catch (error: any) {
      console.error('Error seeding products:', error)
      return {
        success: false,
        error: error.message || 'Failed to seed products'
      }
    }
  }

  return {
    seedProducts
  }
}

