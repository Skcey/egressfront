<template>
  <div class="egress-route-detail">
    <!-- 面包屑 -->
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'EgressRoute' }">出口网关路由</el-breadcrumb-item>
        <el-breadcrumb-item>出口网关路由详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 标题栏 -->
    <div class="title-section">
      <div class="title-left">
        <el-button @click="goBack" type="text" class="back-btn">
          <el-icon :size="20"><ArrowLeft /></el-icon>
        </el-button>
        <div class="gateway-info">
          <h1 class="gateway-name">{{ routeData.name }}</h1>
          <span class="status-display">
            <span 
              class="status-dot" 
              :class="{ 
                'dot-normal': routeData.status === '正常', 
                'dot-error': routeData.status === '异常'
              }"
            ></span>
            {{ routeData.status }}
          </span>
        </div>
      </div>
      <div class="title-actions">
        <el-switch v-model="routeData.enabled" @change="handleSwitchChange" />
        <el-button type="danger" @click="handleDelete">删除</el-button>
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
          <span>{{ routeData.name }}</span>
        </div>
        <div class="info-item">
          <label>所属集群：</label>
          <span>{{ routeData.cluster }}</span>
        </div>
        <div class="info-item">
          <label>命名空间：</label>
          <span>{{ routeData.namespace }}</span>
        </div>
        <div class="info-item">
          <label>状态：</label>
          <span class="status-display">
            <span 
              class="status-dot" 
              :class="{ 
                'dot-normal': routeData.status === '正常', 
                'dot-error': routeData.status === '异常'
              }"
            ></span>
            {{ routeData.status }}
          </span>
        </div>
        <div class="info-item">
          <label>创建时间：</label>
          <span>{{ routeData.createTime }}</span>
        </div>
      </div>
    </div>

    <!-- 路由配置 -->
    <div class="config-section">
      <div class="section-header">
        <div class="section-title">
          <el-icon class="section-icon"><Menu /></el-icon>
          <h3>路由配置</h3>
        </div>
        <el-button type="primary" text @click="handleEdit">编辑</el-button>
      </div>
      <div class="config-content">
        <!-- 出口网关 -->
        <div class="config-row">
          <span class="config-label">出口网关：</span>
          <span
            class="config-value gateway-link"
            data-gateway-link="true"
            @click="navigateToEgressNode"
            :title="`点击查看 ${routeData.gateway} 详情`"
            style="color: #333;"
          >
            {{ routeData.gateway }}
          </span>
          <el-tag type="primary" size="small" style="margin-left: 13px">{{ routeData.gatewayType }}</el-tag>
        </div>

        <!-- 访问目标地址 -->
        <div class="config-row">
          <span class="config-label">访问目标地址：</span>
                        <el-tag
            v-for="(addr, index) in routeData.targetAddress" 
                          :key="index"
                          size="small"
                          type="info"
            style="margin-right: 8px"
                        >
            {{ addr }}
                        </el-tag>
                      </div>

        <!-- 本集群访问对象/跨集群访问对象 -->
        <div class="config-tabs" v-if="routeData.localAccess.hasData || routeData.crossCluster.hasData">
          <el-tabs v-model="activeTab" type="card">
            <!-- 本集群访问对象 -->
            <el-tab-pane v-if="routeData.localAccess.hasData" label="本集群访问对象" name="local">
              <AccessObjectsDisplay 
                :access-objects="routeData.localAccess.objects"
                :show-title="false"
                variant="tab"
                @view-match="handleViewMatch"
              />
            </el-tab-pane>

            <!-- 跨集群访问对象 -->
            <el-tab-pane v-if="routeData.crossCluster.hasData" label="跨集群访问对象" name="cross">
              <div class="tab-content">
                <div v-if="routeData.crossCluster.hasData">
                <div class="cross-cluster-header">
                  <span class="header-text">关联跨集群网关映射实例下出口路由</span>
                </div>

                <div class="cross-cluster-section">
                  <!-- 关联的出口路由卡片 -->
                  <div class="route-card">
                    <div class="route-card-header">
                      <div class="route-name-row">
                        <span
                          class="route-name cross-route-link"
                          @click="navigateToCrossRoute"
                          :title="`点击查看 ${routeData.crossCluster.routeName} 详情`"
                          style="cursor: pointer; user-select: none;"
                        >
                          {{ routeData.crossCluster.routeName }}
                        </span>
                        <span class="status-display" style="margin-left: 14px">
                          <span class="status-dot dot-normal"></span>
                          正常
                        </span>
                      </div>
                    </div>
                    <div class="route-card-body">
                      <div class="card-info-item">
                        <span class="info-label">所属出口网关</span>
                        <div class="info-value">
                          <span
                            class="cross-gateway-link"
                            @click="navigateToCrossGateway"
                            :title="`点击查看 ${routeData.crossCluster.gateway} 详情`"
                            style="cursor: pointer; user-select: none;"
                          >
                            {{ routeData.crossCluster.gateway }}
                          </span>
                          <el-tag type="warning" size="small" style="margin-left: 6px">映射</el-tag>
                        </div>
                      </div>
                      <div class="card-info-item">
                        <span class="info-label">所在集群</span>
                        <span class="info-value">{{ routeData.crossCluster.cluster }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- 生效访问目标地址 -->
                  <div class="effective-address">
                    <div class="effective-row">
                      <span class="effective-label">生效访问目标地址：</span>
                      <el-tag size="small" type="info">{{ routeData.crossCluster.effectiveAddress }}</el-tag>
                    </div>
                    <el-tag type="warning" size="small" class="warning-tip">
                      生效访问目标地址为 当前出口路由 与 关联映射网关的出口路由 共同配置的访问地址
                    </el-tag>
                  </div>

                  <!-- 生效对象 -->
                  <div class="effective-objects">
                    <span class="objects-label">生效对象：</span>
                  </div>

                  <!-- 访问对象列表 -->
                  <div 
                    v-for="(obj, index) in routeData.crossCluster.objects" 
                            :key="index"
                    class="access-section"
                  >
                    <div class="access-row">
                      <div class="access-item">
                        <span class="access-label">命名空间选择器</span>
                        <div class="tag-group">
                          <el-tag
                            v-for="(tag, tagIndex) in obj.namespaceSelectors"
                            :key="tagIndex"
                            size="small"
                            type="info"
                          >
                            {{ tag }}
                          </el-tag>
                        </div>
                      </div>
                      <div class="access-item">
                        <span class="access-label">Pod</span>
                        <div class="pod-content">
                          <span class="pod-type">{{ obj.podSelectors.includes('全部Pod') ? '全部Pod' : '部分Pod' }}</span>
                          <div class="tag-group" v-if="!obj.podSelectors.includes('全部Pod')">
                            <el-tag
                              v-for="(tag, tagIndex) in obj.podSelectors"
                              :key="tagIndex"
                              size="small"
                              type="info"
                            >
                              {{ tag }}
                            </el-tag>
                          </div>
                        </div>
                      </div>
                    </div>
                    <el-link type="primary" @click="handleViewMatch('cross', index)">查看匹配对象</el-link>
                  </div>
                  
                </div>
                </div>

                <!-- 无数据提示 -->
                <el-empty v-else description="暂无跨集群访问对象" />
              </div>
            </el-tab-pane>
          </el-tabs>
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Menu } from '@element-plus/icons-vue'
import { getEgressPolicyDetail, toggleEgressPolicy, deleteEgressPolicy, getPods } from '@/api/egressPolicy'
import { useClusterStore } from '@/stores/cluster'
import { useErrorHandler } from '@/composables/useErrorHandler'
import MatchingPodsDrawer from '@/components/MatchingPodsDrawer.vue'
import AccessObjectsDisplay from '@/components/AccessObjectsDisplay.vue'

const router = useRouter()
const route = useRoute()
const clusterStore = useClusterStore()
const { handleError, handleSuccess, handleWarning, showDeleteConfirm } = useErrorHandler()

const loading = ref(false)
const clusterDisplayNames = ref({})

const routeData = ref({
  name: '',
  status: '',
  cluster: '',
  namespace: '',
  createTime: '',
  gateway: '',
  gatewayType: '',
  targetAddress: [],
  enabled: true,
  localAccess: {
    hasData: false,
    objects: []
  },
  crossCluster: {
    hasData: false,
    routeName: '',
    gateway: '',
    cluster: '',
    clusterName: '', // 原始集群名称，用于路由跳转
    namespace: '', // 跨集群路由的命名空间
    effectiveAddress: [],
    objects: []
  }
})

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

const formatStatus = (status) => {
  return status === 1 ? '正常' : '异常'
}

const formatGatewayType = (type) => {
  return type === 0 ? '实体' : '映射'
}

// 格式化 destIPBlocks
const formatDestIPBlocks = (blocks) => {
  if (!blocks || blocks.length === 0) return []
  return blocks.map(block => {
    let text = block.cidr
    if (block.except && block.except.length > 0) {
      text += ' 屏蔽 ' + block.except.join(', ')
    }
    return text
  })
}

// 格式化标签选择器
const formatLabels = (labels) => {
  if (!labels) return []
  return Object.entries(labels).map(([key, value]) => `${key} = ${value}`)
}

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

// 获取路由详情
const fetchPolicyDetail = async () => {
  try {
    loading.value = true
    const clusterName = route.params.clusterName
    const namespace = route.params.namespace
    const policyName = route.params.name
    const response = await getEgressPolicyDetail(clusterName, namespace, policyName)
    const data = response.data
    // 处理基本信息
    routeData.value = {
      name: data.name,
      status: formatStatus(data.status),
      cluster: data.clusterDisplayName,
      namespace: data.namespace,
      createTime: formatTime(data.createTime),
      gateway: data.egressNode?.name || '--',
      gatewayType: formatGatewayType(data.egressNode?.type || 0),
      targetAddress: formatDestIPBlocks(data.destIPBlocks),
      enabled: data.enable,
      localAccess: {
        hasData: false,
        objects: []
      },
      crossCluster: {
        hasData: false,
        routeName: '',
        gateway: '',
        cluster: '',
        effectiveAddress: [],
        objects: []
      }
    }
    
    // 处理本集群访问对象
    if (data.targets && data.targets.length > 0) {
      routeData.value.localAccess.hasData = true
      routeData.value.localAccess.objects = data.targets.map(target => ({
        namespaceSelectors: formatLabels(target.namespaceMatchLabels),
        podSelectors: target.podMatchLabels ? formatLabels(target.podMatchLabels) : ['全部Pod']
      }))
    }
    
    // 处理跨集群访问对象
    if (data.externalEgressPolicies && data.externalEgressPolicies.length > 0) {
      const external = data.externalEgressPolicies[0]
      routeData.value.crossCluster.hasData = true
      routeData.value.crossCluster.routeName = external.name
      routeData.value.crossCluster.gateway = external.egressNode?.name || '--'
      routeData.value.crossCluster.cluster = external.clusterDisplayName
      routeData.value.crossCluster.clusterName = external.clusterName // 保存原始集群名称用于跳转
      routeData.value.crossCluster.namespace = external.namespace // 保存跨集群路由的命名空间
      routeData.value.crossCluster.effectiveAddress = formatDestIPBlocks(external.realIPBlocks || [])
      
      if (external.targets && external.targets.length > 0) {
        routeData.value.crossCluster.objects = external.targets.map(target => ({
          namespaceSelectors: formatLabels(target.namespaceMatchLabels),
          podSelectors: target.podMatchLabels ? formatLabels(target.podMatchLabels) : ['全部Pod']
        }))
      }
    }
    
    // 设置默认激活的 tab
    if (routeData.value.localAccess.hasData) {
      activeTab.value = 'local'
    } else if (routeData.value.crossCluster.hasData) {
      activeTab.value = 'cross'
    }

  } catch (error) {
    handleError(error, '获取路由详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 跳转到跨集群路由详情页
const navigateToCrossRoute = async () => {
  const crossClusterName = routeData.value.crossCluster.clusterName
  const routeNamespace = routeData.value.crossCluster.namespace
  const routeName = routeData.value.crossCluster.routeName
  
  console.log('[Detail] 跳转到跨集群路由:', {
    clusterName: crossClusterName,
    namespace: routeNamespace,
    routeName: routeName
  })

  try {
    await router.push({
      name: 'EgressRouteDetail',
      params: {
        clusterName: crossClusterName,
        namespace: routeNamespace, 
        name: routeName
      }
    })
  } catch (err) {
    console.error('[Detail] 路由跳转失败:', err)
  }
}

// 跳转到跨集群网关详情页
const navigateToCrossGateway = async () => {
  const crossClusterName = routeData.value.crossCluster.clusterName
  const gatewayName = routeData.value.crossCluster.gateway
  
  try {
    await router.push({
      name: 'EgressNodeDetail',
      params: {
        clusterName: crossClusterName,
        name: gatewayName
      }
    })
  } catch (err) {
    console.error('[Detail] 网关跳转失败:', err)
  }
}

// 当前激活的标签页
const activeTab = ref('local')

// 查看匹配对象抽屉
const matchDrawerVisible = ref(false)
const matchTableData = ref([])

// 初始化
onMounted(async () => {
  await fetchClusterNames()
  await fetchPolicyDetail()
})

// 返回
const goBack = () => {
  const clusterName = route.params.clusterName
  router.push({ 
    name: 'EgressRoute',
    params: { clusterName }
  })
}

// 开关变更
const handleSwitchChange = async (value) => {
  try {
    const clusterName = route.params.clusterName
    const namespace = route.params.namespace
    const policyName = route.params.name
    
    await toggleEgressPolicy(clusterName, namespace, policyName, value)
    routeData.value.status = value ? '正常' : '异常'
    handleSuccess(value ? '路由已开启' : '路由已关闭')
  } catch (error) {
    // 恢复开关状态
    routeData.value.enabled = !value
    handleError(error, '切换路由开关失败，请稍后重试')
  }
}

// 删除
const handleDelete = async () => {
  try {
    await showDeleteConfirm(routeData.value.name, '路由')
    
    const clusterName = route.params.clusterName
    const namespace = route.params.namespace
    const policyName = route.params.name
    
    await deleteEgressPolicy(clusterName, namespace, policyName)
    handleSuccess('删除成功')
    
    router.push({ 
      name: 'EgressRoute',
      params: { clusterName }
    })
  } catch (error) {
    if (error === 'cancel') {
      console.log('取消删除')
      return
    }
    
    handleError(error, '删除路由失败，请稍后重试', true)
  }
}

// 编辑
const handleEdit = () => {
  const clusterName = route.params.clusterName
  const namespace = route.params.namespace
  const policyName = route.params.name
  
  router.push({ 
    name: 'EgressRouteEdit',
    params: { 
      clusterName,
      namespace,
      name: policyName
    }
  })
}

// 跳转到出口网关详情页
const navigateToEgressNode = () => {
  if (!routeData.value.gateway) return
  
  const clusterName = route.params.clusterName
  const gatewayName = routeData.value.gateway
  router.push({
    name: 'EgressNodeDetail',
    params: {
      clusterName,
      name: gatewayName
    }
  })
}

// 查看匹配对象
const handleViewMatch = async (type, index = null) => {
  try {
    const clusterName = route.params.clusterName
    let targets = []

     // 辅助函数：将对象转换为 target 格式
     const convertObjToTarget = (obj) => {
      const namespaceMatchLabels = {}
      obj.namespaceSelectors.forEach(selector => {
        const [key, value] = selector.split(' = ')
        namespaceMatchLabels[key.trim()] = value.trim()
      })
      
      let podMatchLabels = null
      if (obj.podSelectors[0] !== '全部Pod') {
        podMatchLabels = {}
        obj.podSelectors.forEach(selector => {
          const [key, value] = selector.split(' = ')
          podMatchLabels[key.trim()] = value.trim()
        })
      }
      
      return {
        namespaceMatchLabels,
        podMatchLabels
      }
    }

    // 根据type和index选择对应的targets
    if (type === 'local' && routeData.value.localAccess.hasData) {
      const objects = index !== null 
        ? [routeData.value.localAccess.objects[index]] 
        : routeData.value.localAccess.objects
      targets = objects.filter(obj => obj).map(convertObjToTarget)
    } else if (type === 'cross' && routeData.value.crossCluster.hasData) {
      const objects = index !== null 
        ? [routeData.value.crossCluster.objects[index]] 
        : routeData.value.crossCluster.objects
      targets = objects.filter(obj => obj).map(convertObjToTarget)
    }
    
    if (targets.length === 0) {
      handleWarning('没有可用的访问对象')
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
.egress-route-detail {
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
      }
    }

    .title-actions {
      display: flex;
      align-items: center;
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
      }
    }
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
      background-color: #67C23A; // 绿色
    }

    &.dot-error {
      background-color: #EA0000; // 红色
    }
  }
  .cross-gateway-link {
    color: #3D3D3D;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: #409EFF !important;
      text-decoration: underline;
    }
  }

  .config-content {
    .config-row {
      margin-bottom: 16px;
      font-size: 14px;

      .config-label {
        color: #606266;
        font-weight: 500;
      }

      .config-value {
        color: #303133;
        margin-left: 4px;
      }

      :deep(.config-value.gateway-link) {
          color: #333 !important;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            color: #409EFF !important;
            text-decoration: underline;
          }
        }
      }

      :deep(.config-value.gateway-link) {
        color: #333 !important;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          color: #409EFF !important;
          text-decoration: underline;
        }
      }

      :deep([data-gateway-link]) {
        color: #333 !important;

        &:hover {
          color: #409EFF !important;
        }
      }
    }

    .config-tabs {
      :deep(.el-tabs) {
        .el-tabs__header {
          margin: 0;
        }

        .el-tabs__item {
          padding: 8px 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .el-tabs__content {
          border: 1px solid #DEDFE0;
          border-top: none;
          border-radius: 0 5px 5px;
          padding: 8px;
        }
      }

      .tab-content {
        .cross-cluster-header {
          padding: 0;
          margin-bottom: 8px;

          .header-text {
            font-size: 14px;
            color: #3D3D3D;
          }
        }

        .cross-cluster-section {
          .route-card {
            background: #ECF5FF;
            padding: 4px 8px;
            margin-bottom: 8px;
            border-radius: 4px;

            .route-card-header {
              .route-name-row {
                display: flex;
                align-items: center;

                .route-name {
                  font-size: 14px;
                  font-weight: 600;
                  color: #3D3D3D;
                  transition: color 0.2s ease;

                  &.cross-route-link {
                    cursor: pointer;
                    
                    &:hover {
                      color: #409EFF !important;
                      text-decoration: underline;
                    }
                  }
                }
              }
            }

            .route-card-body {
              display: flex;
              align-items: center;
              gap: 16px;
              margin-top: 13px;

              .card-info-item {
                display: flex;
                align-items: center;
                gap: 16px;

                .info-label {
                  font-size: 14px;
                  color: #3D3D3D;
                }

                .info-value {
                  display: flex;
                  align-items: center;
                  font-size: 14px;
                  color: #3D3D3D;
                }
              }
            }
          }

          .effective-address {
            padding: 8px 0;
            margin-bottom: 8px;

            .effective-row {
              display: flex;
              align-items: center;
              margin-bottom: 8px;

              .effective-label {
                font-size: 14px;
                color: #3D3D3D;
              }
            }

            .warning-tip {
              border-radius: 4px;
            }
          }

          .effective-objects {
            margin-bottom: 8px;

            .objects-label {
              font-size: 14px;
              color: #3D3D3D;
            }
          }

          .no-data-tip {
            text-align: center;
            padding: 32px 0;
            color: #909399;
            font-size: 14px;
          }
        }

      }
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

</style>
