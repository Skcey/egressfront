import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/node',
    children: [
      {
        path: 'node',
        name: 'NodeInfo',
        component: () => import('@/views/node/index.vue'),
        meta: {
          title: '节点信息'
        }
      },
      {
        path: 'egress',
        name: 'Egress',
        component: () => import('@/views/egressnode/index.vue'),
        meta: {
          title: '出口网关'
        }
      },
      {
        path: 'egress/add',
        name: 'EgressNodeAdd',
        component: () => import('@/views/egressnode/add.vue'),
        meta: {
          title: '新建出口网关'
        }
      },
      {
        path: 'egress/detail/:id',
        name: 'EgressNodeDetail',
        component: () => import('@/views/egressnode/detail.vue'),
        meta: {
          title: '出口网关详情'
        }
      },
      {
        path: 'egress-mapping',
        name: 'EgressMapping',
        component: () => import('@/views/egressclass/index.vue'),
        meta: {
          title: '出口网关映射'
        }
      },
      {
        path: 'egress-mapping/add',
        name: 'EgressMappingAdd',
        component: () => import('@/views/egressclass/create.vue'),
        meta: {
          title: '新建出口网关映射'
        }
      },
      {
        path: 'egress-mapping/detail/:id',
        name: 'EgressMappingDetail',
        component: () => import('@/views/egressclass/detail.vue'),
        meta: {
          title: '出口网关映射详情'
        }
      },
      {
        path: 'egress-route',
        name: 'EgressRoute',
        component: () => import('@/views/egresspolicy/index.vue'),
        meta: {
          title: '出口网关路由'
        }
      },
      {
        path: 'egress-route/add',
        name: 'EgressRouteAdd',
        component: () => import('@/views/egresspolicy/create.vue'),
        meta: {
          title: '新建出口网关路由'
        }
      },
      {
        path: 'egress-route/detail/:id',
        name: 'EgressRouteDetail',
        component: () => import('@/views/egresspolicy/detail.vue'),
        meta: {
          title: '出口网关路由详情'
        }
      },
      {
        path: 'egress-route/edit/:id',
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

export default router
