<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="layui-card width100" v-show="!detailListInfo.visible && !addInfo.visible && !detailsInfo.visible">
        <div class="layui-card-body">
          <div class="titleTab">
            <div class="tab currentTab">列表页</div>
            <div class="tab otherTab" @click="detailListInfo.visible = true">明细页</div>
          </div>
          <div>
            <div class="filter-wrapper">
              <NewPageFilter
                  v-model:query="filterInfo.query"
                  :filter-list="filterInfo.list"
                  :filter-btn="filterInfo.filterbtn"
                  :listTypeInfo="filterInfo.listTypeInfo"
              >
                <template #filter-fundsCompareAccountName>
                  <el-input
                      v-model="filterInfo.query.fundsCompareAccountName"
                      style="width: 100%"
                      class="not-mongolia"
                      type="input"
                      :required="true"
                      :disabled="true"
                      placeholder="请选择账户信息"
                  >
                    <template #append>
                      <el-icon @click="selectFundsCompareAccount"
                      ><Search
                      /></el-icon>
                    </template>
                  </el-input>
                </template>
              </NewPageFilter>
            </div>
            <div class="filter-wrapper">
              <!-- 条件栏 -->
              <NewPageFilter :filter-btn="filterInfo.btnList">
              </NewPageFilter>
            </div>
            <table-container
                :refresh="tableInfo.refresh"
                :init-curpage="tableInfo.initCurpage"
                v-model:data="tableInfo.data"
                :api="tableInfo.api"
                :query="filterInfo.copyQuery"
                :summary="!!tableInfo.summaryFieldList?.length"
                :summaryFieldList="tableInfo.summaryFieldList"
                :tabIndex="true"
                :field-list="tableInfo.fieldList"
                :handle="tableInfo.handle"
                @handleEvent="tableHandler"
            >
              <template #col-orderNumber="{ row }">
                <span class="slip-edit" @click="detail(row)">{{ row.orderNumber }}</span>
              </template>
            </table-container>
          </div>
        </div>
      </div>
      <modify
          v-if="addInfo.visible"
          v-model:visible="addInfo.visible"
          :form="addInfo.form"
          :title="addInfo.title"
          @returnModify="getList"
      />
      <Detail
          v-if="detailsInfo.visible"
          :title="detailsInfo.title"
          :form="detailsInfo.form"
          v-model:visible="detailsInfo.visible"
          @returnBack="getList"
      ></Detail>
      <DetailList
          v-if="detailListInfo.visible"
          v-model:visible="detailListInfo.visible"
          @callback="getList"
      ></DetailList>
    </div>
    <select-data ref="selectorRef" />
  </div>
</template>
<script setup name="table">
import {getCurrentInstance, onMounted, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import Modify from "./modify.vue";
import DetailList from "./detailList.vue";
import {requiredPageFilter} from "@/utils";
import Detail from "./detail.vue";
import {exportTemplateExcel} from "@/api/base";
import {useSelectData} from "@/hooks/useSelectData";

const { proxy } = getCurrentInstance()
const API = {
  list: null,
  delete: null,
  update: null,
  export: null,
  download: exportTemplateExcel,
}

const {
  exportData,
  downloadTemplate
} = useUpload(API, 'CashBillRecordTemplate', '/record/cashBillRecord/importExcel', () => getList(), 'table:import')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'table',
  type: '14010',
  action: '/record/cashBillRecord/import/excelRecord'
})

const { selectorInfo, selectorRef } = useSelectData()

const level = ref([
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '10', value: '10' },
])
const filterInfo = ref({
  query: {},
  copyQuery: {},
  listTypeInfo: {
    dataType: [{ key: '人工', value: '2' }, { key: '采集', value: '1' }],
  },
  list: [
    { label: '账户信息', value: 'fundsCompareAccountName', slot: true, required: true },
    { label: "会计科目", rangeArr: ['startAccountName','startAccountId', 'endAccountName','endAccountId'], condition: true, componentType: "rangeAccount" },
    { label: "会计期间", rangeArr: ['startYear','startMonth', 'endYear','endMonth'], condition: true, componentType: "rangePeriod" },
    { label: "凭证日期", rangeArr: ['voucherDate', 'voucherDateEnd'], required: true, componentType: "rangeDate" },
    { label: "科目级次", startOptions: level, endOptions: level, rangeArr: ['startSelect','endSelect'], componentType: "rangeSelect" },
    { label: "双输入框", rangeArr: ['start', 'end'], componentType: "rangeInput" },
    { label: '交易开始日期', value: 'businessTimeStart', componentType: 'date', required: true, valueFormat: 'YYYY-MM-DD' },
    { label: '交易结束日期', value: 'businessTimeEnd', componentType: 'date', required: true, valueFormat: 'YYYY-MM-DD' },
    { label: '确认状态', value: 'status', componentType: 'select-model', code: 'cost_document_status' },
    { label: '往来单位', value: 'businessPartners', componentType: 'input' },
    { label: '摘要', value: 'summary', componentType: 'input' },
    { label: '数据来源', value: 'dataSource', componentType: 'select', clearable: true, list: 'dataType' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', event: () => openModify(''), },
    { type: 'button', label: '删除', show: proxy.$permission('table:delete'), event: () => deleteData(), },
    { type: 'button', label: '下载模板', show: proxy.$permission('table:download'), event: () => downloadTemplate('资金日记账导入模板', 'table:download'), },
    ...uploadExcelBtns,
    { type: 'button', label: '导出', show: proxy.$permission('table:export'), event: () => {
        if(Object.keys(filterInfo.value.copyQuery).length === 0) return proxy.$message.warning('请先查询数据');
        exportData(filterInfo.value.copyQuery)
      }, },
  ]
})
const tableInfo = ref({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '单据号', value: 'orderNumber', type: 'slot' },
    { label: '账户信息', value: 'fundsCompareAccountName' },
    { label: '摘要', value: 'summary' },
    { label: '往来单位', value: 'businessPartners' },
    { label: '内部对方账户', value: 'innerAccountName' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '票据号', value: 'billNum' },
    { label: '收款金额', value: 'inMoney', align: 'right' },
    { label: '付款金额', value: 'outMoney', align: 'right' },
    { label: '余额', value: 'balance', align: 'right' },
    { label: '确认人', value: 'sureUserName' },
    { label: '确认状态', value: 'statusValue' },
    { label: '确认日期', value: 'sureTime' },
    { label: '创建人', value: 'createUserName' },
    { label: '创建日期', value: 'createTime' },
    { label: '数据来源', value: 'dataSourceValue' },
  ],
  data: [],
  summaryFieldList: [
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '150',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('table:update'),
        event: openModify,
        ifRender: (row) => !!row.id && row.status == 0
      },
      {
        label: '删除',
        show: proxy.$permission('table:delete'),
        event: deleteData,
        ifRender: (row) => !!row.id && row.status == 0
      },
    ]
  },
  sectionRows: []
})

const detailListInfo = ref({
  visible: false
})

const addInfo = ref({
  visible: false,
  title: '',
  form: null
})


watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  deleteBtn.disabled = !rows.length || !!rows.find(it => it.status === '1')
}, { deep: true })


onMounted(() => {
  tableInfo.value.api = API.list
    // getList()
})

// 查询
function getList() {
  const required = requiredPageFilter(filterInfo.value.list, filterInfo.value.query)
  if(!required) return;
  filterInfo.value.copyQuery = cloneDeep({
    ...filterInfo.value.query,
  })
  tableInfo.value.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.value.query = {

  }
}

// 打开编辑页
// 当row不存在时，则打开的是新增页面
function openModify(row) {
  addInfo.value.id = row?.id;
  addInfo.value.title = row ? '修改资金日记账' : "新增资金日记账"
  addInfo.value.visible = true
}


// 删除数据
function deleteData(row) {
  const ids = row ? [row.id] : tableInfo.value.sectionRows.filter(it => it.id !== null).map(it => it.id)
  if (ids.length === 0) {
    return proxy.$message.warning('请勾选数据')
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.delete(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}


// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function selectFundsCompareAccount() {
  selectorInfo.type = 'voucherType'
  selectorInfo.query = {
  }
  selectorInfo.callback = (data) => {
    filterInfo.value.query.accountBookId = data.id
    filterInfo.value.query.accountBookName = data.name
  }
  selectorInfo.visible = true
}

const detailsInfo = ref({
  visible: false,
  title: '资金日记账详情',
  id: ''
})
function detail(row) {
  detailsInfo.value.id = row.id
  detailsInfo.value.visible = true
}
</script>

