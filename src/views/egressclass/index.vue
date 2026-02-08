<template>
  <div class="egress-class-page">
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>出口网关映射</el-breadcrumb-item>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const router = useRouter()

// 搜索
const searchText = ref('')

// 表格数据
const tableData = ref([
  {
    id: 1,
    name: 'egressclass1',
    cluster: '集群1',
    gatewayCount: 3,
    createTime: '2025-01-01 00:00:00'
  },
  {
    id: 2,
    name: 'egressNode2',
    cluster: '集群2',
    gatewayCount: 3,
    createTime: '2025-01-01 00:00:01'
  },
  {
    id: 3,
    name: 'ec2-egressNode3',
    cluster: '集群3',
    gatewayCount: 3,
    createTime: '2025-01-01 00:00:01'
  },
  {
    id: 4,
    name: 'egressNode4',
    cluster: '集群4',
    gatewayCount: 3,
    createTime: '2025-01-01 00:00:01'
  }
])

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

// 方法
const handleAdd = () => {
  // 跳转到新增页面
  router.push({ name: 'EgressMappingAdd' })
}

const handleView = (row) => {
  // 查看详情
  router.push({ name: 'EgressMappingDetail', params: { id: row.id } })
}

const handleEdit = (row) => {
  // 编辑映射
  console.log('编辑映射', row)
}

const handleDelete = (row) => {
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
    .then(() => {
      // 确认删除
      console.log('删除映射', row)
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
