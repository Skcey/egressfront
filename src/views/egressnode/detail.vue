<template>
  <div class="egress-node-detail">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'Egress' }">出口网关</el-breadcrumb-item>
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
          <span class="status-text">正常</span>
        </div>
      </div>
      <div class="title-actions">
        <el-button type="danger" @click="handleDelete">删除</el-button>
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
          <span class="status-normal">正常</span>
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
            :key="node.id"
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
                <span class="card-title">{{ mapping.sourceGateway.name }}</span>
              </div>
              <div class="card-body">
                <div class="card-info">
                  <span>出口网关地址：{{ mapping.sourceGateway.address }}</span>
                </div>
                <div class="card-info">
                  <span>所属集群名称：{{ mapping.sourceGateway.cluster }}</span>
                </div>
              </div>
            </div>

            <!-- 映射标识和箭头 -->
            <div class="mapping-indicator">
              <el-icon :size="24" color="#909399" class="arrow-icon">
                <DArrowRight />
              </el-icon>
              <div class="mapping-badge">映射</div>
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
                  <span>所属集群名称：{{ mapping.targetGateway.cluster }}</span>
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
              <p class="tip-text">所选节点的所有流量都将统一通过在此处指定的固定出口网关地址访问外部网络</p>
              <el-input
                v-model="editForm.customAddress"
                placeholder="请输入自定义出口地址"
                style="width: 280px"
                size="small"
              />
            </div>
            
            <div v-if="editForm.addressType === 'dynamic'" class="dynamic-address-section">
              <p class="tip-text">系统自动从选择的网关节点中，选取健康节点的IP作为出口地址访问外网</p>
              <div v-if="editForm.selectedNodes.length > 0" class="selected-ips">
                <el-tag
                  v-for="node in editForm.selectedNodes"
                  :key="node.id"
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
          <div class="form-label">选择网关节点：</div>
          <div class="form-content">
            <div class="nodes-cards">
              <div
                v-for="(node, index) in editForm.selectedNodes"
                :key="node.id"
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Menu, CircleCloseFilled, DArrowRight } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import NodeSelectorDrawer from '@/components/NodeSelectorDrawer.vue'

const route = useRoute()
const router = useRouter()

const gatewayDetail = ref({
  id: 1,
  name: '出口网关1',
  address: '10.10.0.1',
  type: '实体',
  status: '正常',
  nodeCount: 3,
  createTime: '2023-10-22 12:21:34',
  nodes: [
    {
      id: 1,
      name: '节点1',
      ip: '10.10.103.80',
      interface: 'eth0',
      installed: true,
      status: '正常'
    },
    {
      id: 2,
      name: '节点2',
      ip: '10.10.103.79',
      interface: 'eth1',
      installed: true,
      status: '正常'
    },
    {
      id: 3,
      name: '节点3',
      ip: '10.10.103.78',
      interface: 'eth0',
      installed: true,
      status: '正常'
    }
  ],
  // 映射网关配置（仅当 type 为 '映射' 时使用）
  mappingGateways: [
    {
      sourceGateway: {
        name: '出口网关1',
        address: '10.0.0.1',
        cluster: '测试集群'
      },
      targetGateway: {
        name: '映射出口网关1',
        address: '10.0.0.1',
        cluster: '默认集群'
      }
    }
  ]
})

const goBack = () => {
  router.push({ name: 'Egress' })
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
  editForm.value = {
    addressType: 'dynamic',
    customAddress: gatewayDetail.value.address,
    selectedNodes: JSON.parse(JSON.stringify(gatewayDetail.value.nodes))
  }
  isEditing.value = true
}

const handleSaveEdit = () => {
  // 保存编辑
  console.log('保存编辑', editForm.value)
  // 更新 gatewayDetail
  gatewayDetail.value.nodes = JSON.parse(JSON.stringify(editForm.value.selectedNodes))
  gatewayDetail.value.address = editForm.value.addressType === 'custom' 
    ? editForm.value.customAddress 
    : editForm.value.selectedNodes[0]?.ip || gatewayDetail.value.address
  isEditing.value = false
}

const handleCancelEdit = () => {
  isEditing.value = false
}

const openNodeSelector = () => {
  showNodeDrawer.value = true
}

const handleNodeSelectionConfirm = (nodes) => {
  // 合并已有节点,避免重复
  const existingIds = editForm.value.selectedNodes.map(n => n.id)
  nodes.forEach(node => {
    if (!existingIds.includes(node.id)) {
      editForm.value.selectedNodes.push(node)
    }
  })
}

const removeNode = (index) => {
  editForm.value.selectedNodes.splice(index, 1)
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
    .then(() => {
      // 确认删除
      console.log('删除网关', gatewayDetail.value)
      // 这里实际应该调用删除API
      // 删除成功后返回列表页
      router.push({ name: 'Egress' })
    })
    .catch((action) => {
      // 取消删除或关闭对话框
      if (action === 'cancel') {
        console.log('取消删除')
      }
    })
}

onMounted(() => {
  const id = route.params.id
  // 这里可以根据ID获取网关详情数据
  console.log('加载网关详情:', id)
  
  // 模拟：如果ID为偶数，显示映射类型
  if (parseInt(id) % 2 === 0) {
    gatewayDetail.value = {
      id: parseInt(id),
      name: '映射出口网关' + id,
      address: '10.10.0.' + id,
      type: '映射',
      status: '正常',
      nodeCount: 0,
      createTime: '2023-10-22 12:21:34',
      nodes: [],
      mappingGateways: [
        {
          sourceGateway: {
            name: '出口网关1',
            address: '10.0.0.1',
            cluster: '测试集群'
          },
          targetGateway: {
            name: '映射出口网关1',
            address: '10.0.0.1',
            cluster: '默认集群'
          }
        }
      ]
    }
  }
})
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
          font-size: 14px;
          color: #67C23A;
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

        &.status-normal {
          color: #67C23A;
          font-weight: 500;
        }
      }
    }
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
          }
        }
      }
    }
  }

  .edit-actions {
    display: flex;
    gap: 12px;
  }
}
</style>