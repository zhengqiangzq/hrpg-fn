<template>
  <page-dialog
    :title="'定位'"
    :visible="visible"
    width="640px"
    :bt-list="btList"
    @reset="handleClose"
  >
    <PageForm
      v-model:ref-obj="formRefObj"
      :data="formData"
      :field-list="fieldList"
      :rules="rules"
      label-width="100px"
    >
      <template #form-accountingPeriod>
        <AccountingPeriod
          v-model:year="formData.year"
          v-model:month="formData.month"
        />
      </template>
    </PageForm>
  </page-dialog>
</template>

<script setup name="VoucherLocateDialog">
import AccountingPeriod from "@/nonGlobalComponents/AccountingPeriod";
const emits = defineEmits(["update:visible", "confirm"]);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  bookName: {
    type: String,
    default: "",
  },
  bookId: {
    type: [String, Number],
    default: "",
  },
});

const formRefObj = ref(null);
const confirming = ref(false);

const formData = ref({
  bookName: "",
  year: null,
  month: null,
  voucherTypeCode: "",
  voucherNo: null,
});

const now = new Date();

const fieldList = [
  {
    label: "核算账簿",
    value: "bookName",
    type: "input",
    disabled: true,
    required: true,
    width: "100%",
  },
  {
    label: "会计期间",
    value: "accountingPeriod",
    type: "slot",
    width: "100%",
    required: true,
  },
  {
    label: "凭证类别",
    value: "voucherTypeCode",
    type: "select-model",
    code: "yes_or_no",
    checkDefault: true,
    required: true,
    width: "100%",
  },
  {
    label: "凭证号",
    value: "voucherNo",
    type: "number",
    precision: 0,
    min: 1,
    required: true,
    width: "100%",
  },
];

const rules = {
  bookName: [{ required: true, message: "请选择核算账簿", trigger: "change" }],
  year: [{ required: true, message: "请选择年", trigger: "change" }],
  month: [{ required: true, message: "请选择月", trigger: "change" }],
  voucherTypeCode: [{ required: true, message: "请选择凭证类别", trigger: "change" }],
  voucherNo: [
    {
      validator: (rule, value, callback) => {
        if (value === null || value === undefined || value === "") {
          callback(new Error("请输入凭证号"));
        } else if (value < 1) {
          callback(new Error("凭证号不能小于1"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

const btList = [
  { label: "确定", type: "primary", event: handleConfirm, disabled: false },
  { label: "取消", type: "default", event: handleClose },
];

// 弹窗打开时重置表单
watch(
  () => props.visible,
  (val) => {
    if (val) {
      formData.value = {
        bookName: props.bookName || "",
        bookId: props.bookId || "",
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        voucherTypeCode: "",
        voucherNo: 1,
      };
      nextTick(() => {
        formRefObj.value?.clearValidate?.();
      });
    }
  }
);

function handleConfirm() {
  formRefObj.value?.validate((valid) => {
    if (!valid) return;
    confirming.value = true;
    emits("confirm", {
      bookId: props.bookId,
      bookName: formData.value.bookName,
      year: formData.value.year,
      month: formData.value.month,
      voucherTypeCode: formData.value.voucherTypeCode,
      voucherNo: formData.value.voucherNo,
    });
    emits("update:visible", false);
    confirming.value = false;
  });
}

function handleClose() {
  emits("update:visible", false);
}
</script>
