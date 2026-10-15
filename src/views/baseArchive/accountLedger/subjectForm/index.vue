<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
          <TreeBtns :title="treeBtnInfo.title" />
        </div>
        <div class="left-container-header border-style-bottom show-placeholder">
          <!-- 树搜索框 -->
          <el-input
            v-model="treeFilter.query.keyword"
            style="flex: 1"
            :clearable="true"
            placeholder="请输入编码/名称"
            class="show-placeholder"
            @keyup.enter.native="treeSearch"
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
        <!-- 树结构 -->
        <div class="left-container-main main-flex">
          <el-tree
            ref="treeRef"
            :data="treeInfo.treeData"
            highlight-current
            :props="treeInfo.defaultProps"
            :default-expanded-keys="treeInfo.treeData"
            :filter-node-method="filterNode"
            node-key="id"
            :default-expand-all="true"
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
          >
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <NewPageFilter :filter-btn="filterInfo.btnList"> </NewPageFilter>
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
          btnCode="subjectForm:list"
        ></table-container>
      </div>
    </div>
    <!-- 新增编辑弹窗 -->
    <PageDialog
      v-if="dialogInfo.visible"
      :title="dialogInfo.title"
      v-model:visible="dialogInfo.visible"
      :width="dialogInfo.width"
      :bt-loading="dialogInfo.btLoading"
      :bt-list="dialogInfo.btList"
      :row="dialogInfo.row"
    >
      <PageForm
        class="paddingBox order-model-formBox flex_wrap_start_start"
        v-model:ref-obj="formInfo.ref"
        :data="formInfo.data"
        :field-list="formInfo.fieldList"
        :rules="formInfo.rules"
        :label-width="formInfo.labelWidth"
        @handleEvent="(event) => changeForm(event)"
      />
    </PageDialog>
    <SelectAllocationOrg
      v-if="selectAllocationOrgInfo.visible"
      v-model:query="selectAllocationOrgInfo.query"
      v-model:show-dialog="selectAllocationOrgInfo.visible"
      title="选择组织"
      :saveEmpty="true"
      :checkStrictly="true"
      :check-box="true"
      :highlightCurrent="true"
      :showAllocationPlan="false"
      @callback="selectAllocationOrgInfoCallBack"
    ></SelectAllocationOrg>
    <SelectAllocationOrgDetails
      v-if="selectAllocationOrgDetailInfo.visible"
      v-model:query="selectAllocationOrgDetailInfo.query"
      v-model:show-dialog="selectAllocationOrgDetailInfo.visible"
      :allocationApi="accchartDistribute"
      :cancelApi="cancelDistribute"
      :loids="selectAllocationOrgDetailInfo.loids"
      @reset="getList"
    ></SelectAllocationOrgDetails>
  </div>
</template>

<script setup name="subjectForm">
import {
  accsystemList,
  accchartList,
  accchartCreate,
  accchartUpdate,
  accchartDel,
  accchartCheckTransition,
  accchartDistribute,
  cancelDistribute,
} from "@/api/base.js";
const SelectAllocationOrgDetails = defineAsyncComponent(
  () => import("@/components/SelectAllocationOrg/details"),
);
const { proxy } = getCurrentInstance();
// 树过滤信息
const treeFilter = ref({
  query: {
    keyword: "",
  },
});
const treeBtnInfo = ref({
  title: "科目表",
});
// 树结构信息
const treeRef = ref();
const treeInfo = ref({
  data: [],
  nodeKey: "id",
  checked: [],
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
  },
  searchList: [
    {
      componentType: "input",
      label: "科目表编码",
      value: "code",
      event: search,
    },
    {
      componentType: "input",
      label: "科目表名称",
      value: "name",
      event: search,
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
      show: proxy.$permission("subjectForm:add"),
      disabled: () => {
        return !currentNode.value.id;
      },
    },
    {
      type: "button",
      label: "分配",
      event: () => allocation(),
      show: proxy.$permission("subjectForm:allocation"),
      disabled: () => {
        // 1. 非当前组织批次禁用
        const isNotCurrentOrgBatch = !proxy.$fn.isCurrentOrgBatch(
          tableInfo.value.selections,
        );
        // 2. 选中项中包含“分配型”禁用
        const hasAllocationType = tableInfo.value.selections.some(
          (item) => item.controlType !== "2",
        );
        return isNotCurrentOrgBatch || hasAllocationType;
      },
    },
    {
      type: "button",
      label: "取消全部分配",
      show: proxy.$permission("subjectForm:cancellAllocation"),
      event: cancellAllocation,
      disabled: () => {
        // 1. 非当前组织批次禁用
        const isNotCurrentOrgBatch = !proxy.$fn.isCurrentOrgBatch(
          tableInfo.value.selections,
        );
        // 2. 选中项中包含“分配型”禁用
        const hasAllocationType = tableInfo.value.selections.some(
          (item) => item.controlType !== "2",
        );
        return isNotCurrentOrgBatch || hasAllocationType;
      },
    },
    {
      type: "button",
      label: "删除",
      event: () => remove(),
      show: proxy.$permission("subjectForm:delete"),
      disabled: () => {
        // 1. 非当前组织批次禁用
        return !proxy.$fn.isCurrentOrgBatch(
          tableInfo.value.selections,
        );
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
      label: "科目表编码",
      value: "code",
    },
    {
      label: "科目表名称",
      value: "name",
    },
    {
      label: "所属科目体系",
      value: "accsystemName",
    },
    {
      label: "科目编码规则",
      value: "codeRule",
    },
    {
      label: "管控模式",
      value: "controlTypeValue",
    },
    {
      label: "科目分配模式",
      value: "accDistributionTypeValue",
    },
    {
      label: "备注",
      value: "remark",
    },
    {
      label: "创建组织",
      value: "createOrgName",
    },
    {
      label: "创建人",
      value: "createUserName",
    },
    {
      label: "创建日期",
      value: "createDate",
    },
  ],
  handle: {
    fixed: "right",
    label: "操作",
    width: "90",
    btList: [
      {
        label: "编辑",
        event: update,
        show: proxy.$permission("subjectForm:update"),
        ifRender: (row) => {
          return proxy.$fn.isCurrentOrg(row);
        },
      },
      {
        label: "分配",
        event: allocation,
        show: proxy.$permission("subjectForm:allocation"),
        ifRender: (row) => {
          return proxy.$fn.isCurrentOrg(row) && row.controlType === "2";
        },
      },
      {
        label: "分配详情",
        event: allocationDetail,
        show: proxy.$permission("subjectForm:allocationDetail"),
        ifRender: (row) => {
          return proxy.$fn.isCurrentOrg(row) && row.controlType === "2";
        },
      },
      {
        label: "删除",
        event: remove,
        popconfirmText: "删除后将改变数据,是否继续？",
        show: proxy.$permission("subjectForm:delete"),
        ifRender: (row) => {
          return proxy.$fn.isCurrentOrg(row);
        },
      },
    ],
  },
});
// 点击树节点
const currentNode = ref({});
const selectAllocationOrgInfo = ref({
  visible: false,
  saveEmpty: true,
  query: {
    includePeer: "1",
  },
  checkedKey: {},
  loids: [],
});
const selectAllocationOrgDetailInfo = ref({
  visible: false,
  query: {
    dataType: "accchart",
    loid: "-2",
  },
  loids: [],
});
// 新增编辑弹窗
const dialogInfo = ref({
  visible: false,
  width: "800px",
  btLoading: false,
  btList: [
    {
      label: "确定",
      type: "primary",
      event: save,
    },
    { label: "取消", event: close },
  ],
});
// 账簿表单
const formInfo = ref({
  ref: null,
  data: {},
  fieldList: [
    {
      label: "科目表编码",
      value: "code",
      type: "input",
      required: true,
      width: "50%",
    },
    {
      label: "科目表名称",
      value: "name",
      type: "input",
      required: true,
      width: "50%",
    },
    {
      label: "所属科目体系",
      value: "accsystemName",
      type: "input",
      required: true,
      width: "50%",
      disabled: true,
    },
    {
      label: "科目编码规则",
      value: "codeRule",
      type: "input",
      required: true,
      width: "50%",
      disabled: true,
    },
    {
      label: "管控模式",
      value: "controlType",
      type: "select-model",
      code: "base_data_control_type",
      required: true,
      width: "50%",
      event: "controlTypeChange",
    },
    {
      label: "科目分配模式",
      value: "accDistributionType",
      type: "select-model",
      code: "accasoa_disribution_type",
      required: true,
      width: "50%",
      show: false,
    },
    {
      label: "备注",
      value: "remark",
      type: "textarea",
    },
  ],
  rules: {
    code: [{ required: true, message: "请输入科目表编码", trigger: "blur" }],
    name: [{ required: true, message: "请输入科目表名称", trigger: "blur" }],
    accsystemName: [
      { required: true, message: "请输入所属科目体系", trigger: "blur" },
    ],
    codeRule: [
      { required: true, message: "请输入科目编码规则", trigger: "blur" },
    ],
    controlType: [
      { required: true, message: "请选择管控模式", trigger: "change" },
    ],
    accDistributionType: [
      { required: true, message: "请选择科目分配模式", trigger: "change" },
    ],
  },
  labelWidth: "120px",
});
// 批量按钮控制
const canDel = computed(() => {
  return !tableInfo.value.selections.length;
});
// 树节点过滤方法
watch(treeFilter.value.query, (val) => {
  treeRef.value.filter(val.keyword);
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
  tableInfo.value.api = accchartList;
  tableInfo.value.initCurpage = Math.random();
  tableInfo.value.refresh = Math.random();
}
// 清除查询
function clearSearch() {
  tableInfo.value.data = [];
  filterInfo.value.query.name = "";
  filterInfo.value.query.code = "";
  search();
}
// 获取树数据
async function fetchArchiveTypes() {
  let result = await accsystemList({});
  if (result.data && result.data.length > 0) {
    treeInfo.value.treeData[0].children = result.data;
  }
}
function treeSearch() {
  treeRef.value.filter(treeFilter.value.query.keyword);
}
function filterNode(value, data) {
  if (!value) return true;
  return (
    data.name.includes(value) || data.code.includes(value) || data.id === "-2"
  );
}
async function handleNodeClick(node) {
  if (node.id && node.id != "-2") {
    currentNode.value = node;
    filterInfo.value.query.accsystemIds = [node.id];
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
// 编辑
function update(row) {
  formInfo.value.data = row?.id
    ? proxy.$fn.deepClone(row)
    : {
        accsystemId: currentNode.value.id,
        accsystemName: currentNode.value.name,
        codeRule: currentNode.value.codeRule,
      };
  dialogInfo.value.title = row?.id ? "编辑科目表" : "新增科目表";
  dialogInfo.value.visible = true;
  changeForm("controlTypeChange", true);
}
// 关闭新增编辑弹窗
function close() {
  dialogInfo.value.visible = false;
  formInfo.value.data = {};
}
function changeForm(event, isInit) {
  switch (event) {
    case "controlTypeChange":
      isInit ? '' : formInfo.value.data.accDistributionType = "";
      formInfo.value.fieldList.some((item) => {
        if (item.value === "accDistributionType") {
          item.show = formInfo.value.data.controlType === "2";
        }
      });
      break;
    default:
      break;
  }
}
// 保存会计账簿信息
function save() {
  formInfo.value.ref.validate((valid) => {
    if (valid) {
      let api = formInfo.value.data.id ? accchartUpdate : accchartCreate;
      let btnCode = formInfo.value.data.id
        ? "subjectForm:update"
        : "subjectForm:add";
      if (!formInfo.value.data.id) {
        api(formInfo.value.data, btnCode).then((resp) => {
          if (resp && resp.success) {
            close();
            getList();
          }
        });
        return;
      }
      accchartCheckTransition(formInfo.value.data, btnCode).then((res) => {
        api(formInfo.value.data, btnCode).then((resp) => {
          if (resp && resp.success) {
            close();
            getList();
          }
        });
      });
    }
  });
}
function remove(row) {
  const ids = getIds(row);
  if (row?.id) {
    accchartDel(ids, "subjectForm:delete").then((res) => {
      if (res && res.success) {
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
      accchartDel(ids, "subjectForm:del").then((resp) => {
        if (resp && resp.success) {
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
function getLoids(row) {
  if (row && row.loid) {
    return [row.loid];
  } else {
    return tableInfo.value.selections.map((value) => value.loid);
  }
}
function cancellAllocation() {
  let params = {
    loids: [],
  };
  proxy
    .$confirm("请确认是否取消全部分配?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
    .then(() => {
      params.loids = getLoids();
      cancelDistribute(params).then((res) => {
        if (res && res.success) {
          proxy.$message.success({
            message: "操作成功",
            duration: 3000,
            showClose: true,
          });
          getList();
        }
      });
    });
}
function allocationDetail(row) {
  selectAllocationOrgDetailInfo.value.visible = true;
  selectAllocationOrgDetailInfo.value.loids = getLoids(row);
  selectAllocationOrgDetailInfo.value.query.loid = row.loid;
}
function allocation(row) {
  const ids = getLoids(row);
  selectAllocationOrgInfo.value.loids = ids;
  selectAllocationOrgInfo.value.visible = true;
}
function selectAllocationOrgInfoCallBack(allNodes) {
  let params = {
    loids: selectAllocationOrgInfo.value.loids,
    orgList: [],
  };
  if (allNodes && allNodes.length) {
    allNodes.map((item) => {
      params.orgList.push({
        ...item,
        children: [],
      });
    });
  }
  accchartDistribute(params).then((res) => {
    if (res && res.success) {
      proxy.$message.success({
        message: "操作成功",
        duration: 3000,
        showClose: true,
      });
      getList();
    }
  });
}
</script>

<style lang="scss" scoped></style>
