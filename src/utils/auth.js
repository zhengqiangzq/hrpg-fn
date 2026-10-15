import Cookies from 'js-cookie'

const TokenKey = 'token'

export function getToken() {
  const roleDataToken = localStorage.getItem('userInfoStore')
    ? JSON.parse(localStorage.getItem('userInfoStore')).userAndPermissionInfo
        ?.userInfoDTO?.token
    : Cookies.get(TokenKey)
  return roleDataToken
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
