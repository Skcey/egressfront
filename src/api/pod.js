import request from '@/utils/request'

/**
 * 获取pod对象
 * @param {string} clusterName - 集群名称
 * @param {array} data - 查询条件数组
 */
export function getPods(clusterName, data) {
  return request({
    url: `/clusters/${clusterName}/pods`,
    method: 'post',
    data
  })
}
