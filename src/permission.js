import router from '@/router'
import store from '@/store'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import getPageTitle from '@/utils/get-page-title'
import { getToken } from '@/utils/auth'

NProgress.configure({
  showSpinner: false,
})

const whiteList = ['/login', '/oa'] // no redirect whitelist

export function initPermission(app) {
  router.beforeEach(async (to, from, next) => {
    NProgress.start()
    document.title = getPageTitle(to.meta.title)
    const hasToken = getToken()
    if (to.path === '/appDownload') {
      //打开app下载页面时不做拦截
      next()
    } else {
      if (hasToken) {
        if (to.path === '/login') {
          next()
          NProgress.done()
        } else {
          await store.dispatch('permission/getControl')
          const hasRoles =
            store.state.permission.addRoutes &&
            store.state.permission.addRoutes.length > 0
          if (hasRoles) {
            const _query = await getQueryParams()
            if (to.path.includes('/redirect/')) {
              next()
              return
            }
            if (_query.businessOrgId && _query.businessGroupId) {
              store.dispatch('permission/getDictMapOtherOrg')
              store.dispatch('permission/getUserPermissionCodesOtherOrg')
              await store.dispatch('permission/getCoreSystemConfigOtherOrg')
            } else {
              store.dispatch('permission/getDictMap')
              store.dispatch('permission/getUserPermissionCodes')
              await store.dispatch('permission/getCoreSystemConfig')
            }
            // 首次进入子系统时获取用户登录配置（后续直接使用缓存）
            await store.dispatch('systemConfig/getUserLoginConfig')
            next()
          } else {
            try {
              const accessRoutes = await store.dispatch(
                'permission/generateRoutes'
              )
              await store.dispatch('permission/getUserPermissionCodes')
              accessRoutes.forEach((route) => {
                router.addRoute(route)
              })
              next({
                ...to,
                replace: true,
              })
            } catch (error) {
              await store.dispatch('user/resetToken')
              ElMessage.error(error || 'Has Error')
              logout(next, to)
              NProgress.done()
            }
          }
        }
      } else {
        if (whiteList.indexOf(to.path) !== -1) {
          next()
        } else {
          logout(next, to)
          NProgress.done()
        }
      }
    }
  })

  router.afterEach(() => {
    store.dispatch('app/setHighlightRowId', '')
    NProgress.done()
  })
}
function logout(next, to) {
  if (window.__POWERED_BY_WUJIE__) {
    window.$wujie?.bus.$emit('microAppLogout')
  } else {
    next(`/login?redirect=${to.path}`)
  }
}
function getQueryParams() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const params = new URLSearchParams(window.parent.location.search)
      resolve(Object.fromEntries(params.entries()))
    }, 0)
  })
}