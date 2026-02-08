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
          <el-tag v-if="routeData.status === '正常'" type="success" class="type-tag">正常</el-tag>
          <el-tag v-else type="danger" class="type-tag">异常</el-tag>
        </div>
      </div>
      <div class="title-actions">
        <el-switch v-model="routeData.enabled" @change="handleSwitchChange" />
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
          <span :class="routeData.status === '正常' ? 'status-normal' : ''">{{ routeData.status }}</span>
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
          <span class="config-value">{{ routeData.gateway }}</span>
          <el-tag type="primary" size="small" style="margin-left: 13px">实体</el-tag>
        </div>

        <!-- 访问目标地址 -->
        <div class="config-row">
          <span class="config-label">访问目标地址：</span>
          <el-tag size="small" type="info">{{ routeData.targetAddress }}</el-tag>
        </div>

        <!-- 本集群访问对象/跨集群访问对象 -->
        <div class="config-tabs">
          <el-tabs v-model="activeTab" type="card">
            <!-- 本集群访问对象 -->
            <el-tab-pane label="本集群访问对象" name="local">
              <div class="tab-content">
                <div class="access-section">
                  <div class="access-row">
                    <div class="access-item">
                      <span class="access-label">命名空间选择器</span>
                      <div class="tag-group">
                        <el-tag
                          v-for="(tag, index) in routeData.localAccess.namespaceSelectors"
                          :key="index"
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
                        <span class="pod-type">部分Pod</span>
                        <div class="tag-group">
                          <el-tag
                            v-for="(tag, index) in routeData.localAccess.podSelectors"
                            :key="index"
                            size="small"
                            type="info"
                          >
                            {{ tag }}
                          </el-tag>
                        </div>
                      </div>
                    </div>
                  </div>
                  <el-link type="primary" @click="handleViewMatch('local')">查看匹配对象</el-link>
                </div>

                <div class="access-section">
                  <div class="access-row">
                    <div class="access-item">
                      <span class="access-label">命名空间选择器</span>
                      <div class="tag-group">
                        <el-tag
                          v-for="(tag, index) in routeData.localAccess.namespaceSelectors2"
                          :key="index"
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
                        <span class="pod-type">部分Pod</span>
                        <div class="tag-group">
                          <el-tag
                            v-for="(tag, index) in routeData.localAccess.podSelectors2"
                            :key="index"
                            size="small"
                            type="info"
                          >
                            {{ tag }}
                          </el-tag>
                        </div>
                      </div>
                    </div>
                  </div>
                  <el-link type="primary" @click="handleViewMatch('local')">查看匹配对象</el-link>
                </div>
              </div>
            </el-tab-pane>

            <!-- 跨集群访问对象 -->
            <el-tab-pane label="跨集群访问对象" name="cross">
              <div class="tab-content">
                <div class="cross-cluster-header">
                  <span class="header-text">关联跨集群网关映射实例下出口路由</span>
                </div>

                <div class="cross-cluster-section">
                  <!-- 关联的出口路由卡片 -->
                  <div class="route-card">
                    <div class="route-card-header">
                      <div class="route-name-row">
                        <span class="route-name">{{ routeData.crossCluster.routeName }}</span>
                        <el-tag type="success" size="small" style="margin-left: 14px">正常</el-tag>
                      </div>
                    </div>
                    <div class="route-card-body">
                      <div class="card-info-item">
                        <span class="info-label">所属出口网关</span>
                        <div class="info-value">
                          <span>{{ routeData.crossCluster.gateway }}</span>
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
                  <div class="access-section">
                    <div class="access-row">
                      <div class="access-item">
                        <span class="access-label">命名空间选择器</span>
                        <div class="tag-group">
                          <el-tag
                            v-for="(tag, index) in routeData.crossCluster.namespaceSelectors"
                            :key="index"
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
                          <span class="pod-type">部分Pod</span>
                          <div class="tag-group">
                            <el-tag
                              v-for="(tag, index) in routeData.crossCluster.podSelectors"
                              :key="index"
                              size="small"
                              type="info"
                            >
                              {{ tag }}
                            </el-tag>
                          </div>
                        </div>
                      </div>
                    </div>
                    <el-link type="primary" @click="handleViewMatch('cross')">查看匹配对象</el-link>
                  </div>

                  <div class="access-section">
                    <div class="access-row">
                      <div class="access-item">
                        <span class="access-label">命名空间选择器</span>
                        <div class="tag-group">
                          <el-tag
                            v-for="(tag, index) in routeData.crossCluster.namespaceSelectors2"
                            :key="index"
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
                          <span class="pod-type">部分Pod</span>
                          <div class="tag-group">
                            <el-tag
                              v-for="(tag, index) in routeData.crossCluster.podSelectors2"
                              :key="index"
                              size="small"
                              type="info"
                            >
                              {{ tag }}
                            </el-tag>
                          </div>
                        </div>
                      </div>
                    </div>
                    <el-link type="primary" @click="handleViewMatch('cross')">查看匹配对象</el-link>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
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
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Menu } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 路由数据
const routeData = ref({
  name: '出口网关路由名称',
  status: '正常',
  cluster: '集群名称',
  namespace: '命名空间名称',
  createTime: '2023-10-22 12:21:34',
  gateway: '出口网关名称',
  targetAddress: '192.168.1.1/24 屏蔽 192.168.1.1',
  enabled: true,
  localAccess: {
    namespaceSelectors: ['key = value', 'key = value', 'key = value', 'key = value'],
    podSelectors: ['key = value', 'key = value', 'key = value', 'key = value'],
    namespaceSelectors2: ['key = value', 'key = value', 'key = value', 'key = value'],
    podSelectors2: ['key = value', 'key = value', 'key = value', 'key = value']
  },
  crossCluster: {
    routeName: '出口路由名称',
    gateway: '出口网关名称',
    cluster: '集群名称',
    effectiveAddress: '192.168.1.1/24 屏蔽 192.168.1.1',
    namespaceSelectors: ['key = value', 'key = value', 'key = value', 'key = value'],
    podSelectors: ['key = value', 'key = value', 'key = value', 'key = value'],
    namespaceSelectors2: ['key = value', 'key = value', 'key = value', 'key = value'],
    podSelectors2: ['key = value', 'key = value', 'key = value', 'key = value']
  }
})

// 当前激活的标签页
const activeTab = ref('local')

// 查看匹配对象抽屉
const matchDrawerVisible = ref(false)
const matchTableData = ref([
  { podName: '节点1', namespace: '10.10.103.80', status: '正常' },
  { podName: '节点2', namespace: '10.10.103.79', status: '正常' },
  { podName: '节点3', namespace: '10.10.103.78', status: '正常' },
  { podName: '节点4', namespace: '10.10.103.77', status: '异常' }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(1000)

// 返回
const goBack = () => {
  router.back()
}

// 开关变更
const handleSwitchChange = (value) => {
  routeData.value.status = value ? '正常' : '异常'
}

// 删除
const handleDelete = () => {
  ElMessageBox.confirm('确定要删除该路由吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    router.back()
  }).catch(() => {})
}

// 编辑
const handleEdit = () => {
  router.push({ name: 'EgressRouteEdit', params: { id: route.params.id } })
}

// 查看匹配对象
const handleViewMatch = (type) => {
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

        &.status-normal {
          color: #67C23A;
          font-weight: 500;
        }
      }
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
        }

        .access-section {
          background: #F4F4F5;
          padding: 4px;
          margin-bottom: 8px;
          border-radius: 4px;
          position: relative;

          .access-row {
            display: flex;
            gap: 62px;
            padding: 0;

            .access-item {
              flex: 1;
              display: flex;
              gap: 4px;

              .access-label {
                font-size: 14px;
                color: #3D3D3D;
                white-space: nowrap;
                line-height: 26px;
              }

              .tag-group {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
              }

              .pod-content {
                display: flex;
                flex-direction: column;
                gap: 4px;
                flex: 1;

                .pod-type {
                  font-size: 14px;
                  color: #3D3D3D;
                }
              }
            }
          }

          .el-link {
            position: absolute;
            right: 4px;
            top: 4px;
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
}
</style>
