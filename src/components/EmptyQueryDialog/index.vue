<template>
  <el-dialog
    :title="title"
    :model-value="visible"
    :width="width"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
    @close="handleClose"
  >
    <!-- 筛选栏 -->
    <div class="filterBox">
      <!-- 核算账簿 -->
      <el-input
        :model-value="localBookName"
        class="filter-control show-placeholder not-mongolia"
        placeholder="核算账簿"
        readonly
      >
        <template #append>
          <el-icon @click="openBookSelector"><Search /></el-icon>
        </template>
      </el-input>
      <!-- 年份 -->
      <el-select
        v-model="localYear"
        class="filter-control show-placeholder"
        placeholder="请选择年"
      >
        <el-option
          v-for="y in yearOptions"
          :key="y"
          :label="String(y)"
          :value="y"
        />
      </el-select>
      <!-- 月份 -->
      <el-select
        v-model="localMonth"
        class="filter-control show-placeholder"
        placeholder="请选择月"
      >
        <el-option
          v-for="m in monthOptions"
          :key="m"
          :label="String(m).padStart(2, '0')"
          :value="m"
        />
      </el-select>
      <!-- 凭证类别（使用字典组件，code 待替换） -->
      <select-model
        v-model:modelValue="localVoucherTypeId"
        class="filter-control show-placeholder"
        type-code="voucher_type"
        placeholder="请选择凭证类型"
      />
      <el-button type="primary" @click="handleQuery">
        查询
      </el-button>
    </div>
    <!-- 结果展示区域 -->
    <div class="result-box">
      <pre v-if="resultText">{{ resultText }}</pre>
      <div v-else class="empty-tip">暂无数据</div>
    </div>
    <!-- 底部按钮 -->
    <template #footer>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </template>
  </el-dialog>
  <!-- 核算账簿选择弹窗 -->
  <SelectData ref="selectorRef" />
</template>

<script setup name="EmptyQueryDialog">
import { voucherEmptyNoQuery } from "@/api/base";
import { useSelectData } from "@/hooks/useSelectData";

const { proxy } = getCurrentInstance();
const { selectorInfo, selectorRef } = useSelectData();

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: "空号查询" },
  width: { type: String, default: "800px" },
  // 核算账簿（支持 v-model，与父页面共享选中状态）
  bookId: { type: String, default: "" },
  bookName: { type: String, default: "" },
});

const emit = defineEmits(["update:visible", "callback"]);

// ========== 本地状态（初始全空） ==========
const localYear = ref("");
const localMonth = ref("");
const localVoucherTypeId = ref("");
const resultText = ref("");

// 下拉选项（固定值）
const yearOptions = ref([2024, 2025, 2026, 2027]);
const monthOptions = ref(Array.from({ length: 12 }, (_, i) => i + 1));

// 本地核算账簿（弹窗内独立管理）
const localBookId = ref(props.bookId);
const localBookName = ref(props.bookName);

watch(
  () => props.bookId,
  (val) => {
    localBookId.value = val;
    localBookName.value = props.bookName;
  },
);

// ========== 核算账簿选择器 ==========
function openBookSelector() {
  selectorInfo.type = "accountingBook";
  selectorInfo.showCheckbox = false;
  selectorInfo.query = {};
  selectorInfo.callback = (row) => {
    if (row && Object.keys(row).length) {
      localBookId.value = row.id;
      localBookName.value = row.name;
    }
  };
  selectorInfo.visible = true;
}

// ========== 查询 ==========
function handleQuery() {
  if (!localBookId.value) {
    proxy.$message.warning("请先选择核算账簿");
    return;
  }
  const params = {
    bookId: localBookId.value,
    year: localYear.value,
    month: localMonth.value,
    voucherTypeId: localVoucherTypeId.value,
  };
  voucherEmptyNoQuery(params, "voucherPreparation:emptyNoQuery")
    .then((res) => {
      if (res && res.success) {
        resultText.value = res.data || res.message || "";
      }
    })
}

// ========== 确认 ==========
function handleConfirm() {
  emit("callback", {
    bookId: localBookId.value,
    bookName: localBookName.value,
    year: localYear.value,
    month: localMonth.value,
    voucherTypeId: localVoucherTypeId.value,
    result: resultText.value,
  });
  emit("update:visible", false);
}

// ========== 取消 ==========
function handleCancel() {
  emit("update:visible", false);
}

function handleClose() {
  // 关闭时清空结果，但保留核算账簿选择（与父页面共享）
  resultText.value = "";
}
</script>

<style lang="scss" scoped>
.filterBox {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.filter-control {
  min-width: 165px;
  margin-right: 8px;
}

.result-box {
  min-height: 220px;
  max-height: 360px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  background-color: #fafafa;
  overflow-y: auto;

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
    font-family: Consolas, "Courier New", monospace;
    font-size: 13px;
    color: #303133;
    line-height: 1.6;
  }

  .empty-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 180px;
    color: #909399;
    font-size: 14px;
  }
}
</style>
