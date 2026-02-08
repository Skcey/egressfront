import request from '@/utils/request'

/**
 * 查询出口路由列表
 * @param {string} clusterName - 集群名称
 * @param {string} namespace - 命名空间（可选）
 */
export function getEgressPolicies(clusterName, namespace) {
  return request({
    url: `/clusters/${clusterName}/egressPolicies`,
    method: 'get',
    params: namespace ? { namespace } : {}
  })
}

/**
 * 查询出口路由详情
 * @param {string} clusterName - 集群名称
 * @param {string} namespace - 命名空间
 * @param {string} egressPolicyName - 出口路由名称
 */
export function getEgressPolicyDetail(clusterName, namespace, egressPolicyName) {
  return request({
    url: `/clusters/${clusterName}/namespaces/${namespace}/egressPolicies/${egressPolicyName}`,
    method: 'get'
  })
}

/**
 * 开启/关闭出口路由
 * @param {string} clusterName - 集群名称
 * @param {string} namespace - 命名空间
 * @param {string} egressPolicyName - 出口路由名称
 * @param {boolean} enable - 是否启用
 */
export function switchEgressPolicy(clusterName, namespace, egressPolicyName, enable) {
  return request({
    url: `/clusters/${clusterName}/namespaces/${namespace}/egressPolicies/${egressPolicyName}/switch`,
    method: 'put',
    params: { enable }
  })
}

/**
 * 查询跨集群出口网关路由
 * @param {string} clusterName - 集群名称
 * @param {string} egressNodeName - 出口网关名称
 */
export function getCrossClusterEgressPolicies(clusterName, egressNodeName) {
  return request({
    url: `/clusters/${clusterName}/egressNodes/${egressNodeName}/egressPolicies`,
    method: 'get'
  })
}

/**
 * 创建出口路由
 * @param {string} clusterName - 集群名称
 * @param {string} namespace - 命名空间
 * @param {object} data - 创建数据
 */
export function createEgressPolicy(clusterName, namespace, data) {
  return request({
    url: `/clusters/${clusterName}/namespaces/${namespace}/egressPolicies`,
    method: 'post',
    data
  })
}

/**
 * 删除出口路由
 * @param {string} clusterName - 集群名称
 * @param {string} namespace - 命名空间
 * @param {string} egressPolicyName - 出口路由名称
 */
export function deleteEgressPolicy(clusterName, namespace, egressPolicyName) {
  return request({
    url: `/clusters/${clusterName}/namespaces/${namespace}/egressPolicies/${egressPolicyName}`,
    method: 'delete'
  })
}

/**
 * 编辑出口路由
 * @param {string} clusterName - 集群名称
 * @param {string} namespace - 命名空间
 * @param {string} egressPolicyName - 出口路由名称
 * @param {object} data - 编辑数据
 */
export function updateEgressPolicy(clusterName, namespace, egressPolicyName, data) {
  return request({
    url: `/clusters/${clusterName}/namespaces/${namespace}/egressPolicies/${egressPolicyName}`,
    method: 'put',
    data
  })
}
