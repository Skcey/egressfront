<template>
  <el-drawer
    v-model="visible"
    title="选择网关节点"
    direction="rtl"
    size="941px"
    @close="handleClose"
  >
    <div class="node-selector-content">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="availableNodes"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <template #empty>
          <el-empty description="暂无可选节点" />
        </template>
        <el-table-column 
          type="selection" 
          width="48"
        />
        <el-table-column prop="name" label="节点名称" width="180" />
        <el-table-column prop="ip" label="ip地址" width="180" />
        <el-table-column prop="installed" label="已安装出口网关" width="260">
          <template #default="scope">
            {{ scope.row.installed ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="180">
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
      </el-table>

      <div class="drawer-pagination">
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
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getNodes } from '@/api/egressNode'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  // 已选中的节点列表
  selectedNodes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const route = useRoute()
const visible = ref(props.modelValue)
const tableRef = ref(null)
const loading = ref(false)

// 节点数据
const availableNodes = ref([])

const selectedNodesInDrawer = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const clusterName = route.params.clusterName

// 获取节点列表
const fetchNodes = async () => {
  try {
    loading.value = true
    const response = await getNodes(clusterName)
    // 处理返回的数据
    availableNodes.value = response.data.map((node, index) => ({
      id: index + 1,
      name: node.name,
      ip: node.ip,
      installed: node.egressNodeDeployed,
      status: node.status === 'Ready' ? '正常' : '异常',
      interface: 'eth0' // 默认网卡
    }))
    
    total.value = availableNodes.value.length
    // 获取数据后，自动勾选已有的节点
    setTimeout(() => {
      initSelectedNodes()
    }, 100)
  } catch (error) {
    console.error('获取节点列表失败:', error)
    ElMessage.error('获取节点列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 初始化已选节点的勾选状态
const initSelectedNodes = () => {
  if (tableRef.value && props.selectedNodes.length > 0) {
    // 清空当前选中
    tableRef.value.clearSelection()
    
    // 根据已选节点列表勾选对应的行
    availableNodes.value.forEach(node => {
      const isSelected = props.selectedNodes.some(n => n.ip === node.ip)
      if (isSelected) {
        tableRef.value.toggleRowSelection(node, true)
      }
    })
  }
}

watch(() => props.modelValue, async (val) => {
  visible.value = val
  if (val) {
    // 打开抽屉时，获取节点列表
    await fetchNodes()
    
    // 等待下一帧，确保表格渲染完成
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 自动选中已选节点
    if (tableRef.value && props.selectedNodes.length > 0) {
      props.selectedNodes.forEach(selectedNode => {
        const node = availableNodes.value.find(n => n.ip === selectedNode.ip)
        if (node) {
          tableRef.value.toggleRowSelection(node, true)
        }
      })
    }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    // 关闭抽屉时清空选中状态
    selectedNodesInDrawer.value = []
  }
})

const handleSelectionChange = (selection) => {
  selectedNodesInDrawer.value = selection
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const handleClose = () => {
  visible.value = false
}

const handleCancel = () => {
  visible.value = false
}

const handleConfirm = () => {
  if (selectedNodesInDrawer.value.length === 0) {
    ElMessage.warning('请至少选择一个节点')
    return
  }
  
  // 为每个节点设置默认网卡
  const nodesWithInterface = selectedNodesInDrawer.value.map(node => ({
    ...node,
    interface: node.interface || 'eth0'
  }))
  emit('confirm', nodesWithInterface)
  visible.value = false
}
</script>

<style lang="scss" scoped>
// 节点选择抽屉样式
:deep(.el-drawer__header) {
  padding: 20px 20px 0 !important;
  margin-bottom: 0 !important;
}

:deep(.el-drawer__body) {
  padding-top: 12px;
}

.node-selector-content {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;

  .drawer-pagination {
    margin-top: 16px;
    display: flex;
    justify-content: center;
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

// 状态显示样式
.status-display {
  display: flex;
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
</style>
