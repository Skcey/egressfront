import request from '@/utils/request'

/**
 * 查询出口路由列表
 * @param {string} clusterName - 集群名称
 * @param {string} namespace - 命名空间（可选）
 * @returns {Promise}
 */
export function getEgressPolicies(clusterName, namespace = '') {
  return request({
    url: `/clusters/${clusterName}/egressPolicies`,
    method: 'get',
    params: { namespace }
  })
}

/**
 * 查询出口路由详情
 * @param {string} clusterName - 集群名称
 * @param {string} namespace - 命名空间
 * @param {string} policyName - 路由名称
 * @returns {Promise}
 */
export function getEgressPolicyDetail(clusterName, namespace, policyName) {
  return request({
    url: `/clusters/${clusterName}/namespaces/${namespace}/egressPolicies/${policyName}`,
    method: 'get'
  })
}

/**
 * 开启/关闭出口路由
 * @param {string} clusterName - 集群名称
 * @param {string} namespace - 命名空间
 * @param {string} policyName - 路由名称
 * @param {boolean} enable - 是否开启
 * @returns {Promise}
 */
export function toggleEgressPolicy(clusterName, namespace, policyName, enable) {
  return request({
    url: `/clusters/${clusterName}/namespaces/${namespace}/egressPolicies/${policyName}/switch`,
    method: 'put',
    params: { enable }
  })
}

/**
 * 查询跨集群出口网关路由
 * @param {string} clusterName - 集群名称
 * @param {string} egressNodeName - 出口网关名称
 * @param {string} namespace - 命名空间（可选）
 * @returns {Promise}
 */
export function getExternalEgressPolicies(clusterName, egressNodeName, namespace = '') {
  return request({
    url: `/clusters/${clusterName}/egressNodes/${egressNodeName}/egressPolicies`,
    method: 'get',
    params: namespace ? { namespace } : {}
  })
}

/**
 * 创建出口路由
 * @param {string} clusterName - 集群名称
 * @param {string} namespace - 命名空间
 * @param {Object} data - 路由数据
 * @returns {Promise}
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
 * @param {string} policyName - 路由名称
 * @returns {Promise}
 */
export function deleteEgressPolicy(clusterName, namespace, policyName) {
  return request({
    url: `/clusters/${clusterName}/namespaces/${namespace}/egressPolicies/${policyName}`,
    method: 'delete'
  })
}

/**
 * 编辑出口路由
 * @param {string} clusterName - 集群名称
 * @param {string} namespace - 命名空间
 * @param {string} policyName - 路由名称
 * @param {Object} data - 路由数据
 * @returns {Promise}
 */
export function updateEgressPolicy(clusterName, namespace, policyName, data) {
  return request({
    url: `/clusters/${clusterName}/namespaces/${namespace}/egressPolicies/${policyName}`,
    method: 'put',
    data
  })
}

/**
 * 获取 Pod 对象列表
 * @param {string} clusterName - 集群名称
 * @param {Array} targets - 目标选择器数组
 * @returns {Promise}
 */
export function getPods(clusterName, targets) {
  return request({
    url: `/clusters/${clusterName}/pods`,
    method: 'post',
    data: targets
  })
}
