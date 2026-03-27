<template>
  <div class="egress-route-edit">
    <!-- 面包屑 -->
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'EgressRoute' }">出口网关路由</el-breadcrumb-item>
        <el-breadcrumb-item>编辑出口网关路由</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 标题栏 -->
    <div class="title-section">
      <el-button @click="goBack" type="text" class="back-btn">
        <el-icon :size="20"><ArrowLeft /></el-icon>
      </el-button>
        <h1 class="page-title">编辑 {{ originalData?.name || '出口网关路由' }}</h1>
    </div>

    <!-- 步骤条 -->
    <div class="steps-wrapper">
      <el-steps :active="currentStep" align-center process-status="process" finish-status="success">
        <el-step title="修改配置" />
        <el-step title="确认配置" />
      </el-steps>
    </div>

    <!-- 步骤内容 -->
    <div class="content-wrapper">
      <!-- 步骤1: 修改配置 -->
      <div v-if="currentStep === 0" class="step-content">
        <!-- 本集群访问对象 -->
        <AccessObjectsConfig 
          v-model:enable-local-access="formData.enableLocalAccess"
          v-model:access-objects="formData.accessObjects"
        />

        <!-- 跨集群访问对象 - 只有实体网关才能配置 -->
        <CrossClusterConfig 
          v-model:enable-cross-cluster="formData.enableCrossCluster"
          v-model:cross-cluster="crossCluster"
          :is-gateway-mapped="isGatewayMapped"
          :gateway-name="originalData?.egressNode?.name"
          :cluster-options="clusterOptions"
          :mapping-gateway-options="mappingGatewayOptions"
          :namespace-options="namespaceOptions"
          :route-options="routeOptions"
          @target-cluster-change="handleTargetClusterChange"
          @mapping-gateway-change="handleMappingGatewayChange"
          @namespace-change="handleNamespaceChange"
          @navigate-to-create-mapping="navigateToCreateMapping"
          @navigate-to-create-route="navigateToCreateRoute"
        />

        <!-- 底部按钮 -->
        <div class="footer-actions">
          <el-button type="primary" @click="nextStep" :disabled="!canGoNext">
            下一步
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </div>
      </div>

      <!-- 步骤2: 确认配置 -->
      <div v-if="currentStep === 1" class="step-content">
        <!-- 本集群访问对象 -->
        <AccessObjectsDisplay 
          v-if="formData.enableLocalAccess"
          :access-objects="formData.accessObjects"
          title="本集群访问对象"
          variant="detail"
          @view-match="handleViewMatch"
        />

        <!-- 跨集群访问对象 -->
        <CrossClusterDisplay 
          v-if="formData.enableCrossCluster"
          :cross-cluster="crossCluster"
          :gateway-name="originalData?.egressNode?.name"
          title="跨集群访问对象"
          variant="detail"
        />

        <!-- 底部按钮 -->
        <div class="footer-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </div>
      </div>
    </div>

    <!-- 查看匹配对象抽屉 -->
    <MatchingPodsDrawer 
      v-model:visible="matchDrawerVisible"
      :matching-pods="matchTableData"
      size="941px"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, CirclePlus, CircleCloseFilled, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getEgressPolicyDetail, updateEgressPolicy, getPods, getExternalEgressPolicies } from '@/api/egressPolicy'
import { listSyncedEgressNodeName } from '@/api/egressNode'
import { getNamespaces } from '@/api/namespace'
import { useClusterStore } from '@/stores/cluster'
import { useFormValidation } from '@/composables/useFormValidation'
import { useErrorHandler } from '@/composables/useErrorHandler'
import AccessObjectsConfig from '@/components/AccessObjectsConfig.vue'
import CrossClusterConfig from '@/components/CrossClusterConfig.vue'
import MatchingPodsDrawer from '@/components/MatchingPodsDrawer.vue'
import AccessObjectsDisplay from '@/components/AccessObjectsDisplay.vue'
import CrossClusterDisplay from '@/components/CrossClusterDisplay.vue'
  
const router = useRouter()
const route = useRoute()
const clusterStore = useClusterStore()
const { handleError, handleSuccess } = useErrorHandler()
  
const loading = ref(false)
const submitting = ref(false)
const clusterDisplayNames = ref({})
const originalData = ref({})

// 当前步骤
const currentStep = ref(0)

// 使用表单验证逻辑
const { canGoNext, buildTargetsData, buildExternalEgressPolicies } = useFormValidation(formData)

// 表单数据
const formData = ref({
  enableLocalAccess: false,
  enableCrossCluster: false,
  accessObjects: [
    {
      namespaceKey: '',
      namespaceValue: '',
      namespaceSelectors: [],
      podType: 'all',
      podKey: '',
      podValue: '',
      podSelectors: []
    }
  ]
})

  // 跨集群配置
  const crossCluster = ref({
    targetCluster: '',
    mappingGateway: '',
    namespace: '',
    route: ''
  })
  
  // 跨集群选项数据
  const clusterOptions = ref([])
  const mappingGatewayOptions = ref([])
  const namespaceOptions = ref([])
  const routeOptions = ref([])

// 计算当前网关是否为映射网关
const isGatewayMapped = computed(() => {
  return originalData.value?.egressNode?.type === 1
})

// 查看匹配对象抽屉
const matchDrawerVisible = ref(false)
const matchTableData = ref([])

// 表单验证逻辑已移至 useFormValidation composable
  
// 初始化 - 获取路由详情
onMounted(async () => {
  await fetchClusterNames()
  await fetchPolicyDetail()
})

// 获取集群名称映射
const fetchClusterNames = async () => {
  try {
    // 确保集群数据已加载
    await clusterStore.initializeClusters()
    const clusters = clusterStore.clusters
    const nameMap = {}
    clusters.forEach(cluster => {
      nameMap[cluster.name] = cluster.displayName
    })
    clusterDisplayNames.value = nameMap
  } catch (error) {
    handleError(error, '获取集群信息失败')
  }
}

  // 获取路由详情并填充表单
const fetchPolicyDetail = async () => {
  try {
    loading.value = true
    const clusterName = route.params.clusterName
    const namespace = route.params.namespace
    const policyName = route.params.name
    
    const response = await getEgressPolicyDetail(clusterName, namespace, policyName)
    const data = response.data
    
    // 保存原始数据
    originalData.value = data
    // 填充表单数据
    formData.value.enableLocalAccess = !!(data.targets && data.targets.length > 0)
    // 如果是映射网关，不允许配置跨集群访问对象
    if (data.egressNode?.type === 1) {
      formData.value.enableCrossCluster = false
    } else {
      formData.value.enableCrossCluster = !!(data.externalEgressPolicies && data.externalEgressPolicies.length > 0)
    }
    
    // 填充本集群访问对象
    if (data.targets && data.targets.length > 0) {
      formData.value.accessObjects = data.targets.map(target => {
        const namespaceSelectors = Object.entries(target.namespaceMatchLabels || {}).map(([key, value]) => ({
          key,
          value
        }))
        
        let podSelectors = []
        let podType = 'all'
        if (target.podMatchLabels) {
          podType = 'partial'
          podSelectors = Object.entries(target.podMatchLabels).map(([key, value]) => ({
            key,
            value
          }))
        }
        
        return {
          namespaceKey: '',
          namespaceValue: '',
          namespaceSelectors,
          podType,
          podKey: '',
          podValue: '',
          podSelectors
        }
      })
    }
    
    // 填充跨集群访问对象
    if (data.externalEgressPolicies && data.externalEgressPolicies.length > 0) {
      const external = data.externalEgressPolicies[0]
      crossCluster.value = {
        targetCluster: external.clusterName,
        mappingGateway: external.egressNode?.name || '',
        namespace: external.namespace,
        route: external.name
      }
    }
    
  } catch (error) {
    handleError(error, '获取路由详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  const clusterName = route.params.clusterName
  const namespace = route.params.namespace
  const policyName = route.params.name
  
  router.push({
    name: 'EgressRouteDetail',
    params: {
      clusterName,
      namespace,
      name: policyName
    }
  })
}
  
// 处理目标集群选择变化
const handleTargetClusterChange = async (targetClusterName) => {
  // 清空后续选项
  crossCluster.value.mappingGateway = ''
  crossCluster.value.namespace = ''
  crossCluster.value.route = ''
  mappingGatewayOptions.value = []
  namespaceOptions.value = []
  routeOptions.value = []

  if (!targetClusterName) {
    return
  }

  try {
    // 使用已有的原始数据，避免重复API调用
    const currentGatewayName = originalData.value.egressNode?.name
    const currentCluster = route.params.clusterName

    let sourceCluster = ''
    let sourceGatewayName = ''

    if (originalData.value.egressNode?.type === 0) { // 当前路由使用实体网关
      sourceCluster = currentCluster
      sourceGatewayName = currentGatewayName
    } else if (originalData.value.egressNode?.type === 1) { // 当前路由使用映射网关
      // 映射网关命名规则：源集群-源网关
      const parts = currentGatewayName.split('-')
      sourceCluster = parts[0]
      sourceGatewayName = parts.slice(1).join('-')
    } else {
      console.warn('无法识别当前路由的网关类型或名称:', originalData.value.egressNode)
      return
    }

    console.log(`[Edit] 获取映射网关:`, {
      sourceCluster,
      sourceGateway: sourceGatewayName,
      targetCluster: targetClusterName
    })

    // 并行获取映射网关列表和命名空间列表
    const [mappingResponse, namespaceResponse] = await Promise.all([
      listSyncedEgressNodeName(sourceCluster, sourceGatewayName, targetClusterName),
      getNamespaces(targetClusterName)
    ])

    // 设置映射网关选项
    const mappedGatewayNames = mappingResponse.data || []
    mappingGatewayOptions.value = mappedGatewayNames.map(name => ({
      label: name,
      value: name
    }))

    // 设置命名空间选项
    const namespaces = namespaceResponse.data || []
    namespaceOptions.value = namespaces.map(ns => ({
      label: ns.name,
      value: ns.name
    }))

    console.log(`[Edit] 目标集群 "${targetClusterName}" 的映射网关选项:`, mappingGatewayOptions.value)
    console.log(`[Edit] 目标集群 "${targetClusterName}" 的命名空间选项:`, namespaceOptions.value)

  } catch (error) {
    console.error('获取选项失败:', error)
    mappingGatewayOptions.value = []
    namespaceOptions.value = []
  }
}
  
// 处理映射网关选择变化
const handleMappingGatewayChange = (gatewayName) => {
  console.log('[Edit] 映射网关变化:', gatewayName)
  
  // 重置后续选项
  crossCluster.value.namespace = ''
  crossCluster.value.route = ''
  routeOptions.value = []
  
  // 命名空间列表已经在选择目标集群时获取了，这里不需要重新获取
  console.log('[Edit] 可用命名空间:', namespaceOptions.value)
}
  
// 处理命名空间选择变化
const handleNamespaceChange = async (namespace) => {
  crossCluster.value.route = ''

  if (!namespace) {
    routeOptions.value = []
    return
  }

  try {
    const targetCluster = crossCluster.value.targetCluster
    const gatewayName = crossCluster.value.mappingGateway

    // 获取该命名空间下使用该映射网关的路由
    const response = await getExternalEgressPolicies(targetCluster, gatewayName)
    const policies = response.data || []

    // 筛选指定命名空间的路由
    const filteredPolicies = policies.filter(policy => policy.namespace === namespace)

    routeOptions.value = filteredPolicies.map(policy => ({
      label: policy.name,
      value: policy.name
    }))

    console.log('[Edit] 路由选项:', routeOptions.value)
  } catch (error) {
    console.error('获取路由选项失败:', error)
    routeOptions.value = []
  }
}
  
  
// 跳转到新建出口网关映射页面
const navigateToCreateMapping = (targetCluster) => {
  router.push({
    name: 'EgressMappingAdd',
    params: {
      clusterName: targetCluster
    }
  })
}

// 跳转到新建出口路由页面
const navigateToCreateRoute = (targetCluster) => {
  router.push({
    name: 'EgressRouteAdd',
    params: {
      clusterName: targetCluster
    }
  })
}

// 访问对象操作方法已移至 AccessObjectsConfig 组件中

// 下一步
const nextStep = () => {
  if (!canGoNext.value) {
    ElMessage.warning('请完成必填项')
    return
  }
  currentStep.value = 1
}

// 上一步
const prevStep = () => {
  currentStep.value = 0
}

  // 取消
  const handleCancel = () => {
    const clusterName = route.params.clusterName || 'default'
    const namespace = route.params.namespace
    const policyName = route.params.name
    
    router.push({
      name: 'EgressRouteDetail',
      params: {
        clusterName,
        namespace,
        name: policyName
      }
    })
  }
  
  // 提交
  const handleSubmit = async () => {
    try {
      submitting.value = true
      const clusterName = route.params.clusterName
      const namespace = route.params.namespace
      const policyName = route.params.name
      
      // 使用 useFormValidation 构建数据
      const targets = formData.value.enableLocalAccess ? buildTargetsData(formData.value.accessObjects) : null
      const externalEgressPolicies = formData.value.enableCrossCluster ? buildExternalEgressPolicies(crossCluster.value) : []
      
      const updateData = {
        name: originalData.value.name,
        clusterName: originalData.value.clusterName,
        namespace: originalData.value.namespace,
        enable: originalData.value.enable,
        egressNode: originalData.value.egressNode,
        destIPBlocks: originalData.value.destIPBlocks,
        targets,
        externalEgressPolicies
      }
      
      await updateEgressPolicy(clusterName, namespace, policyName, updateData)
      handleSuccess('修改成功')
      
      router.push({
        name: 'EgressRouteDetail',
        params: {
          clusterName,
          namespace,
          name: policyName
        }
      })
    } catch (error) {
      handleError(error, '修改路由失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  }
  
  // 查看匹配对象
  const handleViewMatch = async () => {
    try {
      const clusterName = route.params.clusterName
      
      // 使用 useFormValidation 构建查询参数
      const targets = buildTargetsData(formData.value.accessObjects)
      if (!targets) {
        ElMessage.warning('请先配置访问对象')
        return
      }
      
      const response = await getPods(clusterName, targets)
      const data = response.data || []
      
      matchTableData.value = data.map(pod => ({
        name: pod.name,
        namespace: pod.namespace,
        status: pod.status === 1 ? '正常' : '异常'
      }))
      
      matchDrawerVisible.value = true
    } catch (error) {
      handleError(error, '获取匹配Pod失败')
    }
  }
</script>

<style lang="scss" scoped>
.egress-route-edit {
  min-height: 100%;
  background-color: #FFFFFF;
  padding: 12px;

  .breadcrumb-wrapper {
    padding: 0 0 9px;

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
    align-items: center;
    gap: 8px;
    padding: 0 0 29px;

    .back-btn {
      font-size: 14px;
      color: #303133;
      font-weight: 600;
      padding: 0;
      
      :deep(.el-icon) {
        font-weight: bold;
      }

      &:hover,
      &:active {
        color: #409EFF;
      }
    }

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.88);
      margin: 0;
    }
  }

  .steps-wrapper {
    padding: 0 24px 29px;

    // 当前步骤 - 蓝色
    :deep(.el-step__head.is-process) {
      color: #409EFF;
      border-color: #409EFF;
    }

    :deep(.el-step__title.is-process) {
      color: #409EFF;
    }

    :deep(.el-step__head.is-process .el-step__icon.is-text) {
      border-color: #409EFF;
      background-color: #409EFF;
      color: #FFFFFF;
    }

    // 已完成步骤 - 绿色
    :deep(.el-step__head.is-success) {
      color: #67C23A;
      border-color: #67C23A;
    }

    :deep(.el-step__title.is-success) {
      color: #67C23A;
    }

    :deep(.el-step__head.is-success .el-step__icon) {
      border-color: #67C23A;
      background-color: #67C23A;
      color: #FFFFFF;
    }

    :deep(.el-step__head.is-success .el-step__icon-inner) {
      color: #FFFFFF;
    }

    // 未进行步骤 - 灰色
    :deep(.el-step__head.is-wait) {
      color: #C0C4CC;
      border-color: #C0C4CC;
    }

    :deep(.el-step__title.is-wait) {
      color: #C0C4CC;
    }

    :deep(.el-step__head.is-wait .el-step__icon.is-text) {
      border-color: #C0C4CC;
      color: #C0C4CC;
      background-color: transparent;
    }
  }

  .content-wrapper {
    padding: 0 24px 24px;

    .step-content {
      .config-section {
        margin-bottom: 17px;

        .section-checkbox {
          padding: 0 0 0 4px;
          background-color: #E9E9EB;
          height: 32px;
          display: flex;
          align-items: center;
        }

        .section-title-row {
          padding: 5px 0 5px 4px;
          background-color: #E9E9EB;
          display: flex;
          align-items: center;

          .section-title-text {
            font-size: 14px;
            color: #606266;
          }
        }

        .config-content-wrapper {
          border: 1px solid #DEDFE0;
          border-top: none;
          border-radius: 0 5px 5px;
          padding: 0 0 24px;

          .access-object-section {
            border-bottom: 1px solid #DEDFE0;
            position: relative;
            
            &:last-of-type {
              border-bottom: none;
            }

            .delete-object-icon {
              position: absolute;
              right: 8px;
              top: 8px;
              color: #F56C6C;
              cursor: pointer;
              z-index: 10;

              &:hover {
                color: #F78989;
              }
            }
          }

          .namespace-section,
          .pod-section {
            padding: 0 32px;
            
            &.namespace-section {
              margin-top: 8px;
            }
          }
          
          .pod-section {
            margin-top: 32px;
          }

          .input-row,
          .pod-row {
            display: flex;
            gap: 32px;

            .input-label {
              font-size: 14px;
              color: #3D3D3D;
              white-space: nowrap;
              line-height: 32px;
              min-width: 98px;
            }

            .input-group,
            .pod-config {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 12px;
            }

            .key-value-inputs {
              display: flex;
              gap: 16px;
              align-items: center;

              .input-item {
                display: flex;
                align-items: center;
                gap: 8px;

                .input-item-label {
                  font-size: 14px;
                  color: #3D3D3D;
                  white-space: nowrap;
                }

                :deep(.el-input) {
                  width: 280px;
                }
              }

              .add-icon {
                color: #303133;
                cursor: pointer;
                flex-shrink: 0;

                &:hover {
                  color: #409EFF;
                }
              }
            }

            .tag-list {
              display: flex;
              flex-wrap: wrap;
              gap: 12px 8px;
            }

            .pod-selector-inputs {
              margin-top: 16px;
              
              .input-group {
                display: flex;
                flex-direction: column;
                gap: 12px;
              }
            }
          }

          .add-object-btn {
            width: 100%;
            background-color: #F5F7FA;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            margin-top: 16px;
            gap: 6px;

            .el-icon {
              font-size: 14px;
            }

            span {
              font-size: 14px;
            }
          }
        }
  
  .clickable-link {
    color: #409EFF;
    cursor: pointer;
    text-decoration: underline;
    transition: all 0.3s;
  
    &:hover {
      color: #66b1ff;
    }
  }
  
        .cross-cluster-wrapper {
          padding: 17px 0;

          .cross-cluster-step {
            margin-bottom: 17px;

            .step-header {
              display: flex;
              align-items: center;
              gap: 16px;
              margin-bottom: 8px;

              .step-number {
                width: 22px;
                height: 22px;
                border-radius: 100px;
                border: 1px solid #767676;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                color: #767676;

                &.active {
                  background-color: #79BBFF;
                  border-color: #91CAFF;
                  color: #FFFFFF;
                }
              }

              .step-title {
                font-size: 14px;
                color: #3D3D3D;
              }
            }

            .step-content-area {
              padding-left: 38px;

              .select-row {
                display: flex;
                gap: 32px;
                margin-bottom: 8px;

                :deep(.el-select) {
                  width: 280px;
                }
              }

              .help-text {
                font-size: 14px;
                color: #909399;
              }
            }
          }
        }


      }

      .footer-actions {
        display: flex;
        gap: 16px;
        padding-top: 39px;
      }
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
