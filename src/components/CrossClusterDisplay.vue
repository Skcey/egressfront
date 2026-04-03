<template>
  <div class="cross-cluster-display">
    <div v-if="showTitle" class="section-title-row">
      <span class="section-title-text">{{ title }}</span>
    </div>

    <div :class="wrapperClass">
      <div class="confirm-card">
        <div :class="rowClass">
          <div class="cross-cluster-item">
            <span class="info-label">
              {{ gatewayName }} 的映射网关 {{ crossCluster.targetCluster }} / {{ crossCluster.mappedGateway }}
            </span>
          </div>
          <div class="cross-cluster-item">
            <span class="info-label">
              关联跨集群映射网关的出口路由 {{ crossCluster.namespace }} / {{ crossCluster.egressRoute }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <el-empty v-if="!crossCluster || !hasValidData" description="暂无跨集群访问对象" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  crossCluster: {
    type: Object,
    default: () => ({})
  },
  gatewayName: {
    type: String,
    default: '出口网关'
  },
  title: {
    type: String,
    default: '跨集群访问对象'
  },
  showTitle: {
    type: Boolean,
    default: true
  },
  // 样式变体：'confirm' (确认页面) | 'detail' (详情页面)
  variant: {
    type: String,
    default: 'confirm',
    validator: (value) => ['confirm', 'detail'].includes(value)
  }
})

// 根据变体计算包装器类名
const wrapperClass = computed(() => {
  switch (props.variant) {
    case 'confirm':
      return 'cross-cluster-confirm'
    case 'detail':
      return 'confirm-content-wrapper'
    default:
      return 'cross-cluster-confirm'
  }
})

// 根据变体计算行类名
const rowClass = computed(() => {
  switch (props.variant) {
    case 'confirm':
      return 'cross-cluster-text-wrapper'
    case 'detail':
      return 'cross-cluster-row'
    default:
      return 'cross-cluster-text-wrapper'
  }
})

// 检查是否有有效数据
const hasValidData = computed(() => {
  const cc = props.crossCluster
  return cc && (cc.targetCluster || cc.mappedGateway || cc.namespace || cc.egressRoute)
})
</script>

<style lang="scss" scoped>
.cross-cluster-display {
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

  .cross-cluster-confirm {
    background-color: #F4F4F5;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .cross-cluster-text-wrapper {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .cross-cluster-item {
      .info-label {
        font-size: 14px;
        color: #3D3D3D;
      }
    }
  }

  .confirm-content-wrapper {
    border: 1px solid #DEDFE0;
    border-top: none;
    border-radius: 0 5px 5px;
    padding: 8px;
    background: #FFFFFF;

    .confirm-card {
      background-color: #F4F4F5;
      padding: 4px;
      border-radius: 4px;
      position: relative;

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
    }
  }
}
</style>