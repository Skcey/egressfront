<template>
  <div class="sidebar-container" :class="{ collapsed: isCollapsed }">
    <div class="logo">
      <div class="logo-left">
        <el-icon :size="20" color="#409EFF">
          <Platform />
        </el-icon>
        <span class="logo-text">Egress 管理</span>
      </div>
    </div>
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      background-color="#FFFFFF"
      text-color="#303133"
      active-text-color="#409EFF"
    >
      <el-menu-item index="node" @click="handleMenuClick('NodeInfo')">
        <el-icon><Menu /></el-icon>
        <span>节点信息</span>
      </el-menu-item>
      <el-menu-item index="egress" @click="handleMenuClick('Egress')">
        <el-icon><Menu /></el-icon>
        <span>出口网关</span>
      </el-menu-item>
      <el-menu-item index="egress-mapping" @click="handleMenuClick('EgressMapping')">
        <el-icon><Menu /></el-icon>
        <span>出口网关映射</span>
      </el-menu-item>
      <el-menu-item index="egress-route" @click="handleMenuClick('EgressRoute')">
        <el-icon><Menu /></el-icon>
        <span>出口网关路由</span>
      </el-menu-item>
    </el-menu>
    <div class="footer" @click="toggleSidebar">
      <el-icon :size="16" color="#303133">
        <Fold v-if="isCollapsed" />
        <Expand v-else />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Platform, Menu, Expand, Fold } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const isCollapsed = ref(false)

// 根据路由名称映射菜单索引
const routeNameToMenuIndex = {
  'NodeInfo': 'node',
  'Egress': 'egress',
  'EgressNodeAdd': 'egress',
  'EgressNodeDetail': 'egress',
  'EgressMapping': 'egress-mapping',
  'EgressMappingAdd': 'egress-mapping',
  'EgressMappingDetail': 'egress-mapping',
  'EgressRoute': 'egress-route',
  'EgressRouteAdd': 'egress-route',
  'EgressRouteDetail': 'egress-route',
  'EgressRouteEdit': 'egress-route'
}

const activeMenu = computed(() => {
  return routeNameToMenuIndex[route.name] || 'node'
})

const handleMenuClick = (routeName) => {
  const clusterName = route.params.clusterName || 'default'
  router.push({
    name: routeName,
    params: { clusterName }
  })
}

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style lang="scss" scoped>
.sidebar-container {
  width: 200px;
  height: 100vh;
  background-color: #FFFFFF;
  border-right: 1px solid #E4E7ED;
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;

  &.collapsed {
    width: 64px;
  }
  
  .logo {
    width: 200px;
    height: 48px;
    padding: 12px 16px;
    display: flex;
    align-items: center;

    .logo-left {
      display: flex;
      align-items: center;
      gap: 4px;

      .logo-text {
        font-family: 'PingFang SC';
        font-size: 16px;
        font-weight: 600;
        line-height: 24px;
        color: #303133;
        transition: opacity 0.3s ease;
      }
    }
  }

  &.collapsed {
    .logo {
      width: 64px;
      padding: 12px 12px;

      .logo-left .logo-text {
        opacity: 0;
      }
    }
  }
  
  .sidebar-menu {
    flex: 1;
    border-right: none;

    :deep(.el-menu-item) {
      height: 46px;
      line-height: 46px;
      padding: 12px 20px;
      transition: padding 0.3s ease;

      &.is-active {
        color: #409EFF;
        background-color: transparent;
      }

      span {
        margin-left: 4px;
        font-family: 'Inter';
        font-size: 14px;
        font-weight: 400;
        line-height: 22px;
        transition: opacity 0.3s ease;
      }
    }
  }

  &.collapsed {
    .sidebar-menu :deep(.el-menu-item) {
      padding: 12px 16px;
      justify-content: center;

      span {
        opacity: 0;
        position: absolute;
        left: -9999px;
      }
    }
  }
  
  .footer {
    width: 200px;
    height: 40px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: padding 0.3s ease;

    &:hover {
      background-color: #F5F7FA;
    }
  }

  &.collapsed {
    .footer {
      width: 64px;
      padding: 12px 16px;
      justify-content: center;
    }
  }
}
</style>
