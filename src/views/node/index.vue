<template>
  <div class="node-info-page">
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>节点信息</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="content-wrapper">
      <div class="node-list">
        <div 
          v-for="node in nodeList" 
          :key="node.id" 
          class="node-card"
          :class="{ 'node-error': node.status === '异常' }"
        >
          <div class="node-icon-wrapper">
            <el-icon :size="60" color="#303133">
              <Platform />
            </el-icon>
          </div>
          <div class="node-info">
            <div class="node-name">{{ node.name }}</div>
            <div class="node-details">
              <div class="node-ip">节点IP: {{ node.ip }}</div>
              <div class="node-status">
                节点状态 ： 
                <span :class="{ 'status-error': node.status === '异常' }">
                  {{ node.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Platform } from '@element-plus/icons-vue'

const nodeList = ref([
  {
    id: 1,
    name: '节点1',
    ip: '10.10.103.80',
    status: '正常'
  },
  {
    id: 2,
    name: '节点2',
    ip: '10.10.103.79',
    status: '正常'
  },
  {
    id: 3,
    name: '节点3',
    ip: '10.10.101.80',
    status: '异常'
  },
  {
    id: 4,
    name: '节点4',
    ip: '10.10.103.81',
    status: '正常'
  },
  {
    id: 5,
    name: '节点5',
    ip: '10.10.103.82',
    status: '正常'
  },{
    id: 6,
    name: '节点6',
    ip: '10.10.103.83',
    status: '正常'
  }
])
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
      gap: 24px;
      
      .node-card {
        width: 100%;
        height: 100px;
        background-color: #F7F8FA;
        border-radius: 5px;
        padding: 16px 48px 16px 16px;
        display: flex;
        align-items: center;
        gap: 16px;
        
        &.node-error {
          background-color: #FFF2F2;
        }
        
        .node-icon-wrapper {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .node-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 24px;
          
          .node-name {
            font-family: 'Source Han Sans CN';
            font-size: 20px;
            line-height: 20px;
            color: #303133;
            min-width: 62px;
            text-align: center;
          }
          
            .node-details {
              display: flex;
              flex-direction: column;
              gap: 6px;

              .node-ip {
                font-family: 'Source Han Sans CN';
                font-size: 14px;
                line-height: 20px;
                color: #303133;
              }

              .node-status {
                font-family: 'Source Han Sans CN';
                font-size: 14px;
                line-height: 20px;
                color: #303133;
              
              .status-error {
                color: #EA0000;
              }
            }
          }
        }
      }
    }
  }
}
</style>
