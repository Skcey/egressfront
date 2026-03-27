import { refreshSession } from '@/api/auth'

/**
 * 获取token
 */
export function getToken() {
  return localStorage.getItem('token')
}

/**
 * 设置token
 */
export function setToken(token) {
  localStorage.setItem('token', token)
}

/**
 * 移除token
 */
export function removeToken() {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    try {
      return JSON.parse(userInfoStr)
    } catch (error) {
      console.error('解析用户信息失败:', error)
      return null
    }
  }
  return null
}

/**
 * 检查token是否即将过期 (提前30分钟刷新)
 */
export function isTokenExpiringSoon() {
  const userInfo = getUserInfo()
  if (!userInfo || !userInfo.expireTime) {
    return false
  }
  
  const now = Date.now()
  const expireTime = userInfo.expireTime
  const refreshThreshold = 30 * 60 * 1000 // 30分钟
  
  return (expireTime - now) <= refreshThreshold
}

/**
 * 检查token是否已过期
 */
export function isTokenExpired() {
  const userInfo = getUserInfo()
  if (!userInfo || !userInfo.expireTime) {
    return true
  }
  
  return Date.now() >= userInfo.expireTime
}

/**
 * 刷新token
 */
export async function refreshToken() {
  try {
    const response = await refreshSession()
    if (response.success && response.data) {
      // 更新过期时间
      const userInfo = getUserInfo()
      if (userInfo) {
        userInfo.expireTime = Date.now() + 6 * 60 * 60 * 1000 // 6小时后过期
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      }
      return true
    }
    return false
  } catch (error) {
    console.error('刷新token失败:', error)
    return false
  }
}

/**
 * 自动刷新token定时器
 */
let refreshTimer = null

/**
 * 启动自动刷新机制
 */
export function startAutoRefresh() {
  // 清除之前的定时器
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  // 每5分钟检查一次是否需要刷新
  refreshTimer = setInterval(async () => {
    const token = getToken()
    if (!token) {
      stopAutoRefresh()
      return
    }
    
    if (isTokenExpired()) {
      // token已过期，跳转到登录页
      removeToken()
      window.location.href = '/login'
      return
    }
    
    if (isTokenExpiringSoon()) {
      console.log('Token即将过期，正在刷新...')
      const success = await refreshToken()
      if (success) {
        console.log('Token刷新成功')
      } else {
        console.log('Token刷新失败，跳转到登录页')
        removeToken()
        window.location.href = '/login'
      }
    }
  }, 5 * 60 * 1000) // 5分钟检查一次
}

/**
 * 停止自动刷新机制
 */
export function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}