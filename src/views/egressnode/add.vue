<template>
  <div class="egress-node-add">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'Egress', params: { clusterName: $route.params.clusterName }}">出口网关</el-breadcrumb-item>
        <el-breadcrumb-item>新建出口网关</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 标题区域 -->
    <div class="title-section">
      <div class="title-left">
        <el-button @click="goBack" type="text" class="back-btn">
          <el-icon :size="20"><ArrowLeft /></el-icon>
        </el-button>
        <div class="gateway-info">
          <h1 class="gateway-name">新建出口网关</h1>
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
              placeholder="请输入网关名称"
              style="width: 320px"
              clearable
              maxlength="63"
              show-word-limit
            />
          </div>
        </div>
        <div class="form-item">
          <div class="form-label">所属集群：</div>
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

    <!-- 网关配置 -->
    <div class="config-section">
      <div class="section-header">
        <div class="section-title">
          <el-icon class="section-icon"><Menu /></el-icon>
          <h3>网关配置</h3>
        </div>
      </div>

      <div class="config-content">
        <!-- 出口网关地址配置 -->
        <div class="config-item">
          <div class="config-label required">出口网关地址：</div>
          <div class="config-body">
            <el-radio-group v-model="formData.addressType">
              <el-radio label="custom">自定义出口地址</el-radio>
              <el-radio label="dynamic">动态出口地址</el-radio>
            </el-radio-group>

            <div v-if="formData.addressType === 'custom'" class="address-input-section">
              <p class="tip-text">
                <span class="required-mark">*</span>
                所选节点的所有流量都将统一通过在此处指定的固定出口网关地址访问外部网络
              </p>
              <el-input
                v-model="formData.customAddress"
                placeholder="请输入自定义出口地址（例如：192.168.1.1）"
                style="width: 280px"
                size="small"
                clearable
              />
            </div>

            <div v-if="formData.addressType === 'dynamic'" class="address-input-section">
              <p class="tip-text">系统自动从选择的网关节点中，选取健康节点的IP作为出口地址访问外网</p>
              <div v-if="formData.selectedNodes.length > 0" class="selected-ips">
                <el-tag
                  v-for="node in formData.selectedNodes"
                  :key="node.name"
                  size="small"
                  closable
                  @close="removeNode(formData.selectedNodes.indexOf(node))"
                  style="margin-right: 4px"
                >
                  {{ node.ip }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 选择网关节点 -->
        <div class="config-item nodes-section">
          <div class="config-label required">选择网关节点：</div>
          <div class="config-body">
            <!-- 已选择的节点列表 -->
            <div v-if="formData.selectedNodes.length > 0" class="node-cards-grid">
              <div
                v-for="(node, index) in formData.selectedNodes"
                :key="node.name"
                class="node-config-card"
              >
                <div class="card-header">
                  <span>{{ node.name }}</span>
                  <el-icon :size="16" color="#F56C6C" @click="removeNode(index)" class="close-icon">
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
            <!-- 空状态占位 -->
            <div v-else class="empty-placeholder">
              <el-icon :size="48" color="#C0C4CC">
                <Document />
              </el-icon>
              <p class="empty-text">暂未选择网关节点</p>
              <p class="empty-hint">请点击下方按钮选择网关节点</p>
            </div>
            <el-button
              type="primary"
              text
              bg
              @click="showNodeDrawer = true"
              style="width: 100%; margin-top: 16px"
            >
              选择网关节点
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

    <!-- 节点选择抽屉 -->
    <NodeSelectorDrawer
      v-model="showNodeDrawer"
      :selected-nodes="formData.selectedNodes"
      @confirm="handleNodeSelection"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Menu, CircleCloseFilled, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import NodeSelectorDrawer from '@/components/NodeSelectorDrawer.vue'
import { createEgressNode } from '@/api/egressNode'
import { useClusterStore } from '@/stores/cluster'

const router = useRouter()
const route = useRoute()
const clusterStore = useClusterStore()

const formData = ref({
  name: '',
  cluster: '', // 默认显示当前选定的集群，不可修改
  addressType: 'custom', // 'custom' or 'dynamic'
  customAddress: '',
  selectedNodes: []
})

const showNodeDrawer = ref(false)
const submitting = ref(false)

// 初始化集群信息
onMounted(() => {
  // 从store中获取当前集群显示名称
  formData.value.cluster = clusterStore.currentClusterDisplayName
})

// 监听路由参数变化，当切换集群时更新集群名称并重置表单
watch(() => route.params.clusterName, (newClusterName, oldClusterName) => {
  if (newClusterName && newClusterName !== oldClusterName) {
    // 更新store中的当前集群
    clusterStore.setCurrentCluster(newClusterName)
    
    // 更新集群显示名称
    formData.value.cluster = clusterStore.currentClusterDisplayName
    
    // 重置表单数据（因为不同集群的节点不同）
    formData.value.name = ''
    formData.value.addressType = 'custom'
    formData.value.customAddress = ''
    formData.value.selectedNodes = []
    
    ElMessage.info(`已切换到 ${formData.value.cluster}`)
  }
})

const goBack = () => {
  const clusterName = route.params.clusterName
  router.push({ name: 'Egress', params: { clusterName } })
}

const handleNodeSelection = (nodes) => {
  // 合并已有节点,避免重复
  const existingNames = formData.value.selectedNodes.map(n => n.name)
  nodes.forEach(node => {
    if (!existingNames.includes(node.name)) {
      formData.value.selectedNodes.push(node)
    }
  })
}

const removeNode = (index) => {
  formData.value.selectedNodes.splice(index, 1)
}

const handleSubmit = async () => {
  // 表单验证
  // 1. 检查网关名称
  if (!formData.value.name || formData.value.name.trim() === '') {
    ElMessage.warning('请输入网关名称')
    return
  }

  // 验证网关名称格式（只允许字母、数字、中划线和下划线）
  const namePattern = /^[a-zA-Z0-9_-]+$/
  if (!namePattern.test(formData.value.name.trim())) {
    ElMessage.warning('网关名称只能包含字母、数字、中划线和下划线')
    return
  }

  // 2. 如果选择自定义出口地址，检查地址是否填写
  if (formData.value.addressType === 'custom') {
    if (!formData.value.customAddress || formData.value.customAddress.trim() === '') {
      ElMessage.warning('请输入自定义出口地址')
      return
    }
    
    // 验证IP地址格式
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipPattern.test(formData.value.customAddress.trim())) {
      ElMessage.warning('请输入有效的IP地址')
      return
    }
  }

  // 3. 检查是否选择了网关节点
  if (formData.value.selectedNodes.length === 0) {
    ElMessage.warning('请至少选择一个网关节点')
    return
  }

  // 4. 检查所有节点的网卡是否填写
  const hasEmptyInterface = formData.value.selectedNodes.some(node => !node.interface || node.interface.trim() === '')
  if (hasEmptyInterface) {
    ElMessage.warning('请为所有节点配置网卡')
    return
  }

  try {
    submitting.value = true
    const clusterName = route.params.clusterName
    
    // 构建创建数据
    const createData = {
      name: formData.value.name.trim(),
      clusterName: clusterName, 
      egressIpType: formData.value.addressType === 'custom' ? 1 : 0,
      egressIP: formData.value.addressType === 'custom' ? formData.value.customAddress.trim() : null,
      nodeList: formData.value.selectedNodes.map(node => ({
        ip: node.ip,
        interfaceName: node.interface.trim()
      }))
    }

    await createEgressNode(clusterName, createData)
    ElMessage.success('创建成功')
    
    // 创建成功后返回列表页
    router.push({ name: 'Egress', params: { clusterName } })
  } catch (error) {
    console.error('创建出口网关失败:', error)
    ElMessage.error('创建出口网关失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  const clusterName = route.params.clusterName
  router.push({ name: 'Egress', params: { clusterName } })
}
</script>

<style lang="scss" scoped>
.egress-node-add {
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

        .address-input-section {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;

          .tip-text {
            font-family: 'Inter';
            font-size: 14px;
            line-height: 22px;
            color: #909399;
            margin: 0;
            .required-mark {
              color: #F56C6C;
              margin-right: 4px;
            }
          }

          .selected-ips {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
          }
        }
      }

      &.nodes-section {
        .config-label {
          padding-top: 0;
        }
      }
    }
  }

  .node-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(358px, 1fr));
    gap: 16px;
    width: 100%;

    .node-config-card {
      border: 1px solid #DCDFE6;
      border-radius: 4px;
      overflow: hidden;
      width: 358px;

      .card-header {
        background-color: #F5F7FA;
        padding: 8px 20px;
        border-bottom: 1px solid #E4E7ED;
        display: flex;
        align-items: center;
        justify-content: space-between;

        span {
          font-family: 'Inter';
          font-size: 16px;
          font-weight: 600;
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
        display: flex;
        flex-direction: column;
        gap: 12px;

        p {
          margin: 0;
          font-family: 'Inter';
          font-size: 14px;
          line-height: 22px;
          color: #606266;
        }

        .network-input {
          display: flex;
          align-items: center;
          gap: 8px;

          span {
            font-family: 'Inter';
            font-size: 14px;
            line-height: 22px;
            color: #606266;
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
}
</style>
