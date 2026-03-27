import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { useClusterStore } from '@/stores/cluster'
import { getToken, isTokenExpired, startAutoRefresh, stopAutoRefresh } from '@/utils/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/cluster/default/node', // 先重定向到默认路径，在路由守卫中处理集群逻辑
    children: [
      {
        path: 'cluster/:clusterName/node',
        name: 'NodeInfo',
        component: () => import('@/views/node/index.vue'),
        meta: {
          title: '节点信息'
        }
      },
      {
        path: 'cluster/:clusterName/egress',
        name: 'Egress',
        component: () => import('@/views/egressnode/index.vue'),
        meta: {
          title: '出口网关'
        }
      },
      {
        path: 'cluster/:clusterName/egress/add',
        name: 'EgressNodeAdd',
        component: () => import('@/views/egressnode/add.vue'),
        meta: {
          title: '新建出口网关'
        }
      },
      {
        path: 'cluster/:clusterName/egress/detail/:name',
        name: 'EgressNodeDetail',
        component: () => import('@/views/egressnode/detail.vue'),
        meta: {
          title: '出口网关详情'
        }
      },
      {
        path: 'cluster/:clusterName/egress-mapping',
        name: 'EgressMapping',
        component: () => import('@/views/egressclass/index.vue'),
        meta: {
          title: '出口网关映射'
        }
      },
      {
        path: 'cluster/:clusterName/egress-mapping/add',
        name: 'EgressMappingAdd',
        component: () => import('@/views/egressclass/create.vue'),
        meta: {
          title: '新建出口网关映射'
        }
      },
      {
        path: 'cluster/:clusterName/egress-mapping/detail/:name',
        name: 'EgressMappingDetail',
        component: () => import('@/views/egressclass/detail.vue'),
        meta: {
          title: '出口网关映射详情'
        }
      },
      {
        path: 'cluster/:clusterName/egress-route',
        name: 'EgressRoute',
        component: () => import('@/views/egresspolicy/index.vue'),
        meta: {
          title: '出口网关路由'
        }
      },
      {
        path: 'cluster/:clusterName/egress-route/add',
        name: 'EgressRouteAdd',
        component: () => import('@/views/egresspolicy/create.vue'),
        meta: {
          title: '新建出口网关路由'
        }
      },
      {
        path: 'cluster/:clusterName/egress-route/detail/:namespace/:name',
        name: 'EgressRouteDetail',
        component: () => import('@/views/egresspolicy/detail.vue'),
        meta: {
          title: '出口网关路由详情'
        }
      },
      {
        path: 'cluster/:clusterName/egress-route/edit/:namespace/:name',
        name: 'EgressRouteEdit',
        component: () => import('@/views/egresspolicy/edit.vue'),
        meta: {
          title: '编辑出口网关路由'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 检查是否需要登录验证
  const token = getToken()
  const isLoginPage = to.path === '/login'
  
  // 如果没有token且不是登录页，跳转到登录页
  if (!token && !isLoginPage) {
    next('/login')
    return
  }
  
  // 如果有token但已过期，清除token并跳转到登录页
  if (token && isTokenExpired() && !isLoginPage) {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    stopAutoRefresh()
    next('/login')
    return
  }
  
  // 如果已登录且访问登录页，重定向到首页
  if (token && !isTokenExpired() && isLoginPage) {
    next('/')
    return
  }
  
  // 如果已登录，启动自动刷新机制
  if (token && !isTokenExpired() && !isLoginPage) {
    startAutoRefresh()
  }
  
  const clusterStore = useClusterStore()
  const clusterName = to.params.clusterName
  
  // 如果集群列表还没加载，先加载
  if (clusterStore.clusters.length === 0) {
    try {
      await clusterStore.fetchClusters()
    } catch (error) {
      console.error('加载集群列表失败:', error)
      next()
      return
    }
  }
  // 如果访问的是默认集群路径，且有可用的集群，重定向到第一个集群
  if (clusterName === 'default' && clusterStore.clusters.length > 0) {
    const firstCluster = clusterStore.getFirstCluster()
    if (firstCluster) {
      clusterStore.setCurrentCluster(firstCluster.name)
      // 构建新的路径，保持当前页面类型
      const newPath = to.path.replace('/cluster/default/', `/cluster/${firstCluster.name}/`)
      next(newPath)
      return
    }
  }
  
  // 同步当前集群名称到store
  if (clusterName && clusterName !== clusterStore.currentClusterName) {
    clusterStore.setCurrentCluster(clusterName)
  }
  
  next()
})

export default router
