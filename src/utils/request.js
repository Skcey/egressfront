/**
 * http配置
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: '/api', // api的base_url
  timeout: 100000 // 请求超时时间
})

// request 拦截器
service.interceptors.request.use(
  config => {
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.parse(new Date()) / 1000
      }
    }
    return config
  },
  error => {
    console.error(error)
    return Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果返回的状态码不是200，则认为有错误
    if (res.code !== undefined && res.code !== 0) {
      ElMessage({
        message: res.errorMsg || res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.errorMsg || res.message || 'Error'))
    }
    
    return res
  },
  error => {
    console.error('err: ' + error)
    ElMessage({
      message: error.message || 'Network Error',
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
