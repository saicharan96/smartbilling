<template>
  <div class="data-table-wrapper">
    <!-- Search and Filter Bar -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <div class="search-box">
          <MagnifyingGlassIcon class="search-icon" />
          <input
            v-model="localSearchQuery"
            type="text"
            :placeholder="searchPlaceholder || 'Search...'"
            class="search-input"
            @input="handleSearch"
          />
          <button
            v-if="localSearchQuery"
            @click="clearSearch"
            class="clear-search-btn"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
        <div v-if="filterableColumns.length > 0" class="filters-section">
          <el-select
            v-model="activeFilters"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="Filters"
            class="filter-select"
            clearable
            @change="handleFilterChange"
          >
            <el-option
              v-for="col in filterableColumns"
              :key="col.prop"
              :label="col.label"
              :value="col.prop"
            />
          </el-select>
        </div>
      </div>
      <div class="toolbar-right">
        <el-button
          v-if="showColumnToggle"
          type="default"
          size="default"
          @click="showColumnDialog = true"
        >
          <AdjustmentsHorizontalIcon class="w-4 h-4 mr-1" />
          Columns
        </el-button>
        <el-button
          type="default"
          size="default"
          @click="resetTable"
        >
          <ArrowPathIcon class="w-4 h-4 mr-1" />
          Reset
        </el-button>
      </div>
    </div>

    <!-- Table -->
    <el-card shadow="never" class="table-card">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="paginatedData"
        :default-sort="defaultSort"
        style="width: 100%"
        :empty-text="emptyText || 'No data available'"
        @sort-change="handleSortChange"
        row-key="id"
        :default-expand-all="false"
      >
        <el-table-column
          v-if="showIndex"
          type="index"
          label="#"
          width="60"
          :index="(index) => (currentPage - 1) * pageSize + index + 1"
        />
        <el-table-column
          v-for="column in visibleColumns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :sortable="column.sortable !== false ? 'custom' : false"
          :formatter="column.formatter"
        >
          <template #default="{ row, $index }">
            <slot
              :name="column.prop"
              :row="row"
              :index="$index"
              :column="column"
            >
              <span v-if="column.formatter">
                {{ column.formatter(row, column, row[column.prop], $index) }}
              </span>
              <span v-else>{{ row[column.prop] }}</span>
            </slot>
          </template>
        </el-table-column>
        <el-table-column
          v-if="showActions"
          label="Actions"
          :width="actionsWidth || 120"
          fixed="right"
        >
          <template #default="{ row, $index }">
            <slot name="actions" :row="row" :index="$index" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <div v-if="showPagination" class="table-pagination">
        <el-pagination
          :current-page="currentPage"
          :page-size="localPageSize"
          :page-sizes="pageSizes"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

    <!-- Column Visibility Dialog -->
    <el-dialog
      v-model="showColumnDialog"
      title="Column Visibility"
      width="400px"
    >
      <div class="column-list">
        <el-checkbox
          v-for="column in columns"
          :key="column.prop"
          v-model="column.visible"
          :label="column.label"
        />
      </div>
      <template #footer>
        <el-button @click="showColumnDialog = false">Cancel</el-button>
        <el-button type="primary" @click="applyColumnVisibility">Apply</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

export interface DataTableColumn {
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  sortable?: boolean
  filterable?: boolean
  formatter?: (row: any, column: any, cellValue: any, index: number) => string
  visible?: boolean
}

interface Props {
  data: any[]
  columns: DataTableColumn[]
  loading?: boolean
  searchPlaceholder?: string
  emptyText?: string
  showPagination?: boolean
  showIndex?: boolean
  showActions?: boolean
  actionsWidth?: number
  pageSize?: number
  pageSizes?: number[]
  defaultSort?: { prop: string; order: 'ascending' | 'descending' }
  showColumnToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  searchPlaceholder: 'Search...',
  emptyText: 'No data available',
  showPagination: true,
  showIndex: false,
  showActions: false,
  actionsWidth: 120,
  pageSize: 10,
  pageSizes: () => [10, 20, 50, 100],
  showColumnToggle: true
})

const emit = defineEmits<{
  search: [query: string]
  sort: [sortConfig: { prop: string; order: string }]
  filter: [filters: string[]]
}>()

const tableRef = ref()
const localSearchQuery = ref('')
const activeFilters = ref<string[]>([])
const currentPage = ref(1)
const localPageSize = ref(props.pageSize)
const sortConfig = ref<{ prop: string; order: string } | null>(null)
const showColumnDialog = ref(false)

// Initialize column visibility
const columnsWithVisibility = computed(() => {
  return props.columns.map(col => ({
    ...col,
    visible: col.visible !== false
  }))
})

const visibleColumns = computed(() => {
  return columnsWithVisibility.value.filter(col => col.visible !== false)
})

const filterableColumns = computed(() => {
  return props.columns.filter(col => col.filterable !== false)
})

// Search functionality
const handleSearch = () => {
  emit('search', localSearchQuery.value)
  currentPage.value = 1
}

const clearSearch = () => {
  localSearchQuery.value = ''
  handleSearch()
}

// Filter functionality
const handleFilterChange = () => {
  emit('filter', activeFilters.value)
  currentPage.value = 1
}

// Sort functionality
const handleSortChange = ({ prop, order }: any) => {
  if (order) {
    sortConfig.value = { prop, order }
    emit('sort', { prop, order })
  } else {
    sortConfig.value = null
    emit('sort', { prop: '', order: '' })
  }
}

// Filtered and sorted data
const filteredData = computed(() => {
  let result = [...props.data]

  // Apply search
  if (localSearchQuery.value) {
    const query = localSearchQuery.value.toLowerCase()
    result = result.filter(row => {
      return props.columns.some(col => {
        const value = row[col.prop]
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(query)
      })
    })
  }

  // Apply filters
  if (activeFilters.value.length > 0) {
    // This is a basic filter - can be extended
    result = result.filter(row => {
      return activeFilters.value.some(filterProp => {
        const value = row[filterProp]
        return value !== null && value !== undefined && value !== ''
      })
    })
  }

  // Apply sorting
  if (sortConfig.value) {
    const { prop, order } = sortConfig.value
    result.sort((a, b) => {
      const aVal = a[prop]
      const bVal = b[prop]
      
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'ascending' ? aVal - bVal : bVal - aVal
      }
      
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      
      if (order === 'ascending') {
        return aStr.localeCompare(bStr)
      } else {
        return bStr.localeCompare(aStr)
      }
    })
  }

  return result
})

// Pagination
const paginatedData = computed(() => {
  if (!props.showPagination) {
    return filteredData.value
  }
  
  const start = (currentPage.value - 1) * localPageSize.value
  const end = start + localPageSize.value
  return filteredData.value.slice(start, end)
})

const handleSizeChange = (size: number) => {
  localPageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const resetTable = () => {
  localSearchQuery.value = ''
  activeFilters.value = []
  sortConfig.value = null
  currentPage.value = 1
  localPageSize.value = props.pageSize
  emit('search', '')
  emit('filter', [])
  emit('sort', { prop: '', order: '' })
  tableRef.value?.clearSort()
}

const applyColumnVisibility = () => {
  showColumnDialog.value = false
}

// Watch for external data changes
watch(() => props.data, () => {
  currentPage.value = 1
}, { deep: true })

watch(() => props.pageSize, (newSize) => {
  localPageSize.value = newSize
})
</script>

<style scoped>
.data-table-wrapper {
  width: 100%;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 12px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 300px;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 18px;
  height: 18px;
  color: #6b7280;
  pointer-events: none;
  z-index: 1;
}

.search-input {
    width: 100%;
    padding: 5px 12px 5px 36px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #00ED64;
  box-shadow: 0 0 0 3px rgba(0, 237, 100, 0.1);
}

.dark .search-input {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

.dark .search-input:focus {
  border-color: #00ED64;
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  padding: 4px;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.clear-search-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.dark .clear-search-btn {
  color: #94a3b8;
}

.dark .clear-search-btn:hover {
  background: #334155;
  color: #f1f5f9;
}

.filters-section {
  min-width: 150px;
}

.filter-select {
  width: 150px;
}

.table-card {
  border-radius: 12px !important;
  padding: 0px !important;
  overflow: hidden;
}

.table-pagination {
  margin-top: 16px;
  display: flex;
  background: white;
  border-radius: 12px;
  justify-content: flex-end;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.dark .table-pagination {
  border-top-color: #334155;
}

.column-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 400px;
  overflow-y: auto;
}

.el-card__body {
  background: white !important;
  background-image: none !important;
  padding: 0px !important;
  transition: background-color 0.3s ease;
}

@media (max-width: 768px) {
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
  }

  .search-box {
    min-width: 100%;
  }
}
</style>

