import request from '@/utils/request'

/**
 * 查询出口网关列表
 * @param {string} clusterName - 集群名称
 */
export function getEgressNodes(clusterName) {
  return request({
    url: `/clusters/${clusterName}/egressNodes`,
    method: 'get'
  })
}

/**
 * 查询实体网关映射的映射网关列表
 * @param {string} clusterName - 集群名称
 * @param {string} egressNodeName - 出口网关名称
 * @param {string} externalClusterName - 外部集群名称
 */
export function getMappedEgressNodes(clusterName, egressNodeName, externalClusterName) {
  return request({
    url: `/clusters/${clusterName}/egressNodes/${egressNodeName}/externalClusters/${externalClusterName}/egressNodes`,
    method: 'get'
  })
}

/**
 * 查询出口网关详情
 * @param {string} clusterName - 集群名称
 * @param {string} egressNodeName - 出口网关名称
 */
export function getEgressNodeDetail(clusterName, egressNodeName) {
  return request({
    url: `/clusters/${clusterName}/egressNodes/${egressNodeName}`,
    method: 'get'
  })
}

/**
 * 查询出口网关配置
 * @param {string} clusterName - 集群名称
 * @param {string} egressNodeName - 出口网关名称
 */
export function getEgressNodeConfig(clusterName, egressNodeName) {
  return request({
    url: `/clusters/${clusterName}/egressNodes/${egressNodeName}/configurations`,
    method: 'get'
  })
}

/**
 * 创建出口网关
 * @param {string} clusterName - 集群名称
 * @param {object} data - 创建数据
 */
export function createEgressNode(clusterName, data) {
  return request({
    url: `/clusters/${clusterName}/egressNodes`,
    method: 'post',
    data
  })
}

/**
 * 修改实体网关
 * @param {string} clusterName - 集群名称
 * @param {string} egressNodeName - 出口网关名称
 * @param {object} data - 修改数据
 */
export function updateEgressNode(clusterName, egressNodeName, data) {
  return request({
    url: `/clusters/${clusterName}/egressNodes/${egressNodeName}`,
    method: 'put',
    data
  })
}

/**
 * 删除出口网关
 * @param {string} clusterName - 集群名称
 * @param {string} egressName - 出口网关名称
 */
export function deleteEgressNode(clusterName, egressName) {
  return request({
    url: `/clusters/${clusterName}/egressNodes/${egressName}`,
    method: 'delete'
  })
}
