import request from '@/utils/request'

/**
 * 查询出口网关映射列表
 * @param {string} clusterName - 集群名称
 */
export function getEgressClasses(clusterName) {
  return request({
    url: `/clusters/${clusterName}/egressClasses`,
    method: 'get'
  })
}

/**
 * 创建出口网关映射
 * @param {string} clusterName - 集群名称
 * @param {object} data - 创建数据
 */
export function createEgressClass(clusterName, data) {
  return request({
    url: `/clusters/${clusterName}/egressClasses`,
    method: 'post',
    data
  })
}

/**
 * 查询出口网关映射详情
 * @param {string} clusterName - 集群名称
 * @param {string} egressClassName - 出口网关映射名称
 */
export function getEgressClassDetail(clusterName, egressClassName) {
  return request({
    url: `/clusters/${clusterName}/egressClasses/${egressClassName}`,
    method: 'get'
  })
}

/**
 * 查询出口网关映射配置
 * @param {string} clusterName - 集群名称
 * @param {string} egressClassName - 出口网关映射名称
 */
export function getEgressClassConfig(clusterName, egressClassName) {
  return request({
    url: `/clusters/${clusterName}/egressClasses/${egressClassName}/configurations`,
    method: 'get'
  })
}

/**
 * 修改出口网关映射
 * @param {string} clusterName - 集群名称
 * @param {string} egressClassName - 出口网关映射名称
 * @param {object} data - 修改数据
 */
export function updateEgressClass(clusterName, egressClassName, data) {
  return request({
    url: `/clusters/${clusterName}/egressClasses/${egressClassName}`,
    method: 'put',
    data
  })
}

/**
 * 删除出口网关映射
 * @param {string} clusterName - 集群名称
 * @param {string} egressClassName - 出口网关映射名称
 */
export function deleteEgressClass(clusterName, egressClassName) {
  return request({
    url: `/clusters/${clusterName}/egressClasses/${egressClassName}`,
    method: 'delete'
  })
}
