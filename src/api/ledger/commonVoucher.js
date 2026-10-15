import request from '@/utils/request'
const prePath = '/ga/commonVoucher'

//常用凭证列表
export function commonVoucherList(data, btnCode) {
  return request({
    url: prePath + '/list',
    method: 'post',
    data,
    btnCode,
  })
}
//常用凭证新增
export function commonVoucherCreate(data, btnCode) {
  return request({
    url: prePath + '/create',
    method: 'post',
    data,
    btnCode,
  })
}
//常用凭证批量删除
export function commonVoucherDelete(data, btnCode) {
  return request({
    url: prePath + '/deleteBatch',
    method: 'post',
    data,
    btnCode,
  })
}
//常用凭证编辑
export function commonVoucherUpdate(data, btnCode) {
  return request({
    url: prePath + '/update',
    method: 'post',
    data,
    btnCode,
  })
}
//常用凭证查询一条数据
export function commonVoucherGetbyId(id, btnCode) {
  return request({
    url: prePath + '/' + id,
    method: 'get',
    btnCode,
  })
}
//常用凭证导出
export function commonVoucherExcel(data, btnCode) {
  return request({
    url: prePath + '/exportExcel',
    method: 'post',
    data,
    responseType: 'blob',
    btnCode,
  })
}
