import { getUserLoginConfig } from '@/api/base'

const systemConfig = {
  namespaced: true,
  state: {
    // 用户登录配置（首次进入子系统时获取）
    userLoginConfig: null,
  },
  mutations: {
    SET_USER_LOGIN_CONFIG: (state, data) => {
      state.userLoginConfig = data
    },
  },
  actions: {
    // 获取用户登录配置（仅首次加载，后续直接使用缓存）
    async getUserLoginConfig({ commit, state }) {
      try {
        const res = await getUserLoginConfig()
        if (res?.data) {
          commit('SET_USER_LOGIN_CONFIG', res.data)
        }
        return res?.data
      } catch (e) {
        console.error('获取用户登录配置失败:', e)
        return null
      }
    },
  },
}

export default systemConfig