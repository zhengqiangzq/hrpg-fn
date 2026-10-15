<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
          <TreeBtns
            :filterBtn="treeBtnInfo.btnList"
            :title="treeBtnInfo.title"
          />
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
        <div class="slipui-card-body firstCard">
          <div
            class="slipui-btn-container border-style-bottom rightContainerTitleBox"
          >
            <div class="rightContainerTitle">科目体系详情</div>
            <el-button
              :disabled="!tableInfo.data.length || isDisabled"
              type="primary"
              @click="save"
              >保存</el-button
            >
          </div>
          <div>
            <PageForm
              class="paddingBox order-model-formBox flex_wrap_start_start"
              ref="formRef"
              v-model:ref-obj="formInfo.ref"
              :data="formInfo.data"
              :field-list="formInfo.fieldList"
              :rules="formInfo.rules"
              :label-width="formInfo.labelWidth"
            />
          </div>
        </div>
        <div class="slipui-card-body">
          <div class="opt-header border-style-bottom mb12">
            <el-button
              type="primary"
              :disabled="isDisabled"
              @click="addRow(undefined)"
              >增加行</el-button
            >
            <el-button
              :plain="false"
              :disabled="canDel || isDisabled"
              @click="delRow(undefined)"
              >删除行</el-button
            >
          </div>
          <el-form
            :model="tableInfo"
            ref="tableForm"
            style="width: 100%"
            @submit.native.prevent
          >
            <table-container
              ref="table"
              :refresh="tableInfo.refresh"
              :init-curpage="tableInfo.initCurpage"
              v-model:data="tableInfo.data"
              :field-list="tableInfo.fieldList"
              :handle="tableInfo.handle"
              :checkBox="true"
              :pager="false"
              :tabIndex="true"
              @handleEvent="handleEvent"
            >
            </table-container>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="subjectSystem">
import {
  accsystemList,
  acctypeList,
  acctypeCreate,
  acctypeUpdate,
  acctypeDel,
} from "@/api/base.js";
const PERMISSION_CODE = "subjectSystem";
const { proxy } = getCurrentInstance();
// 树过滤信息
const treeFilter = ref({
  query: {
    keyword: "",
  },
});
const treeBtnInfo = ref({
  title: "科目体系",
  btnList: [
    {
      type: "button",
      label: "新增",
      show: proxy.$permission(`${PERMISSION_CODE}:add`),
      event: add,
    },
    {
      type: "button",
      label: "删除",
      show: proxy.$permission(`${PERMISSION_CODE}:delete`),
      event: del,
      disabled: () => isDisabled.value,
    },
  ],
});
// 表单相关
const formInfo = ref({
  ref: null,
  data: {},
  fieldList: [
    {
      label: "科目体系编码",
      value: "code",
      type: "input",
      required: true,
      disabled: () => isDisabled.value,
    },
    {
      label: "科目体系名称",
      value: "name",
      type: "input",
      required: true,
      disabled: () => isDisabled.value,
    },
    {
      label: "科目体系规则",
      value: "codeRule",
      type: "input",
      required: true,
      labelTip: "最多支持九级。例：4/4/4/4/4/4/4/4/4",
      disabled: () => isDisabled.value,
    },
    {
      label: "备注",
      value: "remark",
      type: "textarea",
      disabled: () => isDisabled.value,
    },
  ],
  rules: {
    code: [{ required: true, message: "请输入科目体系编码" }],
    name: [{ required: true, message: "请输入科目体系名称" }],
    codeRule: [
      { required: true, message: "请输入科目体系规则" },
      {
        pattern: /^[1-4](?:\/[1-4]){0,8}$/,
        message: "请输入1-4的数字，用/分隔，最多支持9级",
      },
    ],
  },
  labelWidth: "130px",
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
      label: "科目类型编码",
      value: "code",
      type: "inputRules",
      required: true,
      rules: [
        { required: true, message: "请输入科目类型编码", trigger: "blur" },
      ],
      disabled: () => isDisabled.value,
    },
    {
      label: "科目类型名称",
      value: "name",
      type: "inputRules",
      required: true,
      rules: [
        { required: true, message: "请输入科目类型名称", trigger: "blur" },
      ],
      disabled: () => isDisabled.value,
    },
    {
      label: "余额方向",
      value: "balanceDirection",
      type: "select-model-rules",
      code: "accounting_account_direction",
      required: true,
      rules: [{ required: true, message: "请选择余额方向", trigger: "change" }],
      disabled: () => isDisabled.value,
    },
    {
      label: "科目类型性质",
      value: "type",
      type: "select-model-rules",
      code: "acctype_type",
      required: true,
      rules: [
        { required: true, message: "请选择科目类型性质", trigger: "change" },
      ],
      disabled: () => isDisabled.value,
    },
    {
      label: "科目属性",
      value: "accAttribute",
      type: "select-model-rules",
      code: "acctype_attribute",
      required: true,
      rules: [{ required: true, message: "请选择科目属性", trigger: "change" }],
      disabled: () => isDisabled.value,
    },
  ],
  handle: {
    fixed: "right",
    label: "操作",
    width: "90",
    btList: [
      {
        label: "新增行",
        event: addRow,
        show: true,
        ifRender: () => !isDisabled.value,
      },
      {
        label: "删除行",
        event: delRow,
        show: true,
        ifRender: () => !isDisabled.value,
      },
    ],
  },
});
// 点击树节点
const currentNode = ref({});
const formRefs = ref([]);
// 批量按钮控制
const canDel = computed(() => {
  return !tableInfo.value.selections.length;
});
// 批量按钮控制
const isDisabled = computed(() => {
  return currentNode.value.sysFlag === "1";
});
// 树节点过滤方法
watch(treeFilter.value.query, (val) => {
  treeRef.value.filter(val.keyword);
});
onMounted(() => {
  fetchArchiveTypes();
});
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
    formInfo.value.data = node;
    const response = await acctypeList({ accsystemId: node.id });
    tableInfo.value.data = response.data;
  } else {
    currentNode.value = {};
    formInfo.value.data = {};
    tableInfo.value.data = [];
    clearClick();
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
// 保存
function save() {
  formRefs.value = [proxy.$refs["tableForm"], formInfo.value.ref];
  proxy.$fn.checkForm(formRefs.value).then(() => {
    const api = formInfo.value.data.id ? acctypeUpdate : acctypeCreate;
    const btnCode = formInfo.value.data.id ? ":edit" : ":add";
    const _data = { ...formInfo.value.data, typeList: tableInfo.value.data };
    api(_data, PERMISSION_CODE + btnCode).then((resp) => {
      if (resp && resp.success) {
        fetchArchiveTypes();
        proxy.$message.success("保存成功");
      }
    });
  });
}
function addRow(row) {
  tableInfo.value.data.push({
    randomId: Date.now(), // 临时唯一标识，便于Vue更新DOM
  });
}
// 获取行唯一标识：优先使用接口返回的id，其次使用手动新增的randomId
function getRowKey(row) {
  return row.id || row.randomId;
}
function delRow(row) {
  if (row) {
    // 单个删除：剔除当前行
    const key = getRowKey(row);
    tableInfo.value.data = tableInfo.value.data.filter(
      (item) => getRowKey(item) !== key,
    );
  } else {
    // 批量删除：剔除所有勾选行（注意：原代码 selections 未定义，需使用 tableInfo.value.selections）
    tableInfo.value.data = tableInfo.value.data.filter(
      (item) =>
        !tableInfo.value.selections.some(
          (sel) => getRowKey(sel) === getRowKey(item),
        ),
    );
  }
}

// 新增
function add() {
  currentNode.value = {};
  formInfo.value.data = {};
  tableInfo.value.data = [];
  clearClick();
}
function clearClick() {
  proxy.$nextTick(() => {
    // 清除表单校验状态，避免空数据触发必填校验提示
    proxy.$refs.formRef.clearValidates();
    // 清除树组件的选中状态
    treeRef.value?.setCurrentKey(null);
  });
}
// 删除
function del() {
  proxy
    .$confirm("是否确认删除?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
    .then(() => {
      acctypeDel(currentNode.value.id, PERMISSION_CODE + ":del").then(
        (resp) => {
          if (resp && resp.success) {
            formInfo.value.data = {};
            tableInfo.value.data = [];
            fetchArchiveTypes();
            clearClick()
            proxy.$message.success("删除成功");
          }
        },
      );
    });
}
</script>

<style lang="scss" scoped></style>
