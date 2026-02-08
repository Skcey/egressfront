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
              <span>{{ scope.row.gateway }}</span>
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
            <el-tag 
              :type="scope.row.status === '正常' ? 'success' : 'danger'"
            >
              {{ scope.row.status }}
            </el-tag>
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
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 搜索
const searchText = ref('')

// 表格数据
const tableData = ref([
  {
    id: 1,
    name: '出口路由1',
    namespace: '命名空间1',
    gateway: '出口网关1',
    gatewayType: '实体',
    gatewayStatus: '正常',
    status: '正常',
    enabled: true,
    createTime: '2025/12/4'
  },
  {
    id: 2,
    name: '出口路由2',
    namespace: '命名空间2',
    gateway: '出口网关1',
    gatewayType: '实体',
    gatewayStatus: '正常',
    status: '正常',
    enabled: true,
    createTime: '2025/12/4'
  },
  {
    id: 3,
    name: '出口路由3',
    namespace: '命名空间2',
    gateway: '出口网关1',
    gatewayType: '实体',
    gatewayStatus: '正常',
    status: '正常',
    enabled: true,
    createTime: '2025/12/4'
  },
  {
    id: 4,
    name: '出口路由4',
    namespace: '命名空间1',
    gateway: '出口网关1',
    gatewayType: '实体',
    gatewayStatus: '正常',
    status: '正常',
    enabled: true,
    createTime: '2025/12/4'
  }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(100)
const total = ref(1000)

// 过滤后的数据
const filteredData = computed(() => {
  if (!searchText.value) {
    return tableData.value
  }
  return tableData.value.filter(item =>
    item.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
    item.namespace.includes(searchText.value) ||
    item.gateway.includes(searchText.value)
  )
})

// 方法
const handleAdd = () => {
  router.push({ name: 'EgressRouteAdd' })
}

const handleViewDetail = (row) => {
  router.push({
    name: 'EgressRouteDetail',
    params: { id: row.id }
  })
}

const handleSwitchChange = (row) => {
  // 路由关闭时，状态变为异常
  if (!row.enabled) {
    row.status = '异常'
  } else {
    row.status = '正常'
  }
  console.log('开关状态变更', row)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    '删除后，路由无法恢复，确认要删除它吗？',
    '确认删除路由？',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      distinguishCancelAndClose: true
    }
  )
    .then(() => {
      // 确认删除
      ElMessage.success('删除成功')
      console.log('删除路由', row)
      // 这里实际应该调用删除API
      // 删除成功后从列表中移除
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        tableData.value.splice(index, 1)
      }
    })
    .catch((action) => {
      // 取消删除或关闭对话框
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
}
</style>
