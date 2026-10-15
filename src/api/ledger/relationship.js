import request from '@/utils/request'
const prePath = '/ga/cashflowRelation'


export function cashflowRelationList(data, btnCode) {
    return request({
        url: prePath + '/list',
        method: 'post',
        data,
        btnCode,
    })
}

export function cashflowRelationPage(data, btnCode) {
    return request({
        url: prePath + '/page',
        method: 'post',
        data,
        btnCode,
    })
}

export function cashflowRelationCreate(data, btnCode) {
    return request({
        url: prePath + '/create',
        method: 'post',
        data,
        btnCode,
    })
}

export function cashflowRelationUpdate(data, btnCode) {
    return request({
        url: prePath + '/update',
        method: 'post',
        data,
        btnCode,
    })
}

export function cashflowRelationCopyToOrg(data, btnCode) {
    return request({
        url: prePath + '/copyAccbook',
        method: 'post',
        data,
        btnCode,
    })
}


export function cashflowRelationDelete(data, btnCode) {
    return request({
        url: prePath + '/deleteBatch',
        method: 'post',
        data,
        btnCode,
    })
}

export function cashflowRelationGetbyId(id, btnCode) {
    return request({
        url: prePath + '/' + id,
        method: 'get',
        btnCode,
    })
}

export function cashflowRelationExportExcel(data, btnCode) {
    return request({
        url: prePath + '/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode,
    })
}
