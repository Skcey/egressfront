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
        :data="filteredData"
        style="width: 100%"
        :header-cell-style="{ background: '#F5F7FA', color: '#303133' }"
      >
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
            <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
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
import { Plus, Search, Monitor } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const router = useRouter()

// 搜索
const searchText = ref('')

// 表格数据
const tableData = ref([
  {
    id: 1,
    name: '出口网关1',
    address: '10.10.0.1',
    type: '实体',
    status: '正常',
    nodeCount: 3,
    createTime: '2023-10-22 12:21:34',
    nodes: [
      { ip: '10.10.103.80' },
      { ip: '10.10.103.81' },
      { ip: '10.10.103.82' }
    ]
  },
  {
    id: 2,
    name: '映射出口网关2',
    address: '10.10.0.2',
    type: '映射',
    status: '正常',
    nodeCount: 0,
    createTime: '2023-10-20 15:30:22',
    nodes: []
  },
  {
    id: 3,
    name: '出口网关3',
    address: '10.10.0.3',
    type: '实体',
    status: '异常',
    nodeCount: 1,
    createTime: '2023-10-18 09:15:10',
    nodes: [
      { ip: '10.10.103.85' }
    ]
  }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(tableData.value.length)

// 过滤后的数据
const filteredData = computed(() => {
  if (!searchText.value) {
    return tableData.value
  }
  return tableData.value.filter(item =>
    item.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
    item.address.includes(searchText.value)
  )
})

// 筛选方法
const filterType = (value, row) => {
  return row.type === value
}

const filterStatus = (value, row) => {
  return row.status === value
}

// 方法
const handleAdd = () => {
  // 跳转到新增页面
  router.push({ name: 'EgressNodeAdd' })
}

const handleView = (row) => {
  // 查看详情
  router.push({ name: 'EgressNodeDetail', params: { id: row.id } })
}

const handleEdit = (row) => {
  // 编辑网关
  console.log('编辑网关', row)
}

const handleDelete = (row) => {
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
    .then(() => {
      // 确认删除
      console.log('删除网关', row)
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
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>
