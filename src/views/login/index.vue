<template>
  <div class="login-container">
    <!-- 背景图片 -->
    <div class="background-image"></div>
    
    <!-- 渐变遮罩 -->
    <div class="gradient-overlay"></div>
    
    <!-- 登录表单区域 -->
    <div class="login-form-container">
      <!-- 标题 -->
      <div class="system-title">
        <h1>Egress网关管理系统</h1>
      </div>
      
      <!-- 登录表单 -->
      <div class="login-form-wrapper">
        <!-- 登录表单 -->
        <el-form 
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              class="login-button"
              :loading="loginLoading"
              @click="handleLogin"
            >
              {{ loginLoading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/auth'
import { useClusterStore } from '@/stores/cluster'

const router = useRouter()
const clusterStore = useClusterStore()

// 加载状态
const loginLoading = ref(false)

// 表单引用
const loginFormRef = ref()

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 登录表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}


// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    loginLoading.value = true
    
    // 调用登录API
    const response = await login({
      username: loginForm.username,
      password: loginForm.password
    })
    
    if (response.success && response.data) {
      const loginResult = response.data
      
      // 存储token和用户信息
      localStorage.setItem('token', loginResult.token)
      localStorage.setItem('userInfo', JSON.stringify({
        userId: loginResult.userId,
        username: loginResult.username,
        expireTime: loginResult.expireTime,
        loginTime: new Date().toISOString()
      }))
      
      ElMessage.success('登录成功')
      
      // 初始化集群信息并跳转到第一个集群的节点页面
      await clusterStore.initializeClusters()
      
      // 跳转到主页 (会被路由守卫重定向到第一个集群)
      router.push('/')
    } else {
      ElMessage.error(response.errorMsg || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error(error.message || '登录失败，请检查用户名和密码')
  } finally {
    loginLoading.value = false
  }
}

</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 背景图片
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/images/login2.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

// 渐变遮罩
.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent 0%, rgba(1, 11, 42, 0.3) 20%, rgba(1, 11, 42, 0.7) 50%, #010b2a 100%);
  z-index: 2;
}

// 登录表单容器
.login-form-container {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 680px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

// 系统标题
.system-title {
  margin-bottom: 40px;
  text-align: center;
  
  h1 {
    font-size: 36px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    letter-spacing: 2px;
  }
}

// 登录表单包装器
.login-form-wrapper {
  width: 100%;
  background: rgba(255, 255, 255, 0);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 50px 40px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}


// 登录表单
.login-form {
  .el-form-item {
    margin-bottom: 24px;
    
    &:last-child {
      margin-top: 42px;
      margin-bottom: 0;
    }
    
    :deep(.el-input__wrapper) {
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      
      &:hover {
        background: rgba(255, 255, 255, 0.95);
        border-color: rgba(255, 255, 255, 0.5);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      &.is-focus {
        background: rgba(255, 255, 255, 0.98);
        border-color: #409eff;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
      }
    }
    
    :deep(.el-input__inner) {
      height: 48px;
      line-height: 48px;
      font-size: 14px;
      color: #303133;
      
      &::placeholder {
        color: #909399;
      }
    }
  }
  
  .login-button {
    width: 40%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 8px;
    background: linear-gradient(135deg, #409eff 0%, #1890ff 100%);
    border: none;
    box-shadow: 0 4px 15px rgba(64, 158, 255, 0.4);
    transition: all 0.3s ease;
    color: #ffffff;
    margin: 0 auto;
    display: block;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(64, 158, 255, 0.6);
      background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &.is-loading {
      transform: none;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-form-container {
    padding: 20px;
    max-width: 95%;
  }
  
  .system-title {
    margin-bottom: 30px;
    
    h1 {
      font-size: 28px;
      letter-spacing: 1px;
    }
  }
  
  .login-form-wrapper {
    padding: 40px 30px;
  }
}

@media (max-width: 480px) {
  .login-form-container {
    padding: 15px;
    max-width: 98%;
  }
  
  .system-title {
    margin-bottom: 25px;
    
    h1 {
      font-size: 24px;
      letter-spacing: 1px;
    }
  }
  
  .login-form-wrapper {
    padding: 30px 20px;
  }
}
</style>