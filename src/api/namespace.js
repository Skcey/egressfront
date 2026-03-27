import request from '@/utils/request'

/**
 * 查询命名空间列表
 * @param {string} clusterName - 集群名称
 */
export function getNamespaces(clusterName) {
  return request({
    url: `/clusters/${clusterName}/namespaces`,
    method: 'get'
  })
}

/**
 * 根据标签查询命名空间列表
 * @param {string} clusterName - 集群名称
 * @param {object} labels - 标签选择器
 */
export function getNamespacesByLabel(clusterName, labels) {
  return request({
    url: `/clusters/${clusterName}/namespaces/search`,
    method: 'post',
    data: labels
  })
}