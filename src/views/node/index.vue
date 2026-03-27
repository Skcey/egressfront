<template>
  <div class="node-info-page" v-loading="loading">
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>节点信息</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="content-wrapper">
      <div class="node-list" v-if="nodeList.length > 0">
        <div 
          v-for="node in nodeList" 
          :key="node.name" 
          class="node-card"
          :class="{ 'node-error': node.status === '异常' }"
        >
          <div class="node-icon-wrapper">
            <el-icon :size="48" color="#303133">
              <Platform />
            </el-icon>
          </div>
          <div class="node-info">
            <div class="node-name">{{ node.name }}</div>
            <div class="node-details">
              <div class="node-ip">节点IP: {{ node.ip }}</div>
              <div class="node-status">
                节点状态 ： 
                <span class="status-display">
                  <span 
                    class="status-dot" 
                    :class="{ 'dot-normal': node.status === '正常', 'dot-error': node.status === '异常' }"
                  ></span>
                  {{ node.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <el-empty description="暂无节点数据" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Platform } from '@element-plus/icons-vue'
import { getNodes } from '@/api/node'
import { ElMessage } from 'element-plus'

const route = useRoute()
const nodeList = ref([])
const loading = ref(false)

// 获取节点数据
const fetchNodeList = async () => {
  try {
    loading.value = true
    // 从路由参数获取集群名称
    const clusterName = route.params.clusterName
    
    const response = await getNodes(clusterName)
    
    // 处理返回的数据，将 status 数字转换为中文
    nodeList.value = response.data.map((node, index) => ({
      name: node.name,
      ip: node.ip,
      status: node.status === 1 ? '正常' : '异常',
      egressNodeDeployed: node.egressNodeDeployed
    }))
  } catch (error) {
    console.error('获取节点信息失败:', error)
    ElMessage.error('获取节点信息失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 监听路由参数变化，当切换集群时重新获取数据
watch(() => route.params.clusterName, () => {
  fetchNodeList()
})

// 页面加载时获取数据
onMounted(() => {
  fetchNodeList()
})
</script>

<style lang="scss" scoped>
.node-info-page {
  min-height: 100%;
  background-color: #FFFFFF;
  
  .breadcrumb-wrapper {
    padding: 16px 32px 0;
    
    :deep(.el-breadcrumb__inner) {
      font-family: 'Inter';
      font-size: 14px;
      font-weight: 600;
      line-height: 22px;
      color: #303133;
    }
  }
  
  .content-wrapper {
    padding: 16px 24px;
    
    .node-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      
      .node-card {
        width: 100%;
        height: 76chpx;
        background-color: #F7F8FA;
        border-radius: 5px;
        padding: 12px 32px 12px 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        
        &.node-error {
          background-color: #FFF2F2;
        }
        
        .node-icon-wrapper {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .node-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 20px;
          
          .node-name {
            font-family: 'Source Han Sans CN';
            font-size: 16px;
            line-height: 18px;
            color: #303133;
            min-width: 100px;
            text-align: left;
          }
          
          .node-details {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .node-ip {
              font-family: 'Source Han Sans CN';
              font-size: 13px;
              line-height: 18px;
              color: #303133;
            }
            .node-status {
              font-family: 'Source Han Sans CN';
              font-size: 13px;
              line-height: 18px;
              color: #303133;
              
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
                  background-color: #67C23A;
                }

                &.dot-error {
                  background-color: #EA0000;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
