import request from '@/utils/request'
const prePath = '/ga/summary'

//常用摘要列表
export function commonSummaryList(data, btnCode) {
  return request({
    url: prePath + '/list',
    method: 'post',
    data,
    btnCode,
  })
}
//常用摘要新增
export function commonSummaryCreate(data, btnCode) {
  return request({
    url: prePath + '/create',
    method: 'post',
    data,
    btnCode,
  })
}
//常用摘要批量删除
export function commonSummaryDelete(data, btnCode) {
  return request({
    url: prePath + '/deleteBatch',
    method: 'post',
    data,
    btnCode,
  })
}
//常用摘要编辑
export function commonSummaryUpdate(data, btnCode) {
  return request({
    url: prePath + '/update',
    method: 'post',
    data,
    btnCode,
  })
}
//常用摘要查询一条数据
export function commonSummaryGetbyId(id, btnCode) {
  return request({
    url: prePath + '/' + id,
    method: 'get',
    btnCode,
  })
}
//常用摘要导出
export function commonSummaryExcel(data, btnCode) {
  return request({
    url: prePath + '/exportExcel',
    method: 'post',
    data,
    responseType: 'blob',
    btnCode,
  })
}
