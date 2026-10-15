<template>
  <div class="app-container">
    <div class="layui-card width100">
      <div class="layui-card-body">
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
            <template #filter-flowName>
              <el-input
                v-model="filterInfo.query.flowName"
                style="width: 100%"
                class="not-mongolia"
                type="input"
                placeholder="请选择现金流量项目"
              >
                <template #append>
                  <el-icon @click="selectFlowItem"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        <table-container
          :refresh="tableInfo.refresh"
          :init-curpage="tableInfo.initCurpage"
          v-model:data="tableInfo.data"
          :api="tableInfo.api"
          :query="filterInfo.copyQuery"
          :tabIndex="true"
          :field-list="tableInfo.fieldList"
          :handle="tableInfo.handle"
          @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
    <select-data ref="selectorRef" />
  </div>
</template>

<script setup name="cashFlowDetail">
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
  "/cashFlowDetail/importExcel",
  () => getList(),
  "cashFlowDetail:import"
);

const { selectorInfo, selectorRef } = useSelectData();

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
  list: [
    { label: "核算账簿", value: "accountBookName", required: true, slot: true },
    { label: "会计科目", rangeArr: ['startAccountName','startAccountId', 'endAccountName','endAccountId'], condition: true, componentType: "rangeAccount" },
    { label: "会计期间", rangeArr: ['startYear','startMonth', 'endYear','endMonth'], componentType: "rangePeriod" },
    { label: "凭证日期", rangeArr: ['voucherDate', 'voucherDateEnd'], required: true, componentType: "rangeDate" },
    { label: "科目级次", startOptions: level, endOptions: level, rangeArr: ['startSelect','endSelect'], componentType: "rangeSelect" },
    { label: "双输入框", rangeArr: ['start', 'end'], componentType: "rangeInput" },
    { label: "现金流量项目", value: "flowName", slot: true },
    { label: "未记账凭证", value: "unposted", componentType: "checkbox-model" },
  ],
  filterbtn: [
    { type: "button", label: "查询", btType: "primary", event: () => getList() },
    { type: "button", label: "重置", event: () => reset() },
  ],
  btnList: [
    {
      type: "button",
      label: "导出",
      show: proxy.$permission("cashFlowDetail:export"),
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
    { label: "现金流量项目编码", value: "flowCode" },
    { label: "现金流量项目", value: "flowName" },
    { label: "凭证日期", value: "voucherDate" },
    { label: "凭证号", value: "voucherNumber" },
    { label: "摘要", value: "summary" },
    { label: "科目", value: "subjectName" },
    { label: "借方金额", value: "debitAmount", align: "right" },
    { label: "贷方金额", value: "creditAmount", align: "right" },
    { label: "分析金额", value: "analysisAmount", align: "right" },
  ],
  data: [],
  summaryFieldList: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '120',
    btList: [
      {
        label: '联查凭证',
        show: proxy.$permission('cashFlowDetail:voucher'),
        event: linkVoucher,
      },
    ]
  },
  sectionRows: [],
});

onMounted(() => {
  tableInfo.value.api = API.list;
});

function getList() {
  console.log('1111111111111111', filterInfo.value.query)
  return;
  const required = requiredPageFilter(filterInfo.value.list, filterInfo.value.query)
  if(!required) return;
  filterInfo.value.copyQuery = cloneDeep({
    ...filterInfo.value.query,
  });
  tableInfo.value.refresh = Math.random();
}

function reset() {
  filterInfo.value.list[1].computeValue = ['2025-03', '2026-04']

  filterInfo.value.query = {};
  getList();
}

function tableHandler(eventName, raw) {
  if (eventName === "tableCheck") {
    tableInfo.value.sectionRows = raw;
  }
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

function selectFlowItem() {
  selectorInfo.type = "flowItem";
  selectorInfo.query = {};
  selectorInfo.callback = (data) => {
    filterInfo.value.query.flowItemId = data.id;
    filterInfo.value.query.flowName = data.name;
  };
  selectorInfo.visible = true;
}
</script>
