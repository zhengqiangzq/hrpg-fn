import request from '@/utils/request'
const prePath = '/base/voucherTypeRange'
export function serviceBusiOrgAction(params, btnCode) {
  return request({
    url: prePathBasic + '/org/getOrgTreeByUserId/' + params.userId,
    method: 'get',
    btnCode
  })
}
//账簿凭证类型范围列表
export function voucherTypeRangeList(data,btnCode) {
    return request({
        url: prePath+'/list',
        method: 'post',
        data,
    btnCode,
})
}
//账簿凭证类型范围新增
export function voucherTypeRangeCreate(data,btnCode) {
    return request({
        url: prePath+'/create',
        method: 'post',
        data,
    btnCode,
})
}
//账簿凭证类型范围批量删除
export function voucherTypeRangeDelete(data,btnCode) {
    return request({
        url: prePath+'/deleteBatch',
        method: 'post',
        data,
    btnCode,
})
}
//账簿凭证类型范围编辑
export function voucherTypeRangeUpdate(data,btnCode) {
    return request({
        url: prePath+'/update',
        method: 'post',
        data,
    btnCode,
})
}