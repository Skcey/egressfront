<template>
  <div class="target-address-config">
    <div class="form-item">
      <label class="form-label">
        <span class="required">*</span>
        目标地址：
      </label>
      <div class="address-config-wrapper">
        <div class="address-inputs-wrapper">
          <el-input
            v-model="targetCIDR"
            placeholder="请输入目标CIDR"
            style="width: 146px"
          />
          <div class="divider-box">屏蔽</div>
          <el-input
            v-model="blockCIDR"
            placeholder="请输入需要屏蔽的目标CIDR，多个配置以英文逗号分隔"
            style="width: 383px"
          />
          <el-icon
            :size="16"
            class="add-icon"
            @click="addTargetAddress"
          >
            <CirclePlus />
          </el-icon>
        </div>

        <!-- 已添加的地址标签 -->
        <div v-if="localTargetAddresses.length > 0" class="address-tag-list">
          <el-tag
            v-for="(address, index) in localTargetAddresses"
            :key="index"
            closable
            @close="removeTargetAddress(index)"
            size="small"
            type="info"
          >
            {{ address }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { CirclePlus } from '@element-plus/icons-vue'

const props = defineProps({
  targetAddresses: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:targetAddresses'])

// 本地响应式数据
const targetCIDR = ref('')
const blockCIDR = ref('')

const localTargetAddresses = computed({
  get: () => props.targetAddresses,
  set: (value) => emit('update:targetAddresses', value)
})

// 添加目标地址
const addTargetAddress = () => {
  if (!targetCIDR.value || !targetCIDR.value.trim()) {
    ElMessage.warning('请输入目标CIDR')
    return
  }
  
  let addressText = targetCIDR.value.trim()
  if (blockCIDR.value && blockCIDR.value.trim()) {
    addressText += ' 屏蔽 ' + blockCIDR.value.trim()
  }
  
  const newAddresses = [...localTargetAddresses.value, addressText]
  emit('update:targetAddresses', newAddresses)
  
  // 清空输入框
  targetCIDR.value = ''
  blockCIDR.value = ''
}

// 删除目标地址
const removeTargetAddress = (index) => {
  const newAddresses = [...localTargetAddresses.value]
  newAddresses.splice(index, 1)
  emit('update:targetAddresses', newAddresses)
}
</script>

<style lang="scss" scoped>
.target-address-config {
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

      .required {
        color: #FF4D4F;
        margin-right: 4px;
      }
    }

    .address-config-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .address-inputs-wrapper {
      display: flex;
      align-items: center;

      .divider-box {
        padding: 5px 8px;
        font-size: 14px;
        color: #3D3D3D;
        background: #E9E9EB;
        line-height: 22px;
      }

      .add-icon {
        color: #303133;
        cursor: pointer;
        flex-shrink: 0;
        margin-left: 8px;

        &:hover {
          color: #409EFF;
        }
      }
    }

    .address-tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}
</style>