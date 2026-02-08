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
                :key="cluster.value"
                :command="cluster"
                :class="{ 'is-active': cluster.name === currentCluster }"
              >
                {{ cluster.name }}
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
            <el-dropdown-item command="changePassword">
              <el-icon><Lock /></el-icon>
              修改密码
            </el-dropdown-item>
            <el-dropdown-item command="logout" divided>
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
import { ref } from 'vue'
import { Sort, User, Lock, SwitchButton } from '@element-plus/icons-vue'

const avatarUrl = ref('https://image-resource.mastergo.com/119687812066963/121410034174635/7fcccb77aeb367f24823a38389ec7544.png')

// 集群相关
const currentCluster = ref('默认集群')
const clusters = ref([
  { name: '默认集群', value: 'default' },
  { name: '测试集群', value: 'test' },
  { name: '生产集群', value: 'prod' }
])

const handleClusterChange = (cluster) => {
  currentCluster.value = cluster.name
  // 这里可以添加切换集群的逻辑
}

// 用户菜单相关
const handleLogout = () => {
  // 退出登录逻辑
  console.log('退出登录')
}

const handleChangePassword = () => {
  // 修改密码逻辑
  console.log('修改密码')
}

const handleUserCommand = (command) => {
  if (command === 'logout') {
    handleLogout()
  } else if (command === 'changePassword') {
    handleChangePassword()
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
