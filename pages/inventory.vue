<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">Inventory</h2>
      <el-button type="primary" @click="openDrawer(null)">
        <PlusIcon class="w-4 h-4 mr-1" />
        Add Product
      </el-button>
    </div>

    <DataTable
      :data="productsStore.products"
      :columns="tableColumns"
      :loading="productsStore.loading"
      search-placeholder="Search products..."
      empty-text="No products yet. Add your first product!"
      :show-actions="true"
      :show-index="true"
      :page-size="20"
    >
      <template #image="{ row }">
        <div class="table-image-container">
          <img
            v-if="row.imageUrl"
            :src="row.imageUrl"
            :alt="row.name"
            class="table-product-image"
          />
          <div v-else class="table-image-placeholder">
            <CubeIcon class="w-6 h-6" />
          </div>
        </div>
      </template>

      <template #name="{ row }">
        <span class="cursor-pointer hover:text-primary" @click="openDrawer(row)">
          {{ row.name }}
        </span>
      </template>

      <template #price="{ row }">
        {{ formatCurrency(row.price) }}
      </template>

      <template #costPrice="{ row }">
        {{ formatCurrency(row.costPrice) }}
      </template>

      <template #status="{ row }">
        <span 
          v-if="row.quantity === 0"
          class="inline-flex items-center gap-x-1.5 rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
        >
          <svg class="size-1.5 fill-red-500" viewBox="0 0 6 6" aria-hidden="true">
            <circle cx="3" cy="3" r="3" />
          </svg>
          Out of Stock
        </span>
        <span 
          v-else-if="row.quantity <= (row.lowStockThreshold ?? 10)"
          class="inline-flex items-center gap-x-1.5 rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
        >
          <svg class="size-1.5 fill-yellow-500" viewBox="0 0 6 6" aria-hidden="true">
            <circle cx="3" cy="3" r="3" />
          </svg>
          Low Stock
        </span>
        <span 
          v-else
          class="inline-flex items-center gap-x-1.5 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
        >
          <svg class="size-1.5 fill-green-500" viewBox="0 0 6 6" aria-hidden="true">
            <circle cx="3" cy="3" r="3" />
          </svg>
          In Stock
        </span>
      </template>

      <template #actions="{ row }">
        <el-dropdown trigger="click" @command="handleCommand">
          <el-button circle>
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu class="w-56 divide-y divide-gray-100">
              <el-dropdown-item :command="{ action: 'edit', row }" class="flex items-center px-4 py-2">
                <PencilSquareIcon class="mr-3 h-5 w-5 text-gray-400" />
                Edit
              </el-dropdown-item>
              <el-dropdown-item :command="{ action: 'delete', row }" divided class="flex items-center px-4 py-2 text-red-700 hover:bg-red-50">
                <TrashIcon class="mr-3 h-5 w-5 text-red-400" />
                Delete
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </DataTable>

    <!-- Product Drawer -->
    <el-drawer
      v-model="drawerVisible"
      :title="isEditing ? 'Edit Product' : 'Add Product'"
      size="40%"
      direction="rtl"
    >
      <el-form
        ref="productFormRef"
        :model="productForm"
        :rules="formRules"
        label-position="top"
        class="product-form"
      >
        <el-form-item label="Product Image" prop="imageUrl">
          <div class="product-image-upload">
            <div v-if="productImagePreview || productForm.imageUrl" class="image-preview">
              <img
                :src="productImagePreview || productForm.imageUrl"
                alt="Product preview"
                class="preview-image"
              />
              <el-button
                type="danger"
                size="small"
                circle
                @click="removeProductImage"
                class="remove-image-btn"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-upload
              v-else
              :auto-upload="false"
              :on-change="handleProductImageChange"
              :show-file-list="false"
              accept="image/*"
              class="product-upload"
            >
              <el-button type="primary">
                <el-icon class="mr-1"><Upload /></el-icon>
                Upload Image
              </el-button>
            </el-upload>
            <div v-if="productImageFile" class="mt-2">
              <el-button type="primary" @click="uploadProductImage" :loading="uploadingImage" size="small">
                {{ uploadingImage ? 'Uploading...' : 'Save Image' }}
              </el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="Product Name" prop="name">
          <el-input v-model="productForm.name" placeholder="Enter product name" />
        </el-form-item>

        <el-form-item label="Product Code" prop="code">
          <el-input v-model="productForm.code" placeholder="Enter product code" />
        </el-form-item>

        <el-form-item label="Unit" prop="unit">
          <el-select v-model="productForm.unit" placeholder="Select unit" style="width: 100%">
            <el-option label="Pieces" value="pcs" />
            <el-option label="Kilograms" value="kg" />
            <el-option label="Grams" value="g" />
            <el-option label="Liters" value="L" />
            <el-option label="Meters" value="m" />
            <el-option label="Box" value="box" />
            <el-option label="Pack" value="pack" />
          </el-select>
        </el-form-item>

        <el-form-item label="Category" prop="categoryId">
          <el-select
            v-model="productForm.categoryId"
            placeholder="Select category (optional)"
            style="width: 100%"
            clearable
            filterable
          >
            <el-option
              v-for="category in categoriesStore.allCategoriesSorted"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            >
              <div class="flex items-center gap-2">
                <PinIcon v-if="category.pinned" class="w-4 h-4 text-blue-500" />
                <span>{{ category.name }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Description" prop="description">
          <el-input
            v-model="productForm.description"
            type="textarea"
            :rows="3"
            placeholder="Enter product description"
          />
        </el-form-item>

        <div class="price-fields-row">
          <el-form-item label="Cost Price" prop="costPrice" class="price-field">
            <el-input-number
              v-model="productForm.costPrice"
              :min="0"
              :precision="2"
              style="width: 100%"
              placeholder="Enter cost price"
            />
          </el-form-item>

          <el-form-item label="Rate" prop="rate" class="price-field">
            <el-input-number
              v-model="productForm.rate"
              :min="0"
              :precision="2"
              style="width: 100%"
              placeholder="Enter rate"
            />
          </el-form-item>
        </div>

        <div class="price-fields-row">
          <el-form-item label="Selling Price" prop="price" class="price-field">
            <el-input-number
              v-model="productForm.price"
              :min="0"
              :precision="2"
              style="width: 100%"
              placeholder="Enter selling price"
            />
          </el-form-item>

          <el-form-item label="Quantity" prop="quantity" class="price-field">
            <el-input-number
              v-model="productForm.quantity"
              :min="0"
              :precision="0"
              style="width: 100%"
              placeholder="Enter quantity"
            />
          </el-form-item>
        </div>

        <el-form-item label="Low Stock Threshold" prop="lowStockThreshold">
          <el-input-number
            v-model="productForm.lowStockThreshold"
            :min="0"
            :precision="0"
            style="width: 100%"
            placeholder="Alert when stock is at or below this number"
          />
          <div class="text-xs text-gray-500 mt-1">
            Product will show "Low Stock" when quantity reaches this number
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveProduct" :loading="saving">
            {{ isEditing ? 'Update Product' : 'Add Product' }}
          </el-button>
          <el-button @click="drawerVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, CubeIcon } from '@heroicons/vue/24/outline'
import { PaperClipIcon as PinIcon } from '@heroicons/vue/24/solid'
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/20/solid'
import { MoreFilled, Upload, Delete } from '@element-plus/icons-vue'
import { useProductsStore } from '~/stores/products'
import { useCategoriesStore } from '~/stores/categories'
import { useAuthStore } from '~/stores/auth'
import { ElMessageBox, ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()
const authStore = useAuthStore()
const drawerVisible = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const uploadingImage = ref(false)
const productFormRef = ref<FormInstance>()

const productImageFile = ref<File | null>(null)
const productImagePreview = ref<string | null>(null)

const tableColumns = [
  { prop: 'image', label: 'Image', width: 80, sortable: false },
  { prop: 'name', label: 'Name', minWidth: 150, sortable: true, filterable: true },
  { prop: 'code', label: 'Code', width: 120, sortable: true, filterable: true },
  { prop: 'price', label: 'Price', width: 120, sortable: true },
  { prop: 'costPrice', label: 'Cost Price', width: 120, sortable: true },
  { prop: 'quantity', label: 'Quantity', width: 120, sortable: true },
  { prop: 'status', label: 'Status', width: 120, sortable: false }
]

const productForm = ref({
  name: '',
  code: '',
  unit: '',
  description: '',
  costPrice: 0,
  rate: 0,
  price: 0,
  quantity: 0,
  lowStockThreshold: 10, // Default threshold
  categoryId: undefined as string | undefined,
  imageUrl: undefined as string | undefined
})

const formRules: FormRules = {
  name: [
    { required: true, message: 'Product name is required', trigger: 'blur' }
  ],
  price: [
    { required: true, message: 'Selling price is required', trigger: 'blur' },
    { type: 'number', min: 0, message: 'Price must be greater than 0', trigger: 'blur' }
  ],
  costPrice: [
    { required: true, message: 'Cost price is required', trigger: 'blur' },
    { type: 'number', min: 0, message: 'Cost price must be greater than 0', trigger: 'blur' }
  ],
  quantity: [
    { required: true, message: 'Quantity is required', trigger: 'blur' },
    { type: 'number', min: 0, message: 'Quantity must be 0 or greater', trigger: 'blur' }
  ]
}

const resetForm = () => {
  productForm.value = {
    name: '',
    code: '',
    unit: '',
    description: '',
    costPrice: 0,
    rate: 0,
    price: 0,
    quantity: 0,
    lowStockThreshold: 10,
    categoryId: undefined,
    imageUrl: undefined
  }
  productImageFile.value = null
  productImagePreview.value = null
  productFormRef.value?.clearValidate()
}

const openDrawer = (product: any) => {
  if (product && product.id) {
    // Edit mode
    isEditing.value = true
    currentProductId.value = product.id
    productForm.value = {
      name: product.name || '',
      code: product.code || '',
      unit: product.unit || '',
      description: product.description || '',
      costPrice: product.costPrice || 0,
      rate: product.rate || product.price || 0,
      price: product.price || 0,
      quantity: product.quantity || 0,
      lowStockThreshold: product.lowStockThreshold ?? 10,
      categoryId: product.categoryId || undefined,
      imageUrl: product.imageUrl || undefined
    }
    productImageFile.value = null
    productImagePreview.value = null
  } else {
    // Add mode
    isEditing.value = false
    currentProductId.value = null
    resetForm()
  }
  drawerVisible.value = true
}

const saveProduct = async () => {
  if (!productFormRef.value) return

  await productFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        const productData: any = {
          name: productForm.value.name,
          code: productForm.value.code || '',
          unit: productForm.value.unit || '',
          description: productForm.value.description || '',
          costPrice: productForm.value.costPrice,
          rate: productForm.value.rate || productForm.value.price,
          price: productForm.value.price,
          quantity: productForm.value.quantity,
          lowStockThreshold: productForm.value.lowStockThreshold || 10
        }
        
        // Only include optional fields if they have values
        if (productForm.value.categoryId) {
          productData.categoryId = productForm.value.categoryId
        }
        
        if (productForm.value.imageUrl) {
          productData.imageUrl = productForm.value.imageUrl
        }

        if (isEditing.value && currentProductId.value) {
          const result = await productsStore.updateProduct(currentProductId.value, productData)
          if (result.success) {
            ElMessage.success('Product updated successfully')
            drawerVisible.value = false
          } else {
            ElMessage.error(result.error || 'Failed to update product')
          }
        } else {
          const result = await productsStore.addProduct(productData)
          if (result.success) {
            ElMessage.success('Product added successfully')
            drawerVisible.value = false
            resetForm()
          } else {
            ElMessage.error(result.error || 'Failed to add product')
          }
        }
      } catch (error: any) {
        ElMessage.error(error.message || 'An error occurred')
      } finally {
        saving.value = false
      }
    }
  })
}

const currentProductId = ref<string | null>(null)

const handleCommand = (command: { action: string, row: any }) => {
  if (command.action === 'edit') {
    openDrawer(command.row)
  } else if (command.action === 'delete') {
    deleteProduct(command.row.id!)
  }
}

const deleteProduct = async (id: string) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to delete this product?', 'Confirm Delete', {
      type: 'warning',
    })
    await productsStore.deleteProduct(id)
    ElMessage.success('Product deleted successfully')
  } catch {
    // User cancelled
  }
}

// Image upload handlers
const handleProductImageChange = (file: any) => {
  productImageFile.value = file.raw
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    productImagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

const uploadProductImage = async () => {
  if (!productImageFile.value || !authStore.user) {
    ElMessage.warning('Please select an image file first')
    return
  }
  
  // Validate file type
  if (!productImageFile.value.type.startsWith('image/')) {
    ElMessage.error('Please select an image file')
    return
  }
  
  // Validate file size (5MB max)
  if (productImageFile.value.size > 5 * 1024 * 1024) {
    ElMessage.error('Image size must be less than 5MB')
    return
  }
  
  uploadingImage.value = true
  try {
    const { $firebase } = useNuxtApp()
    if (!$firebase) {
      throw new Error('Firebase not initialized')
    }
    
    if (!$firebase.storage) {
      throw new Error('Firebase Storage is not enabled')
    }
    
    if (!authStore.user) {
      throw new Error('User not authenticated')
    }
    
    // Convert file to base64 as fallback if Storage fails
    const convertToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    }
    
    let downloadURL: string
    
    // Try Firebase Storage first, but always fallback to base64 on any error
    try {
      const fileExtension = productImageFile.value.name.split('.').pop() || 'png'
      const fileName = `products/${authStore.user.uid}/${Date.now()}.${fileExtension}`
      const fileRef = storageRef($firebase.storage, fileName)
      
      // Upload with timeout to catch CORS quickly
      const uploadPromise = uploadBytes(fileRef, productImageFile.value, {
        contentType: productImageFile.value.type,
        customMetadata: {
          uploadedBy: authStore.user.uid,
          uploadedAt: new Date().toISOString()
        }
      })
      
      // 2 second timeout for CORS detection
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout - likely CORS issue')), 2000)
      })
      
      await Promise.race([uploadPromise, timeoutPromise])
      downloadURL = await getDownloadURL(fileRef)
      
      ElMessage.success('Image uploaded successfully')
    } catch (storageError: any) {
      // ANY error (CORS, timeout, unauthorized, etc.) -> use base64
      console.log('Storage upload failed, using base64 fallback:', storageError)
      
      // Always fallback to base64
      downloadURL = await convertToBase64(productImageFile.value)
    }
    
    // Update form with image URL
    productForm.value.imageUrl = downloadURL
    productImageFile.value = null
    
    ElMessage.success('Image saved successfully')
  } catch (error: any) {
    console.error('Error uploading image:', error)
    ElMessage.error(error.message || 'Failed to upload image')
  } finally {
    uploadingImage.value = false
  }
}

const removeProductImage = () => {
  productForm.value.imageUrl = undefined
  productImageFile.value = null
  productImagePreview.value = null
}

onMounted(async () => {
  const authStore = useAuthStore()
  
  // Wait for auth to initialize
  if (authStore.loading) {
    await authStore.init()
  }
  
  // Only fetch if user is authenticated
  if (authStore.userId) {
    await Promise.all([
      productsStore.fetchProducts(),
      categoriesStore.fetchCategories()
    ])
  }
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0)
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.product-form {
  padding: 20px 0;
}

.price-fields-row {
  display: flex;
  gap: 16px;
}

.price-field {
  flex: 1;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  color: #001f2a;
}

.dark .cursor-pointer:hover {
  color: #60a5fa;
}

.page-header {
  transition: color 0.3s ease;
}

.dark .page-header {
  color: #f1f5f9;
}

.page-title {
  transition: color 0.3s ease;
}

.dark .page-title {
  color: #f1f5f9;
}

.product-image-upload {
  width: 100%;
}

.image-preview {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  background: white;
}

.dark .preview-image {
  border-color: #334155;
  background: #0f172a;
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
}

.table-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
}

.table-product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.dark .table-product-image {
  border-color: #334155;
}

.table-image-placeholder {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #9ca3af;
}

.dark .table-image-placeholder {
  background: #1e293b;
  border-color: #334155;
  color: #64748b;
}
</style>
