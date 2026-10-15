<template>
  <div class="app-container">
    <div class="layui-card width100">
      <div class="layui-card-body">
        <div class="page-title">错误分析</div>
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
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, onMounted, ref } from "vue";
import cloneDeep from "lodash/cloneDeep";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:visible", "callback"]);

const showDialog = computed({
  get() {
    return props.visible;
  },
  set(newValue) {
    emit("update:visible", newValue);
  },
});

const { proxy } = getCurrentInstance();
const API = {
  list: null,
  export: null,
};

const filterInfo = ref({
  query: {},
  copyQuery: {},
  btnList: [
    {
      type: "button",
      label: "保存",
      btType: "primary",
      show: proxy.$permission("errorAnalysis:save"),
      event: () => save(),
    },
    {
      type: "button",
      label: "返回",
      show: true,
      event: () => showDialog.value = false,
    },
  ],
});

const tableInfo = ref({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: "序号", value: "index", type: "index" },
    { label: "核算账簿", value: "accountBookName" },
    { label: "凭证日期", value: "voucherDate" },
    { label: "凭证类型", value: "voucherType" },
    { label: "凭证号", value: "voucherNumber" },
    { label: "摘要", value: "summary" },
    { label: "借方金额", value: "debitAmount", align: "right" },
    { label: "贷方金额", value: "creditAmount", align: "right" },
    { label: "分析金额", value: "analysisAmount", align: "right" },
  ],
  data: [],
  summaryFieldList: [],
  handle: {
    fixed: "right",
    label: "操作",
    width: "160",
    btList: [
      {
        label: "流量标注",
        show: proxy.$permission("errorAnalysis:annotate"),
        event: (row) => annotate(row),
      },
      {
        label: "联查凭证",
        show: proxy.$permission("errorAnalysis:linkVoucher"),
        event: (row) => linkVoucher(row),
      },
    ],
  },
  sectionRows: [],
});

onMounted(() => {
  tableInfo.value.api = API.list;
});

function getList() {
  filterInfo.value.copyQuery = cloneDeep({
    ...filterInfo.value.query,
  });
  tableInfo.value.refresh = Math.random();
}

function tableHandler(eventName, raw) {
  if (eventName === "tableCheck") {
    tableInfo.value.sectionRows = raw;
  }
}

function save() {
  proxy.$message.info("保存功能开发中");
}

function annotate(row) {
  proxy.$message.info("流量标注功能开发中");
}

function linkVoucher(row) {
  proxy.$message.info("联查凭证功能开发中");
}
</script>
