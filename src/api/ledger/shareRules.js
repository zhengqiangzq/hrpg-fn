import request from '@/utils/request'
const prePath = '/ga/shareRule'

//分摊规则列表
export function shareRulesList(data, btnCode) {
  return request({
    url: prePath + '/list',
    method: 'post',
    data,
    btnCode,
  })
}
//分摊规则新增
export function shareRulesCreate(data, btnCode) {
  return request({
    url: prePath + '/create',
    method: 'post',
    data,
    btnCode,
  })
}
//分摊规则批量删除
export function shareRulesDelete(data, btnCode) {
  return request({
    url: prePath + '/deleteBatch',
    method: 'post',
    data,
    btnCode,
  })
}
//分摊规则编辑
export function shareRulesUpdate(data, btnCode) {
  return request({
    url: prePath + '/update',
    method: 'post',
    data,
    btnCode,
  })
}
//分摊规则查询一条数据
export function shareRulesGetbyId(id, btnCode) {
  return request({
    url: prePath + '/' + id,
    method: 'get',
    btnCode,
  })
}
//分摊规则停用
export function shareRulesDisable(data, btnCode) {
  return request({
    url: prePath + '/disable',
    method: 'post',
    data,
    btnCode,
  })
}
//分摊规则启用
export function shareRulesEnable(data, btnCode) {
  return request({
    url: prePath + '/enable',
    method: 'post',
    data,
    btnCode,
  })
}
//分摊规则导出
export function shareRulesExcel(data, btnCode) {
  return request({
    url: prePath + '/exportExcel',
    method: 'post',
    data,
    responseType: 'blob',
    btnCode,
  })
}
