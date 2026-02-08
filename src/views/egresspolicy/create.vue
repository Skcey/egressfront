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
        <el-step title="修改配置"></el-step>
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
              <el-select
                v-model="formData.cluster"
                placeholder="选择集群"
                class="form-input"
                disabled
              >
                <el-option label="默认集群" value="default" />
                <el-option label="集群1" value="cluster1" />
              </el-select>
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
                <el-option label="default" value="default" />
                <el-option label="kube-system" value="kube-system" />
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
                  <el-option label="出口网关1" value="gateway1" />
                  <el-option label="出口网关2" value="gateway2" />
                </el-select>
                <div class="helper-text">若无可用出口网关，可前往 新建出口网关</div>
              </div>
            </div>

            <div class="form-item">
              <label class="form-label">
                <span class="required">*</span>
                目标地址：
              </label>
              <div class="address-config-wrapper">
                <div class="address-inputs-wrapper">
                  <el-input
                    v-model="formData.targetCIDR"
                    placeholder="请输入目标CIDR"
                    style="width: 146px"
                  />
                  <div class="divider-box">屏蔽</div>
                  <el-input
                    v-model="formData.blockCIDR"
                    placeholder="请输入需要屏蔽的目标CIDR，多个配置以英文逗号分隔"
                    style="width: 383px"
                  />
                  <el-icon
                    :size="16"
                    class="add-icon"
                    @click="addTargetAddress"
                  >
                    <CirclePlus />
                  </el-icon>
                </div>

                <!-- 已添加的地址标签 -->
                <div v-if="formData.targetAddresses.length > 0" class="address-tag-list">
                  <el-tag
                    v-for="(address, index) in formData.targetAddresses"
                    :key="index"
                    closable
                    @close="removeTargetAddress(index)"
                    size="small"
                    type="info"
                  >
                    {{ address }}
                  </el-tag>
                </div>
              </div>
            </div>

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

      <!-- 步骤2: 修改配置 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="config-section">
          <div class="form-content">
            <!-- 配置本集群访问对象 -->
            <div class="section-checkbox">
              <el-checkbox v-model="formData.configLocalAccess">配置本集群访问对象</el-checkbox>
            </div>

            <div v-if="formData.configLocalAccess" class="config-content-wrapper">
              <div
                v-for="(obj, objIndex) in formData.accessObjects"
                :key="objIndex"
                class="access-object-section"
              >
                <el-icon
                  v-if="formData.accessObjects.length > 1"
                  :size="16"
                  color="#F56C6C"
                  @click="removeAccessObject(objIndex)"
                  class="delete-object-icon"
                >
                  <CircleCloseFilled />
                </el-icon>

                <!-- 命名空间选择器配置区 -->
                <div class="namespace-section">
                  <div class="input-row">
                    <label class="input-label">命名空间选择器</label>
                    <div class="input-group">
                      <div class="key-value-inputs">
                        <div class="input-item">
                          <span class="input-item-label">Key:</span>
                          <el-input
                            v-model="obj.namespaceKey"
                            placeholder="Please input"
                            size="default"
                          />
                        </div>
                        <div class="input-item">
                          <span class="input-item-label">Value:</span>
                          <el-input
                            v-model="obj.namespaceValue"
                            placeholder="Please input"
                            size="default"
                          />
                        </div>
                        <el-icon
                          :size="16"
                          class="add-icon"
                          @click="addNamespaceSelector(objIndex)"
                        >
                          <CirclePlus />
                        </el-icon>
                      </div>
                      
                      <!-- 已添加的命名空间选择器标签 -->
                      <div v-if="obj.namespaceSelectors.length > 0" class="tag-list">
                        <el-tag
                          v-for="(tag, tagIndex) in obj.namespaceSelectors"
                          :key="tagIndex"
                          closable
                          @close="removeNamespaceSelector(objIndex, tagIndex)"
                          size="small"
                          type="info"
                        >
                          {{ tag.key }} = {{ tag.value }}
                        </el-tag>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Pod选择器配置区 -->
                <div class="pod-section">
                  <div class="pod-row">
                    <label class="input-label">选择Pod</label>
                    <div class="pod-config">
                      <!-- Pod类型选择 -->
                      <el-radio-group
                        v-model="obj.podType"
                        :disabled="obj.namespaceSelectors.length === 0"
                      >
                        <el-radio label="all">全部Pod</el-radio>
                        <el-radio label="partial">部分Pod</el-radio>
                      </el-radio-group>

                      <!-- 部分Pod的key-value输入 -->
                      <div
                        v-if="obj.podType === 'partial'"
                        class="pod-selector-inputs"
                      >
                        <div class="key-value-inputs">
                          <div class="input-item">
                            <span class="input-item-label">Key:</span>
                            <el-input
                              v-model="obj.podKey"
                              placeholder="Please input"
                              size="default"
                            />
                          </div>
                          <div class="input-item">
                            <span class="input-item-label">Value:</span>
                            <el-input
                              v-model="obj.podValue"
                              placeholder="Please input"
                              size="default"
                            />
                          </div>
                          <el-icon
                            :size="16"
                            class="add-icon"
                            @click="addPodSelector(objIndex)"
                          >
                            <CirclePlus />
                          </el-icon>
                        </div>

                        <!-- 已添加的Pod选择器标签 -->
                        <div
                          v-if="obj.podSelectors.length > 0"
                          class="tag-list"
                        >
                          <el-tag
                            v-for="(tag, tagIndex) in obj.podSelectors"
                            :key="tagIndex"
                            closable
                            @close="removePodSelector(objIndex, tagIndex)"
                            size="small"
                            type="info"
                          >
                            {{ tag.key }} = {{ tag.value }}
                          </el-tag>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 添加访问对象按钮 -->
              <el-button text type="primary" class="add-object-btn" @click="addAccessObject">
                <el-icon :size="14"><Plus /></el-icon>
                <span>添加访问对象</span>
              </el-button>
            </div>

            <!-- 跨集群访问对象 -->
            <div class="section-checkbox">
              <el-checkbox v-model="formData.configCrossClusterAccess">配置跨集群访问对象</el-checkbox>
            </div>

            <div v-if="formData.configCrossClusterAccess" class="cross-cluster-wrapper">
              <!-- 步骤1: 选择映射实例 -->
              <div class="cross-cluster-step">
                <div class="step-header">
                  <div class="step-number active">1</div>
                  <span class="step-title">选择 出口网关名称 的映射实例</span>
                </div>
                <div class="step-content-area">
                  <div class="select-row">
                    <el-select
                      v-model="formData.crossCluster.targetCluster"
                      placeholder="Element design"
                      size="default"
                    >
                      <el-option label="集群1" value="cluster1" />
                      <el-option label="集群2" value="cluster2" />
                    </el-select>
                    <el-select
                      v-model="formData.crossCluster.mappedGateway"
                      placeholder="请先选择目标集群"
                      size="default"
                      :disabled="!formData.crossCluster.targetCluster"
                    >
                      <el-option label="映射网关1" value="gateway1" />
                      <el-option label="映射网关2" value="gateway2" />
                    </el-select>
                  </div>
                  <div class="helper-text">
                    可通过在目标集群中新建出口网关映射，实现配置 出口网关名称 的映射网关实例
                  </div>
                </div>
              </div>

              <!-- 步骤2: 关联出口路由 -->
              <div class="cross-cluster-step">
                <div class="step-header">
                  <div class="step-number active">2</div>
                  <span class="step-title">关联跨集群映射网关的出口路由</span>
                </div>
                <div class="step-content-area">
                  <div class="select-row">
                    <el-select
                      v-model="formData.crossCluster.namespace"
                      placeholder="请选择路由所在命名空间"
                      size="default"
                      :disabled="!formData.crossCluster.mappedGateway"
                    >
                      <el-option label="命名空间1" value="ns1" />
                      <el-option label="命名空间2" value="ns2" />
                    </el-select>
                    <el-select
                      v-model="formData.crossCluster.egressRoute"
                      placeholder="请先选择命名空间"
                      size="default"
                      :disabled="!formData.crossCluster.namespace"
                    >
                      <el-option label="路由1" value="route1" />
                      <el-option label="路由2" value="route2" />
                    </el-select>
                  </div>
                  <div class="helper-text">
                    可通过在目标集群中新建出口网关映射关联的出口路由，实现配置跨集群的出口路由
                  </div>
                </div>
              </div>
            </div>
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
            <el-descriptions-item label="所属集群">{{ formData.cluster }}</el-descriptions-item>
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
            <div v-if="formData.configLocalAccess" class="access-objects-section">
              <div class="section-checkbox-confirm">
                <span>本集群访问对象</span>
              </div>

              <div class="confirm-cards-wrapper">
                <div
                  v-for="(obj, objIndex) in formData.accessObjects"
                  :key="objIndex"
                  class="confirm-card"
                >
                  <div class="confirm-row">
                    <div class="confirm-item">
                      <label>命名空间选择器</label>
                      <div class="tag-list">
                        <el-tag
                          v-for="(tag, tagIndex) in obj.namespaceSelectors"
                          :key="tagIndex"
                          size="small"
                          type="info"
                        >
                          {{ tag.key }} = {{ tag.value }}
                        </el-tag>
                      </div>
                    </div>
                    <div class="confirm-item">
                      <label>Pod</label>
                      <div class="pod-content">
                        <span v-if="obj.podType === 'all'" class="pod-type-text">全部Pod</span>
                        <template v-else>
                          <span class="pod-type-text">部分Pod</span>
                          <div class="tag-list">
                            <el-tag
                              v-for="(tag, tagIndex) in obj.podSelectors"
                              :key="tagIndex"
                              size="small"
                              type="info"
                            >
                              {{ tag.key }} = {{ tag.value }}
                            </el-tag>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                  <el-link type="primary" class="view-link" @click="showMatchingObjects">查看匹配对象</el-link>
                </div>
              </div>
            </div>

            <!-- 跨集群访问对象 -->
            <div v-if="formData.configCrossClusterAccess" class="access-objects-section">
              <div class="section-checkbox-confirm">
                <span>配置跨集群访问对象</span>
              </div>

              <div class="cross-cluster-confirm">
                <div class="cross-cluster-text">
                  出口网关1 的映射网关 {{ formData.crossCluster.targetCluster }} / {{ formData.crossCluster.mappedGateway }}
                </div>
                <div class="cross-cluster-text">
                  关联跨集群映射网关的出口路由 {{ formData.crossCluster.namespace }} / {{ formData.crossCluster.egressRoute }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="footer-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </div>
      </div>
    </div>

    <!-- 查看匹配对象抽屉 -->
    <el-drawer
      v-model="matchingDrawerVisible"
      title="查看匹配对象"
      size="600px"
      direction="rtl"
    >
      <el-table :data="matchingPods" style="width: 100%">
        <el-table-column prop="name" label="Pod名称" min-width="200" />
        <el-table-column prop="namespace" label="命名空间" min-width="150" />
        <el-table-column label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '运行中' ? 'success' : 'danger'" size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="matchingPage"
        :page-size="10"
        layout="total, prev, pager, next"
        :total="matchingTotal"
        style="margin-top: 16px; justify-content: center;"
      />
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Menu, Plus, CircleCloseFilled, CirclePlus, Search, Document } from '@element-plus/icons-vue'

const router = useRouter()

const currentStep = ref(0)
const matchingDrawerVisible = ref(false)
const matchingPage = ref(1)
const matchingTotal = ref(20)

const formData = reactive({
  // 基础信息
  name: '',
  cluster: 'default',
  namespace: '',

  // 路由配置
  gateway: '',
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

const matchingPods = ref([
  { name: 'pod-1', namespace: 'default', status: '运行中' },
  { name: 'pod-2', namespace: 'default', status: '运行中' }
])

// 第一步验证：基本信息和路由配置必填项
const canGoNextStep1 = computed(() => {
  return !!(
    formData.name &&
    formData.name.trim() &&
    formData.cluster &&
    formData.namespace &&
    formData.gateway &&
    formData.targetAddresses.length > 0  // 至少添加一个目标地址
  )
})

// 第二步验证：访问对象配置
const canGoNextStep2 = computed(() => {
  // 至少勾选一个配置项
  if (!formData.configLocalAccess && !formData.configCrossClusterAccess) {
    return false
  }

  // 如果勾选了本集群访问对象
  if (formData.configLocalAccess) {
    // 每个访问对象都要验证
    for (const obj of formData.accessObjects) {
      // 命名空间选择器至少要有一个
      if (obj.namespaceSelectors.length === 0) {
        return false
      }
      // 如果选择了部分Pod，Pod选择器至少要有一个
      if (obj.podType === 'partial' && obj.podSelectors.length === 0) {
        return false
      }
    }
  }

  // 如果勾选了跨集群访问对象
  if (formData.configCrossClusterAccess) {
    // 所有下拉框都要选择
    if (!formData.crossCluster.targetCluster || !formData.crossCluster.mappedGateway ||
        !formData.crossCluster.namespace || !formData.crossCluster.egressRoute) {
      return false
    }
  }

  return true
})

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
    if (!formData.targetCIDR || !formData.targetCIDR.trim()) {
      ElMessage.warning('请输入访问目标地址')
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
  router.push({ name: 'EgressRoute' })
}

const handleSubmit = () => {
  ElMessage.success('创建成功')
  router.push({ name: 'EgressRoute' })
}

const addAccessObject = () => {
  formData.accessObjects.push({
    namespaceKey: '',
    namespaceValue: '',
    namespaceSelectors: [],
    podType: 'all',
    podKey: '',
    podValue: '',
    podSelectors: []
  })
}

// 添加目标地址
const addTargetAddress = () => {
  if (!formData.targetCIDR || !formData.targetCIDR.trim()) {
    ElMessage.warning('请输入目标CIDR')
    return
  }
  
  let addressText = formData.targetCIDR.trim()
  if (formData.blockCIDR && formData.blockCIDR.trim()) {
    addressText += ' 屏蔽 ' + formData.blockCIDR.trim()
  }
  
  formData.targetAddresses.push(addressText)
  formData.targetCIDR = ''
  formData.blockCIDR = ''
}

// 删除目标地址
const removeTargetAddress = (index) => {
  formData.targetAddresses.splice(index, 1)
}

const removeAccessObject = (index) => {
  if (formData.accessObjects.length > 1) {
    formData.accessObjects.splice(index, 1)
  } else {
    ElMessage.warning('至少需要保留一个访问对象')
  }
}

const addNamespaceSelector = (objIndex) => {
  const obj = formData.accessObjects[objIndex]
  if (obj.namespaceKey && obj.namespaceValue) {
    obj.namespaceSelectors.push({
      key: obj.namespaceKey,
      value: obj.namespaceValue
    })
    obj.namespaceKey = ''
    obj.namespaceValue = ''
  }
}

const removeNamespaceSelector = (objIndex, tagIndex) => {
  formData.accessObjects[objIndex].namespaceSelectors.splice(tagIndex, 1)
}

const addPodSelector = (objIndex) => {
  const obj = formData.accessObjects[objIndex]
  if (obj.podKey && obj.podValue) {
    obj.podSelectors.push({
      key: obj.podKey,
      value: obj.podValue
    })
    obj.podKey = ''
    obj.podValue = ''
  }
}

const removePodSelector = (objIndex, tagIndex) => {
  formData.accessObjects[objIndex].podSelectors.splice(tagIndex, 1)
}

const showMatchingObjects = () => {
  matchingDrawerVisible.value = true
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

        .address-config-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .address-inputs-wrapper {
          display: flex;
          align-items: center;

          .divider-box {
            padding: 5px 8px;
            font-size: 14px;
            color: #3D3D3D;
            background: #E9E9EB;
            line-height: 22px;
          }

          .add-icon {
            color: #303133;
            cursor: pointer;
            flex-shrink: 0;
            margin-left: 8px;

            &:hover {
              color: #409EFF;
            }
          }
        }

        .address-tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
      }

    }

    .section-checkbox {
      margin-bottom: 8px;
      padding: 8px;
      background: #E9E9EB;

      :deep(.el-checkbox__label) {
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
      }

      .pod-selector-inputs {
        display: flex;
        flex-direction: column;
        gap: 12px;
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

          .helper-text {
            font-size: 14px;
            color: #909399;
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

    .access-objects-section {
      margin-top: 0;

      .section-checkbox-confirm {
        padding: 0 0 0 4px;
        background-color: #E9E9EB;
        height: 32px;
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #606266;
        margin-bottom: 16px;
      }

      .confirm-cards-wrapper {
        border: 1px solid #DEDFE0;
        border-top: none;
        border-radius: 0 5px 5px;
        padding: 8px;
        background: #FFFFFF;
      }

      .confirm-card {
        background-color: #F4F4F5;
        padding: 4px;
        border-radius: 4px;
        margin-bottom: 8px;
        position: relative;

        &:last-child {
          margin-bottom: 0;
        }

        .confirm-row {
          display: flex;
          gap: 62px;
          padding: 4px;

          .confirm-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;

            label {
              font-size: 14px;
              color: #3D3D3D;
              font-weight: 400;
            }

            .tag-list {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;

              .el-tag {
                background-color: #F4F4F5;
                color: #909399;
                border: 1px solid #767676;
              }
            }

            .pod-content {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              gap: 8px;

              .pod-type-text {
                font-size: 14px;
                color: #3D3D3D;
              }

              .tag-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
              }
            }
          }
        }

        .view-link {
          position: absolute;
          top: 4px;
          right: 8px;
          font-size: 14px;
        }
      }

      .cross-cluster-confirm {
        background-color: #F4F4F5;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        flex-direction: row;
        gap: 120px;

        .cross-cluster-text {
          font-size: 14px;
          color: #3D3D3D;
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
