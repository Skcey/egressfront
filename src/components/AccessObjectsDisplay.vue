<template>
  <div class="access-objects-display">
    <div v-if="showTitle" class="section-title-row">
      <span class="section-title-text">{{ title }}</span>
    </div>

    <div :class="wrapperClass">
      <div
        v-for="(obj, objIndex) in accessObjects"
        :key="objIndex"
        class="confirm-card"
      >
        <div class="confirm-row">
          <div class="confirm-item">
            <label>命名空间选择器</label>
            <div class="tag-list">
              <el-tag
                v-for="(tag, tagIndex) in getNamespaceSelectors(obj)"
                :key="tagIndex"
                size="small"
                type="info"
              >
                {{ formatTag(tag) }}
              </el-tag>
            </div>
          </div>
          <div class="confirm-item">
            <label>Pod</label>
            <div class="pod-content">
              <span v-if="isPodTypeAll(obj)" class="pod-type-text">全部Pod</span>
              <template v-else>
                <span class="pod-type-text">部分Pod</span>
                <div class="tag-list">
                  <el-tag
                    v-for="(tag, tagIndex) in getPodSelectors(obj)"
                    :key="tagIndex"
                    size="small"
                    type="info"
                  >
                    {{ formatTag(tag) }}
                  </el-tag>
                </div>
              </template>
            </div>
          </div>
        </div>
        <el-link 
          type="primary" 
          class="view-link" 
          @click="handleViewMatch(objIndex)"
        >
          查看匹配对象
        </el-link>
      </div>
    </div>

    <!-- 无数据提示 -->
    <el-empty v-if="!accessObjects || accessObjects.length === 0" description="暂无访问对象" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  accessObjects: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: '本集群访问对象'
  },
  showTitle: {
    type: Boolean,
    default: true
  },
  // 样式变体：'confirm' (确认页面) | 'detail' (详情页面) | 'tab' (标签页)
  variant: {
    type: String,
    default: 'confirm',
    validator: (value) => ['confirm', 'detail', 'tab'].includes(value)
  }
})

const emit = defineEmits(['view-match'])

// 根据变体计算包装器类名
const wrapperClass = computed(() => {
  switch (props.variant) {
    case 'confirm':
      return 'confirm-cards-wrapper'
    case 'detail':
      return 'confirm-content-wrapper'
    case 'tab':
      return 'tab-content'
    default:
      return 'confirm-cards-wrapper'
  }
})

// 获取命名空间选择器
const getNamespaceSelectors = (obj) => {
  if (!obj) return []
  
  // 处理不同的数据格式
  if (obj.namespaceSelectors) {
    return obj.namespaceSelectors
  }
  return []
}

// 获取Pod选择器
const getPodSelectors = (obj) => {
  if (!obj) return []
  
  // 处理不同的数据格式
  if (obj.podSelectors) {
    return obj.podSelectors.filter(selector => selector !== '全部Pod')
  }
  return []
}

// 判断是否为全部Pod
const isPodTypeAll = (obj) => {
  if (!obj) return true
  
  // 处理不同的数据格式
  if (obj.podType === 'all') return true
  if (obj.podSelectors && obj.podSelectors.includes('全部Pod')) return true
  if (obj.podSelectors && obj.podSelectors.length === 0) return true
  
  return false
}

// 格式化标签显示
const formatTag = (tag) => {
  if (typeof tag === 'string') {
    return tag
  }
  if (typeof tag === 'object' && tag.key && tag.value) {
    return `${tag.key} = ${tag.value}`
  }
  return String(tag)
}

// 处理查看匹配对象
const handleViewMatch = (index) => {
  emit('view-match', 'local', index)
}
</script>

<style lang="scss" scoped>
.access-objects-display {
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

  .confirm-cards-wrapper,
  .confirm-content-wrapper {
    border: 1px solid #DEDFE0;
    border-top: none;
    border-radius: 0 5px 5px;
    padding: 8px;
    background: #FFFFFF;
  }

  .tab-content {
    padding: 0;
  }

  .confirm-card {
    background-color: #F4F4F5;
    padding: 4px;
    border-radius: 4px;
    margin-bottom: 8px;
    position: relative;

    &:last-child {
      margin-bottom: 0;
    }

    .confirm-row {
      display: flex;
      gap: 62px;
      padding: 4px;

      .confirm-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;

        label {
          font-size: 14px;
          color: #3D3D3D;
          font-weight: 400;
        }

        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .el-tag {
            background-color: #F4F4F5;
            color: #909399;
            border: 1px solid #767676;
          }
        }

        .pod-content {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;

          .pod-type-text {
            font-size: 14px;
            color: #3D3D3D;
          }

          .tag-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
        }
      }
    }

    .view-link {
      position: absolute;
      top: 4px;
      right: 8px;
      font-size: 14px;
    }
  }

  // 详情页面变体的特殊样式
  &.variant-detail {
    .confirm-card {
      .confirm-row {
        .confirm-item {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-direction: row;

          label {
            white-space: nowrap;
            line-height: 26px;
          }
        }
      }
    }
  }

  // 标签页变体的特殊样式
  &.variant-tab {
    .confirm-card {
      background-color: transparent;
      border: 1px solid #DEDFE0;
      margin-bottom: 16px;
      
      .confirm-row {
        gap: 32px;
        
        .confirm-item {
          .tag-list .el-tag {
            background-color: #F0F2F5;
            color: #606266;
            border: 1px solid #D9D9D9;
          }
        }
      }
    }
  }
}

// 根据变体应用不同的类
.access-objects-display.variant-detail {
  .confirm-row {
    .confirm-item {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-direction: row;
    }
  }
}
</style>