import request from '@/utils/request'
const prePath = '/base/accassDefaultConfig'

//辅助核算默认设置列表
export function defaultAuxiliarySettingList(data, btnCode) {
  return request({
    url: prePath + '/list',
    method: 'post',
    data,
    btnCode,
  })
}
//辅助核算默认设置新增
export function defaultAuxiliarySettingCreate(data, btnCode) {
  return request({
    url: prePath + '/create',
    method: 'post',
    data,
    btnCode,
  })
}
//辅助核算默认设置批量删除
export function defaultAuxiliarySettingDelete(data, btnCode) {
  return request({
    url: prePath + '/deleteBatch',
    method: 'post',
    data,
    btnCode,
  })
}
//辅助核算默认设置编辑
export function defaultAuxiliarySettingUpdate(data, btnCode) {
  return request({
    url: prePath + '/update',
    method: 'post',
    data,
    btnCode,
  })
}
//辅助核算默认设置查询一条数据
export function defaultAuxiliarySettingGetbyId(id, btnCode) {
  return request({
    url: prePath + '/' + id,
    method: 'get',
    btnCode,
  })
}
//辅助核算默认设置停用
export function defaultAuxiliarySettingDisable(data, btnCode) {
  return request({
    url: prePath + '/disable',
    method: 'post',
    data,
    btnCode,
  })
}
//辅助核算默认设置启用
export function defaultAuxiliarySettingEnable(data, btnCode) {
  return request({
    url: prePath + '/enable',
    method: 'post',
    data,
    btnCode,
  })
}
//辅助核算默认设置导出
export function defaultAuxiliarySettingExcel(data, btnCode) {
  return request({
    url: prePath + '/exportExcel',
    method: 'post',
    data,
    responseType: 'blob',
    btnCode,
  })
}
