import request from '@/utils/request'

/**
 * 查询出口网关列表
 * @param {string} clusterName - 集群名称
 */
export function listEgressNode(clusterName) {
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
export function listSyncedEgressNodeName(clusterName, egressNodeName, externalClusterName) {
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
export function getEgressNode(clusterName, egressNodeName) {
  return request({
    url: `/clusters/${clusterName}/egressNodes/${egressNodeName}`,
    method: 'get'
  })
}

/**
 * 查询出口网关配置
 * @param {string} clusterName - 集群名称
 * @param {string} egressNodeName - 出口网关名称
 * @param {boolean} withGatewayNodeStatus - 是否携带网关节点状态
 */
export function getEgressNodeConfiguration(clusterName, egressNodeName, withGatewayNodeStatus) {
  return request({
    url: `/clusters/${clusterName}/egressNodes/${egressNodeName}/configurations`,
    method: 'get',
    params: {
      withGatewayNodeStatus: withGatewayNodeStatus
    }
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


/**
 * 获取节点信息
 * @param {string} clusterName - 集群名称
 */
export function getNodes(clusterName) {
  return request({
    url: `/clusters/${clusterName}/egressNodes/nodes`,
    method: 'get'
  })
}
