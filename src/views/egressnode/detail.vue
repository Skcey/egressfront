<template>
  <div class="egress-node-detail" v-loading="loading">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item @click="goBack" style="cursor: pointer">出口网关</el-breadcrumb-item>
        <el-breadcrumb-item>出口网关详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 标题区域 -->
    <div class="title-section">
      <div class="title-left">
        <el-button @click="goBack" type="text" class="back-btn">
          <el-icon :size="20"><ArrowLeft /></el-icon>
        </el-button>
        <div class="gateway-info">
          <h1 class="gateway-name">{{ gatewayDetail.name }}</h1>
          <el-tag :type="gatewayDetail.type === '实体' ? 'success' : 'info'" class="type-tag">
            {{ gatewayDetail.type }}
          </el-tag>
          <span class="status-text">
            <span 
              class="status-dot" 
              :class="{ 'dot-normal': gatewayDetail.status === '正常', 'dot-error': gatewayDetail.status === '异常' }"
            ></span>
            {{ gatewayDetail.status }}
          </span>
        </div>
      </div>
      <div class="title-actions">
        <el-tooltip
          v-if="deleteButtonState.disabled"
          :content="deleteButtonState.tooltip"
          placement="top"
        >
          <span>
            <el-button type="danger" disabled>删除</el-button>
          </span>
        </el-tooltip>
        <el-button v-else type="danger" @click="handleDelete">删除</el-button>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="info-section">
      <div class="section-header">
        <div class="section-title">
          <el-icon class="section-icon"><Menu /></el-icon>
          <h3>基本信息</h3>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <label>网关名称：</label>
          <span>{{ gatewayDetail.name }}</span>
        </div>
        <div class="info-item">
          <label>网关类型：</label>
          <span>{{ gatewayDetail.type }}</span>
        </div>
        <div class="info-item">
          <label>网关地址：</label>
          <span>{{ gatewayDetail.address }}</span>
        </div>
        <div class="info-item">
          <label>状态：</label>
          <span class="status-display">
            <span 
              class="status-dot" 
              :class="{ 'dot-normal': gatewayDetail.status === '正常', 'dot-error': gatewayDetail.status === '异常' }"
            ></span>
            {{ gatewayDetail.status }}
          </span>
        </div>
        <div class="info-item">
          <label>创建时间：</label>
          <span>{{ gatewayDetail.createTime }}</span>
        </div>
        <div class="info-item">
          <label>节点数量：</label>
          <span>{{ gatewayDetail.nodeCount }}</span>
        </div>
      </div>
    </div>

    <!-- 网关配置 -->
    <div class="config-section">
      <div class="section-header">
        <div class="section-title">
          <el-icon class="section-icon"><Menu /></el-icon>
          <h3>网关配置</h3>
        </div>
        <!-- 映射类型不显示编辑按钮 -->
        <el-button v-if="!isEditing && gatewayDetail.type === '实体'" type="primary" text @click="handleEdit">编辑</el-button>
        <div v-else-if="isEditing" class="edit-actions">
          <el-button @click="handleCancelEdit">取消</el-button>
          <el-button type="primary" @click="handleSaveEdit">确认</el-button>
        </div>
      </div>

      <!-- 实体网关 - 查看模式 -->
      <div v-if="!isEditing && gatewayDetail.type === '实体'">
        <div class="gateway-address">
          <span class="address-label">出口网关地址：</span>
          <span class="address-value">{{ gatewayDetail.address }}</span>
        </div>
        <div class="gateway-nodes">
          <span class="nodes-label">出口网关节点：</span>
        </div>
        <div class="nodes-grid">
          <div
            v-for="node in gatewayDetail.nodes"
            :key="node.name"
            class="node-card"
          >
            <div class="node-header">
              <h4>{{ node.name }}</h4>
            </div>
            <div class="node-body">
              <div class="node-info">
                <div class="info-row">
                  <span class="label">节点IP：</span>
                  <span class="value">{{ node.ip }}</span>
                </div>
                <div class="info-row">
                  <span class="label">网卡：</span>
                  <span class="value">{{ node.interface }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 映射网关 - 显示映射关系 -->
      <div v-if="!isEditing && gatewayDetail.type === '映射'" class="mapping-config">
        <div class="mapping-cards-container">
          <div
            v-for="(mapping, index) in gatewayDetail.mappingGateways"
            :key="index"
            class="mapping-item"
          >
            <!-- 源网关卡片 -->
            <div class="gateway-card">
              <div class="card-header">
                <span
                  class="card-title source-gateway-link"
                  @click="navigateToSourceGateway(mapping)"
                  :title="`点击查看 ${mapping.sourceGateway.name} 详情`"
                >{{ mapping.sourceGateway.name }}</span>
              </div>
              <div class="card-body">
                <div class="card-info">
                  <span>出口网关地址：{{ mapping.sourceGateway.address }}</span>
                </div>
                <div class="card-info">
                  <span>所属集群名称：{{ mapping.sourceGateway.clusterDisplayName }}</span>
                </div>
              </div>
            </div>

            <!-- 映射标识和箭头 -->
            <div class="mapping-indicator">
              <el-icon :size="24" color="#909399" class="arrow-icon">
                <DArrowRight />
              </el-icon>
              <div 
                  class="mapping-badge clickable" 
                  @click="navigateToEgressClass(mapping.egressClassName)"
                  :title="`点击查看 ${mapping.egressClassName} 详情`"
                >
                  {{ mapping.egressClassName || '映射' }}
              </div>
              <el-icon :size="24" color="#909399" class="arrow-icon">
                <DArrowRight />
              </el-icon>
            </div>

            <!-- 目标网关卡片 -->
            <div class="gateway-card">
              <div class="card-header">
                <span class="card-title">{{ mapping.targetGateway.name }}</span>
              </div>
              <div class="card-body">
                <div class="card-info">
                  <span>出口网关地址：{{ mapping.targetGateway.address }}</span>
                </div>
                <div class="card-info">
                  <span>所属集群名称：{{ mapping.targetGateway.clusterDisplayName }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 编辑模式 - 只对实体网关显示 -->
      <div v-if="isEditing && gatewayDetail.type === '实体'" class="edit-content">
        <!-- 出口网关地址配置 -->
        <div class="form-section">
          <div class="form-label">出口网关地址：</div>
          <div class="form-content">
            <el-radio-group v-model="editForm.addressType">
              <el-radio label="custom">自定义出口地址</el-radio>
              <el-radio label="dynamic">动态出口地址</el-radio>
            </el-radio-group>
            
            <div v-if="editForm.addressType === 'custom'" class="custom-address-section">
              <p class="tip-text">
                <span class="required-mark">*</span>
                所选节点的所有流量都将统一通过在此处指定的固定出口网关地址访问外部网络
              </p>
              <el-input
                v-model="editForm.customAddress"
                placeholder="请输入自定义出口地址（例如：192.168.1.1）"
                style="width: 280px"
                size="small"
                clearable
              />
            </div>
            
            <div v-if="editForm.addressType === 'dynamic'" class="dynamic-address-section">
              <p class="tip-text">系统自动从选择的网关节点中，选取健康节点的IP作为出口地址访问外网</p>
              <div v-if="editForm.selectedNodes.length > 0" class="selected-ips">
                <el-tag
                  v-for="node in editForm.selectedNodes"
                  :key="node.name"
                  size="small"
                  closable
                  @close="removeNode(editForm.selectedNodes.indexOf(node))"
                  style="margin-right: 4px"
                >
                  {{ node.ip }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 选择网关节点 -->
        <div class="form-section nodes-section">
          <div class="form-label">
            <span class="required-mark">*</span>
            选择网关节点：
          </div>
          <div class="form-content">
            <div class="nodes-cards">
              <div
                v-for="(node, index) in editForm.selectedNodes"
                :key="node.name"
                class="edit-node-card"
              >
                <div class="card-header">
                  <span>{{ node.name }}</span>
                  <el-icon @click="removeNode(index)" class="close-icon">
                    <CircleCloseFilled />
                  </el-icon>
                </div>
                <div class="card-body">
                  <p>节点ip：{{ node.ip }}</p>
                  <div class="network-input">
                    <span>网卡：</span>
                    <el-input
                      v-model="node.interface"
                      placeholder="eth0"
                      size="small"
                      style="width: 280px"
                    />
                  </div>
                </div>
              </div>
            </div>
            <el-button
              type="primary"
              text
              bg
              @click="openNodeSelector"
              style="width: 100%; margin-top: 16px"
            >
              选择网关节点
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 节点选择抽屉 -->
    <NodeSelectorDrawer
      v-model="showNodeDrawer"
      :selected-nodes="editForm.selectedNodes"
      @confirm="handleNodeSelectionConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Menu, CircleCloseFilled, DArrowRight } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import NodeSelectorDrawer from '@/components/NodeSelectorDrawer.vue'
import { getEgressNode, getEgressNodeConfiguration, updateEgressNode, deleteEgressNode } from '@/api/egressNode'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const clusterName = computed(() => route.params.clusterName)
const egressNodeName = computed(() => route.params.name)
const gatewayDetail = ref({
  name: '',
  address: '',
  type: '',
  status: '',
  createTime: '',
  nodes: [],
  mappingGateways: []
})

const gatewayConfig = ref(null)

// 删除按钮状态
const deleteButtonState = ref({
  disabled: false,
  tooltip: ''
})

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

// 获取网关详情
const getEgressNodeDetail = async () => {
  try {
    loading.value = true
    // 获取基本详情
    const detailResponse = await getEgressNode(clusterName.value, egressNodeName.value)
    const detail = detailResponse.data
    // 获取配置信息
    const configResponse = await getEgressNodeConfiguration(clusterName.value, egressNodeName.value, true)
    const config = configResponse.data
    gatewayConfig.value = config
    // 组合数据
    gatewayDetail.value = {
      name: detail.name,
      type: detail.type === 0 ? '实体' : '映射',
      status: detail.status === 1 ? '正常' : '异常',
      createTime: formatTime(detail.createTime),
      clusterDisplayName: detail.clusterDisplayName,
      clusterName: detail.clusterName,
      hasBeenUsedByPolicy: detail.hasBeenUsedByPolicy,
      address: config.egressIpType === 0 ? config.currentNode : config.egressIP,
      // 处理节点列表
      nodes: config.nodeList ? config.nodeList.map((node, index) => ({
        name: node.name,
        ip: node.ip,
        interface: node.interfaceName,
        installed: node.egressNodeDeployed,
        status: node.status === 'Ready' ? '正常' : '异常'
      })) : [],
      nodeCount: config.nodeList ? config.nodeList.length : 0
    }
    // 如果是映射网关，处理映射关系
    if (detail.type === 1) {
      gatewayDetail.value.mappingGateways = [{
        egressClassName: config.egressClass, // 出口网关映射名称
        sourceGateway: {
          name: config.syncEgressNodeName,
          address: config.egressIpType === 0 ? config.currentNode : config.egressIP,
          clusterDisplayName: config.gatewayClusterDisplayName,
          clusterName: config.gatewayClusterName
        },
        targetGateway: {
          name: detail.name,
          address: config.egressIpType === 0 ? config.currentNode : config.egressIP,
          clusterDisplayName: detail.clusterDisplayName,
          clusterName: detail.clusterName
        }
      }]
    }
    // 检查删除按钮状态
    await checkDeleteButtonState()
  } catch (error) {
    console.error('获取出口网关详情失败:', error)
    ElMessage.error('获取出口网关详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 检查删除按钮状态
const checkDeleteButtonState = async () => {
  // 映射类型网关不能删除
  if (gatewayDetail.value.type === '映射') {
    deleteButtonState.value = {
      disabled: true,
      tooltip: '映射类型出口网关不允许删除，若需删除请直接删除对应的出口网关映射'
    }
    return
  }

  // 实体网关默认可以删除，具体的依赖检查在删除时由后端处理
  deleteButtonState.value = {
    disabled: false,
    tooltip: ''
  }
}

const goBack = () => {
  router.push({ 
    name: 'Egress',
    params: { clusterName: clusterName.value }
  })
}

const isEditing = ref(false)
const editForm = ref({
  addressType: 'dynamic', // 'custom' or 'dynamic'
  customAddress: '',
  selectedNodes: []
})
const showNodeDrawer = ref(false)

const handleEdit = () => {
  // 初始化编辑表单数据
  const config = gatewayConfig.value
  editForm.value = {
    addressType: config.egressIpType === 0 ? 'dynamic' : 'custom',
    customAddress: config.egressIP || '',
    selectedNodes: JSON.parse(JSON.stringify(gatewayDetail.value.nodes))
  }
  isEditing.value = true
}

const handleSaveEdit = async () => {
  // 表单验证
  // 检查是否选择了网关节点
  if (editForm.value.selectedNodes.length === 0) {
    ElMessage.warning('请至少选择一个网关节点')
    return
  }
  // 如果选择自定义出口地址，检查地址是否填写
  if (editForm.value.addressType === 'custom') {
    if (!editForm.value.customAddress || editForm.value.customAddress.trim() === '') {
      ElMessage.warning('请输入自定义出口地址')
      return
    }
    
    // 验证IP地址格式
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipPattern.test(editForm.value.customAddress.trim())) {
      ElMessage.warning('请输入有效的IP地址')
      return
    }
  }

  // 检查所有节点的网卡是否填写
  const hasEmptyInterface = editForm.value.selectedNodes.some(node => !node.interface || node.interface.trim() === '')
  if (hasEmptyInterface) {
    ElMessage.warning('请为所有节点配置网卡')
    return
  }

  try {
    // 构建更新数据
    const updateData = {
      name: gatewayDetail.value.name,
      clusterName: clusterName,
      egressIpType: editForm.value.addressType === 'custom' ? 1 : 0,
      egressIP: editForm.value.addressType === 'custom' ? editForm.value.customAddress.trim() : null,
      nodeList: editForm.value.selectedNodes.map(node => ({
        ip: node.ip,
        interfaceName: node.interface.trim()
      }))
    }

    await updateEgressNode(clusterName.value, egressNodeName.value, updateData)
    ElMessage.success('修改成功')
    
    await getEgressNodeDetail()
    isEditing.value = false
  } catch (error) {
    console.error('修改出口网关失败:', error)
    ElMessage.error('修改出口网关失败，请稍后重试')
  }
}

const handleCancelEdit = () => {
  isEditing.value = false
}

const openNodeSelector = () => {
  showNodeDrawer.value = true
}

const handleNodeSelectionConfirm = (nodes) => {
  // 以抽屉返回的全量选中节点替换当前列表，保留已填写的网卡名称
  const existingInterfaceMap = {}
  editForm.value.selectedNodes.forEach(n => {
    existingInterfaceMap[n.ip] = n.interface
  })
  editForm.value.selectedNodes = nodes.map(node => ({
    ...node,
    interface: existingInterfaceMap[node.ip] || node.interface || 'eth0' 
  }))
}

const removeNode = (index) => {
  editForm.value.selectedNodes.splice(index, 1)
}

// 跳转到出口网关映射详情页
const navigateToEgressClass = (egressClassName) => {
  if (!egressClassName) return
  router.push({
    name: 'EgressMappingDetail',
    params: {
      clusterName: clusterName,
      name: egressClassName
    }
  })
}

// 跳转到源出口网关详情页（源网关在源集群中）
const navigateToSourceGateway = (mapping) => {
  if (!mapping?.sourceGateway?.name) return
  const sourceClusterName = mapping.sourceGateway.clusterName
  router.push({
    name: 'EgressNodeDetail',
    params: {
      clusterName: sourceClusterName,
      name: mapping.sourceGateway.name
    }
  })
}

const handleDelete = () => {
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
        await deleteEgressNode(clusterName.value, egressNodeName.value)
        ElMessage.success('删除成功')
        // 删除成功后返回列表页
        goBack()
      } catch (error) {
        console.error('删除出口网关失败:', error)
        let errorMessage = '删除出口网关失败，请稍后重试'
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
      // 取消删除或关闭对话框
      if (action === 'cancel') {
        console.log('取消删除')
      }
    })
}

onMounted(() => {
  getEgressNodeDetail()
})

// 当路由参数变化（集群或名称变更）时，自动重新加载详情
watch(
  () => [route.params.clusterName, route.params.name],
  () => {
    getEgressNodeDetail()
  }
)
</script>

<style lang="scss" scoped>
.egress-node-detail {
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
      cursor: pointer;

      &:hover {
        color: #409EFF;
      }
    }
  }

  .title-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 32px 0 24px;

    .title-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .back-btn {
        font-size: 14px;
        color: #303133;
        font-weight: 600;
        transition: color 0.3s;
        
        :deep(.el-icon) {
          font-weight: bold;
        }

        &:hover,
        &:active {
          color: #409EFF;
        }
      }

      .gateway-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .gateway-name {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
          margin: 0;
        }

        .type-tag {
          font-size: 12px;
        }

        .status-text {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #303133;
          font-weight: 500;
        }
      }
    }

    .title-actions {
      display: flex;
      gap: 12px;
    }
  }

  .info-section {
    padding: 24px 32px;
  }

  .config-section {
    padding: 0 32px 24px;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;

      .section-icon {
        color: #409EFF;
        font-size: 18px;
      }

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin: 0;
      }
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;

    .info-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;

      label {
        font-size: 14px;
        font-weight: 500;
        color: #606266;
      }

      span {
        font-size: 14px;
        color: #303133;

        &.status-display {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      }
    }
  }

  // 状态圆点样式
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
  

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;

    &.dot-normal {
      background-color: #67C23A;
    }

    &.dot-abnormal {
      background-color: #F56C6C;
    }
  }

  .status-display {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .config-section {
    .gateway-address {
      margin-bottom: 16px;
      font-size: 14px;

      .address-label {
        color: #606266;
        font-weight: 500;
      }

      .address-value {
        color: #303133;
      }
    }

    .gateway-nodes {
      margin-bottom: 16px;
      font-size: 14px;

      .nodes-label {
        color: #606266;
        font-weight: 500;
      }
    }

    .nodes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 16px;

      .node-card {
        border: 1px solid #DCDFE6;
        border-radius: 4px;
        overflow: hidden;

        .node-header {
          background-color: #F5F7FA;
          padding: 12px 20px;
          border-bottom: 1px solid #E4E7ED;

          h4 {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            margin: 0;
          }
        }

        .node-body {
          padding: 16px 20px;

          .node-info {
            .info-row {
              display: flex;
              margin-bottom: 8px;

              &:last-child {
                margin-bottom: 0;
              }

              .label {
                width: 60px;
                font-size: 14px;
                color: #606266;
                font-weight: 500;
              }

              .value {
                font-size: 14px;
                color: #303133;
              }
            }
          }
        }
      }
    }
  }

  // 编辑模式样式
  .edit-content {
    .form-section {
      margin-bottom: 24px;

      .form-label {
        font-size: 14px;
        font-weight: 500;
        color: #3D3D3D;
        margin-bottom: 8px;

        .required-mark {
          color: #F56C6C;
          margin-right: 4px;
        }
      }

      .form-content {
        padding-left: 0;

        .custom-address-section,
        .dynamic-address-section {
          margin-top: 8px;

          .tip-text {
            font-size: 14px;
            color: #909399;
            margin: 4px 0;
            .required-mark {
              color: #F56C6C;
              margin-right: 4px;
            }
          }

          .selected-ips {
            margin-top: 4px;
          }
        }
      }

      &.nodes-section {
        .nodes-cards {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 16px;
          padding: 0;

          .edit-node-card {
            border: 1px solid #DCDFE6;
            border-radius: 4px;
            overflow: hidden;
            width: 358px;

            .card-header {
              background-color: #F5F7FA;
              padding: 8px 20px;
              border-bottom: 1px solid #E4E7ED;
              display: flex;
              justify-content: space-between;
              align-items: center;

              span {
                font-size: 16px;
                font-weight: 600;
                color: #303133;
              }

              .close-icon {
                cursor: pointer;
                color: #F56C6C;
                font-size: 18px;

                &:hover {
                  color: #F56C6C;
                }
              }
            }

            .card-body {
              padding: 16px;

              p {
                margin: 0 0 12px 0;
                font-size: 14px;
                color: #606266;
              }

              .network-input {
                display: flex;
                align-items: center;
                gap: 8px;

                span {
                  font-size: 14px;
                  color: #606266;
                }
              }
            }
          }
        }
      }
    }
  }

  // 映射网关配置样式
  .mapping-config {
    padding: 0;

    .mapping-cards-container {
      display: flex;
      flex-direction: column;
      gap: 24px;

      .mapping-item {
        display: flex;
        align-items: center;
        gap: 24px;

        .gateway-card {
          width: 292px;
          border-radius: 4px;
          background-color: #FFFFFF;
          box-shadow: 0px 12px 32px 4px rgba(0, 0, 0, 0.04), 0px 8px 20px 0px rgba(0, 0, 0, 0.08);
          overflow: hidden;

          .card-header {
            background-color: #FFFFFF;
            border-bottom: 1px solid #E4E7ED;
            padding: 8px 20px;

            .card-title {
              font-family: 'Inter';
              font-size: 16px;
              font-weight: 400;
              line-height: 24px;
              color: #303133;

              &.source-gateway-link {
                cursor: pointer;
                transition: color 0.2s ease;

                &:hover {
                  color: #409EFF !important;
                }
              }
            }
          }

          .card-body {
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;

            .card-info {
              font-family: 'Inter';
              font-size: 14px;
              font-weight: 400;
              line-height: 22px;
              color: #606266;
            }
          }
        }

        .mapping-indicator {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          gap: 12px;

          .arrow-icon {
            color: #909399;
          }

          .mapping-badge {
            background-color: #E0EAFF;
            color: #3D3D3D;
            font-family: 'Inter';
            font-size: 14px;
            font-weight: 400;
            line-height: 22px;
            padding: 4px 8px;
            border-radius: 8px;
            white-space: nowrap;

            &.clickable {
              cursor: pointer;
              transition: all 0.2s ease;
              
              &:hover {
                background-color: #409EFF;
                color: #FFFFFF;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
              }
              
              &:active {
                transform: translateY(0);
              }
            }
          }
        }
      }
    }
  }

  .edit-actions {
    display: flex;
    gap: 12px;
  }
</style>