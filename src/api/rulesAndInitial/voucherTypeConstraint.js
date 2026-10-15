import request from '@/utils/request'
const prePath = '/base/voucherTypeRule'

//凭证类型约束规则列表
export function voucherTypeConstraintList(data, btnCode) {
  return request({
    url: prePath + '/page',
    method: 'post',
    data,
    btnCode,
  })
}
//凭证类型约束规则新增
export function voucherTypeConstraintCreate(data, btnCode) {
  return request({
    url: prePath + '/create',
    method: 'post',
    data,
    btnCode,
  })
}
//凭证类型约束规则批量删除
export function voucherTypeConstraintDelete(data, btnCode) {
  return request({
    url: prePath + '/deleteBatch',
    method: 'post',
    data,
    btnCode,
  })
}
//凭证类型约束规则编辑
export function voucherTypeConstraintUpdate(data, btnCode) {
  return request({
    url: prePath + '/update',
    method: 'post',
    data,
    btnCode,
  })
}
//凭证类型约束规则查询一条数据
export function voucherTypeConstraintGetbyId(id, btnCode) {
  return request({
    url: prePath + '/' + id,
    method: 'get',
    btnCode,
  })
}
//凭证类型约束规则停用
export function voucherTypeConstraintDisable(data, btnCode) {
  return request({
    url: prePath + '/disable',
    method: 'post',
    data,
    btnCode,
  })
}
//凭证类型约束规则启用
export function voucherTypeConstraintEnable(data, btnCode) {
  return request({
    url: prePath + '/enable',
    method: 'post',
    data,
    btnCode,
  })
}
