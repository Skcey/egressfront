<template>
  <el-drawer
    v-model="visible"
    title="添加出口网关"
    direction="rtl"
    size="941px"
    @close="handleClose"
  >
    <div class="gateway-selector">
      <div class="selector-tip">
        <span>若无出口网关，可前往</span>
        <el-button type="primary" text @click="goToAddGateway">新建出口网关</el-button>
        <el-button type="primary" text icon="Refresh" @click="refreshGateways" />
      </div>

      <el-table
        ref="multipleTableRef"
        :data="paginatedAvailableGateways"
        v-loading="gatewayLoading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column property="name" label="出口网关名称" width="180" />
        <el-table-column property="type" label="类型" width="120" v-if="showTypeColumn" />
        <el-table-column property="address" label="出口网关地址" width="180" />
        <el-table-column property="status" label="状态" width="180">
          <template #default="scope">
            <span class="status-display">
              <span 
                class="status-dot" 
                :class="{ 'dot-normal': scope.row.status === '正常', 'dot-error': scope.row.status === '异常' }"
              ></span>
              {{ scope.row.status }}
            </span>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无数据" />
        </template>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Refresh } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  availableGateways: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  showTypeColumn: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'confirm', 'refresh', 'selection-change'])

// 响应式数据
const multipleTableRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedGateways = ref([])

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const gatewayLoading = computed(() => props.loading)

const paginatedAvailableGateways = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.availableGateways.slice(start, end)
})

const total = computed(() => props.availableGateways.length)

// 方法
const handleClose = () => {
  emit('update:modelValue', false)
}

const handleCancel = () => {
  // 清空选择
  selectedGateways.value = []
  if (multipleTableRef.value) {
    multipleTableRef.value.clearSelection()
  }
  handleClose()
}

const handleConfirm = () => {
  emit('confirm', selectedGateways.value)
  handleCancel()
}

const handleSelectionChange = (selection) => {
  selectedGateways.value = selection
  emit('selection-change', selection)
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const refreshGateways = () => {
  emit('refresh')
}

const goToAddGateway = () => {
  const clusterName = route.params.clusterName || 'default'
  // 根据当前页面类型确定网关集群
  const targetCluster = route.query.gatewayCluster || clusterName
  router.push({ 
    name: 'EgressNodeAdd', 
    params: { clusterName: targetCluster }
  })
}

// 监听抽屉打开状态，重置分页
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    currentPage.value = 1
    selectedGateways.value = []
    if (multipleTableRef.value) {
      multipleTableRef.value.clearSelection()
    }
  }
})
</script>

<style lang="scss" scoped>
.gateway-selector {
  .selector-tip {
    margin-bottom: 16px;
    padding: 12px 16px;
    background-color: #F5F7FA;
    border-radius: 4px;
    font-size: 14px;
    color: #606266;
    
    .el-button {
      margin-left: 4px;
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: center;
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.status-display {
  display: flex;
  align-items: center;
  gap: 8px;

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    
    &.dot-normal {
      background-color: #67C23A;
    }
    
    &.dot-error {
      background-color: #F56C6C;
    }
  }
}
</style>