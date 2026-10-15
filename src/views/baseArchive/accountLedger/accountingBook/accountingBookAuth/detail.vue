<template>
  <div class="view-fill">
    <div v-if="!modifyInfo.visible" class="app-container-flex">
      <NewFullScreen
        v-model="showDialog"
        :title="'角色权限详情'"
        :btn-list="fullInfo.btnList"
        @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
            v-if="$permission('accountingBookAuth:update')"
            type="primary"
            @click="update"
          >
            编辑
          </el-button>
        </template>

        <!-- 角色信息（只读） -->
        <div class="model-panel">
          <div class="model-panel-title">
            <p>角色信息</p>
          </div>
          <div class="model-panel-body">
            <basic-information
              :info="basicInfo.info"
              :label-width="basicInfo.labelWidth"
            />
          </div>
        </div>

        <!-- 账簿信息 + 用户信息 两栏布局 -->
        <div class="container-flex">
          <!-- 左侧：账簿信息 -->
          <div class="left-model-panel model-panel">
            <div class="model-panel-title">
              <p>账簿信息</p>
            </div>
            <div class="treeBox">
              <el-tree
                :data="checkedBookTree"
                :props="bookTree.defaultProps"
                node-key="id"
                default-expand-all
              />
            </div>
          </div>

          <!-- 右侧：用户信息 -->
          <div class="right-model-panel model-panel">
            <div class="model-panel-title">
              <p>用户信息</p>
            </div>
            <div style="flex: 1; min-height: 0; overflow: hidden">
              <page-table
                :refresh="tableInfo.refresh"
                v-model:data="tableInfo.data"
                :field-list="tableInfo.fieldList"
                :checkBox="false"
                :tabIndex="true"
                :pager="false"
                :isDynamic="true"
              />
            </div>
          </div>
        </div>
      </NewFullScreen>
    </div>

    <!-- 编辑弹窗 -->
    <modify
      v-if="modifyInfo.visible"
      v-model:visible="modifyInfo.visible"
      :id="modifyInfo.id"
      :title="modifyInfo.title"
      @returnModify="returnModify"
    />
  </div>
</template>

<script setup>
import { roleDetail, accountingbookList } from "@/api/base";

const modify = defineAsyncComponent(() => import("./modify"));
const { proxy } = getCurrentInstance();
const emit = defineEmits();
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
  },
});

// ========== 角色基本信息 ==========
const basicInfo = ref({
  info: {
    data: {},
    fieldList: [
      { label: "角色编码", value: "code" },
      { label: "角色名称", value: "name" },
      { label: "所属组织", value: "orgName" },
      { label: "角色说明", value: "remark" },
    ],
  },
  labelWidth: "130px",
});

const fullInfo = ref({
  btnList: [{ value: "button", type: "slot" }],
});

// ========== 账簿树 ==========
const bookTree = ref({
  data: [],
  checkedKeys: [],
  defaultProps: {
    children: "children",
    label: function (data) {
      return data.code ? data.code + " " + data.name : data.name;
    },
  },
});

// ========== 用户表 ==========
const tableInfo = ref({
  refresh: 1,
  data: [],
  fieldList: [
    { label: "用户编码", value: "userCode" },
    { label: "用户名称", value: "userName" },
    { label: "所属组织", value: "userOrgName" },
    { label: "权限生效日期", value: "effectiveDate" },
    { label: "权限失效日期", value: "validityDate" },
    { label: "授权人", value: "authorizationUserName" },
    { label: "授权日期", value: "authorizationDate" },
  ],
});

const modifyInfo = ref({
  visible: false,
  title: "",
  id: "",
});

const showDialog = computed({
  get() {
    return props.visible;
  },
  set(newValue) {
    emit("update:visible", newValue);
  },
});
// 仅展示已选中的账簿节点
const checkedBookTree = computed(() => {
  return filterCheckedNodes(bookTree.value.data, bookTree.value.checkedKeys);
});
// ========== 生命周期 ==========
onMounted(() => {
  getMain();
});
function filterCheckedNodes(nodes, checkedKeys) {
  if (!nodes || !nodes.length) return [];
  return nodes
    .reduce((acc, node) => {
      const filteredChildren = filterCheckedNodes(node.children, checkedKeys);
      if (checkedKeys.includes(node.id) || filteredChildren.length) {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, []);
}
function loadBookTree() {
  accountingbookList({}, "accountingBookAuth:list").then((res) => {
    if (res.code === 200) {
      bookTree.value.data = res.data || [];
    }
  });
}

function getMain() {
  roleDetail(props.id, "accountingBookAuth:detail").then((resp) => {
    if (resp.code === 200) {
      basicInfo.value.info.data = resp.data;
      bookTree.value.checkedKeys = resp.data.accountingbookList || [];
      tableInfo.value.data = resp.data.userList || [];
      loadBookTree();
    }
  });
}

function update() {
  modifyInfo.value.title = "编辑角色";
  modifyInfo.value.id = basicInfo.value.info.data.id;
  modifyInfo.value.visible = true;
}

function returnBack() {
  emit("returnBack", false);
}

function returnModify() {
  getMain();
}
</script>

<style scoped lang="scss">
.container-flex {
  display: flex;
  margin-top: 14px;
  flex: 1;
  .model-panel {
    margin-top: 0;
  }
  .left-model-panel {
    width: 280px;
    margin-right: 14px;
  }
  .right-model-panel {
    flex: 1;
  }
}
.treeBox {
  height: calc(100% - 40px);
  overflow: auto;
  :deep(.el-tree-node__expand-icon.is-leaf) {
    display: none;
  }
}
</style>
