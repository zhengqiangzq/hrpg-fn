<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
          <TreeBtns :title="treeBtnInfo.title" />
        </div>
        <div class="left-container-header border-style-bottom show-placeholder">
          <el-input
            v-model="treeFilter.query.keyword"
            style="flex: 1"
            :clearable="true"
            placeholder="请输入科目表编码/名称"
            class="show-placeholder"
            @keyup.enter="treeSearch"
          >
            <template #suffix>
              <i
                class="el-icon-search"
                @click="treeSearch"
                style="display: flex; align-items: center"
                ><el-icon><Search /></el-icon
              ></i>
            </template>
          </el-input>
        </div>
        <div class="left-container-main main-flex">
          <el-tree
            ref="treeRef"
            :data="treeInfo.treeData"
            highlight-current
            :props="treeInfo.defaultProps"
            :filter-node-method="filterNode"
            node-key="id"
            :expand-on-click-node="true"
            @node-click="handleNodeClick"
          >
            <template #default="{ data }">
              <span class="custom-tree-node">
                <span>{{ data.code }}</span>
                <span class="ml8">{{ data.name }}</span>
              </span>
            </template>
          </el-tree>
        </div>
      </div>
      <div class="right-container">
        <div class="filter-wrapper">
          <NewPageFilter
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.searchList"
            :filter-btn="filterInfo.searchBtn"
          />
        </div>
        <div class="filter-wrapper">
          <NewPageFilter :filter-btn="filterInfo.btnList" />
        </div>
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
          btnCode="accountingBookItems:list"
        />
      </div>
    </div>
    <!-- 新增/编辑弹窗 -->
    <add-edit
      v-if="addEditInfo.visible"
      :title="addEditInfo.title"
      :visible="addEditInfo.visible"
      :row="addEditInfo.row"
      @callback="addEditCallback"
    />
  </div>
</template>

<script setup name="accountingBookItems">
import AddEdit from "./addEdit.vue";
import {
  accountingbookList,
  accountingbookDel,
  accountingbookEnable,
  accountingbookDisable,
  accsystemList,
} from "@/api/base.js";

const { proxy } = getCurrentInstance();

// 树过滤信息
const treeFilter = ref({
  query: {
    keyword: "",
  },
});
const treeBtnInfo = ref({
  title: "核算账簿",
});
// 树结构信息
const treeRef = ref();
const treeInfo = ref({
  treeData: [
    {
      id: "-2",
      name: "科目体系",
      code: "",
      children: [],
    },
  ],
  defaultProps: {
    children: "children",
    label: "name",
  },
});

// 过滤相关配置
const filterInfo = ref({
  query: {
    name: "",
    code: "",
    accbookType: "",
    accsystemId: "",
  },
  searchList: [
    {
      componentType: "input",
      label: "账簿编码",
      value: "code",
    },
    {
      componentType: "input",
      label: "账簿名称",
      value: "name",
    },
    {
      componentType: "select-model",
      label: "账簿类型",
      value: "accbookType",
      code: "archives_account_book_type",
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
      event: () => update(),
      show: proxy.$permission("accountingBookItems:add"),
      disabled: () => {
        return !currentNode.value.id;
      },
    },
    {
      type: "button",
      label: "删除",
      event: () => handleDelete(),
      show: proxy.$permission("accountingBookItems:delete"),
      disabled: () => {
        return !tableInfo.value.selections.length;
      },
    },
    {
      type: "button",
      label: "启用",
      event: () => handleEnable(),
      show: proxy.$permission("accountingBookItems:enable"),
      disabled: () => {
        return !tableInfo.value.selections.length;
      },
    },
    {
      type: "button",
      label: "停用",
      event: () => handleDisable(),
      show: proxy.$permission("accountingBookItems:disable"),
      disabled: () => {
        return !tableInfo.value.selections.length;
      },
    },
  ],
});
// 表格信息
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  selections: [],
  data: [],
  api: null,
  query: {},
  fieldList: [
    {
      label: "账簿编码",
      value: "code",
    },
    {
      label: "账簿名称",
      value: "name",
    },
    {
      label: "核算组织",
      value: "orgName",
    },
    {
      label: "账簿类型",
      value: "accbookTypeValue",
    },
    {
      label: "科目体系",
      value: "accsystemName",
    },
    {
      label: "科目表",
      value: "accchartName",
    },
    {
      label: "启用期间",
      value: "startPeriod",
    },
    {
      label: "平行记账",
      value: "isParallelAccountingValue",
    },
    {
      label: "启用状态",
      value: "statusValue",
    },
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
        label: "停用",
        event: handleDisable,
        show: proxy.$permission("accountingBookItems:disable"),
        ifRender: (row) => {
          return row.status === "1";
        },
      },
      {
        label: "编辑",
        event: update,
        show: proxy.$permission("accountingBookItems:update"),
        ifRender: (row) => {
          return row.status !== "1";
        },
      },
      {
        label: "启用",
        event: handleEnable,
        show: proxy.$permission("accountingBookItems:enable"),
        ifRender: (row) => {
          return row.status !== "1";
        },
      },
      {
        label: "删除",
        event: handleDelete,
        popconfirmText: "删除后将改变数据,是否继续？",
        show: proxy.$permission("accountingBookItems:delete"),
        ifRender: (row) => {
          return row.status !== "1";
        },
      },
    ],
  },
});
// 点击树节点
const currentNode = ref({});
// 新增编辑弹窗状态
const addEditInfo = ref({
  visible: false,
  title: "",
  row: null,
});

// 树节点过滤方法
watch(() => treeFilter.value.query?.keyword, (val) => {
  treeRef.value?.filter(val);
});
onMounted(() => {
  fetchArchiveTypes();
});
// 获取列表
function getList() {
  tableInfo.value.refresh = Math.random();
}
// 查询
function search() {
  if(!currentNode.value.id)  {
    proxy.$message.warning("请选择科目体系");
    return;
  }
  tableInfo.value.api = accountingbookList;
  tableInfo.value.initCurpage = Math.random();
  tableInfo.value.refresh = Math.random();
}
// 清除查询
function clearSearch() {
  tableInfo.value.data = [];
  filterInfo.value.query.name = "";
  filterInfo.value.query.code = "";
  filterInfo.value.query.accbookType = "";
  search();
}
// 获取树数据
async function fetchArchiveTypes() {
  const result = await accsystemList({});
  if (result.data && result.data.length > 0) {
    treeInfo.value.treeData[0].children = result.data;
  }
}
function treeSearch() {
  treeRef.value?.filter(treeFilter.value.query.keyword);
}
function filterNode(value, data) {
  if (!value) return true;
  return (
    data.name?.includes(value) || data.code?.includes(value) || data.id === "-2"
  );
}
function handleNodeClick(node) {
  if (node.id && node.id !== "-2") {
    currentNode.value = node;
    filterInfo.value.query.accsystemId = node.id;
    search();
  } else {
    currentNode.value = {};
    tableInfo.value.data = [];
  }
}
// 表格事件
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
// 打开编辑弹窗
function update(row) {
  addEditInfo.value.title = row?.id ? "编辑核算账簿" : "新增核算账簿";
  addEditInfo.value.row = row?.id ? proxy.$fn.deepClone(row) : {
    accsystemId: currentNode.value.id,
    accsystemName: currentNode.value.name,
  };
  addEditInfo.value.visible = true;
}
// 新增/编辑弹窗回调
function addEditCallback(flag) {
  addEditInfo.value.visible = false;
  if (flag) {
    getList();
  }
}
// 删除（单删/批删合并）
function handleDelete(row) {
  const ids = getIds(row);
  const count = ids.length;
  if (count === 0) return;
  const msg =
    count === 1
      ? "删除后将改变数据,是否继续？"
      : `是否确认删除选中的 ${count} 条数据？`;
  proxy
    .$confirm(msg, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
    .then(() => {
      accountingbookDel(ids, "accountingBookItems:delete").then((resp) => {
        if (resp && resp.success) {
          proxy.$message.success("删除成功");
          getList();
        }
      });
    });
}
// 启用
function handleEnable(row) {
  const ids = getIds(row);
  accountingbookEnable(ids, "accountingBookItems:enable").then((resp) => {
    if (resp && resp.success) {
      proxy.$message.success("启用成功");
      getList();
    }
  });
}
// 停用
function handleDisable(row) {
  const ids = getIds(row);
  accountingbookDisable(ids, "accountingBookItems:disable").then((resp) => {
    if (resp && resp.success) {
      proxy.$message.success("停用成功");
      getList();
    }
  });
}
function getIds(row) {
  if (row && row.id) {
    return [row.id];
  } else {
    return tableInfo.value.selections.map((value) => value.id);
  }
}
</script>
