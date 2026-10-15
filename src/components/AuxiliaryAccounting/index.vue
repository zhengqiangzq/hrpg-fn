<template>
  <div class="auxiliary-accounting">
    <DialogTable
      :data="localData"
      :fieldList="computedFieldList"
      :handle="handleConfig"
      :checkBox="false"
      :pager="false"
      :tabIndex="false"
      :maxHeight="maxHeight"
      style="width: 100%"
    >
      <!-- 辅助核算项：下拉选择（已选的项在其他行不可见） -->
      <template #col-accassitemId="{ row }">
        <el-select
          v-model="row.accassitemId"
          filterable
          clearable
          placeholder="请选择辅助核算项"
          style="width: 100%"
          @change="(val) => onItemChange(row, val)"
        >
          <el-option
            v-for="opt in getAvailableOptions(row)"
            :key="opt.value"
            :label="opt.key"
            :value="opt.value"
          />
        </el-select>
      </template>

      <!-- 辅助核算值：带搜索按钮的只读输入框（select-data-custom 风格） -->
      <template #col-itemValue="{ row }">
        <el-input
          :model-value="row.itemValue || ''"
          disabled
          class="not-mongolia"
        >
          <template #append>
            <el-button @click="openValueDialog(row)">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </template>
    </DialogTable>

    <!-- 辅助核算值选择弹窗 -->
    <SelectData ref="selectorRef" />
  </div>
</template>

<script setup name="AuxiliaryAccounting">
// ==================== ① 依赖导入 ====================
import { adjunctAccountItemList, getAdjunctValueConfig } from "@/api/base";
import { useSelectData } from "@/hooks/useSelectData";
import { Search } from "@element-plus/icons-vue";

// ==================== ② 组合式函数 ====================
const { proxy } = getCurrentInstance();
const { selectorInfo, selectorRef } = useSelectData();

// ==================== ③ Props & Emits ====================
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  fieldList: {
    type: Array,
    default: () => [
      { label: "辅助核算项", value: "accassitemId", type: "slot" },
      { label: "辅助核算值", value: "itemValue", type: "slot" },
    ],
  },
  maxHeight: { type: [Number, String], default: '200' },
});

const emit = defineEmits(["update:modelValue"]);

// ==================== ④ 响应式状态 ====================
const localData = ref([]);
const allItemOptions = ref([]);

// ==================== ⑤ 配置 ====================
const handleConfig = ref({
  fixed: "right",
  label: "操作",
  width: "150",
  btList: [
    { label: "新增行", event: addRow, show: true },
    { label: "删除行", event: deleteRow, show: true },
  ],
});

// ==================== ⑥ 计算属性 & Watch ====================
const computedFieldList = computed(() => props.fieldList);

// 父→子：modelValue 变化时同步到内部
watch(
  () => props.modelValue,
  (val) => { localData.value = proxy.$fn.deepClone(val || [{}]); },
  { immediate: true, deep: true },
);

// 子→父：内部编辑自动同步回父组件（加值比较，防止循环触发）
watch(
  localData,
  (val) => {
    const newVal = JSON.stringify(val ?? []);
    const oldVal = JSON.stringify(props.modelValue ?? []);
    if (newVal !== oldVal) {
      emit("update:modelValue", proxy.$fn.deepClone(val));
    }
  },
  { deep: true },
);

// ==================== ⑦ 生命周期 ====================
onMounted(() => { fetchItemOptions(); });

// ==================== ⑨ 辅助核算项 — 选项加载 & 去重 ====================
async function fetchItemOptions() {
  try {
    const res = await adjunctAccountItemList({ page: false });
    if (res?.success && res.data) {
      const list = Array.isArray(res.data) ? res.data : res.data.result || [];
      allItemOptions.value = list.map((item) => ({
        key: item.name,
        value: String(item.id),
      }));
      localData.value.forEach((row) => {
        if (row.accassitemId && !row.accassitemId) {
          const opt = allItemOptions.value.find((o) => o.value === String(row.accassitemId));
          if (opt) row.accassitemId = opt.key;
        }
      });
    }
  } catch (e) {
    console.error("[AuxiliaryAccounting] 获取辅助核算项列表失败:", e);
  }
}

function getAvailableOptions(currentRow) {
  const selectedIds = new Set(
    localData.value
      .filter((r) => r !== currentRow && r.accassitemId)
      .map((r) => String(r.accassitemId)),
  );
  return allItemOptions.value.filter((opt) => !selectedIds.has(opt.value));
}

// ==================== ⑩ 辅助核算项 — 行操作 ====================
function addRow() {
  localData.value.push({
    accassitemId: "", itemValue: "", itemValueId: "",
    isEmpty: false, isNontail: false,
  });
}

function deleteRow(row) {
  if(localData.value.length === 1) {
    proxy.$message.warning("至少保留一条辅助核算项");
    return;
  }
  const idx = localData.value.indexOf(row);
  if (idx !== -1) localData.value.splice(idx, 1);
}

function onItemChange(row, val) {
  row.itemValue = "";
  row.itemValueId = "";
}

// ==================== ⑪ 辅助核算值 — 弹窗选择 ====================
async function openValueDialog(row) {
  if (!row.accassitemId) {
    proxy.$message.warning("请先选择辅助核算项");
    return;
  }
  try {
    const res = await getAdjunctValueConfig(row.accassitemId, {});
    if (!res?.success || !res.data) {
      proxy.$message.warning("获取弹窗配置失败");
      return;
    }
    applyValueDialogConfig(res.data, row);
  } catch (e) {
    console.error("[AuxiliaryAccounting] 获取辅助核算值配置失败:", e);
    proxy.$message.error("获取弹窗配置失败");
  }
}

/**
 * 根据后端返回的 displayType 动态渲染弹窗：
 * - tree       → 纯树
 * - table      → 纯表格
 * - treeTable  → 左树右表（默认）
 */
function applyValueDialogConfig(config, row) {
  Object.keys(selectorInfo).forEach((key) => {
    if (key !== "type" && key !== "visible") delete selectorInfo[key];
  });

  selectorInfo.type = "adjunctValue";
  selectorInfo.title = config.title || "选择辅助核算值";
  selectorInfo.width = config.width || "800px";
  selectorInfo.query = config.query || {};

  const dt = config.displayType || "treeTable";

  if (dt === "tree") {
    selectorInfo.component = "tree";
    selectorInfo.api = config.treeApi || config.api;
    if (config.treeData) selectorInfo.treeData = config.treeData;
    if (config.defaultProps) selectorInfo.defaultProps = config.defaultProps;
    if (config.filterPlaceholder) selectorInfo.filterPlaceholder = config.filterPlaceholder;
    selectorInfo.saveEmpty = config.saveEmpty ?? true;
  } else if (dt === "table") {
    selectorInfo.component = undefined;
    selectorInfo.fieldList = config.fieldList || [];
    selectorInfo.api = config.tableApi || config.api;
    selectorInfo.pager = config.pager ?? true;
    selectorInfo.checkBox = config.checkBox ?? false;
    if (config.filters) selectorInfo.filters = config.filters;
  } else {
    selectorInfo.component = "treeTable";
    selectorInfo.api = config.treeApi || config.api;
    if (config.treeData) selectorInfo.treeData = config.treeData;
    selectorInfo.apiList = config.tableApi || config.api;
    selectorInfo.fieldList = config.fieldList || [];
    selectorInfo.pager = config.pager ?? false;
    selectorInfo.checkBox = config.checkBox ?? false;
    if (config.clickParams) selectorInfo.clickParams = config.clickParams;
    if (config.code) selectorInfo.code = config.code;
    if (config.defaultProps) selectorInfo.defaultProps = config.defaultProps;
    if (config.searchList) selectorInfo.searchList = config.searchList;
    if (config.selectMode) selectorInfo.selectMode = config.selectMode;
  }

  selectorInfo.callback = (selected) => {
    if (!selected) return;
    const items = Array.isArray(selected) ? selected : [selected];
    if (items.length) {
      row.itemValue = items.map((r) => r.name || r.label || r.key || "").join(",");
      row.itemValueId = items.map((r) => r.id || r.value || "").join(",");
    } else if (selected && typeof selected === "object") {
      row.itemValue = selected.name || selected.label || "";
      row.itemValueId = selected.id || "";
    }
  };

  selectorInfo.visible = true;
}

// ==================== ⑫ 对外暴露 ====================
defineExpose({
  /** 获取当前表格数据（深拷贝，避免外部修改内部状态） */
  getData: () => proxy.$fn.deepClone(localData.value),
});
</script>

<style lang="scss" scoped>
.auxiliary-accounting { width: 100%; }
</style>
