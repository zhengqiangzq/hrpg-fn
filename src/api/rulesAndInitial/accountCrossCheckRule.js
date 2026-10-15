import request from '@/utils/request'
const prePath = '/base/accasoaCrossRule'


//科目交叉校验规则列表
export function parallelAccountRuleList(data, btnCode) {
  return request({
    url: prePath + '/list',
    method: 'post',
    data,
    btnCode,
  })
}
//科目交叉校验规则新增
export function parallelAccountRuleCreate(data, btnCode) {
  return request({
    url: prePath + '/create',
    method: 'post',
    data,
    btnCode,
  })
}
//科目交叉校验规则批量删除
export function parallelAccountRuleDelete(data, btnCode) {
  return request({
    url: prePath + '/deleteBatch',
    method: 'post',
    data,
    btnCode,
  })
}
//科目交叉校验规则编辑
export function parallelAccountRuleUpdate(data, btnCode) {
  return request({
    url: prePath + '/update',
    method: 'post',
    data,
    btnCode,
  })
}
//科目交叉校验规则查询一条数据
export function parallelAccountRuleGetbyId(id, btnCode) {
  return request({
    url: prePath + '/' + id,
    method: 'get',
    btnCode,
  })
}
//科目交叉校验规则停用
export function parallelAccountRuleDisable(data, btnCode) {
  return request({
    url: prePath + '/disable',
    method: 'post',
    data,
    btnCode,
  })
}
//科目交叉校验规则启用
export function parallelAccountRuleEnable(data, btnCode) {
  return request({
    url: prePath + '/enable',
    method: 'post',
    data,
    btnCode,
  })
}
//科目交叉校验规则导出
export function parallelAccountRuleExcel(data, btnCode) {
  return request({
    url: prePath + '/exportExcel',
    method: 'post',
    data,
    responseType: 'blob',
    btnCode,
  })
}
