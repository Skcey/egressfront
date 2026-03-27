<template>
  <div class="egress-route-page">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>出口网关路由</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 搜索和新增区域 -->
    <div class="search-section">
      <div class="search-wrapper">
        <el-input
          v-model="searchText"
          placeholder="搜索路由名称或命名空间"
          prefix-icon="Search"
          clearable
          style="width: 300px"
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
        :data="filteredData"
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{ background: '#F5F7FA', color: '#303133' }"
      >
        <el-table-column prop="name" label="名称" min-width="180">
          <template #default="scope">
            <div class="route-name clickable" @click="handleViewDetail(scope.row)">
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="namespace" label="命名空间" min-width="150" />
        <el-table-column prop="gateway" label="出口网关" min-width="200">
          <template #default="scope">
            <div class="gateway-cell">
              <span class="gateway-name" :title="scope.row.gateway">{{ scope.row.gateway }}</span>
              <el-tag 
                :type="scope.row.gatewayType === '实体' ? 'success' : 'info'"
                size="small"
              >
                {{ scope.row.gatewayType }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <span class="status-display">
              <span 
                class="status-dot" 
                :class="{ 
                  'dot-normal': scope.row.status === '正常', 
                  'dot-error': scope.row.status === '异常'
                }"
              ></span>
              {{ scope.row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="路由开关" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.enabled"
              @change="handleSwitchChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button text type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无数据" />
        </template>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="tableData.length"
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
import { Plus } from '@element-plus/icons-vue'
import { getEgressPolicies, toggleEgressPolicy, deleteEgressPolicy } from '@/api/egressPolicy'
import { useErrorHandler } from '@/composables/useErrorHandler'

const router = useRouter()
const route = useRoute()
const { handleError, handleSuccess, showDeleteConfirm } = useErrorHandler()

const searchText = ref('')
const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

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

const formatStatus = (status) => {
  return status === 1 ? '正常' : '异常'
}

const formatGatewayType = (type) => {
  return type === 0 ? '实体' : '映射'
}

const fetchPolicies = async () => {
  try {
    loading.value = true
    const clusterName = route.params.clusterName
    const response = await getEgressPolicies(clusterName)
    const data = response.data
    
    // 转换数据格式
    tableData.value = data.map(item => ({
      name: item.name,
      namespace: item.namespace,
      gateway: item.egressNode?.name || '--',
      gatewayType: formatGatewayType(item.egressNode?.type),
      status: formatStatus(item.status),
      enabled: item.enable,
      createTime: formatTime(item.createTime),
      rawData: item // 保存原始数据
    }))
    
    total.value = tableData.value.length
  } catch (error) {
    handleError(error, '获取出口路由列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 过滤后的数据
const filteredData = computed(() => {
  let data = tableData.value
  
  if (searchText.value) {
    data = data.filter(item =>
      item.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
      item.namespace.includes(searchText.value) ||
      item.gateway.includes(searchText.value)
    )
  }
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return data.slice(start, end)
})

// 初始化
onMounted(() => {
  fetchPolicies()
})

// 监听集群变化
watch(() => route.params.clusterName, () => {
  fetchPolicies()
})

// 方法
const handleAdd = () => {
  const clusterName = route.params.clusterName
  router.push({ 
    name: 'EgressRouteAdd',
    params: { clusterName }
  })
}

const handleViewDetail = (row) => {
  const clusterName = route.params.clusterName
  router.push({
    name: 'EgressRouteDetail',
    params: { 
      clusterName,
      namespace: row.namespace,
      name: row.name
    }
  })
}

const handleSwitchChange = async (row) => {
  try {
    const clusterName = route.params.clusterName
    await toggleEgressPolicy(clusterName, row.namespace, row.name, row.enabled)
    
    // 更新状态显示：关闭=异常，开启=正常
    row.status = row.enabled ? '正常' : '异常'
    
    handleSuccess(row.enabled ? '路由已开启' : '路由已关闭')
  } catch (error) {
    // 恢复开关状态
    row.enabled = !row.enabled
    handleError(error, '切换路由开关失败，请稍后重试')
  }
}

const handleDelete = async (row) => {
  try {
    await showDeleteConfirm(row.name, '路由')
    
    const clusterName = route.params.clusterName
    await deleteEgressPolicy(clusterName, row.namespace, row.name)
    handleSuccess('删除成功')
    
    // 删除成功后刷新列表
    await fetchPolicies()
  } catch (error) {
    if (error === 'cancel') {
      console.log('取消删除')
      return
    }
    
    handleError(error, '删除路由失败，请稍后重试', true)
  }
}

const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}
</script>

<style lang="scss" scoped>
.egress-route-page {
  min-height: 100%;
  background-color: #FFFFFF;

  .breadcrumb-wrapper {
    padding: 16px 32px 0;

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

    :deep(.el-table) {
      font-size: 14px;
    }

    :deep(.el-table__header-wrapper) {
      .el-table__header {
        width: 100% !important;
      }
    }

    :deep(.el-table__body-wrapper) {
      .el-table__body {
        width: 100% !important;
      }
    }

    .route-name {
      display: flex;
      align-items: center;
      gap: 8px;

      span {
        font-weight: 500;
      }

      &.clickable {
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
          color: #409EFF;

          span {
            color: #409EFF;
          }
        }
      }
    }

    .gateway-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .gateway-name {
        width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .el-tag {
        flex-shrink: 0;
      }

      .status-text {
        font-size: 14px;
        color: #3D3D3D;
      }
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      white-space: nowrap;

      .el-button {
        padding: 0;
        margin: 0;
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .status-display {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;

    &.dot-normal {
      background-color: #67C23A; // 绿色
    }

    &.dot-error {
      background-color: #EA0000; // 红色
    }
  }
}
</style>
