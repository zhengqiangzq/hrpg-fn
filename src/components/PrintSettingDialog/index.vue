<template>
  <page-dialog
    :title="title"
    :visible="visible"
    :width="width"
    :bt-list="btList"
    @reset="handleCancel"
  >
    <!-- 上方区域：基本设置 -->
    <page-form
      ref="pageFormRef"
      v-model:ref-obj="formRef"
      className="print-setting-form"
      :data="formData"
      :field-list="upperFieldList"
      :rules="formRules"
      :label-width="'120px'"
    />
    <!-- 下方区域：辅助核算（受是否打印辅助核算控制） -->
    <template v-if="formData.printAuxiliary === '1'">
      <div class="aux-title">辅助核算：</div>
      <page-form
        ref="auxFormRef"
        v-model:ref-obj="auxFormRefObj"
        className="print-setting-form"
        :data="formData"
        :field-list="auxFieldList"
        :label-width="'120px'"
      />
    </template>
  </page-dialog>
</template>

<script setup name="PrintSettingDialog">
import { voucherPrintSettingSave } from "@/api/base";

const { proxy } = getCurrentInstance();

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: "打印设置" },
  width: { type: String, default: "800px" },
  // 核算账簿（单向传参，弹窗内独立管理）
  bookId: { type: String, default: "" },
  bookName: { type: String, default: "" },
});

const emit = defineEmits(["update:visible", "callback"]);

// ========== 表单数据 ==========
const formData = ref({
  accbookName: "",
  accbookId: "",
});

const formRef = ref(null);
const auxFormRefObj = ref(null);

// 监听外部核算账簿变化
watch(
  () => props.bookId,
  (val) => {
    formData.value.accbookId = val;
    formData.value.accbookName = props.bookName;
  },
);

// ========== 上方字段（基本设置） ==========
const upperFieldList = computed(() => [
  {
    label: "核算账簿",
    value: "accbookName",
    asValue: "accbookId",
    type: "select-data-custom",
    selectDataType: "accountingBook",
    required: true,
    width: "50%",
  },
  {
    label: "会计科目",
    value: "accasoaPrintType",
    type: "select-model",
    code: "accasoa_print_type",
    width: "50%",
  },
  {
    label: "是否打印辅助核算",
    value: "printAuxiliary",
    type: "select-model",
    code: "yes_or_no",
    width: "50%",
  },
  {
    label: "凭证打印模版",
    value: "voucherPrintTemplate",
    type: "select-model",
    code: "voucher_print_template",
    width: "50%",
  },
]);

// ========== 下方字段（辅助核算） ==========
const auxFieldList = computed(() => [
  { label: "部门", value: "deptPrintType", type: "select-model", code: "auxiliary_print_type", width: "50%" },
  { label: "人事档案", value: "hrArchivePrintType", type: "select-model", code: "auxiliary_print_type", width: "50%" },
  { label: "项目", value: "itemPrintType", type: "select-model", code: "auxiliary_print_type", width: "50%" },
  { label: "客户档案", value: "customerPrintType", type: "select-model", code: "auxiliary_print_type", width: "50%" },
  { label: "供应商档案", value: "supplierPrintType", type: "select-model", code: "auxiliary_print_type", width: "50%" },
  { label: "人员类别", value: "empTypePrintType", type: "select-model", code: "auxiliary_print_type", width: "50%" },
  { label: "仓库档案", value: "warehousePrintType", type: "select-model", code: "auxiliary_print_type", width: "50%" },
  { label: "部门经济分类", value: "deptEconPrintType", type: "select-model", code: "auxiliary_print_type", width: "50%" },
  { label: "政府经济分类", value: "govEconPrintType", type: "select-model", code: "auxiliary_print_type", width: "50%" },
  { label: "功能分类", value: "funcPrintType", type: "select-model", code: "auxiliary_print_type", width: "50%" },
  { label: "员工状态", value: "empStatusPrintType", type: "select-model", code: "auxiliary_print_type", width: "50%" },
  { label: "资金性质", value: "fundPrintType", type: "select-model", code: "auxiliary_print_type", width: "50%" },
]);

// ========== 校验规则 ==========
const formRules = {
  accbookName: [
    { required: true, message: "请选择核算账簿", trigger: "change" },
  ],
};

// ========== 底部按钮 ==========
const btList = computed(() => [
  { type: "primary", label: "确认", event: handleConfirm, show: true },
  { label: "取消", event: handleCancel, show: true },
]);

// ========== 确认 ==========
function handleConfirm() {
  // 校验上方表单（核算账簿必填）
  if (formRef.value) {
    const valid = formRef.value.validate();
    if (!valid) return;
  }
  // 辅助核算开启时，校验下方表单
  if (formData.value.printAuxiliary === "1" && auxFormRefObj.value) {
    const auxValid = auxFormRefObj.value.validate();
    if (!auxValid) return;
  }
  voucherPrintSettingSave(formData.value, "voucherPreparation:printSetting").then(
    (res) => {
      if (res && res.success) {
        proxy.$message.success("保存成功");
        emit("callback", formData.value);
        emit("update:visible", false);
      }
    },
  );
}

// ========== 取消 ==========
function handleCancel() {
  emit("update:visible", false);
}
</script>

<style lang="scss" scoped>
.print-setting-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}

.aux-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 16px 0 8px 0;
  padding-left: 4px;
}
</style>
