import { getToken, removeToken } from '@/utils/auth'
import Cookies from 'js-cookie'

const state = {
  token: getToken(),
  userInfo: localStorage.getItem('userInfoStore')
    ? JSON.parse(localStorage.getItem('userInfoStore')).spdUerAndPermissionInfo
    : '',
  materialResourceAuth: localStorage.getItem('userInfoStore')
    ? JSON.parse(localStorage.getItem('userInfoStore')).userAndPermissionInfo
        ?.userInfoDTO?.materialResourceType
    : '',
}

const getters = {}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
    if (!token) {
      Cookies.remove('userInfo')
    }
  },
}

const actions = {
  // remove token
  resetToken({ commit }) {
    return new Promise((resolve) => {
      commit('SET_TOKEN', '')
      removeToken()
      resolve()
    })
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
