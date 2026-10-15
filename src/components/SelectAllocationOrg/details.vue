<template>
  <div>
    <page-dialog
      :title="dialogInfo.title"
      v-model:visible="shows"
      :width="dialogInfo.width"
      :bt-loading="dialogInfo.btLoading"
      :bt-list="dialogInfo.btList"
    >
      <!-- 条件栏 -->
      <new-page-filter
        v-model:query="filterInfo.query"
        :filter-list="filterInfo.list"
        :filter-btn="filterInfo.btnList"
      />
      <div>
        <el-button
          style="margin: 5px !important"
          :plain="false"
          :disabled="!canAllocation"
          @click="allocation"
          >重新分配</el-button
        >
        <el-button
          style="margin: 5px !important"
          :plain="false"
          :disabled="!canCancelAllocation"
          @click="cancellAllocation"
          >取消分配</el-button
        >
      </div>
      <dialog-table
        ref="dialogTable"
        :refresh="tableInfo.refresh"
        :init-curpage="tableInfo.initCurpage"
        v-model:data="tableInfo.data"
        :api="tableInfo.api"
        row-key="id"
        :query="filterInfo.query"
        :field-list="tableInfo.fieldList"
        :handle="tableInfo.handle"
        :highlight-row="highlightRow"
        :check-box="checkBox"
        :pager="false"
        :reserve-selection="true"
        :checked-row-list="checkedRowList"
        :checkedList="checkBox ? checkedList : []"
        @handleEvent="handleEvent"
      />
    </page-dialog>
  </div>
</template>

<script setup name="SelectAllocationOrgDetail">
import PageDialog from "../PageDialog/index";
import NewPageFilter from "@/components/NewPageFilter";
import DialogTable from "../DialogTable/index";
import { allocationOrgList } from "@/api/base.js";
const emits = defineEmits();
const { proxy } = getCurrentInstance();
const props = defineProps({
  title: {
    type: String,
    default: "分配详情",
  },
  highlightRow: {
    type: Boolean,
    default: false,
  },
  checkBox: {
    type: Boolean,
    default: true,
  },
  api: {
    type: Function,
    default: allocationOrgList,
  },
  cancelApi: {
    type: Function,
    default: undefined,
  },
  allocationApi: {
    type: Function,
    default: undefined,
  },
  showDialog: {
    type: Boolean,
  },
  query: {
    type: Object,
    default: function () {
      return {};
    },
  },
  checkedRowList: {
    type: Array,
    default: function () {
      return [];
    },
  },
  saveEmpty: {
    type: Boolean,
    default: false,
  },
  checkedList: {
    type: Array,
    default: function () {
      return [];
    },
  },
  loids: {
    type: Array,
    default: function () {
      return [];
    },
  },
  fieldList: {
    type: Array,
    default: function () {
      return [
        { label: "组织编码", value: "code" },
        { label: "组织名称", value: "name" },
        { label: "分配来源机构", value: "createOrgName" },
        { label: "分配状态", value: "allocationResultValue" },
        { label: "分配时间", value: "allocationTime" },
        { label: "失败原因", value: "errorReason" },
      ];
    },
  },
  filterInfoList: {
    type: Array,
    default: function () {
      return [];
    },
  },
});

// 过滤相关配置
const filterInfo = ref({
  query: {
    sort: "create_time desc",
    ...props.query,
  },
  list: [
    {
      componentType: "input",
      label: "编码",
      value: "code",
      event: search,
    },
    {
      componentType: "input",
      label: "名称",
      value: "name",
      event: search,
    },
    {
      componentType: "select-model",
      label: "分配状态",
      code: "success_status",
      clearable: true,
      value: "allocationResult",
      event: search,
    },
  ],
  btnList: [
    { type: "button", label: "查询", event: search },
    { type: "button", label: "重置", event: clearSearch },
  ],
});
// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: undefined,
  data: [],
  selections: [],
  fieldList: props.fieldList,
  handle: {
    fixed: "right",
    label: "操作",
    width: "140",
    btList: [
      {
        label: "取消分配",
        show: true,
        event: cancellAllocation,
        ifRender: function (row) {
          return row.allocationResult === "1";
        },
      },
      {
        label: "重新分配",
        show: true,
        event: allocation,
        ifRender: function (row) {
          return row.allocationResult === "0";
        },
      },
    ],
  },
});
// 弹窗相关
const dialogInfo = ref({
  width: "1200px",
  title: props.title,
  btLoading: false,
  btList: [{ label: "取消", event: handleClose, show: true }],
});
const isDrug = ref(proxy.$route?.path.includes("/drug/"));
const canCancelAllocation = computed(() => {
  return (
    tableInfo.value.selections.length &&
    !tableInfo.value.selections.filter((item) => item.allocationResult !== "1")
      .length
  );
});
const canAllocation = computed(() => {
  return (
    tableInfo.value.selections.length &&
    !tableInfo.value.selections.filter((item) => item.allocationResult !== "0")
      .length
  );
});
const shows = computed({
  get() {
    return props.showDialog;
  },
  set(newValue) {
    emits("update:showDialog", newValue); // 更新父组件shows
  },
});

onMounted(() => {
  // hack, 在table创建出来之后再去调用
  proxy.$nextTick(() => {
    getList();
    fullQuery();
  });
});
function fullQuery() {
  if (props.filterInfoList.length) {
    filterInfo.value.list = proxy.$fn.deepClone(props.filterInfoList)
    filterInfo.value.btnList = []
    // 提取按钮到 btnList，并将 type 转为 componentType
    filterInfo.value.list = filterInfo.value.list.filter((item) => {
      if (item.value === "clearSearch") {
        filterInfo.value.btnList.push({ type: "button", label: "重置", event: clearSearch })
        return false
      }
      if (item.type === "button") {
        filterInfo.value.btnList.push({ ...item })
        return false
      }
      if (item.type) {
        item.componentType = item.type
      }
      item.event = search
      return true
    })
  }
}
function cancellAllocation(row) {
  let params = {
    recordIds: [],
  };
  if (row && row.id) {
    params.recordIds = [row.id];
  } else {
    tableInfo.value.selections.map((item) => {
      params.recordIds.push(item.id);
    });
  }
  props.cancelApi(params).then((res) => {
    if (res && res.success) {
      proxy.$message.success({
        message: "操作成功",
        duration: 3000,
        showClose: true,
      });
      tableInfo.value.selections = [];
      proxy.$refs.dialogTable.clearSelection();
      search();
    }
  });
}
function allocation(row) {
  let params = {
    loids: props.loids,
    orgList: [],
  };
  if (row && row.id) {
    params.orgList = [
      {
        ...row,
        children: [],
      },
    ];
  } else {
    tableInfo.value.selections.map((item) => {
      params.orgList.push({
        ...item,
        children: [],
      });
    });
  }
  props.allocationApi(params).then((res) => {
    if (res && res.success) {
      proxy.$message.success({
        message: "操作成功",
        duration: 3000,
        showClose: true,
      });
      tableInfo.value.selections = [];
      proxy.$refs.dialogTable.clearSelection();
      search();
    }
  });
}
// 获取列表
function getList() {
  tableInfo.value.api = props.api;
  tableInfo.value.refresh = Math.random();
}
function search() {
  tableInfo.value.api = props.api;
  tableInfo.value.initCurpage = Math.random();
  tableInfo.value.refresh = Math.random();
}
function clearSearch() {
  filterInfo.value.query = {
    sort: "create_time desc",
    ...props.query,
  };
  search();
}
function handleEvent(event, data) {
  switch (event) {
    case "tableCheck":
      tableInfo.value.selections = data;
      break;
  }
}
// 关闭弹窗前的回调
function handleClose() {
  shows.value = false;
  emits("reset");
}
</script>

<style scoped></style>
