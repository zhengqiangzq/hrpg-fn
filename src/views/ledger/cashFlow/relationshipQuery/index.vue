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
          :pager="true"
          :field-list="tableInfo.fieldList"
          @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
  </div>
</template>

<script setup name="relationshipQuery">
import { getCurrentInstance, onMounted, ref } from "vue";
import cloneDeep from "lodash/cloneDeep";
import { useUpload } from "@/hooks/useUpload";
import {requiredPageFilter} from "@/utils";
import {cashflowRelationExportExcel, cashflowRelationPage} from "@/api/ledger/relationship";

const { proxy } = getCurrentInstance();
const API = {
  list: cashflowRelationPage,
  export: cashflowRelationExportExcel,
};

const { exportData } = useUpload(
  API,
);

const userInfo = proxy.$store.state.systemConfig?.userLoginConfig

const filterInfo = ref({
  query: {},
  copyQuery: {},
  list: [
    {
      label: "核算账簿",
      value: "accbookName",
      required: true,
      asValue: 'accbookId',
      componentType: "select-data-custom",
      selectDataType: 'accountingBook'
    },
    {
      label: "现金流量项目",
      value: "cashflowItemName",
      asValue: 'cashflowItemId',
      checkBox: true,
      componentType: "select-data-custom",
      selectDataType: 'cashFlowProject'
    },
    {
      label: "会计科目",
      value: "accasoaOriginalName",
      asValue: 'accasoaOriginalId',
      checkBox: true,
      componentType: "select-data-custom",
      selectDataType: 'Account'
    },
  ],
  filterbtn: [
    { type: "button", label: "查询", btType: "primary", event: () => getList() },
    { type: "button", label: "重置", event: () => reset() },
  ],
  btnList: [
    {
      type: "button",
      label: "导出",
      show: proxy.$permission("relationshipQuery:export"),
      event: () => {
        if (Object.keys(filterInfo.value.copyQuery).length === 0) return proxy.$message.warning("请先查询数据");
        exportData(filterInfo.value.copyQuery, 'relationshipQuery:export');
      },
    },
  ],
});

const tableInfo = ref({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: "核算账簿", value: "accbookName" },
    { label: "现金流量项目", value: "cashflowItemName" },
    { label: "借方科目", value: "debitAccasoaName" },
    { label: "借方辅助核算", value: "debitAssValue" },
    { label: "贷方科目", value: "creditAccasoaName" },
    { label: "贷方辅助核算", value: "creditAssValue" },
    { label: "创建人", value: "createUserName" },
    { label: "创建日期", value: "createDate" },
  ],
  data: [],
  sectionRows: [],
});

onMounted(() => {
  if(userInfo) {
    filterInfo.value.query.accbookId = userInfo.accbookId
    filterInfo.value.query.accbookName = userInfo.accbookName
  }
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
</script>
