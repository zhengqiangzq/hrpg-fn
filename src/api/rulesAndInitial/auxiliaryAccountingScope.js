import request from '@/utils/request'
const prePath = '/base/accassScopeControl'

//辅助核算范围控制列表
export function auxiliaryAccountingScopeList(data, btnCode) {
  return request({
    url: prePath + '/list',
    method: 'post',
    data,
    btnCode,
  })
}
//辅助核算范围控制新增
export function auxiliaryAccountingScopeCreate(data, btnCode) {
  return request({
    url: prePath + '/create',
    method: 'post',
    data,
    btnCode,
  })
}
//辅助核算范围控制批量删除
export function auxiliaryAccountingScopeDelete(data, btnCode) {
  return request({
    url: prePath + '/deleteBatch',
    method: 'post',
    data,
    btnCode,
  })
}
//辅助核算范围控制编辑
export function auxiliaryAccountingScopeUpdate(data, btnCode) {
  return request({
    url: prePath + '/update',
    method: 'post',
    data,
    btnCode,
  })
}
//辅助核算范围控制查询一条数据
export function auxiliaryAccountingScopeGetbyId(id, btnCode) {
  return request({
    url: prePath + '/' + id,
    method: 'get',
    btnCode,
  })
}
//辅助核算范围控制停用
export function auxiliaryAccountingScopeDisable(data, btnCode) {
  return request({
    url: prePath + '/disable',
    method: 'post',
    data,
    btnCode,
  })
}
//辅助核算范围控制启用
export function auxiliaryAccountingScopeEnable(data, btnCode) {
  return request({
    url: prePath + '/enable',
    method: 'post',
    data,
    btnCode,
  })
}
//辅助核算范围控制导出
export function auxiliaryAccountingScopeExcel(data, btnCode) {
  return request({
    url: prePath + '/exportExcel',
    method: 'post',
    data,
    responseType: 'blob',
    btnCode,
  })
}
