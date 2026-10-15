<template>
  <div class="view-fill">
    <div v-if="!modifyInfo.visible" class="app-container-flex">
      <NewFullScreen v-model="showDialog" :title="title">
        <template v-slot:full-button>
          <el-button type="primary" @click="save()">保存</el-button>
        </template>
        <!-- 角色信息 -->
        <div class="model-panel">
          <div class="model-panel-title">
            <p>角色信息</p>
          </div>
          <div class="model-panel-body">
            <page-form
              ref="modifyForm"
              class="paddingBox order-model-formBox flex_wrap_start_start"
              v-model:ref-obj="formInfo.ref"
              :data="formInfo.data"
              :field-list="formInfo.fieldList"
              :rules="formInfo.rules"
              :label-width="formInfo.labelWidth"
            >
              <template v-slot:form-orgId>
                <el-input
                  :model-value="formInfo.data.orgName"
                  disabled
                  placeholder="所属组织"
                />
              </template>
            </page-form>
          </div>
        </div>
        <!-- 账簿信息 + 用户信息 两栏布局 -->
        <div class="container-flex">
          <!-- 左侧：账簿信息 -->
          <div class="left-model-panel model-panel">
            <div class="model-panel-title">
              <p>账簿信息</p>
            </div>
            <div class="show-placeholder">
              <el-input
                v-model="bookFilter.keyword"
                placeholder="请输入账簿编码/名称"
                clearable
                @input="filterBookTree"
              >
                <template #suffix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
            <div class="treeBox">
              <el-tree
                ref="bookTreeRef"
                :data="bookTree.data"
                show-checkbox
                node-key="id"
                :props="bookTree.defaultProps"
                :default-checked-keys="bookTree.checkedKeys"
                :filter-node-method="filterBookNode"
                check-on-click-node
                @check="handleBookCheck"
              />
            </div>
          </div>
          <!-- 右侧：用户信息 -->
          <div class="right-model-panel model-panel">
            <div class="model-panel-title">
              <p>用户信息</p>
            </div>
            <new-page-filter
              v-model:query="userFilter.query"
              :filter-list="userFilter.searchList"
            />
            <new-page-filter :filter-btn="userFilter.btnList" />
            <div>
              <el-form
                :model="tableInfo"
                ref="tableForm"
                style="width: 100%; height: 100%"
              >
                <page-table
                  :refresh="tableInfo.refresh"
                  :init-curpage="tableInfo.initCurpage"
                  v-model:data="tableInfo.data"
                  :field-list="tableInfo.fieldList"
                  :handle="tableInfo.handle"
                  :check-box="true"
                  :tabIndex="true"
                  :pager="false"
                  :isDynamic="true"
                  @handleEvent="handleUserEvent"
                />
              </el-form>
            </div>
          </div>
        </div>
        <!-- 选择用户弹窗 -->
        <SelectData ref="selectorRef" />
        <!-- 修改生效/失效日期弹窗 -->
        <FormDialog ref="formDialogRef" />
      </NewFullScreen>
    </div>
  </div>
</template>

<script setup>
import {
  roleCreate,
  roleUpdate,
  roleDetail,
  accountingbookList,
} from "@/api/base";
import { useSelectData } from "@/hooks/useSelectData";
import { useFormDialog } from "@/hooks/useFormDialog";
import { useStorage } from "@vueuse/core";

const { proxy } = getCurrentInstance();
const { selectorInfo, selectorRef } = useSelectData();
const { formDialogInfo, formDialogRef } = useFormDialog();
const setting = useStorage("setting", {}, sessionStorage);
const userInfoStore = useStorage("userInfoStore", {}, localStorage);
const emit = defineEmits(["update:visible", "returnModify"]);
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "新增角色",
  },
  id: {
    type: String,
  },
});

const showDialog = computed({
  get() {
    return props.visible;
  },
  set(newValue) {
    emit("update:visible", newValue);
  },
});

const modifyInfo = ref({
  visible: false,
  title: "",
  id: "",
});

// ========== 角色信息表单 ==========
const formInfo = ref({
  ref: null,
  data: {
    orgId: setting.value.orgId,
    orgName: setting.value.hospitalName,
  },
  fieldList: [
    {
      label: "角色编码",
      value: "code",
      type: "input",
      required: true,
    },
    {
      label: "角色名称",
      value: "name",
      type: "input",
      required: true,
    },
    {
      label: "所属组织",
      value: "orgId",
      type: "slot",
      required: true,
    },
    {
      label: "角色说明",
      value: "remark",
      type: "textarea",
    },
  ],
  rules: {
    code: [{ required: true, message: "请输入角色编码", trigger: "blur" }],
    name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  },
  labelWidth: "130px",
});

// ========== 账簿树 ==========
const bookTreeRef = ref();
const bookFilter = ref({ keyword: "" });
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
const selectedBooks = ref([]);

// ========== 用户表 ==========
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  selections: [],
  fieldList: [
    { label: "用户编码", value: "userCode" },
    { label: "用户名称", value: "userName" },
    { label: "所属组织", value: "userOrgName" },
    { label: "权限生效日期", value: "effectiveDate" },
    { label: "权限失效日期", value: "validityDate" },
    { label: "授权人", value: "authorizationUserName" },
    { label: "授权日期", value: "authorizationDate" },
  ],
  handle: {
    fixed: "right",
    label: "操作",
    width: "180",
    btList: [
      {
        label: "生效/失效日期",
        event: updateDate,
        show: true,
      },
      {
        label: "删除",
        event: removeUser,
        show: true,
        popconfirmText: "是否确认删除该用户?",
      },
    ],
  },
});
// 完整用户数据源（过滤基于此列表）
const allUsers = ref([]);
// ========== 用户搜索过滤 ==========
const userFilter = ref({
  query: {},
  searchList: [
    {
      label: "用户编码/名称",
      value: "keyword",
      componentType: "input",
      event: filterUsers,
    },
  ],
  btnList: [
    {
      label: "新增用户",
      type: "button",
      event: addUser,
    },
    {
      label: "删除用户",
      type: "button",
      disabled: () => !tableInfo.value.selections.length,
      event: () => removeUser(),
    },
  ],
});

// ========== 生命周期 ==========
onMounted(() => {
  loadBookTree();
  if (props.id) {
    loadDetail();
  }
});

// ========== 账簿相关 ==========
function loadBookTree() {
  accountingbookList({}).then((res) => {
    if (res.code === 200) {
      bookTree.value.data = res.data || [];
    }
  });
}

function filterBookTree() {
  bookTreeRef.value?.filter(bookFilter.value.keyword);
}

function filterBookNode(value, data) {
  if (!value) return true;
  return data.name?.includes(value) || data.code?.includes(value);
}
function handleBookCheck(_data, { checkedKeys }) {
  selectedBooks.value = checkedKeys;
}

// ========== 用户相关 ==========
function handleUserEvent(event, data) {
  switch (event) {
    case "tableCheck":
      tableInfo.value.selections = [...data];
      break;
  }
}

function filterUsers() {
  const keyword = (userFilter.value.query.keyword || "").trim().toLowerCase();
  tableInfo.value.selections = [];
  if (!keyword) {
    tableInfo.value.data = [...allUsers.value];
  } else {
    tableInfo.value.data = allUsers.value.filter(
      (item) =>
        (item.userCode || "").toLowerCase().includes(keyword) ||
        (item.userName || "").toLowerCase().includes(keyword),
    );
  }
}

function addUser() {
  selectorInfo.type = "roleAuth";
  const existIds = allUsers.value.map((item) => item.userId);
  selectorInfo.query = {
    idNotIn: existIds,
  };
  selectorInfo.callback = (rows) => {
    const now = new Date().toISOString().split("T")[0];
    if (rows && rows.length) {
      rows.forEach((row) => {
        allUsers.value.push({
          userId: row.id,
          userCode: row.accountNo,
          userName: row.name,
          userOrgName: row.orgName,
          userOrgId: row.orgId,
          userGroupId: row.groupId,
          validateDate: "",
          expireDate: "",
          authorizationUserName:
            userInfoStore.value.userAndPermissionInfo.userInfoDTO.name,
          authorizationUser:
            userInfoStore.value.userAndPermissionInfo.userInfoDTO.id,
          authorizationDate: now,
        });
      });
      filterUsers();
    }
  };
  selectorInfo.visible = true;
}

function removeUser(row) {
  const ids = row
    ? [row.userId]
    : tableInfo.value.selections.map((item) => item.userId);
  allUsers.value = allUsers.value.filter((item) => !ids.includes(item.userId));
  filterUsers();
}

function updateDate(row) {
  formDialogInfo.type = "dateDialog";
  formDialogInfo.formData = {
    validateDate: row.validateDate || "",
    expireDate: row.expireDate || "",
  };
  formDialogInfo.callback = (formData) => {
    Object.assign(row, {
      validateDate: formData.validateDate,
      expireDate: formData.expireDate,
    });
  };
  formDialogInfo.visible = true;
}

// ========== 详情加载 ==========
function loadDetail() {
  roleDetail(props.id, "accountingBookAuth:detail").then((res) => {
    if (res.code === 200) {
      formInfo.value.data = { ...res.data };
      selectedBooks.value = res.data.accountingbookList || [];
      allUsers.value = res.data.userList || [];
      filterUsers();
      // 设置账簿树默认勾选
      nextTick(() => {
        bookTree.value.checkedKeys = selectedBooks.value;
      }, 100);
    }
  });
}

// ========== 保存 ==========
function save() {
  if (!selectedBooks.value.length) {
    proxy.$message.warning("请选择账簿");
    return;
  }
  if (!allUsers.value.length) {
    proxy.$message.warning("请选择用户");
    return;
  }
  const formRefs = [proxy.$refs["modifyForm"].$refs["form"]];
  proxy.$fn.checkForm(formRefs).then(() => {
    const api = props.id ? roleUpdate : roleCreate;
    const btnCode = props.id
      ? "accountingBookAuth:update"
      : "accountingBookAuth:add";
    const data = {
      ...formInfo.value.data,
      accountingbookList: selectedBooks.value,
      userList: allUsers.value,
    };
    api(data, btnCode).then((res) => {
      if (res.code === 200) {
        proxy.$message.success("保存成功");
        showDialog.value = false;
        emit("returnModify", !!props.id);
      }
    });
  });
}

// ========== 编辑弹窗 ==========
function returnModify() {
  modifyInfo.value.visible = false;
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
  height: calc(100% - 70px);
  overflow: auto;
  :deep(.el-tree-node__expand-icon.is-leaf) {
    display: none;
  }
}
</style>
