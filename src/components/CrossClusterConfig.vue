<template>
  <div class="cross-cluster-config">
    <!-- 跨集群访问对象 - 只有实体网关才能配置 -->
    <div v-if="!isGatewayMapped" class="section-checkbox">
      <el-checkbox v-model="localEnableCrossCluster">配置跨集群访问对象</el-checkbox>
    </div>

    <div v-if="localEnableCrossCluster" class="cross-cluster-wrapper">
      <!-- 步骤1: 选择映射实例 -->
      <div class="cross-cluster-step">
        <div class="step-header">
          <div class="step-number active">1</div>
          <span class="step-title">选择 {{ gatewayName || '出口网关' }} 的映射实例</span>
        </div>
        <div class="step-content-area">
          <div class="select-row">
            <el-select
              v-model="localCrossCluster.targetCluster"
              placeholder="请选择目标集群"
              size="default"
              @change="handleTargetClusterChange"
            >
              <el-option
                v-for="cluster in clusterOptions"
                :key="cluster.value"
                :label="cluster.label"
                :value="cluster.value"
              />
            </el-select>
            <el-select
              v-model="localCrossCluster.mappedGateway"
              :placeholder="localCrossCluster.targetCluster ? '请选择映射网关' : '请先选择目标集群'"
              :disabled="!localCrossCluster.targetCluster"
              size="default"
              @change="handleMappingGatewayChange"
            >
              <el-option
                v-for="gateway in mappingGatewayOptions"
                :key="gateway.value"
                :label="gateway.label"
                :value="gateway.value"
              />
            </el-select>
          </div>
          <div class="help-text">
            可通过在目标集群中
            <span class="clickable-link" @click="navigateToCreateMapping">新建出口网关映射</span>
            ，实现配置 "{{ gatewayName || '当前网关' }}" 的映射网关实例
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
              v-model="localCrossCluster.namespace"
              :placeholder="localCrossCluster.mappedGateway ? '请选择命名空间' : '请先选择映射网关'"
              :disabled="!localCrossCluster.mappedGateway"
              size="default"
              @change="handleNamespaceChange"
            >
              <el-option
                v-for="ns in namespaceOptions"
                :key="ns.value"
                :label="ns.label"
                :value="ns.value"
              />
            </el-select>
            <el-select
              v-model="localCrossCluster.egressRoute"
              :placeholder="localCrossCluster.namespace ? '请选择路由' : '请先选择命名空间'"
              :disabled="!localCrossCluster.namespace"
              size="default"
            >
              <el-option
                v-for="route in routeOptions"
                :key="route.value"
                :label="route.label"
                :value="route.value"
              />
            </el-select>
          </div>
          <div class="help-text">
            在目标集群的映射网关下配置出口路由，设定需访问的跨集群对象及访问目标地址，可前往
            <span class="clickable-link" @click="navigateToCreateRoute">新建出口路由</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  enableCrossCluster: {
    type: Boolean,
    default: false
  },
  crossCluster: {
    type: Object,
    default: () => ({
      targetCluster: '',
      mappedGateway: '',
      namespace: '',
      egressRoute: ''
    })
  },
  isGatewayMapped: {
    type: Boolean,
    default: false
  },
  gatewayName: {
    type: String,
    default: ''
  },
  clusterOptions: {
    type: Array,
    default: () => []
  },
  mappingGatewayOptions: {
    type: Array,
    default: () => []
  },
  namespaceOptions: {
    type: Array,
    default: () => []
  },
  routeOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:enableCrossCluster',
  'update:crossCluster',
  'target-cluster-change',
  'mapping-gateway-change',
  'namespace-change',
  'navigate-to-create-mapping',
  'navigate-to-create-route'
])

// 本地响应式数据
const localEnableCrossCluster = computed({
  get: () => props.enableCrossCluster,
  set: (value) => emit('update:enableCrossCluster', value)
})

const localCrossCluster = computed({
  get: () => props.crossCluster,
  set: (value) => emit('update:crossCluster', value)
})

// 事件处理
const handleTargetClusterChange = (targetCluster) => {
  const newCrossCluster = {
    ...localCrossCluster.value,
    targetCluster,
    mappedGateway: '',
    namespace: '',
    egressRoute: ''
  }
  emit('update:crossCluster', newCrossCluster)
  emit('target-cluster-change', targetCluster)
}

const handleMappingGatewayChange = (mappedGateway) => {
  const newCrossCluster = {
    ...localCrossCluster.value,
    mappedGateway,
    namespace: '',
    egressRoute: ''
  }
  emit('update:crossCluster', newCrossCluster)
  emit('mapping-gateway-change', mappedGateway)
}

const handleNamespaceChange = (namespace) => {
  const newCrossCluster = {
    ...localCrossCluster.value,
    namespace,
    egressRoute: ''
  }
  emit('update:crossCluster', newCrossCluster)
  emit('namespace-change', namespace)
}

const navigateToCreateMapping = () => {
  if (!localCrossCluster.value.targetCluster) {
    ElMessage.warning('请先选择目标集群')
    return
  }
  emit('navigate-to-create-mapping', localCrossCluster.value.targetCluster)
}

const navigateToCreateRoute = () => {
  if (!localCrossCluster.value.targetCluster) {
    ElMessage.warning('请先选择目标集群')
    return
  }
  emit('navigate-to-create-route', localCrossCluster.value.targetCluster)
}
</script>

<style lang="scss" scoped>
.cross-cluster-config {
  .section-checkbox {
    margin-bottom: 8px;
    padding: 8px;
    background: #E9E9EB;

    :deep(.el-checkbox__label) {
      font-size: 14px;
      color: #606266;
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
          
          .clickable-link {
            color: #409EFF;
            cursor: pointer;
            text-decoration: none;
            transition: color 0.2s ease;
            
            &:hover {
              color: #66B1FF;
              text-decoration: underline;
            }
            
            &:active {
              color: #337ECC;
            }
          }
        }
      }
    }
  }
}
</style>