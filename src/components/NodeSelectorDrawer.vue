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
        :data="availableNodes"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column prop="name" label="节点名称" width="180" />
        <el-table-column prop="ip" label="ip地址" width="180" />
        <el-table-column prop="installed" label="已安装出口网关" width="260">
          <template #default="scope">
            {{ scope.row.installed ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="180">
          <template #default="scope">
            <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'" size="small">
              {{ scope.row.status }}
            </el-tag>
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

const visible = ref(props.modelValue)
const tableRef = ref(null)

// 模拟节点数据
const availableNodes = ref([
  { id: 1, name: '节点1', ip: '10.10.103.80', installed: true, status: '正常', interface: 'eth0' },
  { id: 2, name: '节点2', ip: '10.10.103.79', installed: true, status: '正常', interface: 'eth1' },
  { id: 3, name: '节点3', ip: '10.10.103.78', installed: true, status: '正常', interface: 'eth0' },
  { id: 4, name: '节点4', ip: '10.10.103.77', installed: true, status: '正常', interface: 'eth0' },
  { id: 5, name: '节点5', ip: '10.10.103.76', installed: false, status: '异常', interface: '' },
  { id: 6, name: '节点6', ip: '10.10.103.75', installed: true, status: '正常', interface: 'eth0' }
])

const selectedNodesInDrawer = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(availableNodes.value.length)

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    // 打开抽屉时,根据已选节点初始化选中状态
    setTimeout(() => {
      if (tableRef.value) {
        availableNodes.value.forEach(node => {
          const isSelected = props.selectedNodes.some(n => n.id === node.id)
          if (isSelected) {
            tableRef.value.toggleRowSelection(node, true)
          }
        })
      }
    }, 100)
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
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
    justify-content: flex-end;
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
