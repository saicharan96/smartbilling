<template>
  <div class="settings-container">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

    <el-card shadow="never" class="bg-white mb-6 rounded-xl">
      <template #header>
        <span class="text-lg font-semibold">Profile Settings</span>
      </template>
      <div v-if="authStore.userProfile" class="space-y-2">
        <p><strong>Name:</strong> {{ authStore.userProfile.name }}</p>
        <p><strong>Email:</strong> {{ authStore.userProfile.email }}</p>
      </div>
      <div v-else>
        <el-skeleton :rows="2" animated />
      </div>
    </el-card>

    <el-card shadow="never" class="bg-white mb-6 rounded-xl">
      <template #header>
        <span class="text-lg font-semibold">Business Information</span>
      </template>
      <el-form @submit.prevent="updateBusinessInfo" label-width="140px">
        <el-form-item label="Business Logo">
          <div class="logo-upload-section">
            <div v-if="logoPreview || authStore.userProfile?.businessLogo" class="logo-preview">
              <img 
                :src="logoPreview || authStore.userProfile?.businessLogo" 
                alt="Business Logo" 
                class="logo-image"
              />
              <el-button 
                type="danger" 
                size="small" 
                circle 
                @click="removeLogo"
                class="remove-logo-btn"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-upload
              v-if="!logoPreview && !authStore.userProfile?.businessLogo"
              :auto-upload="false"
              :on-change="handleLogoChange"
              :show-file-list="false"
              accept="image/*"
              class="logo-upload"
            >
              <el-button type="primary">
                <el-icon class="mr-1"><Upload /></el-icon>
                Upload Logo
              </el-button>
            </el-upload>
            <div v-if="logoFile" class="mt-2">
              <el-button type="primary" @click="uploadLogo" :loading="uploading">
                {{ uploading ? 'Uploading...' : 'Save Logo' }}
              </el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="Business Name">
          <el-input v-model="businessName" placeholder="Enter business name" />
        </el-form-item>
        <el-form-item label="GST Number">
          <el-input v-model="gstNumber" placeholder="Enter GST number" />
        </el-form-item>
        <el-form-item label="Business Address">
          <el-input 
            v-model="businessAddress" 
            type="textarea" 
            :rows="3"
            placeholder="Enter business address" 
          />
        </el-form-item>
        <el-form-item label="Contact Number">
          <el-input v-model="businessContact" placeholder="Enter contact number" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updateBusinessInfo" :loading="saving">Save Changes</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Category Management -->
    <el-card shadow="never" class="bg-white mb-6 rounded-xl">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg font-semibold">Category Management</span>
          <el-button type="primary" size="small" @click="showAddCategory = true">
            <PlusIcon class="w-4 h-4 mr-1" />
            Add Category
          </el-button>
        </div>
      </template>
      
      <div v-loading="categoriesStore.loading">
        <div v-if="categoriesStore.categories.length === 0" class="empty-categories">
          <p class="text-gray-500">No categories yet. Create your first category!</p>
        </div>
        
        <div v-else class="categories-list">
          <div
            v-for="category in categoriesStore.allCategoriesSorted"
            :key="category.id"
            class="category-item"
          >
            <div class="category-info">
              <div class="category-name-section">
                <PinIcon v-if="category.pinned" class="pin-icon pinned" />
                <span class="category-name">{{ category.name }}</span>
              </div>
            </div>
            <div class="category-actions">
              <el-button
                type="text"
                size="small"
                @click="togglePinCategory(category.id!)"
                :title="category.pinned ? 'Unpin category' : 'Pin category'"
              >
                <PinIcon :class="['pin-icon', { pinned: category.pinned }]" />
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="editCategory(category)"
              >
                <PencilIcon class="w-4 h-4" />
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="deleteCategory(category.id!)"
                class="text-red-500"
              >
                <TrashIcon class="w-4 h-4" />
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="bg-white rounded-xl">
      <template #header>
        <span class="text-lg font-semibold">Account Actions</span>
      </template>
      <el-button type="danger" @click="handleLogout">Logout</el-button>
    </el-card>

    <!-- Add/Edit Category Dialog -->
    <el-dialog
      v-model="showCategoryDialog"
      :title="editingCategory ? 'Edit Category' : 'Add Category'"
      width="400px"
    >
      <el-form @submit.prevent="saveCategory" label-position="top">
        <el-form-item label="Category Name" required>
          <el-input
            v-model="categoryForm.name"
            placeholder="Enter category name"
            :maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="categoryForm.pinned">
            Pin this category (appears first in lists)
          </el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCategoryDialog = false">Cancel</el-button>
        <el-button type="primary" @click="saveCategory" :loading="savingCategory">
          {{ editingCategory ? 'Update' : 'Create' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useCategoriesStore } from '~/stores/categories'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Delete } from '@element-plus/icons-vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { PaperClipIcon as PinIcon } from '@heroicons/vue/24/solid'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const authStore = useAuthStore()
const categoriesStore = useCategoriesStore()
const router = useRouter()

const businessName = ref('')
const gstNumber = ref('')
const businessAddress = ref('')
const businessContact = ref('')
const logoFile = ref<File | null>(null)
const logoPreview = ref<string | null>(null)
const uploading = ref(false)
const saving = ref(false)

// Category management
const showAddCategory = ref(false)
const showCategoryDialog = ref(false)
const editingCategory = ref(false)
const savingCategory = ref(false)
const categoryForm = ref({
  name: '',
  pinned: false
})

onMounted(async () => {
  await Promise.all([
    authStore.loadUserProfile(),
    categoriesStore.fetchCategories()
  ])
  if (authStore.userProfile) {
    businessName.value = authStore.userProfile.businessName || ''
    gstNumber.value = authStore.userProfile.gstNumber || ''
    businessAddress.value = authStore.userProfile.businessAddress || ''
    businessContact.value = authStore.userProfile.businessContact || ''
  }
})

watch(showAddCategory, (val) => {
  if (val) {
    categoryForm.value = { name: '', pinned: false }
    editingCategory.value = false
    showCategoryDialog.value = true
    showAddCategory.value = false
  }
})

const handleLogoChange = (file: any) => {
  logoFile.value = file.raw
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

const uploadLogo = async () => {
  if (!logoFile.value || !authStore.user) {
    ElMessage.warning('Please select a logo file first')
    return
  }
  
  // Validate file type
  if (!logoFile.value.type.startsWith('image/')) {
    ElMessage.error('Please select an image file')
    return
  }
  
  // Validate file size (5MB max)
  if (logoFile.value.size > 5 * 1024 * 1024) {
    ElMessage.error('Image size must be less than 5MB')
    return
  }
  
  uploading.value = true
  try {
    const { $firebase } = useNuxtApp()
    if (!$firebase) {
      throw new Error('Firebase not initialized')
    }
    
    if (!$firebase.storage) {
      throw new Error('Firebase Storage is not enabled. Please enable Storage in Firebase Console.')
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
      // Try Firebase Storage upload
      const fileExtension = logoFile.value.name.split('.').pop() || 'png'
      const fileName = `logos/${authStore.user.uid}/business-logo.${fileExtension}`
      const fileRef = storageRef($firebase.storage, fileName)
      
      // Upload with timeout to catch CORS quickly
      const uploadPromise = uploadBytes(fileRef, logoFile.value, {
        contentType: logoFile.value.type,
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
      
      ElMessage.success('Logo uploaded to Storage successfully')
    } catch (storageError: any) {
      // ANY error (CORS, timeout, unauthorized, etc.) -> use base64
      console.log('Storage upload failed, using base64 fallback:', storageError)
      
      ElMessage.info({
        message: 'Using base64 encoding. To use Firebase Storage, enable it in Firebase Console → Storage → Get Started, then deploy rules.',
        duration: 5000
      })
      
      // Always fallback to base64
      downloadURL = await convertToBase64(logoFile.value)
    }
    
    // Update user profile with logo URL
    const result = await authStore.updateUserProfile({ businessLogo: downloadURL })
    
    if (result.success) {
      ElMessage.success('Logo saved successfully')
      logoFile.value = null
      logoPreview.value = null
    } else {
      throw new Error(result.error || 'Failed to update logo')
    }
  } catch (error: any) {
    console.error('Error uploading logo:', error)
    
    let errorMessage = 'Failed to upload logo'
    if (error.code === 'storage/unauthorized') {
      errorMessage = 'Storage permission denied. Please check Firebase Storage rules in Firebase Console → Storage → Rules'
    } else if (error.code === 'storage/canceled') {
      errorMessage = 'Upload was canceled'
    } else if (error.message?.includes('Storage is not enabled')) {
      errorMessage = 'Firebase Storage is not enabled. Please enable it in Firebase Console → Storage → Get Started'
    } else if (error.message?.includes('CORS')) {
      errorMessage = 'CORS error: Please enable Firebase Storage and deploy security rules. See DEPLOY_STORAGE_RULES.md for instructions.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    ElMessage.error(errorMessage)
  } finally {
    uploading.value = false
  }
}

const removeLogo = async () => {
  try {
    const result = await authStore.updateUserProfile({ businessLogo: null })
    if (result.success) {
      ElMessage.success('Logo removed successfully')
      logoPreview.value = null
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'Failed to remove logo')
  }
}

const updateBusinessInfo = async () => {
  saving.value = true
  try {
    const result = await authStore.updateUserProfile({
      businessName: businessName.value,
      gstNumber: gstNumber.value,
      businessAddress: businessAddress.value,
      businessContact: businessContact.value
    })
    
    if (result.success) {
      ElMessage.success('Business information updated successfully')
    } else {
      ElMessage.error(result.error || 'Failed to update business information')
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'An error occurred')
  } finally {
    saving.value = false
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

// Category functions
const editCategory = (category: any) => {
  categoryForm.value = {
    name: category.name,
    pinned: category.pinned
  }
  editingCategory.value = category
  showCategoryDialog.value = true
}

const saveCategory = async () => {
  if (!categoryForm.value.name.trim()) {
    ElMessage.warning('Category name is required')
    return
  }
  
  savingCategory.value = true
  try {
    let result
    if (editingCategory.value) {
      result = await categoriesStore.updateCategory(editingCategory.value.id!, {
        name: categoryForm.value.name.trim(),
        pinned: categoryForm.value.pinned
      })
    } else {
      result = await categoriesStore.addCategory({
        name: categoryForm.value.name.trim(),
        pinned: categoryForm.value.pinned
      })
    }
    
    if (result.success) {
      ElMessage.success(editingCategory.value ? 'Category updated successfully' : 'Category created successfully')
      showCategoryDialog.value = false
      categoryForm.value = { name: '', pinned: false }
      editingCategory.value = false
    } else {
      ElMessage.error(result.error || 'Failed to save category')
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'An error occurred')
  } finally {
    savingCategory.value = false
  }
}

const togglePinCategory = async (id: string) => {
  try {
    const result = await categoriesStore.togglePin(id)
    if (result.success) {
      ElMessage.success('Category pin status updated')
    } else {
      ElMessage.error(result.error || 'Failed to update category')
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'An error occurred')
  }
}

const deleteCategory = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to delete this category? Products using this category will not be deleted, but their category reference will be removed.',
      'Delete Category',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    
    const result = await categoriesStore.deleteCategory(id)
    if (result.success) {
      ElMessage.success('Category deleted successfully')
    } else {
      ElMessage.error(result.error || 'Failed to delete category')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || 'An error occurred')
    }
  }
}
</script>

<style scoped>
.settings-container {
  max-width: 1280px; /* max-w-5xl */
  margin: 0 auto; /* mx-auto */
  padding: 0 16px;
}

.settings-container h2 {
  transition: color 0.3s ease;
}

.dark .settings-container h2 {
  color: #f1f5f9;
}

:deep(.el-card) {
  border-radius: 12px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.dark :deep(.el-card) {
  background-color: #1e293b;
  border-color: #334155;
}

:deep(.el-card__header) {
  border-radius: 12px 12px 0 0;
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.dark :deep(.el-card__header) {
  background-color: #1e293b;
  color: #f1f5f9;
  border-bottom-color: #334155;
}

.dark :deep(.el-card__body) {
  background-color: #1e293b;
  color: #f1f5f9;
}

.logo-upload-section {
  width: 100%;
}

.logo-preview {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}

.logo-image {
  max-width: 200px;
  max-height: 100px;
  object-fit: contain;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  background: white;
}

.remove-logo-btn {
  position: absolute;
  top: -8px;
  right: -8px;
}

.empty-categories {
  padding: 40px;
  text-align: center;
  color: #6b7280;
}

.dark .empty-categories {
  color: #94a3b8;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.dark .category-item {
  background: #0f172a;
  border-color: #334155;
}

.category-item:hover {
  border-color: #3b82f6;
}

.category-info {
  flex: 1;
}

.category-name-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pin-icon {
  width: 16px;
  height: 16px;
  color: #9ca3af;
  transition: color 0.2s;
}

.pin-icon.pinned {
  color: #3b82f6;
}

.category-name {
  font-weight: 500;
  color: #111827;
}

.dark .category-name {
  color: #f1f5f9;
}

.category-actions {
  display: flex;
  gap: 4px;
}
</style>
