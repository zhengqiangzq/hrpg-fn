import request from '@/utils/request'
const prePath = '/base/agingRule'

//账龄区间设置列表
export function agingRangeSetList(data, btnCode) {
  return request({
    url: prePath + '/page',
    method: 'post',
    data,
    btnCode,
  })
}
//账龄区间设置新增
export function agingRangeSetCreate(data, btnCode) {
  return request({
    url: prePath + '/create',
    method: 'post',
    data,
    btnCode,
  })
}
//账龄区间设置批量删除
export function agingRangeSetDelete(data, btnCode) {
  return request({
    url: prePath + '/deleteBatch',
    method: 'post',
    data,
    btnCode,
  })
}
//账龄区间设置编辑
export function agingRangeSetUpdate(data, btnCode) {
  return request({
    url: prePath + '/update',
    method: 'post',
    data,
    btnCode,
  })
}
//账龄区间设置查询一条数据
export function agingRangeSetGetbyId(id, btnCode) {
  return request({
    url: prePath + '/' + id,
    method: 'get',
    btnCode,
  })
}
//账龄区间设置停用
export function agingRangeSetDisable(data, btnCode) {
  return request({
    url: prePath + '/disable',
    method: 'post',
    data,
    btnCode,
  })
}
//账龄区间设置启用
export function agingRangeSetEnable(data, btnCode) {
  return request({
    url: prePath + '/enable',
    method: 'post',
    data,
    btnCode,
  })
}
// 账龄区间设置分配
export function agingRangeSetDistribute(data, btnCode) {
  return request({
    url: prePath + '/distribute',
    method: 'post',
    data,
    btnCode,
  })
}
// 账龄区间设置取消分配
export function agingRangeSetCancelDistribute(data, btnCode) {
  return request({
    url: prePath + '/cancelDistribute',
    method: 'post',
    data,
    btnCode,
  })
}