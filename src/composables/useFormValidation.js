import { computed } from 'vue'

/**
 * 表单验证逻辑 Composable
 * @param {Object} formData - 表单数据
 * @returns {Object} 验证相关的计算属性和方法
 */
export function useFormValidation(formData) {
  
  /**
   * 验证基础信息和路由配置（第一步）
   */
  const canGoNextStep1 = computed(() => {
    if (!formData.value) return false
    
    return !!(
      formData.value.name &&
      formData.value.name.trim() &&
      formData.value.cluster &&
      formData.value.namespace &&
      formData.value.gateway &&
      formData.value.targetAddresses &&
      formData.value.targetAddresses.length > 0
    )
  })

  /**
   * 验证访问对象配置（第二步）
   */
  const canGoNextStep2 = computed(() => {
    if (!formData.value) return false
    
    // 至少勾选一个配置项
    if (!formData.value.configLocalAccess && !formData.value.configCrossClusterAccess && 
        !formData.value.enableLocalAccess && !formData.value.enableCrossCluster) {
      return false
    }

    // 如果勾选了本集群访问对象
    const enableLocalAccess = formData.value.configLocalAccess || formData.value.enableLocalAccess
    if (enableLocalAccess) {
      const accessObjects = formData.value.accessObjects || []
      
      // 每个访问对象都要验证
      for (const obj of accessObjects) {
        // 命名空间选择器至少要有一个
        if (!obj.namespaceSelectors || obj.namespaceSelectors.length === 0) {
          return false
        }
        // 如果选择了部分Pod，Pod选择器至少要有一个
        if (obj.podType === 'partial' && (!obj.podSelectors || obj.podSelectors.length === 0)) {
          return false
        }
      }
    }

    // 如果勾选了跨集群访问对象
    const enableCrossCluster = formData.value.configCrossClusterAccess || formData.value.enableCrossCluster
    if (enableCrossCluster) {
      const crossCluster = formData.value.crossCluster || {}
      
      // 所有下拉框都要选择
      if (!crossCluster.targetCluster || !crossCluster.mappedGateway ||
          !crossCluster.namespace || !crossCluster.egressRoute) {
        return false
      }
    }

    return true
  })

  /**
   * 验证访问对象是否有效
   */
  const validateAccessObjects = (accessObjects) => {
    if (!accessObjects || accessObjects.length === 0) {
      return { valid: false, message: '至少需要添加一个访问对象' }
    }

    for (const obj of accessObjects) {
      if (!obj.namespaceSelectors || obj.namespaceSelectors.length === 0) {
        return { valid: false, message: '每个访问对象至少需要添加一个命名空间选择器' }
      }
      
      if (obj.podType === 'partial' && (!obj.podSelectors || obj.podSelectors.length === 0)) {
        return { valid: false, message: '选择部分Pod时，需要添加Pod选择器' }
      }
    }

    return { valid: true }
  }

  /**
   * 验证跨集群配置是否有效
   */
  const validateCrossCluster = (crossCluster) => {
    if (!crossCluster) {
      return { valid: false, message: '跨集群配置不能为空' }
    }

    if (!crossCluster.targetCluster) {
      return { valid: false, message: '请选择目标集群' }
    }

    if (!crossCluster.mappedGateway) {
      return { valid: false, message: '请选择映射网关' }
    }

    if (!crossCluster.namespace) {
      return { valid: false, message: '请选择命名空间' }
    }

    if (!crossCluster.egressRoute) {
      return { valid: false, message: '请选择出口路由' }
    }

    return { valid: true }
  }

  /**
   * 验证基础信息是否有效
   */
  const validateBasicInfo = (formData) => {
    if (!formData.name || !formData.name.trim()) {
      return { valid: false, message: '请输入名称' }
    }

    if (!formData.cluster) {
      return { valid: false, message: '请选择所属集群' }
    }

    if (!formData.namespace) {
      return { valid: false, message: '请选择命名空间' }
    }

    if (!formData.gateway) {
      return { valid: false, message: '请选择出口网关' }
    }

    if (!formData.targetAddresses || formData.targetAddresses.length === 0) {
      return { valid: false, message: '请添加至少一个访问目标地址' }
    }

    return { valid: true }
  }

  /**
   * 构建后端需要的 targets 数据结构
   */
  const buildTargetsData = (accessObjects) => {
    if (!accessObjects || accessObjects.length === 0) {
      return null
    }

    return accessObjects.map(obj => {
      const namespaceMatchLabels = {}
      if (obj.namespaceSelectors) {
        obj.namespaceSelectors.forEach(sel => {
          namespaceMatchLabels[sel.key] = sel.value
        })
      }
      
      let podMatchLabels = null
      if (obj.podType === 'partial' && obj.podSelectors) {
        podMatchLabels = {}
        obj.podSelectors.forEach(sel => {
          podMatchLabels[sel.key] = sel.value
        })
      }
      
      return {
        namespaceMatchLabels,
        podMatchLabels
      }
    })
  }

  /**
   * 构建后端需要的 externalEgressPolicies 数据结构
   */
  const buildExternalEgressPolicies = (crossCluster) => {
    if (!crossCluster || !crossCluster.targetCluster) {
      return []
    }

    return [{
      name: crossCluster.egressRoute,
      clusterName: crossCluster.targetCluster,
      namespace: crossCluster.namespace
    }]
  }

  /**
   * 构建后端需要的 destIPBlocks 数据结构
   */
  const buildDestIPBlocks = (targetAddresses) => {
    if (!targetAddresses || targetAddresses.length === 0) {
      return []
    }

    return targetAddresses.map(addr => {
      const parts = addr.split(' 屏蔽 ')
      return {
        cidr: parts[0],
        except: parts[1] ? parts[1].split(',').map(s => s.trim()) : []
      }
    })
  }

  return {
    canGoNextStep1,
    canGoNextStep2,
    validateAccessObjects,
    validateCrossCluster,
    validateBasicInfo,
    buildTargetsData,
    buildExternalEgressPolicies,
    buildDestIPBlocks
  }
}