<template>
  <div class="egress-mapping-detail">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'EgressMapping', params: { clusterName: $route.params.clusterName || 'default' } }">
          出口网关映射
        </el-breadcrumb-item>
        <el-breadcrumb-item>出口网关映射详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 标题区域 -->
    <div class="title-section">
      <div class="title-left">
        <el-button @click="goBack" type="text" class="back-btn">
          <el-icon :size="20"><ArrowLeft /></el-icon>
        </el-button>
        <div class="mapping-info">
          <h1 class="mapping-name">{{ mappingDetail.name }}</h1>
        </div>
      </div>
      <div class="title-actions">
        <el-button type="danger" plain @click="handleDelete">删除</el-button>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="info-section" v-loading="loading">
      <div class="section-header">
        <div class="section-title">
          <el-icon class="section-icon"><Menu /></el-icon>
          <h3>基本信息</h3>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <label>名称：</label>
          <span>{{ mappingDetail.name }}</span>
        </div>
        <div class="info-item">
          <label>网关集群：</label>
          <span>{{ mappingDetail.targetCluster }}</span>
        </div>
        <div class="info-item">
          <label>创建时间：</label>
          <span>{{ mappingDetail.createTime }}</span>
        </div>
      </div>
    </div>

    <!-- 网关映射配置 -->
    <div class="config-section">
      <div class="section-header">
        <div class="section-title">
          <el-icon class="section-icon"><Menu /></el-icon>
          <h3>网关映射配置</h3>
        </div>
        <div v-if="!isEditMode">
          <el-button type="primary" text @click="handleEdit" :loading="loading">编辑</el-button>
        </div>
        <div v-else class="edit-actions">
          <el-button text @click="handleCancelEdit" :disabled="submitting">取消</el-button>
          <el-button type="primary" text @click="handleConfirm" :loading="submitting" :disabled="submitting">确认</el-button>
        </div>
      </div>

      <div class="mapping-config" v-loading="loading">
        <!-- 左侧：网关集群 -->
        <div class="cluster-card source-cluster">
          <div class="card-header">{{ mappingDetail.targetCluster }}</div>
          <div class="card-body">
            <div
              v-for="gateway in mappingDetail.sourceGateways"
              :key="gateway.name"
              class="gateway-card"
              :class="{ 'removed': isEditMode && gateway.removed }"
            >
              <div class="gateway-header">
                <span class="gateway-name">{{ gateway.name }}</span>
                <span
                  v-if="isEditMode"
                  class="gateway-action"
                  :class="{ 'restore': gateway.removed, 'remove': !gateway.removed }"
                  @click="toggleGatewayStatus(gateway)"
                >
                  {{ gateway.removed ? '恢复' : '移除' }}
                </span>
              </div>
              <div class="gateway-body">
                <div class="gateway-tags">
                  <span class="status-display">
                    <span 
                      class="status-dot" 
                      :class="{ 'dot-normal': gateway.status === '正常', 'dot-error': gateway.status === '异常' }"
                    ></span>
                    {{ gateway.status }}
                  </span>
                  <el-tag type="primary" size="small">{{ gateway.type }}</el-tag>
                  <el-tag type="info" size="small">地址：{{ gateway.address }}</el-tag>
                </div>
              </div>
            </div>
            
            <!-- 添加出口网关按钮 -->
            <el-button
              v-if="isEditMode"
              text
              type="primary"
              class="add-gateway-btn"
              @click="showGatewaySelector = true"
            >
              添加出口网关
            </el-button>
          </div>
        </div>

        <!-- 中间：箭头区域 -->
        <div class="arrows-container">
          <div
            v-for="(gateway, index) in mappingDetail.sourceGateways"
            :key="gateway.name"
            class="arrow-wrapper"
          >
            <el-icon :size="24" color="#909399">
              <DArrowRight />
            </el-icon>
          </div>
        </div>

        <!-- 右侧：目标集群 -->
        <div class="cluster-card target-cluster">
          <div class="card-header">{{ mappingDetail.clusterName }}</div>
          <div class="card-body">
            <div
              v-for="(gateway, index) in mappingDetail.targetGateways"
              :key="gateway.name"
              class="gateway-card"
              :class="{ 
                'pending-mapping': !gateway.name,
                'removed': isEditMode && mappingDetail.sourceGateways[index]?.removed
              }"
            >
              <div class="gateway-header">
                <span class="gateway-name">{{ gateway.name || '--' }}</span>
              </div>
              <div class="gateway-body">
                <div v-if="gateway.name" class="gateway-tags">
                  <span class="status-display">
                    <span 
                      class="status-dot" 
                      :class="{ 'dot-normal': gateway.status === '正常', 'dot-error': gateway.status === '异常' }"
                    ></span>
                    {{ gateway.status }}
                  </span>
                  <el-tag type="primary" size="small">{{ gateway.type }}</el-tag>
                  <el-tag type="info" size="small">地址：{{ gateway.address }}</el-tag>
                </div>
                <div v-else class="pending-text">待映射</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 网关选择器抽屉 -->
    <GatewaySelectorDrawer
      v-model="showGatewaySelector"
      :available-gateways="availableGateways"
      :loading="gatewayLoading"
      :show-type-column="false"
      @confirm="confirmAddGateways"
      @refresh="fetchAvailableGateways"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Menu, DArrowRight, Refresh } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getEgressClassDetail, getEgressClassConfig, updateEgressClass, deleteEgressClass } from '@/api/egressClass'
import { useClusterStore } from '@/stores/cluster'
import GatewaySelectorDrawer from '@/components/GatewaySelectorDrawer.vue'
import { listEgressNode } from '../../api/egressNode'

const route = useRoute()
const router = useRouter()
const clusterStore = useClusterStore()

// 编辑模式
const isEditMode = ref(false)
const originalConfig = ref(null) // 保存原始配置用于取消操作
const loading = ref(false)
const submitting = ref(false)

// 网关选择器
const showGatewaySelector = ref(false)
const selectedGateways = ref([])
const gatewayLoading = ref(false)

// 映射详情
const mappingDetail = ref({
  name: '',
  clusterName: '',
  targetCluster: '',
  createTime: '',
  sourceGateways: [],
  targetGateways: []
})

// 可用网关列表
const availableGateways = ref([])


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

// 获取映射详情
const fetchMappingDetail = async () => {
  try {
    loading.value = true
    const clusterName = route.params.clusterName
    const egressClassName = route.params.name
    
    // 获取基本信息
    const detailResponse = await getEgressClassDetail(clusterName, egressClassName)
    const detail = detailResponse.data
    // 获取配置信息
    const configResponse = await getEgressClassConfig(clusterName, egressClassName)
    const config = configResponse.data
    // 组合数据
    mappingDetail.value = {
      name: detail.name,
      clusterName: detail.clusterDisplayName,
      targetCluster: detail.gatewayClusterDisplayName,
      createTime: formatTime(detail.createTime),
      sourceGateways: config.detailedSyncEgressNodes.map(node => ({
        name: node.name,
        type: '实体',
        status: node.status === 1 ? '正常' : '异常',
        address: node.egressIpType === 0 ? node.currentNode : node.egressIP,
        removed: false
      })),
      targetGateways: config.detailedSyncedEgressNodes.map(node => ({
        name: node.name,
        type: '映射',
        status: node.status === 1 ? '正常' : '异常',
        address: node.egressIpType === 0 ? node.currentNode : node.egressIP,
        hasBeenUsedByPolicy: node.hasBeenUsedByPolicy
      }))
    }
    // 保存原始配置
    originalConfig.value = JSON.parse(JSON.stringify(config))
  } catch (error) {
    console.error('获取出口网关映射详情失败:', error)
    ElMessage.error('获取出口网关映射详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 获取可用网关列表
const fetchAvailableGateways = async () => {
  try {
    gatewayLoading.value = true
    const config = originalConfig.value
    if (!config || !config.gatewayClusterName) return
    
    const response = await listEgressNode(config.gatewayClusterName)
    const data = response.data || []
    
    // 只显示实体网关，排除已选择的
    const selectedIds = mappingDetail.value.sourceGateways.map(g => g.name)
    availableGateways.value = data
      .filter(item => item.type === 0 && !selectedIds.includes(item.name))
      .map(item => ({
        name: item.name,
        address: item.egressIpType === 0 ? item.currentNode : item.egressIP,
        status: item.status === 1 ? '正常' : '异常'
      }))
    
    selectorCurrentPage.value = 1
  } catch (error) {
    console.error('获取可用网关列表失败:', error)
    ElMessage.error('获取可用网关列表失败')
  } finally {
    gatewayLoading.value = false
  }
}

// 初始化
onMounted(async () => {
  await fetchMappingDetail()
})

const goBack = () => {
  if (isEditMode.value) {
    ElMessageBox.confirm(
      '编辑内容尚未保存，确认要离开吗？',
      '确认离开？',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(() => {
        const clusterName = route.params.clusterName
        router.push({ name: 'EgressMapping', params: { clusterName } })
      })
      .catch(() => {})
  } else {
    const clusterName = route.params.clusterName
    router.push({ name: 'EgressMapping', params: { clusterName } })
  }
}

const handleEdit = async () => {
  isEditMode.value = true
  await fetchAvailableGateways()
}

const handleCancelEdit = async () => {
  isEditMode.value = false
  await fetchMappingDetail()
}

const handleConfirm = async () => { 
  try {
    submitting.value = true
    const clusterName = route.params.clusterName
    const egressClassName = route.params.name
    
    // 构建更新数据：只包含未移除的网关
    const activeGateways = mappingDetail.value.sourceGateways
      .filter(g => !g.removed)
      .map(g => g.name)
    
    const updateData = {
      name: mappingDetail.value.name,
      clusterName: clusterName,
      gatewayClusterName: originalConfig.value.gatewayClusterName,
      syncEgressNodes: activeGateways
    }
    
    await updateEgressClass(clusterName, egressClassName, updateData)
    ElMessage.success('保存成功')
    isEditMode.value = false
    await fetchMappingDetail()
  } catch (error) {
    console.error('保存映射配置失败:', error)
    ElMessage.error('保存映射配置失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const handleDelete = () => {
  // 直接显示确认对话框
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
        const clusterName = route.params.clusterName
        const egressClassName = route.params.name
        await deleteEgressClass(clusterName, egressClassName)
        ElMessage.success('删除成功')
        router.push({ name: 'EgressMapping', params: { clusterName } })
      } catch (error) {
        console.error('删除映射失败:', error)
        // 直接显示后端返回的错误信息
        let errorMessage = '删除出口网关映射失败，请稍后重试'
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

const toggleGatewayStatus = (gateway) => {
  const index = mappingDetail.value.sourceGateways.indexOf(gateway)
  // 如果是新添加的网关，直接从列表中删除
  if (gateway.isNew) {
    if (index >= 0) {
      mappingDetail.value.sourceGateways.splice(index, 1)
      mappingDetail.value.targetGateways.splice(index, 1)
    }
  } else {
    // 否则，切换移除状态（置灰）
    gateway.removed = !gateway.removed
    // 同时更新目标网关的状态
    if (index >= 0 && mappingDetail.value.targetGateways[index]) {
      mappingDetail.value.targetGateways[index].removed = gateway.removed
    }
  }
}

const handleSelectionChange = (val) => {
  selectedGateways.value = val
}

const confirmAddGateways = (newSelectedGateways) => {
  if (newSelectedGateways.length === 0) {
    ElMessage.warning('请选择要添加的出口网关')
    return
  }
  
  // 将选中的网关添加到源网关列表
  newSelectedGateways.forEach(gateway => {
    // 检查是否已存在（避免重复添加）
    const exists = mappingDetail.value.sourceGateways.some(g => g.name === gateway.name)
    if (exists) {
      ElMessage.warning(`出口网关 ${gateway.name} 已存在`)
      return
    }
    
    mappingDetail.value.sourceGateways.push({
      name: gateway.name,
      type: '实体',
      status: gateway.status,
      address: gateway.address,
      removed: false,
      isNew: true // 标记为新添加的网关
    })
    
    // 同时添加到目标网关列表（作为待映射状态）
    mappingDetail.value.targetGateways.push({
      name: null, // 待映射，不显示名称
      type: null,
      status: null,
      address: null
    })
  })
  
  showGatewaySelector.value = false
  selectedGateways.value = []
  
  // 清空表格选择
  if (multipleTableRef.value) {
    multipleTableRef.value.clearSelection()
  }
  
  ElMessage.success('添加成功')
}

</script>

<style lang="scss" scoped>
.egress-mapping-detail {
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

      .mapping-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .mapping-name {
          font-family: 'Source Han Sans';
          font-size: 20px;
          font-weight: 600;
          line-height: 28px;
          color: #303133;
          margin: 0;
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

    .edit-actions {
      display: flex;
      gap: 0px;
      align-items: center;

      .el-button {
        padding: 5px 5px;
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
      }
    }
  }

  .mapping-config {
    display: flex;
    align-items: flex-start;
    gap: 32px;

    .cluster-card {
      width: 380px;
      flex-shrink: 0;
      border: 1px solid #D4D7DE;
      border-radius: 4px;
      background-color: #FFFFFF;
      overflow: hidden;

      .card-header {
        background-color: #D9ECFF;
        padding: 8px 20px;
        font-family: 'Inter';
        font-size: 16px;
        font-weight: 400;
        line-height: 24px;
        color: #303133;
        border-bottom: 1px solid #E4E7ED;
      }

      .card-body {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;

        .gateway-card {
          border: 1px solid #69B1FF;
          border-radius: 4px;
          background-color: #E6F4FF;
          overflow: hidden;

          &.pending-mapping {
            background-color: #F4F4F5;
            border-color: #69B1FF;
          }

          &.removed {
            background-color: #F4F4F5;
            opacity: 0.7;
          }

          .gateway-header {
            background-color: transparent;
            padding: 8px 20px;
            border-bottom: 1px solid #91CAFF;
            font-family: 'Inter';
            font-size: 16px;
            font-weight: 400;
            line-height: 24px;
            color: #303133;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .gateway-name {
              font-weight: 400;
            }

            .gateway-action {
              cursor: pointer;
              font-size: 16px;
              
              &.remove {
                color: #F56C6C;
                
                &:hover {
                  color: #F78989;
                }
              }
              
              &.restore {
                color: #337ECC;
                
                &:hover {
                  color: #409EFF;
                }
              }
            }
          }

          .gateway-body {
            padding: 16px;

            .gateway-tags {
              display: flex;
              align-items: center;
              gap: 24px;
              padding-left: 4px;

              .status-display {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                font-size: 14px;
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
                  background-color: #EA0000;
                }
              }
            }

            .pending-text {
              padding-left: 4px;
              font-size: 14px;
              color: #3D3D3D;
            }
          }
        }

        .add-gateway-btn {
          width: 100%;
          height: 32px;
          border: 1px solid #91CAFF;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }

    .arrows-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 40px; // 对齐卡片标题下方的内容
      flex-shrink: 0;

      .arrow-wrapper {
        height: 96px; // 与gateway-card高度一致
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .gateway-selector {
    .selector-tip {
      display: flex;
      align-items: center;
      gap: 2px;
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 600;
      color: #3D3D3D;

      .el-button {
        padding: 5px 8px;
        margin-left: 0px;
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      padding-top: 16px;
    }
  }

  .drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  // 调整抽屉样式
  :deep(.el-drawer__header) {
    padding: 20px 20px 0;
    margin-bottom: 0;
  }

  :deep(.el-drawer__body) {
    padding-top: 4px;
  }
}
</style>
