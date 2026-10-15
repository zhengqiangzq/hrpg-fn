import request from '@/utils/request'
const prePath = '/ga/voucher'

// 分页
export function voucherPage(data, btnCode) {
    return request({
        url: prePath + '/page',
        method: 'post',
        data,
        btnCode,
    })
}

// 初始化
export function voucherInitVoucher(data, btnCode) {
    return request({
        url: prePath + '/initVoucher',
        method: 'post',
        data,
        btnCode,
    })
}
// 查凭证号
export function voucherInitrefreshNum(data, btnCode) {
    return request({
        url: prePath + '/refreshNum',
        method: 'post',
        data,
        btnCode,
    })
}
// 新增
export function voucherInitcreate(data, btnCode) {
    return request({
        url: prePath + '/create',
        method: 'post',
        data,
        btnCode,
    })
}
// 编辑
export function voucherupdate(data, btnCode) {
    return request({
        url: prePath + '/update',
        method: 'post',
        data,
        btnCode,
    })
}
// 删除
export function voucherdeleteBatch(data, btnCode) {
    return request({
        url: prePath + '/deleteBatch',
        method: 'post',
        data,
        btnCode,
    })
}
// 详情
export function voucherDetail(id, btnCode) {
    return request({
        url: prePath + '/' + id,
        method: 'get',
        btnCode,
    })
}
// 平行记账
export function voucherparallel(data, btnCode) {
    return request({
        url: prePath + '/parallel',
        method: 'post',
        data,
        btnCode,
    })
}
