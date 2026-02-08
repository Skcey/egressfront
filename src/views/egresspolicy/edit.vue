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
      <h1 class="page-title">编辑出口网关路由名称</h1>
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
        <div class="config-section">
          <div class="section-checkbox">
            <el-checkbox v-model="formData.enableLocalAccess">
              配置本集群访问对象
            </el-checkbox>
          </div>

          <div v-if="formData.enableLocalAccess" class="config-content-wrapper">
            <!-- 访问对象列表 -->
            <div
              v-for="(accessObj, objIndex) in formData.accessObjects"
              :key="objIndex"
              class="access-object-section"
            >
              <!-- 删除按钮 -->
              <el-icon
                v-if="formData.accessObjects.length > 1"
                :size="16"
                class="delete-object-icon"
                @click="removeAccessObject(objIndex)"
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
                          v-model="accessObj.namespaceKey"
                          placeholder="Please input"
                          size="default"
                        />
                      </div>
                      <div class="input-item">
                        <span class="input-item-label">Value:</span>
                        <el-input
                          v-model="accessObj.namespaceValue"
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
                    <div v-if="accessObj.namespaceSelectors.length > 0" class="tag-list">
                      <el-tag
                        v-for="(tag, tagIndex) in accessObj.namespaceSelectors"
                        :key="tagIndex"
                        closable
                        @close="removeNamespaceSelector(objIndex, tagIndex)"
                        size="small"
                        type="info"
                      >
                        {{ tag }}
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
                      v-model="accessObj.podType"
                      :disabled="accessObj.namespaceSelectors.length === 0"
                    >
                      <el-radio label="all">全部Pod</el-radio>
                      <el-radio label="partial">部分Pod</el-radio>
                    </el-radio-group>

                    <!-- 部分Pod的key-value输入 -->
                    <div
                      v-if="accessObj.podType === 'partial'"
                      class="pod-selector-inputs"
                    >
                      <div class="key-value-inputs">
                        <div class="input-item">
                          <span class="input-item-label">Key:</span>
                          <el-input
                            v-model="accessObj.podKey"
                            placeholder="Please input"
                            size="default"
                          />
                        </div>
                        <div class="input-item">
                          <span class="input-item-label">Value:</span>
                          <el-input
                            v-model="accessObj.podValue"
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
                        v-if="accessObj.podSelectors.length > 0"
                        class="tag-list"
                      >
                        <el-tag
                          v-for="(tag, tagIndex) in accessObj.podSelectors"
                          :key="tagIndex"
                          closable
                          @close="removePodSelector(objIndex, tagIndex)"
                          size="small"
                          type="info"
                        >
                          {{ tag }}
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
        </div>

        <!-- 跨集群访问对象 -->
        <div class="config-section">
          <div class="section-checkbox">
            <el-checkbox v-model="formData.enableCrossCluster">
              配置跨集群访问对象
            </el-checkbox>
          </div>

          <div v-if="formData.enableCrossCluster" class="cross-cluster-wrapper">
            <!-- 步骤1: 选择映射实例 -->
            <div class="cross-cluster-step">
              <div class="step-header">
                <div class="step-number active">1</div>
                <span class="step-title">选择 出口网关名称 的映射实例</span>
              </div>
              <div class="step-content-area">
                <div class="select-row">
                  <el-select
                    v-model="crossCluster.targetCluster"
                    placeholder="Element design"
                    size="default"
                  >
                    <el-option label="集群1" value="cluster1" />
                    <el-option label="集群2" value="cluster2" />
                  </el-select>
                  <el-select
                    v-model="crossCluster.mappingGateway"
                    placeholder="请先选择目标集群"
                    :disabled="!crossCluster.targetCluster"
                    size="default"
                  >
                    <el-option label="映射网关1" value="gateway1" />
                    <el-option label="映射网关2" value="gateway2" />
                  </el-select>
                </div>
                <div class="help-text">
                  可通过在目标集群中新建出口网关映射，实现配置 出口网关名称 的映射网关实例
                </div>
              </div>
            </div>

            <!-- 步骤2: 关联出口路由 -->
            <div class="cross-cluster-step">
              <div class="step-header">
                <div class="step-number">2</div>
                <span class="step-title">关联跨集群映射网关的出口路由</span>
              </div>
              <div class="step-content-area">
                <div class="select-row">
                  <el-select
                    v-model="crossCluster.namespace"
                    placeholder="请选择路由所在命名空间"
                    :disabled="!crossCluster.mappingGateway"
                    size="default"
                  >
                    <el-option label="命名空间1" value="ns1" />
                    <el-option label="命名空间2" value="ns2" />
                  </el-select>
                  <el-select
                    v-model="crossCluster.route"
                    placeholder="请先选择命名空间"
                    :disabled="!crossCluster.namespace"
                    size="default"
                  >
                    <el-option label="路由1" value="route1" />
                    <el-option label="路由2" value="route2" />
                  </el-select>
                </div>
                <div class="help-text">
                  可通过在目标集群中新建出口网关映射，实现配置 出口网关名称 的映射网关实例
                </div>
              </div>
            </div>
          </div>
        </div>

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
        <div v-if="formData.enableLocalAccess" class="config-section">
          <div class="section-title-row">
            <span class="section-title-text">本集群访问对象</span>
          </div>

          <div class="confirm-content-wrapper">
            <div
              v-for="(accessObj, objIndex) in formData.accessObjects"
              :key="objIndex"
              class="confirm-card"
            >
              <div class="confirm-row">
                <div class="confirm-item">
                  <label>命名空间选择器</label>
                  <div class="tag-list">
                    <el-tag
                      v-for="(tag, tagIndex) in accessObj.namespaceSelectors"
                      :key="tagIndex"
                      size="small"
                      type="info"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
                <div class="confirm-item">
                  <label>Pod</label>
                  <div class="pod-content">
                    <span v-if="accessObj.podType === 'all'" class="pod-type-text">全部Pod</span>
                    <template v-else>
                      <span class="pod-type-text">部分Pod</span>
                      <div class="tag-list">
                        <el-tag
                          v-for="(tag, tagIndex) in accessObj.podSelectors"
                          :key="tagIndex"
                          size="small"
                          type="info"
                        >
                          {{ tag }}
                        </el-tag>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
              <el-link type="primary" class="view-link" @click="handleViewMatch">查看匹配对象</el-link>
            </div>
          </div>
        </div>

        <!-- 跨集群访问对象 -->
        <div v-if="formData.enableCrossCluster" class="config-section">
          <div class="section-title-row">
            <span class="section-title-text">跨集群访问对象</span>
          </div>

          <div class="confirm-content-wrapper">
            <div class="confirm-card">
              <div class="cross-cluster-row">
                <div class="cross-cluster-item">
                  <span class="info-label">
                    出口网关1 的映射网关 {{ crossCluster.targetCluster }} / {{ crossCluster.mappingGateway }}
                  </span>
                </div>
                <div class="cross-cluster-item">
                  <span class="info-label">
                    关联跨集群映射网关的出口路由 {{ crossCluster.namespace }} / {{ crossCluster.route }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="footer-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </div>
      </div>
    </div>

    <!-- 查看匹配对象抽屉 -->
    <el-drawer v-model="matchDrawerVisible" title="查看匹配对象" size="941px">
      <el-table :data="matchTableData" border style="width: 100%">
        <el-table-column prop="podName" label="Pod名称" width="180" />
        <el-table-column prop="namespace" label="命名空间名称" width="180" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag v-if="row.status === '正常'" type="success" size="small">正常</el-tag>
            <el-tag v-else type="danger" size="small">异常</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, CirclePlus, CircleCloseFilled, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 当前步骤
const currentStep = ref(0)

// 表单数据
const formData = ref({
  enableLocalAccess: false,
  enableCrossCluster: false,
  accessObjects: [
    {
      namespaceKey: '',
      namespaceValue: '',
      namespaceSelectors: [],
      podType: 'all', // 'all' 或 'partial'
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

// 查看匹配对象抽屉
const matchDrawerVisible = ref(false)
const matchTableData = ref([
  { podName: 'pod-1', namespace: 'default', status: '正常' },
  { podName: 'pod-2', namespace: 'default', status: '正常' },
  { podName: 'pod-3', namespace: 'kube-system', status: '正常' },
  { podName: 'pod-4', namespace: 'kube-system', status: '异常' }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(1000)

// 是否可以进入下一步
const canGoNext = computed(() => {
  // 至少勾选一个配置项
  if (!formData.value.enableLocalAccess && !formData.value.enableCrossCluster) {
    return false
  }

  // 如果勾选了本集群访问对象
  if (formData.value.enableLocalAccess) {
    // 每个访问对象都要验证
    for (const obj of formData.value.accessObjects) {
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
  if (formData.value.enableCrossCluster) {
    // 所有下拉框都要选择
    if (!crossCluster.value.targetCluster || !crossCluster.value.mappingGateway ||
        !crossCluster.value.namespace || !crossCluster.value.route) {
      return false
    }
  }

  return true
})

// 返回
const goBack = () => {
  router.back()
}

// 添加访问对象
const addAccessObject = () => {
  formData.value.accessObjects.push({
    namespaceKey: '',
    namespaceValue: '',
    namespaceSelectors: [],
    podType: 'all',
    podKey: '',
    podValue: '',
    podSelectors: []
  })
}

// 删除访问对象
const removeAccessObject = (objIndex) => {
  if (formData.value.accessObjects.length > 1) {
    formData.value.accessObjects.splice(objIndex, 1)
  }
}

// 添加命名空间选择器
const addNamespaceSelector = (objIndex) => {
  const obj = formData.value.accessObjects[objIndex]
  if (!obj.namespaceKey || !obj.namespaceValue) {
    ElMessage.warning('请输入Key和Value')
    return
  }
  const selector = `${obj.namespaceKey} = ${obj.namespaceValue}`
  obj.namespaceSelectors.push(selector)
  obj.namespaceKey = ''
  obj.namespaceValue = ''
}

// 删除命名空间选择器
const removeNamespaceSelector = (objIndex, tagIndex) => {
  formData.value.accessObjects[objIndex].namespaceSelectors.splice(tagIndex, 1)
}

// 添加Pod选择器
const addPodSelector = (objIndex) => {
  const obj = formData.value.accessObjects[objIndex]
  if (!obj.podKey || !obj.podValue) {
    ElMessage.warning('请输入Key和Value')
    return
  }
  const selector = `${obj.podKey} = ${obj.podValue}`
  obj.podSelectors.push(selector)
  obj.podKey = ''
  obj.podValue = ''
}

// 删除Pod选择器
const removePodSelector = (objIndex, tagIndex) => {
  formData.value.accessObjects[objIndex].podSelectors.splice(tagIndex, 1)
}

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
  router.back()
}

// 提交
const handleSubmit = () => {
  ElMessage.success('修改成功')
  router.push({ name: 'EgressRouteDetail', params: { id: route.params.id } })
}

// 查看匹配对象
const handleViewMatch = () => {
  matchDrawerVisible.value = true
}

// 分页变更
const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
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
              display: flex;
              align-items: center;
              gap: 23px;
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

        .confirm-content-wrapper {
          .confirm-card {
            background-color: #F4F4F5;
            padding: 4px;
            position: relative;
            border-radius: 4px;
            margin-bottom: 8px;

            &:last-child {
              margin-bottom: 0;
            }

            .confirm-row {
              display: flex;
              gap: 62px;

              .confirm-item {
                flex: 1;
                display: flex;
                gap: 12px;
                align-items: center;

                label {
                  font-size: 14px;
                  color: #3D3D3D;
                  white-space: nowrap;
                  line-height: 26px;
                }

                .tag-list {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 8px;
                  align-items: center;
                }

                .pod-content {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 8px;
                  align-items: center;

                  .pod-type-text {
                    font-size: 14px;
                    color: #3D3D3D;
                    line-height: 26px;
                  }
                }
              }
            }

            .cross-cluster-row {
              display: flex;
              gap: 120px;

              .cross-cluster-item {
                .info-label {
                  font-size: 14px;
                  color: #3D3D3D;
                  line-height: 26px;
                }
              }
            }

            .view-link {
              position: absolute;
              right: 4px;
              top: 4px;
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
