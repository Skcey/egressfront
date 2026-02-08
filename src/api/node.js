import request from '@/utils/request'

/**
 * 获取节点信息
 * @param {string} clusterName - 集群名称
 */
export function getNodes(clusterName) {
  return request({
    url: `/clusters/${clusterName}/nodes`,
    method: 'get'
  })
}
