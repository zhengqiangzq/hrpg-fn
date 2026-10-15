<template>
  <div class="app-container">
    <div class="layui-card width100 table-height">
        <div class="filter-wrapper">
          <NewPageFilter
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.list"
            :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-accountBookName>
              <el-input
                v-model="filterInfo.query.accountBookName"
                style="width: 100%"
                class="not-mongolia"
                type="input"
                placeholder="请选择核算账簿"
              >
                <template #append>
                  <el-icon @click="selectAccountBook"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        <div style="flex: 1">
          <table-container
             style="height: 350px"
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            :isDynamic="false"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
          >
          </table-container>
          <el-tabs v-model="activeName">
            <el-tab-pane label="现金流量" name="one">
              <table-container
                  v-model:data="tableOneInfo.data"
                  :tabIndex="true"
                  :pager="false"
                  :checkBox="false"
                  :isDynamic="false"
                  style="height: 300px"
                  :field-list="tableOneInfo.fieldList"
              />
            </el-tab-pane>
            <el-tab-pane label="凭证分录" name="two">
              <table-container
                  v-model:data="tableTwoInfo.data"
                  :tabIndex="true"
                  :pager="false"
                  :checkBox="false"
                  :isDynamic="false"
                  style="height: 300px"
                  :field-list="tableTwoInfo.fieldList"
              />
            </el-tab-pane>
          </el-tabs>
        </div>
    </div>
    <select-data ref="selectorRef" />
  </div>
</template>

<script setup name="annotation">
import { getCurrentInstance, onMounted, ref } from "vue";
import cloneDeep from "lodash/cloneDeep";
import { useUpload } from "@/hooks/useUpload";
import { exportTemplateExcel } from "@/api/base";
import { useSelectData } from "@/hooks/useSelectData";
import {requiredPageFilter} from "@/utils";

const { proxy } = getCurrentInstance();
const API = {
  list: null,
  export: null,
  download: exportTemplateExcel,
};

const { exportData, downloadTemplate } = useUpload(
  API,
  "cashFlowDetailTemplate",
  "/annotation/importExcel",
  () => getList(),
  "annotation:import"
);

const { selectorInfo, selectorRef } = useSelectData();

const filterInfo = ref({
  query: {},
  copyQuery: {},
  list: [
    { label: "核算账簿", value: "accountBookName", required: true, slot: true },
    { label: "凭证日期", value: "voucherDate", required: true, componentType: "date", valueFormat: "YYYY-MM-DD" },
    { label: "至", value: "voucherDateEnd", componentType: "date", valueFormat: "YYYY-MM-DD" },
    { label: '是否标注', value: 'status', componentType: 'select-model', code: 'yes_or_no' },
    { label: "凭证号", value: "voucher", componentType: "input" },
  ],
  filterbtn: [
    { type: "button", label: "查询", btType: "primary", event: () => getList() },
    { type: "button", label: "重置", event: () => reset() },
  ],
  btnList: [
    {
      type: "button",
      label: "自动标注",
      show: proxy.$permission("annotation:autoAnnotation"),
      event: () => autoAnnotation(),
    },
    {
      type: "button",
      label: "标注日志",
      show: proxy.$permission("annotation:logAnnotation"),
      event: () => logAnnotation(),
    },
    {
      type: "button",
      label: "导出",
      show: proxy.$permission("annotation:export"),
      event: () => {
        if (Object.keys(filterInfo.value.copyQuery).length === 0) return proxy.$message.warning("请先查询数据");
        exportData(filterInfo.value.copyQuery);
      },
    },
  ],
});

const tableInfo = ref({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: "核算账簿", value: "accountBookName" },
    { label: "凭证日期", value: "voucherDate" },
    { label: "凭证号", value: "voucherNumber" },
    { label: "摘要", value: "summary" },
    { label: "财务借方", value: "debitAmount", align: "right" },
    { label: "财务贷方", value: "creditAmount", align: "right" },
    { label: "預算借方", value: "ysdebitAmount", align: "right" },
    { label: "預算贷方", value: "yscreditAmount", align: "right" },
    { label: "备注", value: "remark" },
    { label: "是否标注", value: "isAnnotation" },
    { label: "制单人", value: "analysisAmount" },
    { label: "审核人", value: "analysisAmount" },
    { label: "签字人", value: "analysisAmount" },
    { label: "记账人", value: "analysisAmount" },
    { label: "系统", value: "analysisAmount" },
    { label: "会计期间", value: "analysisAmount" },
  ],
  data: [
    { accountBookName: 1 },
    { accountBookName: 2 },
    { accountBookName: 3 },
    { accountBookName: 4 },
    { accountBookName: 5 },
    { accountBookName: 6 },
    { accountBookName: 7 },
    { accountBookName: 8 },
    { accountBookName: 9 },
    { accountBookName: 10 },
    { accountBookName: 11 },
    { accountBookName: 12 },
    { accountBookName: 13 },
    { accountBookName: 14 },
    { accountBookName: 15 },
    { accountBookName: 16 },
    { accountBookName: 17 },
    { accountBookName: 18 },
    { accountBookName: 19 },
    { accountBookName: 20 },
  ],
  summaryFieldList: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '150',
    btList: [
      {
        label: '单张标注',
        show: proxy.$permission('annotation:solaAnnotation'),
        event: solaAnnotation,
      },
      {
        label: '联查凭证',
        show: proxy.$permission('annotation:voucher'),
        event: linkVoucher,
      },
    ]
  },
  sectionRows: [],
});


const tableOneInfo = ref({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    {label: "分录号", value: "accountBookName"},
    {label: "会计科目", value: "accountBookName"},
    {label: "方向", value: "voucherDate"},
    {label: "现金流量项目", value: "voucherNumber"},
    {label: "金额", value: "debitAmount", align: "right"},
  ],
  data: [
    { accountBookName: 1 },
    { accountBookName: 2 },
    { accountBookName: 3 },
    { accountBookName: 4 },
    { accountBookName: 5 },
    { accountBookName: 6 },
    { accountBookName: 7 },
    { accountBookName: 8 },
    { accountBookName: 9 },
    { accountBookName: 10 },
    { accountBookName: 11 },
    { accountBookName: 12 },
    { accountBookName: 13 },
    { accountBookName: 14 },
    { accountBookName: 15 },
    { accountBookName: 16 },
    { accountBookName: 17 },
    { accountBookName: 18 },
    { accountBookName: 19 },
    { accountBookName: 20 },
  ],
})

const tableTwoInfo = ref({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    {label: "科目属性", value: "accountBookName"},
    {label: "分录号", value: "voucherNumber"},
    {label: "摘要", value: "summary"},
    {label: "会计科目", value: "account"},
    {label: "借方金额", value: "callAmount", align: "right"},
    {label: "贷方金额", value: "debitAmount", align: "right"},
  ],
  data: [
    { accountBookName: 45 },
    { accountBookName: 2 },
    { accountBookName: 3 },
    { accountBookName: 4 },
    { accountBookName: 5 },
    { accountBookName: 6 },
    { accountBookName: 7 },
    { accountBookName: 8 },
    { accountBookName: 9 },
    { accountBookName: 10 },
    { accountBookName: 11 },
    { accountBookName: 12 },
    { accountBookName: 13 },
    { accountBookName: 14 },
    { accountBookName: 15 },
    { accountBookName: 16 },
    { accountBookName: 17 },
    { accountBookName: 18 },
    { accountBookName: 19 },
    { accountBookName: 20 },
  ],
})

const activeName = ref('one')

onMounted(() => {
  tableInfo.value.api = API.list;
});

function getList() {
  const required = requiredPageFilter(filterInfo.value.list, filterInfo.value.query)
  if(!required) return;
  filterInfo.value.copyQuery = cloneDeep({
    ...filterInfo.value.query,
  });
  tableInfo.value.refresh = Math.random();
}

function reset() {
  filterInfo.value.query = {};
  getList();
}

function tableHandler(eventName, raw) {
  if (eventName === "tableCheck") {
    tableInfo.value.sectionRows = raw;
  }
}

function autoAnnotation() {
  proxy.$message.info("自动标注功能开发中");
}
function logAnnotation() {
  proxy.$message.info("标注日志功能开发中");
}
function solaAnnotation(row) {
  proxy.$message.info("单张标注功能开发中");
}
function linkVoucher(row) {
  proxy.$message.info("联查凭证功能开发中");
}

function selectAccountBook() {
  selectorInfo.type = "accountBook";
  selectorInfo.query = {};
  selectorInfo.callback = (data) => {
    filterInfo.value.query.accountBookId = data.id;
    filterInfo.value.query.accountBookName = data.name;
  };
  selectorInfo.visible = true;
}

</script>
