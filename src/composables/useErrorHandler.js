import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 错误处理 Composable
 * 统一处理API错误和用户提示
 */
export function useErrorHandler() {
  
  /**
   * 处理API错误，显示用户友好的错误信息
   * @param {Error} error - 错误对象
   * @param {string} defaultMessage - 默认错误信息
   * @param {boolean} useAlert - 是否使用 Alert 对话框，默认使用 Message
   */
  const handleError = (error, defaultMessage = '操作失败，请稍后重试', useAlert = false) => {
    console.error('API Error:', error)
    
    // 提取错误信息
    let errorMessage = defaultMessage
    if (error.response && error.response.data) {
      // 优先使用 errorMsg，其次使用 message
      errorMessage = error.response.data.errorMsg || error.response.data.message || defaultMessage
    }
    
    if (useAlert) {
      ElMessageBox.alert(errorMessage, '操作失败', {
        confirmButtonText: '确定',
        type: 'error'
      })
    } else {
      ElMessage.error(errorMessage)
    }
    
    return errorMessage
  }

  /**
   * 处理成功消息
   * @param {string} message - 成功信息
   */
  const handleSuccess = (message) => {
    ElMessage.success(message)
  }

  /**
   * 处理警告消息
   * @param {string} message - 警告信息
   */
  const handleWarning = (message) => {
    ElMessage.warning(message)
  }

  /**
   * 显示确认对话框
   * @param {string} message - 确认信息
   * @param {string} title - 对话框标题
   * @param {Object} options - 额外选项
   * @returns {Promise} 确认结果
   */
  const showConfirm = (message, title = '确认操作', options = {}) => {
    const defaultOptions = {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      distinguishCancelAndClose: true,
      ...options
    }
    
    return ElMessageBox.confirm(message, title, defaultOptions)
  }

  /**
   * 显示删除确认对话框
   * @param {string} itemName - 要删除的项目名称
   * @param {string} itemType - 项目类型（如：路由、网关等）
   * @returns {Promise} 确认结果
   */
  const showDeleteConfirm = (itemName = '', itemType = '项目') => {
    const message = itemName 
      ? `删除后，${itemType}"${itemName}"无法恢复，确认要删除它吗？`
      : `删除后，${itemType}无法恢复，确认要删除它吗？`
    
    return showConfirm(message, `确认删除${itemType}？`)
  }

  return {
    handleError,
    handleSuccess,
    handleWarning,
    showConfirm,
    showDeleteConfirm
  }
}