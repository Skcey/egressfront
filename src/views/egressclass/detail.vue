<template>
  <div class="egress-mapping-detail">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'EgressMapping' }">出口网关映射</el-breadcrumb-item>
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
    <div class="info-section">
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
          <span>{{ mappingDetail.cluster }}</span>
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
          <el-button type="primary" text @click="handleEdit">编辑</el-button>
        </div>
        <div v-else class="edit-actions">
          <el-button text @click="handleCancelEdit">取消</el-button>
          <el-button type="primary" text @click="handleConfirm">确认</el-button>
        </div>
      </div>

      <div class="mapping-config">
        <!-- 左侧：网关集群 -->
        <div class="cluster-card source-cluster">
          <div class="card-header">{{ mappingDetail.cluster }}</div>
          <div class="card-body">
            <div
              v-for="gateway in mappingDetail.sourceGateways"
              :key="gateway.id"
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
                  <span class="status-normal">{{ gateway.status }}</span>
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
            :key="gateway.id"
            class="arrow-wrapper"
          >
            <el-icon :size="24" color="#909399">
              <DArrowRight />
            </el-icon>
          </div>
        </div>

        <!-- 右侧：目标集群 -->
        <div class="cluster-card target-cluster">
          <div class="card-header">{{ mappingDetail.targetCluster }}</div>
          <div class="card-body">
            <div
              v-for="(gateway, index) in mappingDetail.targetGateways"
              :key="gateway.id"
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
                  <span class="status-normal">{{ gateway.status }}</span>
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
    <el-drawer
      v-model="showGatewaySelector"
      title="添加出口网关"
      direction="rtl"
      size="941px"
    >
      <div class="gateway-selector">
        <div class="selector-tip">
          <span>若无出口网关，可前往</span>
          <el-button type="primary" text @click="goToAddGateway">新建出口网关</el-button>
          <el-button type="primary" text icon="Refresh" @click="refreshGateways" />
        </div>

        <el-table
          ref="multipleTableRef"
          :data="availableGateways"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="48" />
          <el-table-column property="name" label="出口网关名称" width="180" />
          <el-table-column property="address" label="出口网关地址" width="180" />
          <el-table-column property="status" label="状态" width="180">
            <template #default="scope">
              <el-tag v-if="scope.row.status === '正常'" type="success" size="small">
                {{ scope.row.status }}
              </el-tag>
              <el-tag v-else type="danger" size="small">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="selectorCurrentPage"
            v-model:page-size="selectorPageSize"
            :page-sizes="[10, 20, 50]"
            :total="selectorTotal"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="showGatewaySelector = false">取消</el-button>
          <el-button type="primary" @click="confirmAddGateways">确认</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Menu, DArrowRight, Refresh } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 编辑模式
const isEditMode = ref(false)
const originalMappingDetail = ref(null) // 保存原始数据用于取消操作

// 网关选择器
const showGatewaySelector = ref(false)
const multipleTableRef = ref()
const selectedGateways = ref([])
const selectorCurrentPage = ref(1)
const selectorPageSize = ref(10)
const selectorTotal = ref(0)

const mappingDetail = ref({
  id: 1,
  name: '出口网关映射名称',
  cluster: '网关集群名称',
  targetCluster: '非网关集群名称',
  createTime: '2025-01-01 00:00:00',
  sourceGateways: [
    {
      id: 1,
      name: '出口网关1',
      type: '实体',
      status: '正常',
      address: '10.0.0.1',
      removed: false
    },
    {
      id: 2,
      name: '出口网关2',
      type: '实体',
      status: '正常',
      address: '10.0.0.1',
      removed: false
    },
    {
      id: 3,
      name: '出口网关3',
      type: '实体',
      status: '正常',
      address: '10.0.0.1',
      removed: false
    }
  ],
  targetGateways: [
    {
      id: 1,
      name: '映射出口网关1',
      type: '实体',
      status: '正常',
      address: '10.0.0.1'
    },
    {
      id: 2,
      name: '映射出口网关2',
      type: '实体',
      status: '正常',
      address: '10.0.0.1'
    },
    {
      id: 3,
      name: null, // 待映射
      type: null,
      status: null,
      address: null
    }
  ]
})

// 可用网关列表
const availableGateways = ref([
  {
    id: 4,
    name: '节点1',
    address: '10.10.103.80',
    status: '正常'
  },
  {
    id: 5,
    name: '节点2',
    address: '10.10.103.79',
    status: '正常'
  },
  {
    id: 6,
    name: '节点3',
    address: '10.10.103.78',
    status: '正常'
  },
  {
    id: 7,
    name: '节点4',
    address: '10.10.103.77',
    status: '异常'
  }
])

selectorTotal.value = availableGateways.value.length

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
        router.push({ name: 'EgressMapping' })
      })
      .catch(() => {
        // 取消离开
      })
  } else {
    router.push({ name: 'EgressMapping' })
  }
}

const handleEdit = () => {
  // 保存原始数据的深拷贝
  originalMappingDetail.value = JSON.parse(JSON.stringify(mappingDetail.value))
  isEditMode.value = true
}

const handleCancelEdit = () => {
  // 恢复原始数据
  if (originalMappingDetail.value) {
    mappingDetail.value = JSON.parse(JSON.stringify(originalMappingDetail.value))
  }
  isEditMode.value = false
  originalMappingDetail.value = null
}

const handleConfirm = () => {
  // 保存编辑
  console.log('保存映射配置', mappingDetail.value)
  // 这里实际应该调用保存API
  ElMessage.success('保存成功')
  isEditMode.value = false
  originalMappingDetail.value = null
}

const handleDelete = () => {
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
    .then(() => {
      // 确认删除
      console.log('删除映射', mappingDetail.value)
      // 这里实际应该调用删除API
      // 删除成功后返回列表页
      router.push({ name: 'EgressMapping' })
    })
    .catch((action) => {
      // 取消删除或关闭对话框
      if (action === 'cancel') {
        console.log('取消删除')
      }
    })
}

const toggleGatewayStatus = (gateway) => {
  gateway.removed = !gateway.removed
}

const handleSelectionChange = (val) => {
  selectedGateways.value = val
}

const confirmAddGateways = () => {
  if (selectedGateways.value.length === 0) {
    ElMessage.warning('请选择要添加的出口网关')
    return
  }
  
  // 将选中的网关添加到源网关列表
  selectedGateways.value.forEach(gateway => {
    mappingDetail.value.sourceGateways.push({
      id: gateway.id,
      name: gateway.name,
      type: '实体',
      status: gateway.status,
      address: gateway.address,
      removed: false
    })
    
    // 同时添加到目标网关列表（作为待映射）
    mappingDetail.value.targetGateways.push({
      id: gateway.id,
      name: null,
      type: null,
      status: null,
      address: null
    })
  })
  
  showGatewaySelector.value = false
  selectedGateways.value = []
  ElMessage.success('添加成功')
}

const goToAddGateway = () => {
  // 跳转到新建出口网关页面
  router.push({ name: 'EgressNodeAdd' })
}

const refreshGateways = () => {
  // 刷新可用网关列表
  console.log('刷新网关列表')
  ElMessage.success('刷新成功')
}

onMounted(() => {
  const id = route.params.id
  // 模拟根据ID获取映射详情数据
  console.log('加载映射详情:', id)
})
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

              .status-normal {
                font-size: 14px;
                color: #3D3D3D;
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
