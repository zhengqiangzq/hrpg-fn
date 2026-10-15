<template>
  <div class="app-container">
    <div v-show="!modifyInfo.visible && !detailInfo.visible">
      <!-- 搜索栏 -->
      <div class="filter-wrapper">
        <NewPageFilter
          v-model:query="filterInfo.query"
          :filter-list="filterInfo.searchList"
          :filter-btn="filterInfo.searchBtn"
        />
      </div>
      <!-- 操作按钮 -->
      <div class="filter-wrapper">
        <NewPageFilter :filter-btn="filterInfo.btnList" />
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
        :pager="false"
        v-model:query="filterInfo.query"
        :field-list="tableInfo.fieldList"
        :handle="tableInfo.handle"
        @handleEvent="handleEvent"
        btnCode="accountingBookAuth:list"
      >
        <template v-slot:col-code="scope">
          <span
            v-if="scope.row.code"
            class="slip-edit"
            @click="showDetail(scope.row)"
          >
            {{ scope.row.code }}
          </span>
          <span v-else>
            {{ "-" }}
          </span>
        </template>
      </table-container>
    </div>

    <!-- 编辑弹窗 -->
    <Modify
      v-if="modifyInfo.visible"
      v-model:visible="modifyInfo.visible"
      :id="modifyInfo.id"
      :title="modifyInfo.title"
      @returnModify="returnModify"
    />
    <!-- 详情弹窗 -->
    <Detail
      v-if="detailInfo.visible"
      v-model:visible="detailInfo.visible"
      :id="detailInfo.id"
      @returnBack="getList"
    />
  </div>
</template>

<script setup name="accountingBookAuth">
import { roleList, roleDelete, getOrgTree } from "@/api/base";
import { useHighlightRow } from "@/hooks/useHighlightRow";
const Modify = defineAsyncComponent(() => import("./modify"));
const Detail = defineAsyncComponent(() => import("./detail"));
const { proxy } = getCurrentInstance();
const { setHighlightRow } = useHighlightRow();
// ========== 搜索配置 ==========
const filterInfo = ref({
  copyQuery: {},
  query: {},
  searchList: [
    {
      label: "角色编码",
      value: "code",
      componentType: "input",
      event: search,
    },
    {
      label: "角色名称",
      value: "name",
      componentType: "input",
      event: search,
    },
    {
      label: "所属组织",
      value: "orgName",
      asValue: "orgId",
      componentType: "select-data-custom",
      selectDataType: "orgTree",
    },
  ],
  searchBtn: [
    { type: "button", label: "查询", event: search },
    { type: "button", label: "重置", event: clearSearch },
  ],
  btnList: [
    {
      type: "button",
      label: "新增",
      event: create,
      show: proxy.$permission("accountingBookAuth:add"),
    },
    {
      type: "button",
      label: "删除",
      event: del,
      show: proxy.$permission("accountingBookAuth:delete"),
      disabled: () => !tableInfo.value.selections.length,
    },
  ],
});

// ========== 表格配置 ==========
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  selections: [],
  data: [],
  api: roleList,
  query: {},
  fieldList: [
    { label: "角色编码", value: "code", type: "slot" },
    { label: "角色名称", value: "name" },
    { label: "所属组织", value: "orgName" },
    { label: "角色说明", value: "remark" },
    { label: "创建组织", value: "orgName" },
    { label: "创建人", value: "createUserName" },
    { label: "创建日期", value: "createTime" },
  ],
  handle: {
    fixed: "right",
    label: "操作",
    width: "120",
    btList: [
      {
        label: "编辑",
        event: update,
        show: proxy.$permission("accountingBookAuth:update"),
        ifRender: () => true,
      },
      {
        label: "删除",
        event: del,
        popconfirmText: "删除后将改变数据,是否继续？",
        show: proxy.$permission("accountingBookAuth:delete"),
      },
    ],
  },
});

// ========== 弹窗状态 ==========
const modifyInfo = ref({
  visible: false,
  title: "",
  id: "",
});
const detailInfo = ref({
  visible: false,
  id: "",
});

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

// ========== 查询/重置 ==========
function search() {
  tableInfo.value.initCurpage = Math.random();
  tableInfo.value.refresh = Math.random();
}

function clearSearch() {
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery);
  search();
}

// ========== 列表刷新 ==========
function getList() {
  tableInfo.value.refresh = Math.random();
}

// ========== 新增 ==========
function create() {
  modifyInfo.value.title = "新增角色";
  modifyInfo.value.id = "";
  modifyInfo.value.visible = true;
}

// ========== 编辑 ==========
function update(row) {
  setHighlightRow(row.id)
  modifyInfo.value.title = "编辑角色";
  modifyInfo.value.id = row.id;
  modifyInfo.value.visible = true;
}

// ========== 详情 ==========
function showDetail(row) {
  setHighlightRow(row.id)
  detailInfo.value.id = row.id;
  detailInfo.value.visible = true;
}

// ========== 删除 ==========
function del(row) {
  const ids = getIds(row);
  if (row?.id) {
    roleDelete(ids, "accountingBookAuth:delete").then((res) => {
      if (res.code === 200) {
        proxy.$message.success("删除成功");
        getList();
      }
    });
    return;
  }
  proxy
    .$confirm("是否确认删除?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
    .then(() => {
      roleDelete(ids, "accountingBookAuth:delete").then((resp) => {
        if (resp.code === 200) {
          proxy.$message.success("删除成功");
          getList();
        }
      });
    });
}

function getIds(row) {
  if (row && row.id) {
    return [row.id];
  } else {
    return tableInfo.value.selections.map((value) => value.id);
  }
}

// ========== 编辑返回 ==========
function returnModify(hasId) {
  if (hasId) {
    getList();
  } else {
    search();
  }
}
</script>

<style lang="scss" scoped></style>
