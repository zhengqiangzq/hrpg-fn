<template>
  <div class="app-container">
    <div v-show="!modifyInfo.visible && !detailInfo.visible">
      <!-- 搜索栏 -->
      <div class="filter-wrapper">
        <NewPageFilter
          v-model:query="filterInfo.query.queryMap"
          :queryMoreJson="true"
          :filter-list="filterInfo.searchList"
          :filter-btn="filterInfo.searchBtn"
          :clear-type="clearType"
          :slip-select-request="slipSelectRequest"
        />
      </div>
      <!-- 操作按钮 -->
      <div class="filter-wrapper">
        <NewPageFilter :filter-btn="filterInfo.btnList" />
        <div class="display-flex">
          <el-button @click="preferenceInfo.visible = true">偏好设置</el-button>
        </div>
      </div>
      <!-- 数据表格 -->
      <table-container
        ref="table"
        :refresh="tableInfo.refresh"
        :init-curpage="tableInfo.initCurpage"
        v-model:data="tableInfo.data"
        :api="tableInfo.api"
        :tab-index="true"
        :check-box="true"
        :pager="true"
        v-model:query="filterInfo.query"
        :field-list="tableInfo.fieldList"
        :handle="tableInfo.handle"
        @handleEvent="handleEvent"
        btnCode="voucherPreparation:list"
      />
    </div>

    <!-- 编辑弹窗 -->
    <Modify
      v-if="modifyInfo.visible"
      v-model:visible="modifyInfo.visible"
      :id="modifyInfo.id"
      :title="modifyInfo.title"
      :mode="modifyInfo.mode"
      :defaultBookId="modifyInfo.defaultBookId"
      :defaultBookName="modifyInfo.defaultBookName"
      @returnModify="returnModify"
    />
    <!-- 详情弹窗 -->
    <Detail
      v-if="detailInfo.visible"
      v-model:visible="detailInfo.visible"
      :id="detailInfo.id"
      @returnBack="getList"
    />
    <!-- 偏好设置 -->
    <SetPreference
      v-if="preferenceInfo.visible"
      v-model:visible="preferenceInfo.visible"
      :search-list="filterInfo.searchList"
      :field-list="tableInfo.fieldList"
      :customizeUserVO="filterInfo.query.customizeUserVO"
      :groupLevelShow="false"
      @callback="setPreferenceCallback"
    />
    <!-- 凭证导入 -->
    <UploadExcel
      v-if="uploadExcelInfo.visible"
      v-model:showDialog="uploadExcelInfo.visible"
      type="voucherImport"
      btnCode="voucherPreparation:import"
      action="/base/voucher/importExcel"
    />
    <!-- 导入日志 -->
    <UploadLog
      v-if="uploadLogInfo.visible"
      v-model:showDialog="uploadLogInfo.visible"
      :query="uploadLogInfo.query"
    />
    <!-- 方案查询弹窗 -->
    <PlanSearch
      v-if="planSearchVisible"
      v-model:visible="planSearchVisible"
      :defaultValue="planSearchDefaultValue"
      @search="handlePlanSearch"
    />
    <!-- 空号查询弹窗 -->
    <EmptyQueryDialog
      v-model:visible="emptyQueryVisible"
      :bookId="filterInfo.query.bookId"
      :bookName="filterInfo.query.bookName"
      @callback="handleEmptyQueryCallback"
    />
    <!-- 打印设置弹窗 -->
    <PrintSettingDialog
      v-model:visible="printSettingVisible"
      :bookId="filterInfo.query.bookId"
      :bookName="filterInfo.query.bookName"
      @callback="handlePrintSettingCallback"
    />
    <!-- 操作流水 -->
    <OperateAffair
      v-model:visible="operateAffairVisible"
      :info="operateAffairInfo"
      @callBack="handleOperateAffairClose"
    />
  </div>
</template>

<script setup name="voucherPreparation">
import {
  voucherCustomizeListAll,
  voucherVoid,
  voucherExportExcel,
  getCustomizeSetting,
  updateUserCustomize,
  voucherTypeList,
} from "@/api/base";
import {voucherPage, voucherdeleteBatch} from "@/api/ledger/voucherManagement";

const Modify = defineAsyncComponent(() => import("./modify"));
const Detail = defineAsyncComponent(() => import("./detail"));
const { proxy } = getCurrentInstance();

// ========== 默认搜索字段 ==========
const defaultSearchFields = {
  voucherTypeName: {
    label: "凭证类别",
    value: "voucherTypeName",
    asValue: "voucherTypeId",
    componentType: "slip-select",
    api: voucherTypeList,
    keyField: "name",
    valueField: "id",
    query: {},
    event: search,
    show: true,
  },
  voucherNo: {
    label: "凭证号",
    value: "voucherNo",
    componentType: "rangeInput",
    rangeArr: ["voucherNoStart", "voucherNoEnd"],
    rangeValue: [],
    staryPlaceholder: "起始凭证号",
    endPlaceholder: "结束凭证号",
    event: search,
    show: true,
  },
};

// ========== 默认表格字段 ==========
const defaultTableFields = {
  bookName: {
    label: "核算账簿",
    value: "bookName",
    show: true,
    hidden: false,
  },
  voucherDate: {
    label: "凭证日期",
    value: "voucherDate",
    show: true,
    hidden: false,
  },
  voucherNo: {
    label: "凭证号",
    value: "voucherNo",
    type: "slot",
    show: true,
    hidden: false,
  },
  summary: {
    label: "摘要",
    value: "summary",
    show: true,
    hidden: false,
  },
  financialDebit: {
    label: "财务借方",
    value: "financialDebit",
    show: true,
    hidden: false,
    align: "right",
    formatterValue: (val) => {
      if (val === null || val === undefined) return "-";
      return proxy.$fn?.TripartiteReturnNumber(val) ?? val;
    },
  },
  financialCredit: {
    label: "财务贷方",
    value: "financialCredit",
    show: true,
    hidden: false,
    align: "right",
    formatterValue: (val) => {
      if (val === null || val === undefined) return "-";
      return proxy.$fn?.TripartiteReturnNumber(val) ?? val;
    },
  },
  budgetDebit: {
    label: "预算借方",
    value: "budgetDebit",
    show: true,
    hidden: false,
    align: "right",
    formatterValue: (val) => {
      if (val === null || val === undefined) return "-";
      return proxy.$fn?.TripartiteReturnNumber(val) ?? val;
    },
  },
  budgetCredit: {
    label: "预算贷方",
    value: "budgetCredit",
    show: true,
    hidden: false,
    align: "right",
    formatterValue: (val) => {
      if (val === null || val === undefined) return "-";
      return proxy.$fn?.TripartiteReturnNumber(val) ?? val;
    },
  },
  remark: {
    label: "备注",
    value: "remark",
    show: true,
    hidden: false,
  },
  attachmentCount: {
    label: "附件张数",
    value: "attachmentCount",
    show: true,
    hidden: false,
    align: "center",
  },
};
console.log(2323)
console.log(proxy.$store.state.systemConfig)
// ========== 搜索配置 ==========
const filterInfo = ref({
  copyQuery: {},
  query: {
    customizeUserVO: {},
    queryMap: {
      bookName: {
        queryType: 'EQUALS',
        queryCategory: 'AND',
        value: proxy.$store.state.systemConfig?.userLoginConfig?.accbookName || '',
      },
      bookId: {
        queryType: 'EQUALS',
        queryCategory: 'AND',
        value: proxy.$store.state.systemConfig?.userLoginConfig?.accbookId || '',
      },
      voucherDateStart: {
        queryType: 'EQUALS',
        queryCategory: 'AND',
        value: '',
      },
      voucherDateEnd: {
        queryType: 'EQUALS',
        queryCategory: 'AND',
        value: '',
      },
    },
    planDetailList: [],
  },
  searchList: [
    {
      label: "核算账簿",
      value: "bookName",
      asValue: "bookId",
      componentType: "select-data-custom",
      selectDataType: "accountingBook",
      show: true,
      saveEmpty: false,
      required: true,
    },
    {
      label: "凭证日期",
      value: "voucherDate",
      componentType: "rangeDate",
      rangeArr: ["voucherDateStart", "voucherDateEnd"],
      rangeValue: [],
      show: true,
      required: true,
    },
  ],
  searchBtn: [
    { type: "button", label: "查询", event: () => search(true) },
    { type: "button", label: "方案查询", event: planSearch },
    { type: "button", label: "重置", event: () => clearSearch(true) },
  ],
  btnList: [
    {
      type: "button",
      label: "新增",
      event: create,
      show: proxy.$permission("voucherPreparation:add"),
    },
    {
      type: "button",
      label: "删除",
      event: del,
      show: proxy.$permission("voucherPreparation:delete"),
      disabled: () => !tableInfo.value.selections.length,
    },
    {
      type: "button",
      label: "作废",
      event: handleVoid,
      show: proxy.$permission("voucherPreparation:invalid"),
      disabled: () => !tableInfo.value.selections.length,
    },
    {
      type: "button",
      label: "空号查询",
      event: emptyNoQuery,
      show: proxy.$permission("voucherPreparation:emptyNoQuery"),
    },
    {
      type: "button",
      label: "打印设置",
      event: printSetting,
      show: proxy.$permission("voucherPreparation:printSetting"),
    },
    {
      type: "dropdown",
      label: "打印",
      show: proxy.$permission("voucherPreparation:print"),
      children: [
        {
          label: "打印",
          command: "print",
          show: proxy.$permission("voucherPreparation:print"),
        },
        {
          label: "打印预览",
          command: "printPreview",
          show: proxy.$permission("voucherPreparation:printPreview"),
        },
      ],
      event: (command) => {
        if (command === "print") handlePrint();
        else if (command === "printPreview") handlePrintPreview();
      },
    },
    {
      type: "dropdown",
      label: "导入/导出",
      show:
        proxy.$permission("voucherPreparation:import") ||
        proxy.$permission("voucherPreparation:importTemplate") ||
        proxy.$permission("voucherPreparation:exportMerge") ||
        proxy.$permission("voucherPreparation:exportSplit") ||
        proxy.$permission("voucherPreparation:exportList"),
      children: [
        {
          label: "导入",
          command: "import",
          show: proxy.$permission("voucherPreparation:import"),
        },
        {
          label: "导入日志",
          command: "importLog",
          show: proxy.$permission("voucherPreparation:import"),
        },
        {
          label: "下载导入模版",
          command: "importTemplate",
          show: proxy.$permission("voucherPreparation:importTemplate"),
        },
        {
          label: "凭证导出(辅助合并)",
          command: "exportMerge",
          show: proxy.$permission("voucherPreparation:exportMerge"),
        },
        {
          label: "凭证导出(辅助拆分)",
          command: "exportSplit",
          show: proxy.$permission("voucherPreparation:exportSplit"),
        },
        {
          label: "导出",
          command: "exportList",
          show: proxy.$permission("voucherPreparation:exportList"),
        },
      ],
      event: (command) => {
        switch (command) {
          case "import":
            uploadTest();
            break;
          case "importLog":
            uploadLog();
            break;
          case "importTemplate":
            exportTemplate();
            break;
          case "exportMerge":
            exportExcel("merge");
            break;
          case "exportSplit":
            exportExcel("split");
            break;
          case "exportList":
            exportExcel("list");
            break;
        }
      },
    },
  ],
});

// ========== 表格配置 ==========
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  selections: [],
  data: [],
  api: null,
  query: {},
  fieldList: [
    { label: "核算账簿", value: "accbookName" },
    { label: "凭证号", value: "num" },
    { label: "摘要", value: "explanation" },
    { label: "借方金额", value: "totalDebit" },
    { label: "贷方金额", value: "totalCredit" },
  ],
  handle: {
    fixed: "right",
    label: "操作",
    width: "160",
    btList: [
      {
        label: "编辑",
        event: update,
        show: proxy.$permission("voucherPreparation:update"),
        ifRender: () => true,
      },
      {
        label: "插入",
        event: insert,
        show: proxy.$permission("voucherPreparation:insert"),
        ifRender: () => true,
      },
      {
        label: "作废",
        event: handleVoid,
        show: proxy.$permission("voucherPreparation:invalid"),
        popconfirmText: "确认作废该凭证吗？",
        ifRender: (row) => row.status !== "3",
      },
      {
        label: "删除",
        event: del,
        show: proxy.$permission("voucherPreparation:delete"),
        popconfirmText: "确认删除该凭证吗？",
        ifRender: (row) => row.status === "0" || row.status === "3",
      },
      {
        label: "操作流水",
        event: showOrderAffair,
        show: proxy.$permission("voucherPreparation:orderAffair"),
        ifRender: () => true,
      },
    ],
  },
});

// ========== 弹窗状态 ==========
const modifyInfo = ref({
  visible: false,
  title: "",
  id: "",
  mode: "", // 'add' | 'edit' | 'copy'
  defaultBookId: "",
  defaultBookName: "",
});
const detailInfo = ref({
  visible: false,
  id: "",
});
const preferenceInfo = ref({
  visible: false,
});
const clearType = ref(true);
const slipSelectRequest = ref(true);
const uploadExcelInfo = ref({
  visible: false,
});
const uploadLogInfo = ref({
  visible: false,
  query: {
    type: "voucherImport",
  },
});

// ========== 空号查询弹窗 ==========
const emptyQueryVisible = ref(false);

// ========== 打印设置弹窗 ==========
const printSettingVisible = ref(false);

// ========== 操作流水 ==========
const operateAffairVisible = ref(false);
const operateAffairInfo = ref({
  query: {},
});

// ========== 方案查询弹窗 ==========
const planSearchVisible = ref(false);
const planSearchDefaultValue = ref({});


// ========== 生命周期 ==========
onMounted(() => {
  // setData();
});

// ========== 初始化搜索字段与表格字段 ==========
function setData() {
  const searchObj = {};
  for (const key in defaultSearchFields) {
    searchObj[key] = proxy.$fn.deepClone(defaultSearchFields[key]);
  }
  filterInfo.value.searchList = [...filterInfo.value.searchList, ...Object.values(searchObj)]

  const tableObj = {};
  for (const key in defaultTableFields) {
    tableObj[key] = proxy.$fn.deepClone(defaultTableFields[key]);
  }
  tableInfo.value.fieldList = Object.values(tableObj);

  getCustomize();
}

// ========== 获取偏好设置 ==========
function getCustomize(_slipSelectRequest = true) {
  const param = {
    // TODO: 替换为实际的 tableKey，格式参考: fnNewAccasoaList-com.slip.fn.base.domain.vo.VoucherVO
    tableKey: `fnNewVoucherList-com.slip.fn.base.domain.vo.VoucherVO`,
  };
  getCustomizeSetting(param).then((res) => {
    if (res && res.success) {
      const data = res.data;
      filterInfo.value.query.customizeUserVO = data;

      // 设置表格字段
      tableInfo.value.fieldList = proxy.$fn.setFieldList(
        tableInfo.value.fieldList,
        data.detail,
      );

      // 设置搜索字段
      const searchInfo = proxy.$fn.setSearchList(
        filterInfo.value.searchList,
        data.detail,
      );
      filterInfo.value.query.queryMap = {
        ...filterInfo.value.query.queryMap,
        ...searchInfo.queryMap,
      };
      filterInfo.value.searchList = searchInfo.searchList;
      filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query);

      slipSelectRequest.value = _slipSelectRequest;
      tableInfo.value.api = voucherCustomizeListAll;
    }
  });
}

// ========== 偏好设置回调 ==========
async function setPreferenceCallback(obj) {
  updateUserCustomize(obj.customizeUserVO).then((res) => {
    if (res && res.success) {
      getCustomize(!slipSelectRequest.value);
    }
  });
}

// ========== 查询/重置 ==========
function search(isBtnEvent) {
  console.log("查询/重置");
  console.log(filterInfo.value.query.queryMap);
  // if (!filterInfo.value.query.queryMap?.bookId?.value) {
  //   proxy.$message.warning("请选择核算账簿");
  //   return;
  // }
  // if (!filterInfo.value.query.queryMap?.voucherDateStart?.value || !filterInfo.value.query.queryMap?.voucherDateEnd?.value) {
  //   proxy.$message.warning("请选择凭证日期");
  //   return;
  // }
  // if (isBtnEvent) {
  //   filterInfo.value.query.planDetailList = [];
  // }
  filterInfo.value.copyQuery = {
    accbookIds: '2076961157518278658'
  }
  tableInfo.value.api = voucherPage
  tableInfo.value.initCurpage = Math.random();
  tableInfo.value.refresh = Math.random();
}

function planSearch() {
  planSearchDefaultValue.value = setDefaultValue();
  planSearchVisible.value = true;
}

function setDefaultValue() {
  const list = filterInfo.value.query.planDetailList;
  if (!list || !list.length) return {};
  const obj = {};
  list.forEach((item) => {
    if (item.fieldName) {
      obj[item.fieldName] = item.value;
    }
  });
  return obj;
}

function handlePlanSearch(queryMap) {
  planSearchVisible.value = false;
  filterInfo.value.query.planDetailList = queryMap;
  search();
}

function clearSearch() {
  clearType.value = !clearType.value;
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery);
  filterInfo.value.query.planDetailList = [];
  search(true);
}

// ========== 列表刷新 ==========
function getList() {
  tableInfo.value.refresh = Math.random();
}

// ========== 表格事件 ==========
function handleEvent(event, data) {
  switch (event) {
    case "tableClickRow":
      tableInfo.value.selections = data;
      break;
    case "tableCheck":
      tableInfo.value.selections = data;
      break;
  }
}

// ========== 新增 ==========
function create() {
  modifyInfo.value.title = "新增凭证";
  modifyInfo.value.id = "";
  modifyInfo.value.mode = "add";
  // 将当前搜索条件中的核算账簿传递给编辑页作为默认值
  modifyInfo.value.defaultBookId = filterInfo.value.query.queryMap?.bookId?.value || "";
  modifyInfo.value.defaultBookName = filterInfo.value.query.queryMap?.bookName?.value || "";
  modifyInfo.value.visible = true;
}

// ========== 编辑 ==========
function update(row) {
  modifyInfo.value.title = "编辑凭证";
  modifyInfo.value.id = row.id;
  modifyInfo.value.mode = "edit";
  modifyInfo.value.visible = true;
}

// ========== 插入 ==========
function insert(row) {
  modifyInfo.value.title = "插入凭证";
  modifyInfo.value.id = row.id;
  modifyInfo.value.mode = "insert";
  modifyInfo.value.visible = true;
}

// ========== 详情 ==========
function showDetail(row) {
  detailInfo.value.id = row.id;
  detailInfo.value.visible = true;
}

// ========== 作废 ==========
function handleVoid(row) {
  const ids = getIds(row);
  if (!ids.length) {
    proxy.$message.warning("请选择要作废的凭证");
    return;
  }
  // 表格行操作已由 popconfirm 确认，工具栏按钮需二次确认
  if (row?.id) {
    voucherVoid(ids, "voucherPreparation:invalid").then((res) => {
      if (res && res.success) {
        proxy.$message.success("作废成功");
        getList();
      }
    });
    return;
  }
  proxy
    .$confirm("确认作废选中的凭证吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
    .then(() => {
      voucherVoid(ids, "voucherPreparation:invalid").then((res) => {
        if (res && res.success) {
          proxy.$message.success("作废成功");
          getList();
        }
      });
    });
}

// ========== 删除 ==========
function del(row) {
  const ids = getIds(row);
  if (!ids.length) {
    proxy.$message.warning("请选择要删除的凭证");
    return;
  }
  if (row?.id) {
    voucherdeleteBatch(ids, "voucherPreparation:delete").then((res) => {
      if (res && res.success) {
        proxy.$message.success("删除成功");
        getList();
      }
    });
    return;
  }
  proxy
    .$confirm("确认删除选中的凭证吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
    .then(() => {
      voucherdeleteBatch(ids, "voucherPreparation:delete").then((res) => {
        if (res && res.success) {
          proxy.$message.success("删除成功");
          getList();
        }
      });
    });
}

// ========== 空号查询 ==========
function emptyNoQuery() {
  if (!filterInfo.value.query.bookId) {
    proxy.$message.warning("请先选择核算账簿");
    return;
  }
  emptyQueryVisible.value = true;
}

function handleEmptyQueryCallback(data) {
  // 确认回调，可根据需要处理查询结果
  // data.result 包含后端返回的空号数据
}

// ========== 操作流水 ==========
function showOrderAffair(row) {
  operateAffairInfo.value.query = {
    orderType: 94,
    orderId: row.id,
  };
  operateAffairVisible.value = true;
}

function handleOperateAffairClose() {
  operateAffairVisible.value = false;
}

// ========== 导入/导出 ==========
function uploadTest() {
  uploadExcelInfo.value.visible = true;
}

function uploadLog() {
  uploadLogInfo.value.visible = true;
}

function exportTemplate() {
  // TODO: 替换为实际的导出模板接口，参考 exportTemplateExcel("凭证导入模版")
  proxy.$message.info("导入模版下载功能待后端接口联调");
}

function exportExcel(type) {
  const params = {
    ...filterInfo.value.query,
    page: false,
    exportType: type,
  };
  voucherExportExcel(params, "voucherPreparation:exportList").then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp);
    }
  });
}

// ========== 打印相关 ==========
function printSetting() {
  if (!filterInfo.value.query.bookId) {
    proxy.$message.warning("请先选择核算账簿");
    return;
  }
  printSettingVisible.value = true;
}

function handlePrintSettingCallback(data) {
  // 打印设置保存成功回调
}

function handlePrint() {
  const ids = tableInfo.value.selections.map((item) => item.id);
  if (!ids.length) {
    proxy.$message.warning("请先选择要打印的凭证");
    return;
  }
  // TODO: 对接实际打印接口，参考 doPrintData 的调用方式
  // const params = { ids, ...filterInfo.value.query };
  proxy.$message.info("打印功能待后端接口联调");
}

function handlePrintPreview() {
  const ids = tableInfo.value.selections.map((item) => item.id);
  if (!ids.length) {
    proxy.$message.warning("请先选择要预览的凭证");
    return;
  }
  // TODO: 对接打印预览接口
  proxy.$message.info("打印预览功能待后端接口联调");
}

// ========== 编辑返回 ==========
function returnModify(hasId) {
  if (hasId) {
    getList();
  } else {
    search();
  }
}

// ========== 工具方法 ==========
function getIds(row) {
  if (row && row.id) {
    return [row.id];
  } else {
    return tableInfo.value.selections.map((value) => value.id);
  }
}
</script>

<style lang="scss" scoped></style>
