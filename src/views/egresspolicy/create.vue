<template>
  <div class="egress-route-create">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="breadcrumb-wrapper">
      <el-breadcrumb-item :to="{ name: 'EgressRoute' }">出口网关路由</el-breadcrumb-item>
      <el-breadcrumb-item>新建出口网关路由</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 标题 -->
    <div class="title-wrapper">
      <el-button type="text" class="back-btn" @click="goBack">
        <el-icon :size="20"><ArrowLeft /></el-icon>
      </el-button>
      <h1 class="gateway-name">新建出口网关路由</h1>
    </div>

    <!-- 步骤条 -->
    <div class="steps-wrapper">
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="基础信息"></el-step>
        <el-step title="填写配置"></el-step>
        <el-step title="确认配置"></el-step>
      </el-steps>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 步骤1:基础信息 -->
      <div v-if="currentStep === 0" class="step-content">
        <!-- 基本信息部分 -->
        <div class="config-section">
          <div class="section-header">
            <el-icon class="section-icon" :size="18"><Menu /></el-icon>
            <h3>基本信息</h3>
          </div>

          <div class="form-content">
            <div class="form-item">
              <label class="form-label">
                <span class="required">*</span>
                名称：
              </label>
              <el-input
                v-model="formData.name"
                placeholder="请输入名称"
                class="form-input"
              />
            </div>

            <div class="form-item">
              <label class="form-label">
                <span class="required">*</span>
                所属集群：
              </label>
              <el-input
                :model-value="clusterDisplayName"
                placeholder="选择集群"
                class="form-input"
                disabled
              />
            </div>

            <div class="form-item">
              <label class="form-label">
                <span class="required">*</span>
                命名空间：
              </label>
              <el-select
                v-model="formData.namespace"
                placeholder="选择命名空间"
                class="form-input"
              >
                <el-option 
                  v-for="ns in availableNamespaces" 
                  :key="ns" 
                  :label="ns" 
                  :value="ns" 
                />
              </el-select>
            </div>
          </div>
        </div>

        <!-- 路由配置部分 -->
        <div class="config-section">
          <div class="section-header">
            <el-icon class="section-icon" :size="18"><Menu /></el-icon>
            <h3>路由配置</h3>
          </div>

          <div class="form-content route-config">
            <div class="form-item">
              <label class="form-label">
                <span class="required">*</span>
                出口网关：
              </label>
              <div class="form-input-with-tip">
                <el-select
                  v-model="formData.gateway"
                  placeholder="请选择出口网关"
                  style="width: 280px"
                >
                  <el-option 
                    v-for="gateway in availableGateways" 
                    :key="gateway.value" 
                    :label="gateway.label" 
                    :value="gateway.value" 
                  />
                </el-select>
                <div class="helper-text">
                  若无可用出口网关，可前往 
                  <el-button type="primary" text @click="goToAddGateway">新建出口网关</el-button>
                </div>
              </div>
            </div>

            <TargetAddressConfig 
              v-model:target-addresses="formData.targetAddresses"
            />

            <div class="form-item">
              <label class="form-label">路由开关：</label>
              <el-switch v-model="formData.enabled" size="large" />
            </div>
          </div>
        </div>

        <div class="footer-actions">
          <el-button type="primary" @click="nextStep" :disabled="!canGoNextStep1">下一步</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </div>
      </div>

      <div v-if="currentStep === 1" class="step-content">
        <div class="config-section">
          <div class="form-content">
            <!-- 配置本集群访问对象 -->
            <AccessObjectsConfig 
              v-model:enable-local-access="formData.configLocalAccess"
              v-model:access-objects="formData.accessObjects"
            />

            <!-- 跨集群访问对象 - 只有实体网关才能配置 -->
            <CrossClusterConfig 
              v-model:enable-cross-cluster="formData.configCrossClusterAccess"
              v-model:cross-cluster="formData.crossCluster"
              :is-gateway-mapped="selectedGatewayType === 1"
              :gateway-name="formData.gateway"
              :cluster-options="crossClusterOptions.clusters"
              :mapping-gateway-options="crossClusterOptions.mappedGateways"
              :namespace-options="crossClusterOptions.namespaces"
              :route-options="crossClusterOptions.routes"
              @target-cluster-change="handleTargetClusterChange"
              @mapping-gateway-change="handleMappedGatewayChange"
              @namespace-change="handleNamespaceChange"
              @navigate-to-create-mapping="goToCreateMapping"
              @navigate-to-create-route="goToCreateRoute"
            />
          </div>
        </div>

        <div class="footer-actions">
            <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep" :disabled="!canGoNextStep2">下一步</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </div>
      </div>

      <!-- 步骤3:确认配置 -->
      <div v-if="currentStep === 2" class="step-content">
        <!-- 基本信息 -->
        <div class="config-section">
          <div class="section-header">
            <el-icon class="section-icon" :size="18"><Menu /></el-icon>
            <h3>基本信息</h3>
          </div>

          <el-descriptions :column="3" class="basic-info-desc">
            <el-descriptions-item label="名称">{{ formData.name }}</el-descriptions-item>
            <el-descriptions-item label="所属集群">{{ clusterDisplayName }}</el-descriptions-item>
            <el-descriptions-item label="命名空间">{{ formData.namespace }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 路由配置 -->
        <div class="config-section">
          <div class="section-header">
            <el-icon class="section-icon" :size="18"><Menu /></el-icon>
            <h3>路由配置</h3>
          </div>

          <div class="route-config-confirm">
            <div class="config-row">
              <div class="config-item-label">出口网关：</div>
              <div class="config-item-value">
                <span>{{ formData.gateway }}</span>
                <el-tag type="primary" size="small" class="gateway-tag">实体</el-tag>
              </div>
            </div>
            <div class="config-row">
              <div class="config-item-label">访问目标地址：</div>
              <div class="config-item-value address-tags-wrapper">
                <el-tag
                  v-for="(address, index) in formData.targetAddresses"
                  :key="index"
                  type="info"
                  size="small"
                  class="address-tag"
                >
                  {{ address }}
                </el-tag>
              </div>
            </div>

            <!-- 本集群访问对象 -->
            <AccessObjectsDisplay 
              v-if="formData.configLocalAccess"
              :access-objects="formData.accessObjects"
              title="本集群访问对象"
              variant="confirm"
              @view-match="showMatchingObjects"
            />

            <!-- 跨集群访问对象 -->
            <CrossClusterDisplay 
              v-if="formData.configCrossClusterAccess"
              :cross-cluster="formData.crossCluster"
              :gateway-name="formData.gateway"
              title="配置跨集群访问对象"
              variant="confirm"
            />
          </div>
        </div>

        <div class="footer-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting" :disabled="submitting">确定</el-button>
          <el-button @click="handleCancel" :disabled="submitting">取消</el-button>
        </div>
      </div>
    </div>

    <!-- 查看匹配对象抽屉 -->
    <MatchingPodsDrawer 
      v-model:visible="matchingDrawerVisible"
      :matching-pods="matchingPods"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Menu} from '@element-plus/icons-vue'
import { createEgressPolicy, getPods, getExternalEgressPolicies } from '@/api/egressPolicy'
import { listEgressNode, listSyncedEgressNodeName } from '@/api/egressNode'
import { getNamespaces } from '@/api/namespace'
import { useClusterStore } from '@/stores/cluster'
import { useFormValidation } from '@/composables/useFormValidation'
import { useErrorHandler } from '@/composables/useErrorHandler'
import AccessObjectsConfig from '@/components/AccessObjectsConfig.vue'
import CrossClusterConfig from '@/components/CrossClusterConfig.vue'
import TargetAddressConfig from '@/components/TargetAddressConfig.vue'
import MatchingPodsDrawer from '@/components/MatchingPodsDrawer.vue'
import AccessObjectsDisplay from '@/components/AccessObjectsDisplay.vue'
import CrossClusterDisplay from '@/components/CrossClusterDisplay.vue'

const router = useRouter()
const route = useRoute()
const clusterStore = useClusterStore()
const { handleError, handleSuccess, handleWarning } = useErrorHandler()

const currentStep = ref(0)
const matchingDrawerVisible = ref(false)
const submitting = ref(false)

// 可用数据
const availableNamespaces = ref([])
const availableGateways = ref([])
const clusterDisplayName = ref()

// 跨集群配置的选项数据
const crossClusterOptions = reactive({
  clusters: [], // 可选的目标集群列表
  mappedGateways: [], // 当前网关在目标集群的映射实例
  namespaces: [], // 目标集群的命名空间列表
  routes: [] // 映射网关的路由列表
})

const formData = reactive({
  // 基础信息
  name: '',
  cluster: '',
  namespace: '',

  // 路由配置
  gateway: '',
  gatewayType: 0,
  targetCIDR: '',
  blockCIDR: '',
  targetAddresses: [], // 存储已添加的地址标签
  enabled: true,

  // 本集群访问对象
  configLocalAccess: false,
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
  ],

  // 跨集群访问对象
  configCrossClusterAccess: false,
  crossCluster: {
    targetCluster: '',
    mappedGateway: '',
    namespace: '',
    egressRoute: ''
  }
})

const matchingPods = ref([])

// 使用表单验证逻辑
const formDataRef = computed(() => formData)
const { canGoNextStep1, canGoNextStep2, buildTargetsData, buildExternalEgressPolicies, buildDestIPBlocks } = useFormValidation(formDataRef)

// 计算当前选择的网关类型
const selectedGatewayType = computed(() => {
  if (!formData.gateway) return null
  const gateway = availableGateways.value.find(g => g.value === formData.gateway)
  return gateway ? gateway.type : null
})

// 监听网关选择变化，更新网关类型
watch(() => formData.gateway, (newGateway) => {
  if (newGateway) {
    const gateway = availableGateways.value.find(g => g.value === newGateway)
    if (gateway) {
      formData.gatewayType = gateway.type
      // 如果选择的是映射网关（type: 1），自动取消跨集群配置
      if (gateway.type === 1) {
        formData.configCrossClusterAccess = false
      }
    }
  }
})

// 获取集群名称
const fetchClusterName = async () => {
  try {
    // 确保集群数据已加载
    await clusterStore.initializeClusters()
    const clusters = clusterStore.clusters
    const clusterName = route.params.clusterName
    clusterDisplayName.value = clusterStore.getClusterDisplayName(clusterName)
    formData.cluster = clusterName
    
    // 同时初始化跨集群配置的集群选项（排除当前集群）
    crossClusterOptions.clusters = clusters
      .filter(c => c.name !== clusterName)
      .map(c => ({
        value: c.name,
        label: c.displayName
      }))
  } catch (error) {
    handleError(error, '获取集群信息失败')
  }
}

// 获取可用网关列表
const fetchAvailableGateways = async () => {
  try {
    const clusterName = route.params.clusterName
    const response = await listEgressNode(clusterName)
    const data = response.data || []
    
    availableGateways.value = data.map(item => ({
      value: item.name,
      label: item.name,
      type: item.type
    }))
  } catch (error) {
    handleError(error, '获取可用网关列表失败')
  }
}

// 初始化
onMounted(async () => {
  await fetchClusterName()
  await fetchAvailableGateways()
})

// 监听集群变化
watch(() => route.params.clusterName, async () => {
  await fetchClusterName()
  await fetchAvailableGateways()
  // 重置表单
  Object.assign(formData, {
    name: '',
    cluster: route.params.clusterName,
    namespace: '',
    gateway: '',
    gatewayType: 0,
    targetCIDR: '',
    blockCIDR: '',
    targetAddresses: [],
    enabled: true,
    configLocalAccess: false,
    accessObjects: [{
      namespaceKey: '',
      namespaceValue: '',
      namespaceSelectors: [],
      podType: 'all',
      podKey: '',
      podValue: '',
      podSelectors: []
    }],
    configCrossClusterAccess: false,
    crossCluster: {
      targetCluster: '',
      mappedGateway: '',
      namespace: '',
      egressRoute: ''
    }
  })
  currentStep.value = 0
})

// 表单验证逻辑已移至 useFormValidation composable

const goBack = () => {
  router.back()
}

const nextStep = () => {
  // 第一步验证
  if (currentStep.value === 0) {
    if (!formData.name || !formData.name.trim()) {
      ElMessage.warning('请输入名称')
      return
    }
    if (!formData.cluster) {
      ElMessage.warning('请选择所属集群')
      return
    }
    if (!formData.namespace) {
      ElMessage.warning('请选择命名空间')
      return
    }
    if (!formData.gateway) {
      ElMessage.warning('请选择出口网关')
      return
    }
    // 检查是否有已添加的目标地址，或者输入框中有待添加的地址
    if (formData.targetAddresses.length === 0 && (!formData.targetCIDR || !formData.targetCIDR.trim())) {
      ElMessage.warning('请添加至少一个访问目标地址')
      return
    }
    // 如果输入框中有内容但还没添加，提示用户先添加
    if (formData.targetCIDR && formData.targetCIDR.trim() && formData.targetAddresses.length === 0) {
      ElMessage.warning('请点击添加按钮将目标地址添加到列表')
      return
    }
  }

  // 第二步验证
  if (currentStep.value === 1) {
    // 如果勾选了本集群访问对象，需要验证至少有一个命名空间选择器
    if (formData.configLocalAccess) {
      const hasValidAccessObject = formData.accessObjects.some(obj => 
        obj.namespaceSelectors.length > 0
      )
      if (!hasValidAccessObject) {
        ElMessage.warning('配置本集群访问对象时，至少需要添加一个命名空间选择器')
        return
      }
    }

    // 如果勾选了跨集群访问对象，需要验证所有字段都已选择
    if (formData.configCrossClusterAccess) {
      if (!formData.crossCluster.targetCluster) {
        ElMessage.warning('请选择目标集群')
        return
      }
      if (!formData.crossCluster.mappedGateway) {
        ElMessage.warning('请选择映射网关')
        return
      }
      if (!formData.crossCluster.namespace) {
        ElMessage.warning('请选择命名空间')
        return
      }
      if (!formData.crossCluster.egressRoute) {
        ElMessage.warning('请选择出口路由')
        return
      }
    }

    // 至少需要配置一个访问对象
    if (!formData.configLocalAccess && !formData.configCrossClusterAccess) {
      ElMessage.warning('请至少配置一个访问对象（本集群或跨集群）')
      return
    }
  }

  if (currentStep.value < 2) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleCancel = () => {
  const clusterName = route.params.clusterName
  router.push({ 
    name: 'EgressRoute',
    params: { clusterName }
  })
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    const clusterName = route.params.clusterName
    
    // 使用 useFormValidation 构建数据
    const destIPBlocks = buildDestIPBlocks(formData.targetAddresses)
    const targets = formData.configLocalAccess ? buildTargetsData(formData.accessObjects) : null
    const externalEgressPolicies = formData.configCrossClusterAccess ? buildExternalEgressPolicies(formData.crossCluster) : []
    
    // 获取网关类型
    const selectedGateway = availableGateways.value.find(g => g.value === formData.gateway)
    
    const requestData = {
      name: formData.name,
      clusterName: clusterName,
      namespace: formData.namespace,
      enable: formData.enabled,
      egressNode: {
        name: formData.gateway,
        type: selectedGateway?.type || 0
      },
      destIPBlocks,
      targets,
      externalEgressPolicies
    }
    
    await createEgressPolicy(clusterName, formData.namespace, requestData)
    handleSuccess('创建成功')
    router.push({ 
      name: 'EgressRoute',
      params: { clusterName }
    })
  } catch (error) {
    handleError(error, '创建出口路由失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 访问对象和目标地址的操作方法已移至对应组件中

const goToAddGateway = () => {
  const clusterName = route.params.clusterName
  router.push({ 
    name: 'EgressNodeAdd',
    params: { clusterName }
  })
}

const showMatchingObjects = async () => {
  try {
    const clusterName = route.params.clusterName
    
    // 使用 useFormValidation 构建查询参数
    const targets = buildTargetsData(formData.accessObjects)
    if (!targets) {
      ElMessage.warning('请先配置访问对象')
      return
    }
    
    const response = await getPods(clusterName, targets)
    const data = response.data || []
    
    // 转换数据格式
    matchingPods.value = data.map(pod => ({
      name: pod.name,
      namespace: pod.namespace,
      status: pod.status === 1 ? '运行中' : '异常'
    }))
    
    matchingDrawerVisible.value = true
  } catch (error) {
    handleError(error, '获取匹配Pod失败')
  }
}

// 处理目标集群变化
const handleTargetClusterChange = async (targetCluster) => {
  console.log('[Create] 目标集群变化:', targetCluster)
  
  // 重置后续选项
  formData.crossCluster.mappedGateway = ''
  formData.crossCluster.namespace = ''
  formData.crossCluster.egressRoute = ''
  crossClusterOptions.mappedGateways = []
  crossClusterOptions.namespaces = []
  crossClusterOptions.routes = []
  
  if (!targetCluster || !formData.gateway) {
    return
  }
  
  try {
    const currentCluster = route.params.clusterName
    const currentGateway = formData.gateway
    
    console.log('[Create] 获取映射网关:', {
      sourceCluster: currentCluster,
      sourceGateway: currentGateway,
      targetCluster: targetCluster
    })
    
    const response = await listSyncedEgressNodeName(currentCluster, currentGateway, targetCluster)
    const mappedGatewayNames = response.data || []
    
    crossClusterOptions.mappedGateways = mappedGatewayNames.map(name => ({
      value: name,
      label: name
    }))
    
    console.log('[Create] 可用映射网关:', crossClusterOptions.mappedGateways)
    
    // 同时获取目标集群的命名空间列表
    try {
      const namespaceResponse = await getNamespaces(targetCluster)
      const namespaces = namespaceResponse.data || []
      
      crossClusterOptions.namespaces = namespaces.map(ns => ({
        value: ns.name,
        label: ns.name
      }))
      
      console.log('[Create] 可用命名空间:', crossClusterOptions.namespaces)
    } catch (namespaceError) {
      console.error('获取命名空间列表失败:', namespaceError)
      // 命名空间获取失败不影响映射网关的选择，只记录错误
    }
    
  } catch (error) {
    console.error('获取映射网关列表失败:', error)
    ElMessage.error('获取映射网关列表失败')
  }
}

// 处理映射网关变化
const handleMappedGatewayChange = (mappedGateway) => {
  console.log('[Create] 映射网关变化:', mappedGateway)
  
  // 重置后续选项
  formData.crossCluster.namespace = ''
  formData.crossCluster.egressRoute = ''
  crossClusterOptions.routes = []
}

// 处理命名空间变化
const handleNamespaceChange = async (namespace) => {
  console.log('[Create] 命名空间变化:', namespace)
  
  // 重置路由选项
  formData.crossCluster.egressRoute = ''
  crossClusterOptions.routes = []
  
  if (!namespace || !formData.crossCluster.mappedGateway || !formData.crossCluster.targetCluster) {
    return
  }
  
  try {
    // 获取该命名空间下使用映射网关的路由列表
    const targetCluster = formData.crossCluster.targetCluster
    const mappedGateway = formData.crossCluster.mappedGateway
    
    const response = await getExternalEgressPolicies(targetCluster, mappedGateway, namespace)
    const routes = response.data || []
    
    crossClusterOptions.routes = routes.map(r => ({
      value: r.name,
      label: r.name
    }))
    
    console.log('[Create] 可用路由:', crossClusterOptions.routes)
  } catch (error) {
    console.error('获取路由列表失败:', error)
    ElMessage.error('获取路由列表失败')
  }
}

// 跳转到新建出口网关映射页面
const goToCreateMapping = (targetCluster) => {
  router.push({
    name: 'EgressMappingAdd',
    params: { clusterName: targetCluster }
  })
}

// 跳转到新建出口路由页面
const goToCreateRoute = (targetCluster) => {
  router.push({
    name: 'EgressRouteAdd',
    params: { clusterName: targetCluster }
  })
}
</script>

<style lang="scss" scoped>
.egress-route-create {
  min-height: 100%;
  background-color: #FFFFFF;

  .breadcrumb-wrapper {
    padding: 8px 32px 0;

    :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
      color: #909399;
      font-weight: 400;
    }

    :deep(.el-breadcrumb__item) {
      .el-breadcrumb__inner {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        transition: color 0.3s;

        &:hover {
          color: #409EFF;
        }
      }

      &:last-child .el-breadcrumb__inner {
        color: #909399;
        font-weight: 400;

        &:hover {
          color: #909399;
        }
      }
    }
  }

  .title-wrapper {
    padding: 4px 32px 0 24px;
    display: flex;
    align-items: center;
    gap: 8px;

    .back-btn {
      padding: 0;
      font-size: 20px;
      color: #303133;

      &:hover {
        color: #409EFF;
      }

      &:active {
        color: #337ECC;
      }

      :deep(.el-icon) {
        font-size: 20px;
      }
    }

    .gateway-name {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }
  }

  .steps-wrapper {
    padding: 29px 12px;

    :deep(.el-steps) {
      .el-step {
        flex: 1;
        
        .el-step__head {
          padding-right: 12px;
          
          &.is-process {
            color: #409EFF;
            border-color: #409EFF;
            
            .el-step__icon {
              border: 2px solid #409EFF;
              background: #409EFF;
              
              &.is-text {
                color: #FFFFFF;
              }
            }
            
            .el-step__line {
              background-color: #A8ABB2;
            }
          }
          
          &.is-success {
            color: #67C23A;
            border-color: #67C23A;
            
            .el-step__icon {
              border: 2px solid #67C23A;
              background: #67C23A;
              color: #FFFFFF;
              
              .el-step__icon-inner {
                color: #FFFFFF;
              }
            }
            
            .el-step__line {
              background-color: #67C23A;
            }
          }
          
          &.is-wait {
            color: #C0C4CC;
            border-color: #C0C4CC;
            
            .el-step__icon {
              border: 2px solid #A8ABB2;
              background: #FFFFFF;
              
              &.is-text {
                color: #A8ABB2;
              }
            }
            
            .el-step__line {
              background-color: #A8ABB2;
            }
          }
          
          .el-step__icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            
            &.is-text {
              font-size: 14px;
            }
          }
        }
        
        .el-step__title {
          font-size: 14px;
          font-weight: 600;
          margin-top: 0;
          padding-top: 1px;
          
          &.is-process {
            color: #409EFF;
          }
          
          &.is-success {
            color: #67C23A;
          }
          
          &.is-wait {
            color: #909399;
          }
        }
        
        .el-step__main {
          margin-left: 12px;
        }
      }
    }
  }

  .content-wrapper {
    padding: 0 0 100px;
  }

  .step-content {
    .config-section:first-child {
      padding: 24px 32px;
    }

    .config-section:not(:first-child) {
      padding: 0 32px 24px;
    }
  }

  .config-section {

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;

      .section-icon {
        color: #409EFF;
        font-size: 18px;
      }

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
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

          .required {
            color: #FF4D4F;
            margin-right: 4px;
          }
        }

        .form-input {
          width: 320px;
        }

        .form-input-with-tip {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .helper-text {
            font-size: 14px;
            color: #3D3D3D;
          }
        }
      }

    }
  }

  // 确认配置页面样式
  .basic-info-desc {
    padding: 0 32px;
    
    :deep(.el-descriptions__label) {
      font-size: 14px;
      color: #303133;
      font-weight: 400;
    }
    
    :deep(.el-descriptions__content) {
      font-size: 14px;
      color: #606266;
    }
  }

  .route-config-confirm {
    padding: 0 32px;
    display: flex;
    flex-direction: column;
    gap: 17px;

    .config-row {
      display: flex;
      align-items: center;
      gap: 13px;

      .config-item-label {
        font-size: 14px;
        color: #3D3D3D;
        text-align: right;
      }

      .config-item-value {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #3D3D3D;

        .gateway-tag {
          background-color: #C6E2FF;
          color: #409EFF;
          border: none;
        }

        .address-tags-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .address-tag {
          background-color: #F4F4F5;
          color: #909399;
          border: none;
        }
      }
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
}
</style>
