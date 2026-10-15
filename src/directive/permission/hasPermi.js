/**
 * v-hasPermi 操作权限处理
 * Copyright (c) 2019 slp
 */

import store from '@/store'

export default {
  mounted(el, binding, vnode) {
    hasPermi(el, binding)
  },
  updated(el, binding) {
    hasPermi(el, binding)
  },
}

function hasPermi(el, binding) {
  const { value } = binding
  if (!value || value.length === 0) return
  const all_permission = '*:*:*'
  const permissions = store.getters && store.getters.permissions
  if (value && value instanceof Array && value.length > 0) {
    const permissionFlag = value
    const hasPermissions = permissions.some((permission) => {
      return (
        all_permission === permission || permissionFlag.includes(permission)
      )
    })
    if (!hasPermissions) {
      // 特殊情况处理，主要是因为当页面中具有el-dropdown节点后，删除了所有子节点会报错的问题
      if (el.className === 'el-dropdown-link') {
        el.parentNode && el.parentNode.parentNode.removeChild(el.parentNode)
      } else {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
    return hasPermissions
  } else {
    throw new Error(`请设置操作权限标签值`)
  }
}
