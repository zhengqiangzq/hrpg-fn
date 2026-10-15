import request from '@/utils/request'
import qs from 'qs'
const prePath = '/base'
const prePathBasic = '/basic/base'
//获取菜单详情
export function showSourceDetail(id) {
  return request({
    url: prePathBasic + '/orders/sequence/queryPath/' + id,
    method: 'get',
  })
}
//获取用户列表分页
export function getUserPage(params) {
  return request({
    url: prePathBasic + '/users/page',
    method: 'get',
    params,
  })
}
export function serviceBusiOrgAction(params, btnCode) {
  return request({
    url: prePathBasic + '/org/getOrgTreeByUserId/' + params.userId,
    method: 'get',
    btnCode
  })
}
//导出模板
export function exportExcel(params, btnCode) {
  return request({
    url: `/basic/file/download`,
    method: 'get',
    params,
    responseType: 'blob',
    isBasicHost: true,
    btnCode
  })
}
//上传日志
export function getExcelImportRecordPage(params, btnCode) {
  return request({
    url:prePathBasic + '/excelImportRecord/page',
    method: 'get',
    params,
    isBasicHost: true,
    btnCode
  })
}
//继续上传弹窗
export function excelImportRecordResume(data, btnCode, notShowLoading = false) {
  return request({
    url: prePathBasic + '/excelImportRecord/resume',
    method: 'post',
    data,
    isBasicHost: true,
    btnCode,
    notShowLoading: notShowLoading
  })
}
//中段上传弹窗
export function excelImportRecordInterrupt(data, btnCode) {
  return request({
    url:  prePathBasic + '/excelImportRecord/interrupt',
    method: 'post',
    isBasicHost: true,
    data,
    btnCode
  })
}
export function delExcelImportRecord(data, btnCode) {
  return request({
    url:  prePathBasic + '/excelImportRecord/byDelete',
    method: 'post',
    data,
    isBasicHost: true,
    btnCode
  })
}
export function getUserList(data) {
  return request({
    url: '/basic/user/list',
    method: 'post',
    isBasicHost: true,
    data,
  })
}
export function selectPageByUser(data) {
  return request({
    url: '/basic/user/selectPageByUser',
    method: 'post',
    isBasicHost: true,
    data,
  })
}
// 根据菜单code获取报表名称
export function getMenunameByCode(menuCode) {
  return request({
    url: '/basic/menu/report/reportName/' + menuCode,
    method: 'get',
  })
}
export function doPrintData(data, btnCode) {
  let query = ''
  if (data.query) {
    query = qs.stringify(data.query)
    delete data.query
  }
  return request({
    url: `/basic/ureport/pdf/show?_u=${data._u}&token=${data.token}&createGroupId=${data.createGroupId}&createOrgId=${data.createOrgId}&${query}`,
    method: 'post',
    data,
    responseType: 'blob',
    btnCode
  })
}
//单据流水
export function orderAffairAll(params) {
  params.sort = 'operate_time desc,id desc'
  return request({
    url: '/affair/orderAffairs/all',
    method: 'get',
    params,
  })
}
//获取仓库分页
export function getDepotPage(params) {
  return request({
    url: '/basic/core/depots/page',
    method: 'get',
    params,
  })
}

//获取部门全部
export function getDeptAll(data) {
  return request({
    url: '/basic/department/listAll',
    method: 'post',
    data,
  })
}
//获取全部系统设置
export function getCoreSystemConfigAll(params) {
  return request({
    url: '/basic/core/systemConfig/all',
    method: 'get',
    params,
  })
}
// 根据字典编码集合获取当前组织的字典值
export function dictMapByCodes(data) {
  return request({
    url: '/basic/dict/map/codes',
    method: 'post',
    data,
  })
}

// 分页查询会计期间
export function periodyearList(params) {
  return request({
    url: prePath + '/accountingPeriod/year',
    method: 'get',
    params
  })
}

// 匹配日期所在会计期间
export function periodmonthList(params) {
  return request({
    url: prePath + '/accountingPeriod/month',
    method: 'get',
    params
  })
}
// 获取档案接收树结构
export function getArchivesClassifyTree(params) {
    return request({
        url: '/baseSetting/archivesClassify/tree',
        method: 'get',
        params,
    })
}
export function getDocIsPdfUrl(data) {
  return request({
    url: `/basic/file/pdfPreview`,
    method: 'post',
    data,
  })
}
//获取自定义表格用户配置项
export function getCustomizeSetting(params, btnCode) {
  return request({
    url: '/basic/customize/user/getSetting',
    method: 'get',
    params,
    btnCode
  })
}
export function updateUserCustomize(data, btnCode) {
  return request({
    url: '/basic/customize/user/update',
    method: 'post',
    data,
    btnCode
  })
}
//获取用户按钮权限集合
export function getPermissionCodes(params, btnCode) {
  return request({
    url: '/resourceInfo/codes',
    method: 'get',
    params,
    btnCode,
    notShowLoading: true,
  })
}
export function downloadLodop(params) {
  return request({
    url: '/file/download',
    method: 'get',
    responseType: 'blob',
    params,
  })
}
//获取药品财务分类树
export function getDrugFinancialTree(params) {
  return request({
    url: '/basic/financial/drug/tree',
    method: 'get',
    params,
  })
}
//获取物资分类树
export function getMaterialFinancialTree(params) {
  return request({
    url: '/basic/financial/material/tree',
    method: 'get',
    params,
  })
}
// 根据资源code获取对应的默认模板
export function fatchTemplateByCode(data) {
  return request({
    url: prePathBasic + '/printTemplate/getTemplate',
    method: 'post',
    data,
  })
}
// 公共附件删除
export function fileRemoveList(data) {
  return request({
    url: '/basic/file/removeList',
    method: 'post',
    data,
  })
}
//上传日志
export function excelImportRecordUpdateStatus(data, btnCode) {
  return request({
    url: prePathBasic + '/excelImportRecord/updateStatus',
    method: 'post',
    data,
    isBasicHost: true,
    btnCode
  })
}
//关闭上传弹窗
export function excelImportRecordClose(data) {
  return request({
    url: prePathBasic + '/excelImportRecord/close',
    method: 'post',
    isBasicHost: true,
    data,
  })
}
//轮询上传接口
export function excelImportRecordGetCacheInfo(data) {
  return request({
    url: prePathBasic + '/excelImportRecord/getCacheInfo',
    method: 'post',
    data,
    isBasicHost: true,
    notShowLoading: true
  })
}
//上传生成记录
export function excelImportRecordInitImportRecord(data, btnCode) {
  return request({
    url:  prePathBasic + '/excelImportRecord/initImportRecord',
    method: 'post',
    isBasicHost: true,
    data,
    btnCode
  })
}
//导出模板
export function exportTemplateExcel(type,btnCode) {
  return request({
    url: `/basic/file/download`,
    method: 'get',
    params: {
      fileName: 'template/' + type + '.xlsx',
    },
    responseType: 'blob',
    btnCode,
  })
}
// 业务ID获取流程数据
export function getBusinessKeyById(params) {
  return request({
    url: '/basic/flowOperation/selectByBusinessKey',
    method: 'get',
    params: params,
  })
}
//单据流水
export function orderOpAffairAll(params) {
  params.sort = 'operate_time desc,id desc'
  return request({
    url: '/basic/affair/orderOperateAffairs/all',
    method: 'get',
    params,
  })
}
// 获取分配记录
export function allocationOrgList(data, btnCode) {
  return request({
    url: prePath + '/allocationOrg/list',
    method: 'post',
    data,
    btnCode,
  })
}
// 组织树部分查询
export function getOrgTree(params, btnCode) {
  return request({
    url: prePath + '/org/currentOrg/tree',
    method: 'get',
    params,
    btnCode,
  })
}
// 组织树全部查询
export function getAllOrgTree(params, btnCode) {
  return request({
    url: prePathBasic + '/org/tree',
    method: 'get',
    params,
    btnCode,
  })
}
// 分配方案-详情
export function getAllocationById(id, btnCode) {
  return request({
    url: prePathBasic + '/allocation/plan/' + id,
    method: 'get',
    btnCode,
  })
}
// 分配方案-列表
export function getAllocationList(params, btnCode) {
  return request({
    url: prePathBasic + '/allocation/plan/list',
    method: 'get',
    params,
    btnCode,
  })
}
// 财务核算系统接口start
// 科目体系
export function accsystemList(data, btnCode) {
  return request({
    url: prePath + '/accsystem/list',
    method: 'post',
    data: data,
    btnCode
  })
}
export function acctypeList(data, btnCode) {
  return request({
    url: prePath + '/acctype/list',
    method: 'post',
    data: data,
    btnCode
  })
}
export function acctypeCreate(data, btnCode) {
  return request({
    url: prePath + '/accsystem/create',
    method: 'post',
    data: data,
    btnCode
  })
}
export function acctypeUpdate(data, btnCode) {
  return request({
    url: prePath + '/accsystem/update',
    method: 'post',
    data: data,
    btnCode
  })
}
export function acctypeDel(id, btnCode) {
  return request({
    url: prePath + '/accsystem/delete/' + id,
    method: 'post',
    btnCode
  })
}
// 科目表-start
// 列表
export function accchartList(data, btnCode) {
  return request({
    url: prePath + '/accchart/list',
    method: 'post',
    data: data,
    btnCode
  })
}
export function accchartCreate(data, btnCode) {
  return request({
    url: prePath + '/accchart/create',
    method: 'post',
    data: data,
    btnCode
  })
}
export function accchartUpdate(data, btnCode) {
  return request({
    url: prePath + '/accchart/update',
    method: 'post',
    data: data,
    btnCode
  })
}
export function accchartDel(data, btnCode) {
  return request({
    url: prePath + '/accchart/deleteBatch',
    method: 'post',
    data: data,
    btnCode
  })
}
// 校验管控模式转换（返回提示语，前端确认后再调用 update）
export function accchartCheckTransition(data, btnCode) {
  return request({
    url: prePath + '/accchart/checkTransition',
    method: 'post',
    data: data,
    btnCode
  })
}
// 分配
export function accchartDistribute(data, btnCode) {
  return request({
    url: prePath + '/accchart/distribute',
    method: 'post',
    data: data,
    btnCode
  })
}
// 取消分配
export function cancelDistribute(data, btnCode) {
  return request({
    url: prePath + '/accchart/cancelDistribute',
    method: 'post',
    data,
    btnCode,
  })
}
// 科目表-end
// 会计科目-start
export function accasoaCustomizeListAll(data, btnCode) {
  return request({
    url: prePath + '/accasoa/customizeList/all',
    method: 'post',
    data,
    btnCode,
  })
}
export function accasoaAdd(data, btnCode) {
  return request({
    url: prePath + '/accasoa/create',
    method: 'post',
    data,
    btnCode,
  })
}
export function accasoaUpdate(data, btnCode) {
  return request({
    url: prePath + '/accasoa/update',
    method: 'post',
    data,
    btnCode,
  })
}
export function accasoaById(id, btnCode) {
  return request({
    url: prePath + '/accasoa/' + id,
    method: 'get',
    btnCode,
  })
}
export function accasoaDel(data, btnCode) {
  return request({
    url: prePath + '/accasoa/delete',
    method: 'post',
    data,
    btnCode,
  })
}
export function accasoaEnable(data, btnCode) {
  return request({
    url: prePath + '/accasoa/enable',
    method: 'post',
    data,
    btnCode,
  })
}
export function accasoaDisable(data, btnCode) {
  return request({
    url: prePath + '/accasoa/disable',
    method: 'post',
    data,
    btnCode,
  })
}
export function accasoaBatchSetAssist(data, btnCode) {
  return request({
    url: prePath + '/accasoa/batchSetAccass',
    method: 'post',
    data,
    btnCode,
  })
}
export function accasoaExportExcel(data, btnCode) {
  return request({
    url: prePath + '/accasoa/exportExcel',
    method: 'post',
    responseType: 'blob',
    data,
    btnCode
  })
}
export function accasoaVersioning(data, btnCode) {
  return request({
    url: prePath + '/accasoa/versioning',
    method: 'post',
    data,
    btnCode,
  })
}
export function accasoaVersionList(params, btnCode) {
  return request({
    url: prePath + '/accasoa/versions/' + params.originalId,
    method: 'get',
    btnCode,
  })
}
export function accasoaVersionDel(data, btnCode) {
  return request({
    url: prePath + '/accasoa/deleteVersion',
    method: 'post',
    data,
    btnCode,
  })
}

export function accasoagetAccassItemByAccasoaId(params, btnCode) {
  return request({
    url: prePath + '/accasoa/getAccassItemByAccasoaId',
    method: 'get',
    params,
    btnCode,
  })
}

// 分配
export function accasoaDistribute(data, btnCode) {
  return request({
    url: prePath + '/accasoa/distribute',
    method: 'post',
    data: data,
    btnCode
  })
}
// 取消分配
export function cancelAccasoaDistribute(data, btnCode) {
  return request({
    url: prePath + '/accasoa/cancelDistribute',
    method: 'post',
    data,
    btnCode,
  })
}
// 根据账簿查询会计科目
export function accasoaListByBook(data, btnCode) {
  return request({
    url: prePath + '/accasoa/tree',
    method: 'post',
    data,
    btnCode,
  })
}
// 弃用
// export function accasoaListByBook(params, btnCode) {
//   return request({
//     url: prePath + '/accasoa/getTreeByParams',
//     method: 'get',
//     params,
//     btnCode,
//   })
// }
// 会计科目-end
// 登录设置
export function getUserLoginConfig(params, btnCode) {
  return request({
    url: prePath + '/userLoginConfig/config',
    method: 'get',
    params: params,
    btnCode
  })
}
export function createUserLoginConfig(data, btnCode) {
  return request({
    url: prePath + '/userLoginConfig/create',
    method: 'post',
    data: data,
    btnCode
  })
}
export function updateUserLoginConfig(data, btnCode) {
  return request({
    url: prePath + '/userLoginConfig/update',
    method: 'post',
    data: data,
    btnCode
  })
}
/**
 * 现金流量分析
 */
// 现金流量树数据
export function cashFlowItemsTreeList(params, btnCode) {
  return request({
    url: prePath + '/cashflowItem/tree',
    method: 'get',
    params,
    btnCode,
  })
}

// 现金流量项目新增
export function cashFlowItemsAdd(data, btnCode) {
  return request({
    url: prePath + '/cashflowItem/create',
    method: 'post',
    data,
    btnCode,
  })
}
// 现金流量项目修改
export function cashFlowItemsUpdate(data, btnCode) {
  return request({
    url: prePath + '/cashflowItem/update',
    method: 'post',
    data,
    btnCode,
  })
}

// 现金流量项目删除
export function cashFlowItemsDelete(id, btnCode) {
  return request({
    url: prePath + '/cashflowItem/delete/' + id,
    method: 'post',
    btnCode,
  })
}
// 现金流量项目启用
export function cashFlowItemsEnable(id, btnCode) {
  return request({
    url: prePath + '/cashflowItem/enable/' + id,
    method: 'post',
    btnCode,
  })
}
// 现金流量项目停用
export function cashFlowItemsDisable(id, btnCode) {
  return request({
    url: prePath + '/cashflowItem/disable/' + id,
    method: 'post',
    btnCode,
  })
}
// 现金流量项目导入
export function cashFlowItemsImport(data, btnCode) {
  return request({
    url: prePath + '/cashflowItem/importExce1',
    method: 'post',
    responseType: 'blob',
    data,
    btnCode
  })
}
// 现金流量项目导出
export function cashFlowItemsExcel(params, btnCode) {
  return request({
    url: prePath + '/cashflowItem/exportExcel',
    method: 'get',
    responseType: 'blob',
    params,
    btnCode
  })
}

// 现金流量查询一条数据
export function cashFlowItemsGetbyId(id, btnCode) {
  return request({
    url: prePath + '/cashflowItem/' + id,
    method: 'get',
    btnCode,
  })
}


/**
 * 差异分析项目
 */

// 差异分析树数据
export function varianceAnalysisTreeList(params, btnCode) {
  return request({
    url: prePath + '/diffanalyItem/tree',
    method: 'get',
    params,
    btnCode,
  })
}

// 差异分析项目新增
export function varianceAnalysisAdd(data, btnCode) {
  return request({
    url: prePath + '/diffanalyItem/create',
    method: 'post',
    data,
    btnCode,
  })
}
// 差异分析项目修改
export function varianceAnalysisUpdate(data, btnCode) {
  return request({
    url: prePath + '/diffanalyItem/update',
    method: 'post',
    data,
    btnCode,
  })
}

// 差异分析项目删除
export function varianceAnalysisDelete(id, btnCode) {
  return request({
    url: prePath + '/diffanalyItem/delete/' + id,
    method: 'post',
    btnCode,
  })
}
// 差异分析项目启用
export function varianceAnalysisEnable(id, btnCode) {
  return request({
    url: prePath + '/diffanalyItem/enable/' + id,
    method: 'post',
    btnCode,
  })
}
// 差异分析项目停用
export function varianceAnalysisDisable(id, btnCode) {
  return request({
    url: prePath + '/diffanalyItem/disable/' + id,
    method: 'post',
    btnCode,
  })
}

// 差异分析查询一条数据
export function varianceAnalysisGetbyId(id, btnCode) {
  return request({
    url: prePath + '/diffanalyItem/' + id,
    method: 'get',
    btnCode,
  })
}
// 差异分析导入
export function  varianceAnalysisImport(data, btnCode) {
  return request({
    url: prePath + '/diffanalyItem/importExce1',
    method: 'post',
    responseType: 'blob',
    data,
    btnCode
  })
}
// 差异分析导出
export function  varianceAnalysisExcel(params, btnCode) {
  return request({
    url: prePath + '/diffanalyItem/exportExcel',
    method: 'get',
    responseType: 'blob',
    params,
    btnCode
  })
}
// 凭证类型分页查询
export function voucherTypeList(data, btnCode) {
  return request({
    url: prePath + '/voucherType/list',
    method: 'post',
    data,
    btnCode,
  })
}
// 凭证类型新增
export function voucherTypeAdd(data, btnCode) {
  return request({
    url: prePath + '/voucherType/create',
    method: 'post',
    data,
    btnCode,
  })
}
// 凭证类型编辑
export function voucherTypeUpdate(data, btnCode) {
  return request({
    url: prePath + '/voucherType/update',
    method: 'post',
    data,
    btnCode,
  })
}

// 凭证类型删除
export function voucherTypeDelete(data, btnCode) {
  return request({
    url: prePath + '/voucherType/deleteBatch',
    method: 'post',
    data,
    btnCode,
  })
}

// 凭证类型启用
export function voucherTypeEnable(data, btnCode) {
  return request({
    url: prePath + '/voucherType/enable',
    method: 'post',
    data,
    btnCode,
  })
}

// 凭证类型停用
export function voucherTypeDisable(data, btnCode) {
  return request({
    url: prePath + '/voucherType/disable',
    method: 'post',
    data,
    btnCode,
  })
}
// 凭证类型分配
export function voucherTypeDistribute(data, btnCode) {
  return request({
    url: prePath + '/voucherType/distribute',
    method: 'post',
    data,
    btnCode,
  })
}
// 凭证类型取消分配
export function voucherTypeCancelDistribute(data, btnCode) {
  return request({
    url: prePath + '/voucherType/cancelDistribute',
    method: 'post',
    data,
    btnCode,
  })
}

// ========== 核算账簿 ==========
// 核算账簿列表
export function accountingbookList(data, btnCode) {
  return request({
    url: prePath + '/accountingbook/list',
    method: 'post',
    data,
    btnCode,
  })
}
// 核算账簿列表（含组织）
export function accountingbookAuthList(params, btnCode) {
  return request({
    url: prePath + '/accountingbook/authList',
    method: 'get',
    params,
    btnCode,
  })
}
// 查询有权限的账簿(type:1用户有权限的账簿,2组织有权限的账簿)
export function accountingbookUserAuthList(params, btnCode) {
  return request({
    url: prePath + '/accountingbook/authList',
    method: 'get',
    params,
    btnCode,
  })
}
// 核算账簿新增
export function accountingbookCreate(data, btnCode) {
  return request({
    url: prePath + '/accountingbook/create',
    method: 'post',
    data,
    btnCode,
  })
}
// 核算账簿编辑
export function accountingbookUpdate(data, btnCode) {
  return request({
    url: prePath + '/accountingbook/update',
    method: 'post',
    data,
    btnCode,
  })
}
// 核算账簿删除
export function accountingbookDel(data, btnCode) {
  return request({
    url: prePath + '/accountingbook/deleteBatch',
    method: 'post',
    data,
    btnCode,
  })
}
// 核算账簿启用
export function accountingbookEnable(data, btnCode) {
  return request({
    url: prePath + '/accountingbook/enable',
    method: 'post',
    data,
    btnCode,
  })
}
// 核算账簿停用
export function accountingbookDisable(data, btnCode) {
  return request({
    url: prePath + '/accountingbook/disable',
    method: 'post',
    data,
    btnCode,
  })
}
// ========== 辅助核算 ==========
// 辅助核算-系统档案查询
export function sysArchiveList(data, btnCode) {
  return request({
    url: prePath + '/bdClass/page',
    method: 'post',
    data,
    btnCode,
  })
}
// 辅助核算分页查询
export function adjunctAccountItemList(data, btnCode) {
  return request({
    url: prePath + '/accassitem/list',
    method: 'post',
    data,
    btnCode,
  })
}
// 辅助核算新增
export function adjunctAccountItemAdd(data, btnCode) {
  return request({
    url: prePath + '/accassitem/create',
    method: 'post',
    data,
    btnCode,
  })
}
// 辅助核算编辑
export function adjunctAccountItemUpdate(data, btnCode) {
  return request({
    url: prePath + '/accassitem/update',
    method: 'post',
    data,
    btnCode,
  })
}

// 辅助核算删除
export function adjunctAccountItemDelete(data, btnCode) {
  return request({
    url: prePath + '/accassitem/deleteBatch',
    method: 'post',
    data,
    btnCode,
  })
}
// 辅助核算导出
export function  adjunctAccountItemExcel(data, btnCode) {
  return request({
    url: prePath + '/accassitem/exportExcel',
    method: 'post',
    responseType: 'blob',
    data,
    btnCode
  })
}
// 获取辅助核算值选择弹窗配置（根据辅助核算项ID返回不同的弹窗配置）
export function getAdjunctValueConfig(itemId, params, btnCode) {
  return request({
    url: prePath + '/accassitem/adjunctValueConfig/' + itemId,
    method: 'post',
    data: params,
    btnCode,
  })
}
// *辅助核算弹窗统一接口查询（传参：{accassitemId:辅助核算值id,accbookId:账簿id},refType:1,2,3(树，表，左树右表)）

export function accountQueryServlet(params, btnCode) {
  return request({
    url: prePath + '/queryField/queryBaseData',
    method: 'post',
    data: params,
    btnCode,
  })
}
// 查询辅助核算属性
export function assPropertyList(params, btnCode) {
  return request({
    url: prePath + '/property/list',
    method: 'post',
    data: params,
    btnCode,
  })
}
// ========== 账簿授权角色权限 ==========
// 角色列表
export function roleList(data, btnCode) {
  return request({
    url: prePath + '/accountingbookRole/list',
    method: 'post',
    data,
    btnCode,
  })
}
// 角色新增
export function roleCreate(data, btnCode) {
  return request({
    url: prePath + '/accountingbookRole/create',
    method: 'post',
    data,
    btnCode,
  })
}
// 角色编辑
export function roleUpdate(data, btnCode) {
  return request({
    url: prePath + '/accountingbookRole/update',
    method: 'post',
    data,
    btnCode,
  })
}
// 角色删除
export function roleDelete(data, btnCode) {
  return request({
    url: prePath + '/accountingbookRole/deleteBatch',
    method: 'post',
    data,
    btnCode,
  })
}
// 角色详情
export function roleDetail(id, btnCode) {
  return request({
    url: prePath + '/accountingbookRole/' + id,
    method: 'get',
    btnCode,
  })
}

// ========== 查询方案 ==========
// 查询方案-列表
export function queryPlanList(data, btnCode) {
  return request({
    url: prePath + '/queryPlan/list',
    method: 'post',
    data,
    btnCode,
  })
}
// 查询方案-详情
export function queryPlanDetail(data, btnCode) {
  return request({
    url: prePath + '/userQueryPlanDetail/list',
    method: 'post',
    data,
    btnCode,
  })
}
// 查询方案-保存
export function queryPlanSave(data, btnCode) {
  return request({
    url: prePath + '/userQueryPlan/create',
    method: 'post',
    data,
    btnCode,
  })
}
// 查询方案-删除
export function queryPlanDelete(data, btnCode) {
  return request({
    url: prePath + '/userQueryPlan/deleteBatch',
    method: 'post',
    data,
    btnCode,
  })
}
// 查询方案-获取左侧tree
export function queryPlanTree(data, btnCode) {
  return request({
    url: prePath + '/userQueryPlan/list',
    method: 'post',
    data,
    btnCode,
  })
}

// ========== 凭证制单 ==========
// 凭证自定义列表（含偏好设置）
export function voucherCustomizeListAll(data, btnCode) {
  return request({
    url: prePath + '/voucher/customizeList/all',
    method: 'post',
    data,
    btnCode,
  })
}
// 凭证作废
export function voucherVoid(data, btnCode) {
  return request({
    url: prePath + '/voucher/void',
    method: 'post',
    data,
    btnCode,
  })
}
// 空号查询
export function voucherEmptyNoQuery(data, btnCode) {
  return request({
    url: prePath + '/voucher/emptyNoQuery',
    method: 'post',
    data,
    btnCode,
  })
}
// 凭证导出
export function voucherExportExcel(data, btnCode) {
  return request({
    url: prePath + '/voucher/exportExcel',
    method: 'post',
    responseType: 'blob',
    data,
    btnCode,
  })
}
// 凭证导入
export function voucherImportExcel(data, btnCode) {
  return request({
    url: prePath + '/voucher/importExcel',
    method: 'post',
    data,
    btnCode,
  })
}
// 凭证打印
export function voucherPrint(data, btnCode) {
  return request({
    url: prePath + '/voucher/print',
    method: 'post',
    responseType: 'blob',
    data,
    btnCode,
  })
}
// 打印设置保存
export function voucherPrintSettingSave(data, btnCode) {
  return request({
    url: prePath + '/voucher/printSetting/save',
    method: 'post',
    data,
    btnCode,
  })
}
