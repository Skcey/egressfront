<template>
  <div class="egress-class-page">
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'EgressMapping', params: { clusterName: $route.params.clusterName || 'default' } }">
          出口网关映射
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <div class="search-section">
      <div class="search-wrapper">
        <el-input
          v-model="searchText"
          placeholder="搜索映射名称"
          prefix-icon="Search"
          clearable
          style="width: 400px"
        />
      </div>
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <el-table
        :data="paginatedData"
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{ background: '#F5F7FA', color: '#303133' }"
      >
        <el-table-column prop="name" label="名称" width="200">
          <template #default="scope">
            <div class="mapping-name clickable" @click="handleView(scope.row)">
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="cluster" label="网关集群" width="250" align="center" />
        <el-table-column prop="gatewayCount" label="出口网关" width="200" align="center" />
        <el-table-column prop="createTime" label="创建时间"  width="250" align="center" />
        <el-table-column label="操作" fixed="right" align="center" >
          <template #default="scope">
            <el-button text type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无数据" />
        </template>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getEgressClasses, deleteEgressClass } from '@/api/egressClass'

const router = useRouter()
const route = useRoute()

const searchText = ref('')
const tableData = ref([])
const loading = ref(false)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = computed(() => filteredData.value.length)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 过滤后的数据
const filteredData = computed(() => {
  if (!searchText.value) {
    return tableData.value
  }
  return tableData.value.filter(item =>
    item.name.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return '--'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

// 获取出口网关映射列表
const fetchEgressClassList = async () => {
  try {
    loading.value = true
    const clusterName = route.params.clusterName
    const response = await getEgressClasses(clusterName)
    const data = response.data || []
    
    tableData.value = data.map(item => ({
      name: item.name,
      cluster: item.gatewayClusterDisplayName,
      gatewayCount: item.syncEgressNodes.length,
      createTime: formatTime(item.createTime)
    }))
  } catch (error) {
    console.error('获取出口网关映射列表失败:', error)
    ElMessage.error('获取出口网关映射列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(async () => {
  await fetchEgressClassList()
})

// 监听路由参数变化
watch(() => route.params.clusterName, async (newClusterName, oldClusterName) => {
  if (newClusterName && newClusterName !== oldClusterName) {
    await fetchEgressClassList()
  }
})

// 方法
const handleAdd = () => {
  const clusterName = route.params.clusterName
  router.push({ name: 'EgressMappingAdd', params: { clusterName } })
}

const handleView = (row) => {
  const clusterName = route.params.clusterName
  router.push({ name: 'EgressMappingDetail', params: { clusterName, name: row.name } })
}

const handleDelete = async (row) => {
  const clusterName = route.params.clusterName

  ElMessageBox.confirm(
    '删除后，出口网关映射无法恢复，确认要删除它吗？',
    '确认删除出口网关映射？',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      distinguishCancelAndClose: true
    }
  )
    .then(async () => {
      try {
        await deleteEgressClass(clusterName, row.name)
        ElMessage.success('删除成功')
        await fetchEgressClassList()
      } catch (error) {
        console.error('删除出口网关映射失败:', error)
        let errorMessage = '删除出口网关映射失败'
        if (error.response && error.response.data && error.response.data.errorMsg) {
          errorMessage = error.response.data.errorMsg
        }
        
        ElMessageBox.alert(errorMessage, '删除失败', {
          confirmButtonText: '确定',
          type: 'error'
        })
      }
    })
    .catch((action) => {
      if (action === 'cancel') {
        console.log('取消删除')
      }
    })
}

const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}
</script>

<style lang="scss" scoped>
.egress-class-page {
  min-height: 100%;
  background-color: #FFFFFF;

  .breadcrumb-wrapper {
    padding: 8px 32px 0;

    :deep(.el-breadcrumb__inner) {
      font-family: 'Inter';
      font-size: 14px;
      font-weight: 600;
      line-height: 22px;
      color: #303133;
    }
  }

  .search-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    gap: 16px;

    .search-wrapper {
      flex: 1;
      max-width: 400px;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
    }
  }

  .table-section {
    padding: 0 24px 24px;

    .mapping-name {
      color: #303133;
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: #409EFF;
      }
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
  }
}
</style>
