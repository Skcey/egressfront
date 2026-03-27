<template>
  <div class="egress-node-page">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>出口网关</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 搜索和新增区域 -->
    <div class="search-section">
      <div class="search-wrapper">
        <el-input
          v-model="searchText"
          placeholder="搜索网关名称或地址"
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
        v-loading="loading"
        :data="filteredData"
        style="width: 100%"
        :header-cell-style="{ background: '#F5F7FA', color: '#303133' }"
      >
        <template #empty>
          <el-empty description="暂无出口网关数据" />
        </template>
        <el-table-column prop="name" label="名称" min-width="180">
          <template #default="scope">
            <div class="gateway-name clickable" @click="handleView(scope.row)">
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="150" />
        <el-table-column 
          prop="type" 
          label="类型" 
          width="100"
          :filters="[
            { text: '实体', value: '实体' },
            { text: '映射', value: '映射' }
          ]"
          :filter-method="filterType"
        >
          <template #default="scope">
            <el-tag :type="scope.row.type === '实体' ? 'success' : 'info'">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column 
          prop="status" 
          label="状态" 
          width="100"
          :filters="[
            { text: '正常', value: '正常' },
            { text: '异常', value: '异常' }
          ]"
          :filter-method="filterStatus"
        >
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
        <el-table-column prop="nodeCount" label="节点数" width="100">
          <template #default="scope">
            <el-popover
              placement="bottom"
              :width="200"
              trigger="click"
            >
              <template #reference>
                <span class="node-count-trigger">{{ scope.row.nodeCount }}</span>
              </template>
              <el-table :data="scope.row.nodes" size="small" style="width: 100%">
                <el-table-column prop="ip" label="节点IP" />
              </el-table>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip
                v-if="scope.row.type === '映射'"
                content="映射类出口网关不允许删除，请修改或删除相关出口网关映射"
                placement="top"
              >
                <span>
                  <el-button text type="danger" disabled>删除</el-button>
                </span>
              </el-tooltip>
              <el-button v-else text type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { listEgressNode, deleteEgressNode } from '@/api/egressNode'

const router = useRouter()
const route = useRoute()

const searchText = ref('')
const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 获取出口网关列表
const fetchEgressNodes = async () => {
  try {
    loading.value = true
    const clusterName = route.params.clusterName
    const response = await listEgressNode(clusterName)
    
    // 处理返回的数据，转换为表格需要的格式
    tableData.value = response.data.map((item, index) => ({
      name: item.name,
      address: item.egressIpType === 0 ? item.currentNode : item.egressIP,
      type: item.type === 0 ? '实体' : '映射',
      status: item.status === 1 ? '正常' : '异常',
      nodeCount: item.nodeIps ? item.nodeIps.length : 0,
      createTime: formatTime(item.createTime),
      nodes: item.nodeIps ? item.nodeIps.map(ip => ({ ip })) : []
    }))
    total.value = tableData.value.length
  } catch (error) {
    console.error('获取出口网关列表失败:', error)
    ElMessage.error('获取出口网关列表失败，请稍后重试')
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
      item.address.includes(searchText.value)
    )
  }
  total.value = data.length
  
  return data
})

const filterType = (value, row) => {
  return row.type === value
}

const filterStatus = (value, row) => {
  return row.status === value
}

const handleAdd = () => {
  const clusterName = route.params.clusterName
  router.push({ 
    name: 'EgressNodeAdd',
    params: { clusterName }
  })
}

const handleView = (row) => {
  const clusterName = route.params.clusterName
  router.push({ 
    name: 'EgressNodeDetail', 
    params: { 
      clusterName,
      name: row.name
    } 
  })
}

const handleDelete = async (row) => {
  const clusterName = route.params.clusterName
  
  // 直接显示删除确认对话框
  ElMessageBox.confirm(
    '删除后，出口网关无法恢复，确认要删除它吗？',
    '确认删除出口网关？',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      distinguishCancelAndClose: true
    }
  )
    .then(async () => {
      try {
        await deleteEgressNode(clusterName, row.name)
        ElMessage.success('删除成功')
        // 重新获取列表
        await fetchEgressNodes()
      } catch (error) {
        console.error('删除出口网关失败:', error)
        let errorMessage = '删除出口网关失败'
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

// 监听路由参数变化，当切换集群时重新获取数据
watch(() => route.params.clusterName, () => {
  fetchEgressNodes()
})

// 页面加载时获取数据
onMounted(() => {
  fetchEgressNodes()
})
</script>

<style lang="scss" scoped>
.egress-node-page {
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

    .action-buttons {
      display: flex;
      gap: 8px;
      white-space: nowrap;

      .el-button {
        padding: 0;
        margin: 0;
      }
    }

    .gateway-name {
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

    .node-count-trigger {
      color: #409EFF;
      cursor: pointer;
      user-select: none;
      
      &:hover {
        text-decoration: underline;
      }
    }

    // 状态显示样式
    .status-display {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #303133;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
      flex-shrink: 0;

      &.dot-normal {
        background-color: #67C23A;
      }

      &.dot-error {
        background-color: #F56C6C;
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
