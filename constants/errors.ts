export const ERROR_MESSAGES = {
  // Firestore errors
  FIRESTORE_UNDEFINED_FIELD: 'Invalid data: Some fields contain undefined values. Please check your input.',
  FIRESTORE_PERMISSION_DENIED: 'Permission denied. Please check Firestore security rules.',
  FIRESTORE_INDEX_REQUIRED: 'Database index required. Please create the index in Firebase Console.',
  
  // Validation errors
  CUSTOMER_NOT_SELECTED: 'Please select a customer before checkout.',
  CART_EMPTY: 'Your cart is empty. Please add products before checkout.',
  PAYMENT_METHOD_NOT_SELECTED: 'Please select a payment method before checkout.',
  PRODUCT_OUT_OF_STOCK: 'One or more products are out of stock.',
  INSUFFICIENT_STOCK: 'Not enough stock available for one or more products.',
  
  // Authentication errors
  USER_NOT_AUTHENTICATED: 'You are not logged in. Please log in to continue.',
  AUTH_FAILED: 'Authentication failed. Please check your credentials.',
  
  // General errors
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  OPERATION_FAILED: 'Operation failed. Please try again.',
  
  // Sale/Checkout errors
  SALE_CREATION_FAILED: 'Failed to create sale. Please try again.',
  INVOICE_GENERATION_FAILED: 'Failed to generate invoice. Please try again.',
  
  // Product errors
  PRODUCT_NOT_FOUND: 'Product not found.',
  PRODUCT_UPDATE_FAILED: 'Failed to update product.',
  PRODUCT_DELETE_FAILED: 'Failed to delete product.',
  
  // Customer errors
  CUSTOMER_NOT_FOUND: 'Customer not found.',
  CUSTOMER_UPDATE_FAILED: 'Failed to update customer.',
  CUSTOMER_DELETE_FAILED: 'Failed to delete customer.',
  
  // Category errors
  CATEGORY_EXISTS: 'Category with this name already exists.',
  CATEGORY_NOT_FOUND: 'Category not found.',
  
  // Image upload errors
  IMAGE_UPLOAD_FAILED: 'Failed to upload image. Please try again.',
  IMAGE_TOO_LARGE: 'Image size is too large. Maximum size is 5MB.',
  INVALID_IMAGE_FORMAT: 'Invalid image format. Please upload a valid image file.'
} as const

export const ERROR_CODES = {
  FIRESTORE_UNDEFINED_FIELD: 'FIRESTORE_UNDEFINED_FIELD',
  FIRESTORE_PERMISSION_DENIED: 'permission-denied',
  FIRESTORE_INDEX_REQUIRED: 'failed-precondition',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_REQUIRED: 'auth/requires-recent-login'
} as const

export const getErrorMessage = (error: any): string => {
  if (!error) return ERROR_MESSAGES.UNKNOWN_ERROR
  
  const errorMessage = error.message || error.toString() || ''
  const errorCode = error.code || ''
  
  // Check for specific error codes
  if (errorCode === ERROR_CODES.FIRESTORE_PERMISSION_DENIED) {
    return ERROR_MESSAGES.FIRESTORE_PERMISSION_DENIED
  }
  
  if (errorCode === ERROR_CODES.FIRESTORE_INDEX_REQUIRED) {
    return ERROR_MESSAGES.FIRESTORE_INDEX_REQUIRED
  }
  
  // Check for specific error messages
  if (errorMessage.includes('undefined') || errorMessage.includes('Unsupported field value')) {
    return ERROR_MESSAGES.FIRESTORE_UNDEFINED_FIELD
  }
  
  if (errorMessage.includes('permission') || errorMessage.includes('Permission denied')) {
    return ERROR_MESSAGES.FIRESTORE_PERMISSION_DENIED
  }
  
  if (errorMessage.includes('index') || errorMessage.includes('Index')) {
    return ERROR_MESSAGES.FIRESTORE_INDEX_REQUIRED
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('Network') || errorMessage.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR
  }
  
  if (errorMessage.includes('auth') || errorMessage.includes('Authentication')) {
    return ERROR_MESSAGES.USER_NOT_AUTHENTICATED
  }
  
  // Return the original error message if no match
  return errorMessage || ERROR_MESSAGES.UNKNOWN_ERROR
}

