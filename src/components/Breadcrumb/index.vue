<template>
  <div class="breadcrumb-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
        {{ item }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbList = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => item.meta.title)
})
</script>

<style lang="scss" scoped>
.breadcrumb-container {
  padding: 16px 32px 0;
  
  :deep(.el-breadcrumb__inner) {
    font-family: 'Inter';
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
    color: #303133;
  }
}
</style>
