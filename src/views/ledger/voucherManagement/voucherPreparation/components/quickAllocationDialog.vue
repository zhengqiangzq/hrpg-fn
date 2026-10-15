<template>
  <page-dialog
    title="快速分摊"
    :visible="visible"
    width="800px"
    :bt-list="btList"
    @reset="handleClose"
  >
    <!-- 分摊金额 & 规则选择 -->
    <new-page-filter
      v-model:query="formData"
      :filter-list="filterList"
      :filter-btn="[]"
    />
    <!-- 分摊明细表格 -->
    <dialog-table
      ref="tableRef"
      v-model:data="tableData"
      :field-list="fieldList"
      :check-box="false"
      :pager="false"
      :tab-index="true"
    >
    </dialog-table>
  </page-dialog>
</template>

<script setup name="QuickAllocationDialog">
import { getCurrentInstance } from "vue";
import { getAllocationById } from "@/api/base";
import { verifyNumberIntegerAndFloat } from "@/utils/index";

const { proxy } = getCurrentInstance();
const emits = defineEmits(["update:visible", "confirm"]);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

// ========== 表单数据 ==========
const formData = ref({
  allocationAmount: "",
  ruleId: "",
  ruleName: "",
});

// ========== 筛选字段配置 ==========
const filterList = ref([
  {
    label: "分摊金额",
    value: "allocationAmount",
    componentType: "input",
    inputRule: verifyNumberIntegerAndFloat,
  },
  {
    label: "分摊规则",
    value: "ruleName",
    componentType: "select-data-custom",
    selectDataType: "allocationRule",
    asValue: "ruleId",
    saveEmpty: true,
  },
]);

// ========== 表格数据 ==========
const tableData = ref([]);

// ========== 表格列配置 ==========
const fieldList = ref([
  { label: "部门", value: "departmentName" },
  { label: "比例", value: "ratio" },
]);

// ========== 底部按钮 ==========
const btList = ref([
  { label: "确定", type: "primary", event: handleConfirm, show: true },
  { label: "取消", type: "default", event: handleClose, show: true },
]);

// 监听规则选择变化，获取规则详情并生成分摊行
watch(
  () => formData.value.ruleId,
  async (newRuleId) => {
    if (!newRuleId) {
      tableData.value = [];
      return;
    }
    const { data } = await getAllocationById(newRuleId);
    if (data && data.departmentList && Array.isArray(data.departmentList)) {
      tableData.value = data.departmentList.map((dept, index) => ({
        departmentId: dept.id,
        departmentName: dept.name,
        ratio: dept.ratio || "",
      }));
    } else {
      tableData.value = [];
    }
  }
);


// ========== 确定 ==========
function handleConfirm() {
  if (!formData.value.allocationAmount) {
    proxy.$message.warning("请输入分摊金额");
    return;
  }
  if (!formData.value.ruleId) {
    proxy.$message.warning("请选择分摊规则");
    return;
  }

  emits("confirm", {
    allocationAmount: formData.value.allocationAmount,
    ruleId: formData.value.ruleId,
    ruleName: formData.value.ruleName,
    details: tableData.value,
  });
  emits("update:visible", false);
}

// ========== 取消 ==========
function handleClose() {
  formData.value = {};
  tableData.value = [];
  emits("update:visible", false);
}
</script>

<style lang="scss" scoped></style>
