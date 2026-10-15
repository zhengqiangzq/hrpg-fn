<template>
  <div class="app-container">
    <div class="layui-card width100" v-show="!errorAnalysisInfo.visible">
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
          :handle="tableInfo.handle"
          :field-list="tableInfo.fieldList"
          @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
    <error-analysis
      v-if="errorAnalysisInfo.visible"
      v-model:visible="errorAnalysisInfo.visible"
      @callback="getList"
    ></error-analysis>
    <select-data ref="selectorRef" />
  </div>
</template>

<script setup name="cashFlowQuery">
import { getCurrentInstance, onMounted, ref } from "vue";
import cloneDeep from "lodash/cloneDeep";
import { useUpload } from "@/hooks/useUpload";
import { exportTemplateExcel } from "@/api/base";
import { useSelectData } from "@/hooks/useSelectData";
import ErrorAnalysis from "./errorAnalysis.vue";
import {requiredPageFilter} from "@/utils";

const { proxy } = getCurrentInstance();
const API = {
  list: null,
  export: null,
  download: exportTemplateExcel,
};

const { exportData, downloadTemplate } = useUpload(
  API,
  "cashFlowQueryTemplate",
  "/cashFlowQuery/importExcel",
  () => getList(),
  "cashFlowQuery:import"
);

const { selectorInfo, selectorRef } = useSelectData();

const errorAnalysisInfo = ref({
  visible: false,
});

const filterInfo = ref({
  query: {},
  copyQuery: {},
  list: [
    { label: "核算账簿", value: "accountBookName", required: true, slot: true },
    { label: "凭证日期", value: "voucherDate", required: true, componentType: "date" },
    { label: "至", value: "voucherDateEnd", componentType: "date" },
    { label: "未记账凭证", value: "unposted", componentType: "checkbox-model" },
  ],
  filterbtn: [
    { type: "button", label: "查询", btType: "primary", event: () => getList() },
    { type: "button", label: "重置", event: () => reset() },
  ],
  btnList: [
    {
      type: "button",
      label: "错误分析",
      show: proxy.$permission("cashFlowQuery:errorAnalysis"),
      event: () => errorAnalysisInfo.value.visible = true,
    },
    {
      type: "button",
      label: "导出",
      show: proxy.$permission("cashFlowQuery:export"),
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
    { label: "现金流量项目编码", value: "flowCode" },
    { label: "现金流量项目", value: "flowName" },
    { label: "本期数", value: "currentAmount", align: "right" },
    { label: "联查", value: "link", type: "slot" },
  ],
  data: [],
  summaryFieldList: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '120',
    btList: [
      {
        label: '现金流量明细',
        show: proxy.$permission('cashFlowQuery:detail'),
        event: goDetail,
      },
    ]
  },
  sectionRows: [],
});

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

function goDetail(row) {
  proxy.$message.info("查看现金流量明细");
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
