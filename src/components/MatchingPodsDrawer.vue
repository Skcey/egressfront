<template>
  <el-drawer
    v-model="localVisible"
    title="查看匹配对象"
    :size="size"
    direction="rtl"
  >
    <el-table :data="paginatedData" style="width: 100%" border>
      <el-table-column prop="name" label="Pod名称" min-width="180" />
      <el-table-column prop="namespace" label="命名空间名称" min-width="180" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag 
            :type="getStatusType(row.status)" 
            size="small"
          >
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="matchingPods.length"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  matchingPods: {
    type: Array,
    default: () => []
  },
  size: {
    type: String,
    default: '600px'
  }
})

const emit = defineEmits(['update:visible'])

// 本地响应式数据
const currentPage = ref(1)
const pageSize = ref(10)

const localVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.matchingPods.slice(start, end)
})

// 获取状态类型
const getStatusType = (status) => {
  if (status === '正常' || status === '运行中') {
    return 'success'
  } else if (status === '异常') {
    return 'danger'
  }
  return 'info'
}

// 分页事件处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}
</script>

<style lang="scss" scoped>
.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>