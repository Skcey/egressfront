<template>
  <div class="egress-mapping-create">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'EgressMapping', params: { clusterName: $route.params.clusterName } }">
          出口网关映射
        </el-breadcrumb-item>
        <el-breadcrumb-item>新建出口网关映射</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 标题区域 -->
    <div class="title-section">
      <div class="title-left">
        <el-button @click="handleBack" type="text" class="back-btn">
          <el-icon :size="20"><ArrowLeft /></el-icon>
        </el-button>
        <div class="title-info">
          <h1 class="title-name">新建出口网关映射</h1>
        </div>
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
      <div class="form-content">
        <div class="form-item">
          <div class="form-label required">名称：</div>
          <div class="form-value">
            <el-input
              v-model="formData.name"
              placeholder="请输入名称"
              style="width: 320px"
              clearable
              maxlength="63"
              show-word-limit
            />
          </div>
        </div>
        <div class="form-item">
          <div class="form-label required">所属集群：</div>
          <div class="form-value">
            <el-input
              v-model="formData.cluster"
              disabled
              style="width: 320px"
            />
          </div>
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
      </div>

      <div class="config-content">
        <!-- 网关集群 -->
        <div class="config-item">
          <div class="config-label required">网关集群：</div>
          <div class="config-body">
            <el-select
              v-model="formData.gatewayCluster"
              placeholder="选择集群"
              style="width: 320px"
              :loading="clusterLoading"
              clearable
            >
              <el-option
                v-for="cluster in clusters"
                :key="cluster.name"
                :label="cluster.displayName"
                :value="cluster.name"
              />
            </el-select>
          </div>
        </div>

        <!-- 出口网关节点 -->
        <div class="config-item nodes-section">
          <div class="config-label required">出口网关节点：</div>
          <div class="config-body">
            <!-- 已选择的网关列表 -->
            <div v-if="selectedGateways.length > 0" class="gateway-cards-grid">
              <div
                v-for="(gateway, index) in selectedGateways"
                :key="gateway.name"
                class="gateway-card"
              >
                <div class="card-header">
                  <span class="gateway-name">{{ gateway.name }}</span>
                  <el-icon :size="16" color="#F56C6C" @click="removeGateway(index)" class="close-icon">
                    <CircleCloseFilled />
                  </el-icon>
                </div>
                <div class="card-body">
                  <div class="gateway-info">
                    <span class="status-text">{{ gateway.status }}</span>
                    <el-tag type="primary" size="small" class="gateway-tag primary">
                      {{ gateway.type }}
                    </el-tag>
                    <el-tag type="info" size="small" class="gateway-tag info">
                      地址：{{ gateway.address }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
            <!-- 空状态占位 -->
            <div v-else class="empty-placeholder">
              <el-icon :size="48" color="#C0C4CC">
                <Document />
              </el-icon>
              <p class="empty-text">暂未选择出口网关</p>
              <p class="empty-hint">请点击下方按钮添加出口网关</p>
            </div>
            <el-button
              type="primary"
              text
              bg
              @click="handleAddGateway"
              style="width: 100%; margin-top: 16px"
            >
              添加出口网关
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="footer-actions">
      <el-button type="primary" @click="handleSubmit" :loading="submitting" :disabled="submitting">
        {{ submitting ? '创建中...' : '新建' }}
      </el-button>
      <el-button @click="handleCancel" :disabled="submitting">取消</el-button>
    </div>

      <!-- 添加出口网关抽屉 -->
    <GatewaySelectorDrawer
      v-model="showGatewayDrawer"
      :available-gateways="availableGateways"
      :loading="gatewayLoading"
      :show-type-column="true"
      @confirm="handleDrawerConfirm"
      @refresh="fetchAvailableGateways"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Menu, CircleCloseFilled, Document } from '@element-plus/icons-vue'
import { createEgressClass } from '@/api/egressClass'
import { useClusterStore } from '@/stores/cluster'
import GatewaySelectorDrawer from '@/components/GatewaySelectorDrawer.vue'
import { listEgressNode } from '../../api/egressNode'

const router = useRouter()
const route = useRoute()
const clusterStore = useClusterStore()

// 表单数据
const formData = reactive({
  name: '',
  cluster: '',
  gatewayCluster: '',
})

// 集群列表
const clusters = ref([])
const clusterLoading = ref(false)

// 已选择的网关列表
const selectedGateways = ref([])

// 抽屉相关
const showGatewayDrawer = ref(false)

// 可选的网关列表
const availableGateways = ref([])
const gatewayLoading = ref(false)

const selectedInDrawer = ref([])
const submitting = ref(false)

// 获取集群列表
const fetchClusters = async () => {
  try {
    clusterLoading.value = true
    
    // 确保集群数据已加载
    await clusterStore.initializeClusters()
    const allClusters = clusterStore.clusters
    
    // 设置当前集群
    const currentClusterName = route.params.clusterName
    formData.cluster = clusterStore.getClusterDisplayName(currentClusterName)
    
    // 过滤掉当前集群（不能映射自己集群的网关）
    clusters.value = allClusters.filter(c => c.name !== currentClusterName)
    
    console.log('[EgressMapping] 当前集群:', currentClusterName, '可选网关集群:', clusters.value.map(c => c.name))
  } catch (error) {
    console.error('获取集群列表失败:', error)
    ElMessage.error('获取集群列表失败')
  } finally {
    clusterLoading.value = false
  }
}

// 获取网关集群的网关列表
const fetchAvailableGateways = async () => {
  if (!formData.gatewayCluster) return
  
  try {
    gatewayLoading.value = true
    const response = await listEgressNode(formData.gatewayCluster)
    const data = response.data || []
    
    // 只显示实体网关（type === 0）
    availableGateways.value = data
      .filter(item => item.type === 0)
      .map(item => ({
        name: item.name,
        type: item.type === 0 ? '实体' : '映射',
        status: item.status === 1 ? '正常' : '异常',
        address: item.egressIpType === 0 ? item.currentNode : item.egressIP
      }))
  } catch (error) {
    console.error('获取网关列表失败:', error)
    ElMessage.error('获取网关列表失败')
  } finally {
    gatewayLoading.value = false
  }
}

// 监听网关集群变化
watch(() => formData.gatewayCluster, () => {
  // 清空已选择的网关
  selectedGateways.value = []
  availableGateways.value = []
  if (formData.gatewayCluster) {
    fetchAvailableGateways()
  }
})

// 监听路由参数变化
watch(() => route.params.clusterName, async (newClusterName) => {
  if (newClusterName) {
    await fetchClusters()
  }
})

// 初始化
onMounted(async () => {
  await fetchClusters()
})

// 返回
const handleBack = () => {
  const clusterName = route.params.clusterName
  router.push({ name: 'EgressMapping', params: { clusterName } })
}

// 移除网关
const removeGateway = (index) => {
  selectedGateways.value.splice(index, 1)
}

// 添加出口网关
const handleAddGateway = () => {
  if (!formData.gatewayCluster) {
    ElMessage.warning('请先选择网关集群')
    return
  }
  showGatewayDrawer.value = true
}


// 选择变化
const handleSelectionChange = (selection) => {
  selectedInDrawer.value = selection
}

// 抽屉确认
const handleDrawerConfirm = (newSelectedGateways) => {
  if (newSelectedGateways.length === 0) {
    ElMessage.warning('请至少选择一个出口网关')
    return
  }
  
  // 合并已有网关，避免重复
  const existingIds = selectedGateways.value.map(g => g.name)
  newSelectedGateways.forEach(gateway => {
    if (!existingIds.includes(gateway.name)) {
      selectedGateways.value.push(gateway)
    }
  })
  
  ElMessage.success('添加成功')
}

// 提交表单
const handleSubmit = async () => {
  // 表单验证
  if (!formData.name || formData.name.trim() === '') {
    ElMessage.warning('请输入名称')
    return
  }
  
  // 验证名称格式
  const namePattern = /^[a-zA-Z0-9_-]+$/
  if (!namePattern.test(formData.name.trim())) {
    ElMessage.warning('名称只能包含字母、数字、中划线和下划线')
    return
  }
  
  if (!formData.gatewayCluster) {
    ElMessage.warning('请选择网关集群')
    return
  }
  
  if (selectedGateways.value.length === 0) {
    ElMessage.warning('请至少添加一个出口网关')
    return
  }
  
  try {
    submitting.value = true
    const clusterName = route.params.clusterName
    
    const createData = {
      name: formData.name.trim(),
      clusterName: clusterName,
      gatewayClusterName: formData.gatewayCluster,
      syncEgressNodes: selectedGateways.value.map(g => g.name)
    }
    
    await createEgressClass(clusterName, createData)
    ElMessage.success('创建成功')
    router.push({ name: 'EgressMapping', params: { clusterName } })
  } catch (error) {
    console.error('创建出口网关映射失败:', error)
    ElMessage.error('创建出口网关映射失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 取消
const handleCancel = () => {
  const clusterName = route.params.clusterName
  router.push({ name: 'EgressMapping', params: { clusterName } })
}
</script>

<style lang="scss" scoped>
.egress-mapping-create {
  min-height: 100%;
  background-color: #FFFFFF;
  padding-bottom: 100px;

  .breadcrumb-wrapper {
    padding: 16px 32px 0;

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

      .title-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .title-name {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
          margin: 0;
        }
      }
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

  .form-content {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .form-item {
      display: flex;
      align-items: flex-start;
      gap: 19px;

      .form-label {
        font-family: 'Inter';
        font-size: 14px;
        font-weight: 400;
        line-height: 22px;
        color: #3D3D3D;
        min-width: 98px;
        padding-top: 5px;

        &.required::before {
          content: '*';
          color: #FF4D4F;
          margin-right: 4px;
        }
      }

      .form-value {
        flex: 1;
      }
    }
  }

  .config-content {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .config-item {
      display: flex;
      align-items: flex-start;
      gap: 19px;

      .config-label {
        font-family: 'Inter';
        font-size: 14px;
        font-weight: 400;
        line-height: 22px;
        color: #3D3D3D;
        min-width: 98px;
        padding-top: 8px;

        &.required::before {
          content: '*';
          color: #FF4D4F;
          margin-right: 4px;
        }
      }

      .config-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      &.nodes-section {
        .config-label {
          padding-top: 0;
        }
      }
    }
  }

  .gateway-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(358px, 1fr));
    gap: 16px;
    width: 100%;

    .gateway-card {
      width: 358px;
      background: #E6F4FF;
      border: 1px solid #69B1FF;
      border-radius: 4px;

      .card-header {
        padding: 8px 20px;
        border-bottom: 1px solid #91CAFF;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .gateway-name {
          font-size: 16px;
          font-weight: 400;
          line-height: 24px;
          color: #303133;
        }

        .close-icon {
          cursor: pointer;
          transition: opacity 0.3s;

          &:hover {
            opacity: 0.8;
          }
        }
      }

      .card-body {
        padding: 16px;

        .gateway-info {
          display: flex;
          align-items: center;
          gap: 24px;
          padding-left: 4px;

          .status-text {
            font-size: 14px;
            color: #3D3D3D;
            text-align: center;
          }

          .gateway-tag {
            font-size: 14px;
            border: none;

            &.primary {
              background-color: #C6E2FF;
              color: #409EFF;
            }

            &.info {
              background-color: #F4F4F5;
              color: #909399;
            }
          }
        }
      }
    }
  }

  .empty-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    background-color: #FAFAFA;
    border: 1px dashed #D9D9D9;
    border-radius: 4px;

    .empty-text {
      font-size: 14px;
      color: #606266;
      margin: 12px 0 4px;
    }

    .empty-hint {
      font-size: 12px;
      color: #909399;
      margin: 0;
    }
  }

  .footer-actions {
    display: flex;
    gap: 24px;
    padding: 0 32px;
    margin-top: 24px;

    .el-button {
      width: 124px;
    }
  }

  // 抽屉样式
  .gateway-selector {
    .selector-tip {
      display: flex;
      align-items: center;
      gap: 4px;
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
      background-color: #67C23A;
    }

    &.dot-error {
      background-color: #EA0000;
    }
  }
}
</style>
