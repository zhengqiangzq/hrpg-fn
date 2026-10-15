import request from '@/utils/request'
const prePath = '/base/parallelVoucherRule'
const prePath2 = '/base/accbookCopyDetail'


//平行记账规则设置列表
export function parallelAccountRuleList(data, btnCode) {
  return request({
    url: prePath + '/list',
    method: 'post',
    data,
    btnCode,
  })
}
//平行记账规则设置明细页
export function parallelAccountRuleDetailList(data, btnCode) {
  return request({
    url: prePath + '/detail',
    method: 'post',
    data,
    btnCode,
  })
}
//平行记账规则设置新增
export function parallelAccountRuleCreate(data, btnCode) {
  return request({
    url: prePath + '/create',
    method: 'post',
    data,
    btnCode,
  })
}
//平行记账规则设置批量删除
export function parallelAccountRuleDelete(data, btnCode) {
  return request({
    url: prePath + '/deleteBatch',
    method: 'post',
    data,
    btnCode,
  })
}
//平行记账规则设置编辑
export function parallelAccountRuleUpdate(data, btnCode) {
  return request({
    url: prePath + '/update',
    method: 'post',
    data,
    btnCode,
  })
}
//平行记账规则设置查询一条数据
export function parallelAccountRuleGetbyId(id, btnCode) {
  return request({
    url: prePath + '/' + id,
    method: 'get',
    btnCode,
  })
}
//平行记账规则复制到其他账簿
export function parallelAccountRuleCopyOther(data, btnCode) {
  return request({
    url: prePath + '/copyAccbook',
    method: 'post',
    data,
    btnCode,
  })
}
//平行记账规则设置复制详情
export function parallelAccountRuleCopyDetail(data, btnCode) {
  return request({
    url: prePath2 + '/list',
    method: 'post',
    data,
    btnCode,
  })
}
//平行记账规则设置导出
export function parallelAccountRuleExcel(data, btnCode) {
  return request({
    url: prePath + '/exportExcel',
    method: 'post',
    data,
    responseType: 'blob',
    btnCode,
  })
}
