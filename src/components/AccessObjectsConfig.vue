<template>
  <div class="access-objects-config">
    <!-- 配置本集群访问对象 -->
    <div class="section-checkbox">
      <el-checkbox v-model="localEnableLocalAccess">配置本集群访问对象</el-checkbox>
    </div>

    <div v-if="localEnableLocalAccess" class="config-content-wrapper">
      <div
        v-for="(obj, objIndex) in localAccessObjects"
        :key="objIndex"
        class="access-object-section"
      >
        <el-icon
          v-if="localAccessObjects.length > 1"
          :size="16"
          color="#F56C6C"
          @click="removeAccessObject(objIndex)"
          class="delete-object-icon"
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
                    v-model="obj.namespaceKey"
                    placeholder="Please input"
                    size="default"
                  />
                </div>
                <div class="input-item">
                  <span class="input-item-label">Value:</span>
                  <el-input
                    v-model="obj.namespaceValue"
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
              <div v-if="obj.namespaceSelectors.length > 0" class="tag-list">
                <el-tag
                  v-for="(tag, tagIndex) in obj.namespaceSelectors"
                  :key="tagIndex"
                  closable
                  @close="removeNamespaceSelector(objIndex, tagIndex)"
                  size="small"
                  type="info"
                >
                  {{ tag.key }} = {{ tag.value }}
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
                v-model="obj.podType"
                :disabled="obj.namespaceSelectors.length === 0"
              >
                <el-radio label="all">全部Pod</el-radio>
                <el-radio label="partial">部分Pod</el-radio>
              </el-radio-group>

              <!-- 部分Pod的key-value输入 -->
              <div
                v-if="obj.podType === 'partial'"
                class="pod-selector-inputs"
              >
                <div class="key-value-inputs">
                  <div class="input-item">
                    <span class="input-item-label">Key:</span>
                    <el-input
                      v-model="obj.podKey"
                      placeholder="Please input"
                      size="default"
                    />
                  </div>
                  <div class="input-item">
                    <span class="input-item-label">Value:</span>
                    <el-input
                      v-model="obj.podValue"
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
                  v-if="obj.podSelectors.length > 0"
                  class="tag-list"
                >
                  <el-tag
                    v-for="(tag, tagIndex) in obj.podSelectors"
                    :key="tagIndex"
                    closable
                    @close="removePodSelector(objIndex, tagIndex)"
                    size="small"
                    type="info"
                  >
                    {{ tag.key }} = {{ tag.value }}
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
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { CircleCloseFilled, CirclePlus, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  enableLocalAccess: {
    type: Boolean,
    default: false
  },
  accessObjects: {
    type: Array,
    default: () => [{
      namespaceKey: '',
      namespaceValue: '',
      namespaceSelectors: [],
      podType: 'all',
      podKey: '',
      podValue: '',
      podSelectors: []
    }]
  }
})

const emit = defineEmits(['update:enableLocalAccess', 'update:accessObjects'])

// 本地响应式数据
const localEnableLocalAccess = computed({
  get: () => props.enableLocalAccess,
  set: (value) => emit('update:enableLocalAccess', value)
})

const localAccessObjects = computed({
  get: () => props.accessObjects,
  set: (value) => emit('update:accessObjects', value)
})

// 添加访问对象
const addAccessObject = () => {
  const newObjects = [...localAccessObjects.value, {
    namespaceKey: '',
    namespaceValue: '',
    namespaceSelectors: [],
    podType: 'all',
    podKey: '',
    podValue: '',
    podSelectors: []
  }]
  emit('update:accessObjects', newObjects)
}

// 删除访问对象
const removeAccessObject = (index) => {
  if (localAccessObjects.value.length > 1) {
    const newObjects = [...localAccessObjects.value]
    newObjects.splice(index, 1)
    emit('update:accessObjects', newObjects)
  } else {
    ElMessage.warning('至少需要保留一个访问对象')
  }
}

// 添加命名空间选择器
const addNamespaceSelector = (objIndex) => {
  const obj = localAccessObjects.value[objIndex]
  if (obj.namespaceKey && obj.namespaceValue) {
    const newObjects = [...localAccessObjects.value]
    newObjects[objIndex].namespaceSelectors.push({
      key: obj.namespaceKey,
      value: obj.namespaceValue
    })
    newObjects[objIndex].namespaceKey = ''
    newObjects[objIndex].namespaceValue = ''
    emit('update:accessObjects', newObjects)
  } else {
    ElMessage.warning('请输入Key和Value')
  }
}

// 删除命名空间选择器
const removeNamespaceSelector = (objIndex, tagIndex) => {
  const newObjects = [...localAccessObjects.value]
  newObjects[objIndex].namespaceSelectors.splice(tagIndex, 1)
  emit('update:accessObjects', newObjects)
}

// 添加Pod选择器
const addPodSelector = (objIndex) => {
  const obj = localAccessObjects.value[objIndex]
  if (obj.podKey && obj.podValue) {
    const newObjects = [...localAccessObjects.value]
    newObjects[objIndex].podSelectors.push({
      key: obj.podKey,
      value: obj.podValue
    })
    newObjects[objIndex].podKey = ''
    newObjects[objIndex].podValue = ''
    emit('update:accessObjects', newObjects)
  } else {
    ElMessage.warning('请输入Key和Value')
  }
}

// 删除Pod选择器
const removePodSelector = (objIndex, tagIndex) => {
  const newObjects = [...localAccessObjects.value]
  newObjects[objIndex].podSelectors.splice(tagIndex, 1)
  emit('update:accessObjects', newObjects)
}
</script>

<style lang="scss" scoped>
.access-objects-config {
  .section-checkbox {
    margin-bottom: 8px;
    padding: 8px;
    background: #E9E9EB;

    :deep(.el-checkbox__label) {
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
    }

    .pod-selector-inputs {
      display: flex;
      flex-direction: column;
      gap: 12px;
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
}
</style>