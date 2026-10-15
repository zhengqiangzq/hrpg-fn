<template>
  <page-dialog
    :title="title"
    v-model:visible="dialogVisible"
    width="800px"
    :bt-list="dialogInfo.btList"
    @reset="cancel"
  >
    <PageForm
      ref="formRef"
      class="paddingBox order-model-formBox flex_wrap_start_start"
      :data="formData"
      :field-list="fieldList"
      :rules="rules"
      label-width="120px"
    />
  </page-dialog>
</template>

<script setup name="accountingBookAddEdit">
import { accountingbookCreate, accountingbookUpdate } from "@/api/base.js";
import { Session } from '@/utils/storage.js'
const { proxy } = getCurrentInstance();

const props = defineProps({
  title: { type: String, default: "新增核算账簿" },
  visible: { type: Boolean, default: false },
  row: { type: Object, default: null },
});

const emit = defineEmits(["callback", "update:visible"]);

const dialogVisible = ref(false);
const formRef = ref(null);

const formData = ref({});

// PageForm fieldList
const fieldList = ref([
  {
    label: "账簿编码",
    value: "code",
    type: "input",
    required: true,
    width: "50%",
  },
  {
    label: "账簿名称",
    value: "name",
    type: "input",
    required: true,
    width: "50%",
  },
  {
    label: "核算组织",
    value: "orgName",
    type: "input",
    required: true,
    disabled: true,
    width: "50%",
  },
  {
    label: "账簿类型",
    value: "accbookType",
    type: "select-model",
    code: "archives_account_book_type",
    required: true,
    checkDefault: true,
    width: "50%",
  },
  {
    label: "科目体系",
    value: "accsystemName",
    asValue: "accsystemId",
    type: "select-data-custom",
    selectDataType: "accSystem",
    required: true,
    width: "50%",
  },
  {
    label: "科目表",
    value: "accchartName",
    asValue: "accchartId",
    type: "select-data-custom",
    selectDataType: "accChart",
    required: true,
    width: "50%",
  },
  {
    label: "启用期间",
    value: "startPeriod",
    asValue: "accountingPeriodId",
    type: "select-data-custom",
    selectDataType: "accountingPeriodMonth",
    valueField: "id",
    labelField: "periodyearAndMonth",
    required: true,
    width: "50%",
  },
  {
    label: "平行记账",
    value: "isParallelAccounting",
    type: "checkbox-model",
    width: "50%",
  },
]);

const rules = ref({
  code: [{ required: true, message: "请输入账簿编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入账簿名称", trigger: "blur" }],
  orgName: [{ required: true, message: "请输入核算组织", trigger: "blur" }],
  accbookType: [
    { required: true, message: "请选择账簿类型", trigger: "change" },
  ],
  accsystemName: [
    { required: true, message: "请选择科目体系", trigger: "change" },
  ],
  accchartName: [
    { required: true, message: "请选择科目表", trigger: "change" },
  ],
  startPeriod: [{ required: true, message: "请选择启用期间", trigger: "change" }],
});
const dialogInfo = ref({
  btList: [
    { label: "确认", type: "primary", event: handleSave },
    { label: "取消", event: cancel },
  ],
});
// ---- watch ----
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val;
    if (val) initForm();
  },
  { immediate: true },
);
// ---- 表单初始化 ----
function initForm() {
  if (props.row?.id) {
    formData.value = proxy.$fn.deepClone(props.row);
  } else {
    console.log(proxy.$store.state.userInfo);
    formData.value = {
      ...proxy.$fn.deepClone(props.row),
      orgId: Session.get('setting').orgId,
      orgName: Session.get('setting').hospitalName,
    };
  }
  formRef.value?.clearValidates();
}

// ---- 按钮事件 ----
function cancel() {
  dialogVisible.value = false;
  emit("callback", false);
}
async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  const isEdit = !!formData.value.id;
  const api = isEdit ? accountingbookUpdate : accountingbookCreate;
  const btnCode = isEdit
    ? "accountingBookItems:update"
    : "accountingBookItems:add";
  api(formData.value, btnCode).then((resp) => {
    if (resp && resp.success) {
      proxy.$message.success("保存成功");
      dialogVisible.value = false;
      emit("callback", true);
    }
  });
}
</script>
