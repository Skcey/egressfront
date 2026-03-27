import { computed, reactive } from 'vue'
import { getClusters } from '@/api/cluster'

// 全局集群状态
const clusterState = reactive({
  clusters: [],
  currentClusterName: '',
  loading: false
})

// 计算属性
const currentCluster = computed(() => {
  return clusterState.clusters.find(cluster => cluster.name === clusterState.currentClusterName)
})

const currentClusterDisplayName = computed(() => {
  return currentCluster.value?.displayName
})

const defaultCluster = computed(() => {
  return clusterState.clusters.length > 0 ? clusterState.clusters[0] : null
})

// 方法
const fetchClusters = async () => {
  try {
    clusterState.loading = true
    const response = await getClusters()
    clusterState.clusters = response.data
    return clusterState.clusters
  } catch (error) {
    console.error('获取集群列表失败:', error)
    throw error
  } finally {
    clusterState.loading = false
  }
}

const setCurrentCluster = (clusterName) => {
  clusterState.currentClusterName = clusterName
}

const getClusterDisplayName = (clusterName) => {
  const cluster = clusterState.clusters.find(c => c.name === clusterName)
  return cluster?.displayName || clusterName
}

// 初始化集群数据（如果还没有加载）
const initializeClusters = async () => {
  if (clusterState.clusters.length === 0) {
    await fetchClusters()
  }
  return clusterState.clusters
}

// 导出集群store
export const useClusterStore = () => {
  return {
    // 状态
    clusters: clusterState.clusters,
    currentClusterName: clusterState.currentClusterName,
    loading: clusterState.loading,
    
    // 计算属性
    currentCluster,
    currentClusterDisplayName,
    defaultCluster,
    
    // 方法
    fetchClusters,
    setCurrentCluster,
    getClusterDisplayName,
    initializeClusters,
    
    // 获取第一个集群
    getFirstCluster: () => {
      return clusterState.clusters.length > 0 ? clusterState.clusters[0] : null
    }
  }
}