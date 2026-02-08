<template>
  <div class="egress-mapping-create">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'EgressMapping' }">出口网关映射</el-breadcrumb-item>
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
            />
          </div>
        </div>
        <div class="form-item">
          <div class="form-label required">所属集群：</div>
          <div class="form-value">
            <el-select
              v-model="formData.cluster"
              placeholder="默认集群"
              disabled
              style="width: 320px"
            >
              <el-option label="默认集群" value="default" />
            </el-select>
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
            >
              <el-option label="集群1" value="cluster1" />
              <el-option label="集群2" value="cluster2" />
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
                :key="gateway.id"
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
      <el-button type="primary" @click="handleSubmit">新建</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </div>

    <!-- 添加出口网关抽屉 -->
    <el-drawer
      v-model="showGatewayDrawer"
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
          <el-table-column property="type" label="类型" width="120" />
          <el-table-column property="status" label="状态" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'" size="small">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column property="address" label="地址" width="180" />
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="handleDrawerCancel">取消</el-button>
          <el-button type="primary" @click="handleDrawerConfirm">确认</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Menu, CircleCloseFilled, Document } from '@element-plus/icons-vue'

const router = useRouter()

// 表单数据
const formData = reactive({
  name: '',
  cluster: 'default',
  gatewayCluster: '',
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' }
  ],
  cluster: [
    { required: true, message: '请选择所属集群', trigger: 'change' }
  ],
  gatewayCluster: [
    { required: true, message: '请选择网关集群', trigger: 'change' }
  ]
}

// 已选择的网关列表
const selectedGateways = ref([])

// 抽屉相关
const showGatewayDrawer = ref(false)
const multipleTableRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 可选的网关列表
const availableGateways = ref([
  { id: 1, name: '网关1', type: '实体', status: '正常', address: '10.0.0.1' },
  { id: 2, name: '网关2', type: '实体', status: '正常', address: '10.0.0.2' },
  { id: 3, name: '网关3', type: '虚拟', status: '异常', address: '10.0.0.3' }
])

const selectedInDrawer = ref([])

const formRef = ref(null)

// 返回
const handleBack = () => {
  router.back()
}

// 移除网关
const removeGateway = (index) => {
  selectedGateways.value.splice(index, 1)
}

// 添加出口网关
const handleAddGateway = () => {
  showGatewayDrawer.value = true
}

// 前往新建出口网关
const goToAddGateway = () => {
  router.push('/egress/add')
}

// 刷新网关列表
const refreshGateways = () => {
  ElMessage.success('刷新成功')
  // TODO: 实际项目中调用API刷新数据
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedInDrawer.value = selection
}

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 抽屉取消
const handleDrawerCancel = () => {
  showGatewayDrawer.value = false
}

// 抽屉确认
const handleDrawerConfirm = () => {
  if (selectedInDrawer.value.length === 0) {
    ElMessage.warning('请至少选择一个出口网关')
    return
  }
  selectedGateways.value = [...selectedInDrawer.value]
  showGatewayDrawer.value = false
  ElMessage.success('添加成功')
}

// 提交表单
const handleSubmit = async () => {
  if (!formData.name) {
    ElMessage.warning('请输入名称')
    return
  }
  if (!formData.gatewayCluster) {
    ElMessage.warning('请选择网关集群')
    return
  }
  if (selectedGateways.value.length === 0) {
    ElMessage.warning('请至少添加一个出口网关节点')
    return
  }
  // TODO: 提交数据到后端
  ElMessage.success('创建成功')
  router.push({ name: 'EgressMapping' })
}

// 取消
const handleCancel = () => {
  router.back()
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
}
</style>
