import request from '@/utils/request'

/**
 * 获取集群信息
 */
export function getClusters() {
  return request({
    url: '/clusters',
    method: 'get'
  })
}
