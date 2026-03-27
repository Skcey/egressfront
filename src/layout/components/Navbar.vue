<template>
  <div class="navbar">
    <div class="left">
      <div class="cluster-info">
        <span class="cluster-name">{{ currentCluster }}</span>
        <el-dropdown @command="handleClusterChange" trigger="click">
          <div class="cluster-dropdown">
            <el-icon :size="16" color="#303133">
              <Sort />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="cluster in clusters"
                :key="cluster.name"
                :command="cluster"
                :class="{ 'is-active': cluster.displayName === currentCluster }"
              >
                {{ cluster.displayName }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="toolbar">
      <el-dropdown @command="handleUserCommand" trigger="click">
        <div class="user-info">
          <el-avatar :size="32" shape="square" :src="avatarUrl" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Sort, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useClusterStore } from '@/stores/cluster'
import { logout } from '@/api/auth'
import avatarImage from '@/assets/images/avatar.png'

const route = useRoute()
const router = useRouter()
const clusterStore = useClusterStore()

const avatarUrl = ref(avatarImage)

// 使用store中的集群信息
const currentCluster = computed(() => clusterStore.currentClusterDisplayName)
const clusters = computed(() => clusterStore.clusters)

// 切换集群
const handleClusterChange = (cluster) => {
  // 更新store中的当前集群
  clusterStore.setCurrentCluster(cluster.name)
  
  // 获取当前路由名称，保持在相同的页面，只切换集群
  const currentRouteName = route.name
  const currentParams = { ...route.params, clusterName: cluster.name }
  
  router.push({
    name: currentRouteName,
    params: currentParams,
    query: route.query
  })
}

// 页面加载时确保集群列表已加载
onMounted(async () => {
  if (clusterStore.clusters.length === 0) {
    try {
      await clusterStore.fetchClusters()
    } catch (error) {
      console.error('获取集群列表失败:', error)
      ElMessage.error('获取集群列表失败')
    }
  }
})

// 用户菜单相关
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    try {
      // 调用后端登出接口
      await logout()
    } catch (error) {
      console.warn('后端登出失败:', error)
      // 即使后端登出失败，也要清除前端数据
    }
    
    // 清除本地存储的用户信息
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    
    ElMessage.success('退出登录成功')
    
    // 跳转到登录页面
    router.push('/login')
  } catch {
    // 用户取消退出
  }
}

const handleUserCommand = (command) => {
  if (command === 'logout') {
    handleLogout()
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 48px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E4E7ED;
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.12);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  
  .left {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 4px;

    .cluster-info {
      display: flex;
      align-items: center;

      .cluster-name {
        font-family: 'Inter';
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
        color: #303133;
      }

      .cluster-dropdown {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 4px;

        &:hover {
          background-color: #F7F8FA;
        }
      }
    }
  }
  
  .toolbar {
    display: flex;
    align-items: center;

    .user-info {
      padding: 8px;
      cursor: pointer;
      border-radius: 4px;

      &:hover {
        background-color: #F7F8FA;
      }
    }
  }

  // 下拉菜单样式
  :deep(.el-dropdown-menu) {
    .el-dropdown-menu__item {
      &.is-active {
        color: #409EFF;
        background-color: #ECF5FF;
      }

      &:hover {
        background-color: #F5F7FA;
      }
    }
  }
}
</style>
