<template>
  <el-dialog
    :model-value="visible"
    title="查询方案"
    :width="width"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
    class="plan-search-dialog"
    destroy-on-close
  >
    <div class="plan-search-content">
      <!-- 左侧：方案树 -->
      <div class="plan-tree-panel">
        <div class="panel-title">方案</div>
        <el-tree
          ref="treeRef"
          :data="treeData"
          node-key="id"
          highlight-current
          :props="{ children: 'children', label: 'name' }"
          @node-click="handleNodeClick"
        />
      </div>

      <!-- 右侧：查询条件表单 -->
      <div class="query-form-panel">
        <div class="panel-title">查询条件</div>
        <div class="form-grid">
          <div
            v-for="field in fieldList"
            :key="field.value"
            class="form-item"
            :class="{ 'span-full': field.span === 2 }"
          >
            <label class="form-label">{{ field.label }}</label>
            <div class="form-control">
              <!-- input -->
              <el-input
                v-if="field.componentType === 'input'"
                v-model.lazy="formValues[field.value]"
                :placeholder="field.placeholder || ''"
                clearable
              />

              <!-- SelectModel -->
              <SelectModel
                v-else-if="field.componentType === 'selectModel'"
                v-model="formValues[field.value]"
                :typeCode="field.dictCode"
                :multiple="field.multiple"
                :checkDefault="false"
              />

              <!-- select（统一用 SlipSelect，字典类型自动适配） -->
              <SlipSelect
                v-else-if="field.componentType === 'select'"
                v-model="formValues[field.value]"
                v-bind="field.slipProps"
                :multiple="field.multiple"
              />

              <!-- selectDataCustom（带搜索图标的 SelectData 弹窗） -->
              <el-input
                v-else-if="field.componentType === 'selectDataCustom'"
                :model-value="formValues[field.value] || ''"
                disabled
                class="not-mongolia"
              >
                <template #append>
                  <el-button @click="openSelectDataCustom(field)">
                    <el-icon><Search /></el-icon>
                  </el-button>
                </template>
              </el-input>

              <!-- RangeDate -->
              <RangeDate
                v-else-if="field.componentType === 'rangeDate'"
                :modelValue="formValues[field.value]"
                @change="(val) => (formValues[field.value] = val)"
              />

              <!-- RangeInput -->
              <RangeInput
                v-else-if="field.componentType === 'rangeInput'"
                :modelValue="formValues[field.value]"
                @change="(val) => (formValues[field.value] = val)"
              />

              <!-- checkbox-group -->
              <el-checkbox-group
                v-else-if="field.componentType === 'checkboxGroup'"
                v-model="formValues[field.value]"
              >
                <el-checkbox
                  v-for="opt in field.options"
                  :key="opt.value"
                  :label="opt.value"
                  >{{ opt.label }}</el-checkbox
                >
              </el-checkbox-group>

              <!-- 兜底 slot（表格等自定义内容均走此处） -->
              <slot
                v-else-if="field.componentType === 'slot'"
                :name="field.value"
                :field="field"
                :modelValue="formValues[field.value]"
                @update:modelValue="formValues[field.value] = $event"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="footer-left">
          <el-button type="primary" @click="openSaveDialog">方案保存</el-button>
          <el-button @click="handleDeletePlan">方案删除</el-button>
        </div>
        <div class="footer-right">
          <el-button type="primary" @click="handleSearch">确认</el-button>
          <el-button @click="handleClose">取消</el-button>
        </div>
      </div>
    </template>
  </el-dialog>

  <!-- 保存方案子弹窗 -->
  <FormDialog ref="formDialogRef" />

  <!-- SelectData 弹窗（selectDataCustom 共用） -->
  <SelectData ref="selectorRef" />
</template>

<script setup name="PlanSearch">
import {
  queryPlanList,
  queryPlanTree,
  queryPlanDetail,
  queryPlanSave,
  queryPlanDelete,
} from "@/api/base";
import RangeDate from "@/nonGlobalComponents/RangeDate/index.vue";
import RangeInput from "@/nonGlobalComponents/RangeInput/index.vue";
import { useSelectData } from "@/hooks/useSelectData";
import { useFormDialog } from "@/hooks/useFormDialog";
import { defaultFieldOverrides } from "./defaultFieldOverrides";

// 内部派生：当前路由path和用户ID
const { proxy } = getCurrentInstance();
const { selectorInfo, selectorRef } = useSelectData();
const { formDialogInfo, formDialogRef } = useFormDialog();
// 非响应数据
const menuId =
  JSON.parse(localStorage.getItem("routeStore") || "{}")?.curRoute?.id || "";
const userId =
  JSON.parse(localStorage.getItem("userInfoStore") || "{}")
    ?.userAndPermissionInfo?.userInfoDTO?.id || "";
// ==================== Props & Emits ====================
const props = defineProps({
  visible: { type: Boolean, default: false },
  /** 静态配置（直接传入 JSON） */
  config: { type: Object, default: null },
  /** 初始回显值（优先级高于 field.defaultValue） */
  defaultValue: { type: Object, default: () => ({}) },
  width: { type: String, default: "1200px" },
  /**
   * 字段覆盖配置，以 fieldName 为 key，value 为需覆盖的属性
   * 优先级：此 prop > defaultFieldOverrides 公共 JSON > 后端接口返回
   * 示例：{ voucherStatus: { placeholder: '请选择凭证状态' } }
   */
  fieldOverrides: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["update:visible", "search"]);

// ==================== 响应式数据 ====================
const treeData = ref([]);
const fieldList = ref([]);
const formValues = ref({});
const defaultValues = ref({});
const selectedPlanId = ref("");
watch(
  () => props.visible,
  (val) => {
    val ? doInit() : resetState();
  },
);

onMounted(() => {
  if (props.visible) doInit();
});
// ==================== 初始化表单值 ====================
function initFormValues() {
  const values = {};
  console.log("defaultValue", props.defaultValue);
  fieldList.value.forEach((field) => {
    field.value = field.fieldName;
    let _value = props.defaultValue[field.value] || field.defaultValue || "";
    if (field.value === "accassitem" && _value) {
      _value = JSON.parse(_value);
    }
    values[field.value] = _value;
    // selectDataCustom 的 asValue 字段也初始化
    if (field.type === "selectDataCustom" && field.asValue) {
      const rawId =
        props.defaultValue &&
        Object.prototype.hasOwnProperty.call(props.defaultValue, field.asValue)
          ? props.defaultValue[field.asValue]
          : "";
      values[field.asValue] =
        rawId !== undefined && rawId !== null ? proxy.$fn.deepClone(rawId) : "";
    }
  });
  console.log("fieldList", fieldList.value);
  console.log("formValues", values);
  console.log(proxy.$fn.deepClone(values));
  formValues.value = values;
  defaultValues.value = proxy.$fn.deepClone(values);
}

// ==================== 加载方案树 ====================
async function loadPlans() {
  try {
    const res = await queryPlanTree({ menuId: menuId, userId: userId });
    if (res.data) {
      treeData.value = res.data;
      return;
    }
  } catch {
    /* fallback */
  }
}

// ==================== selectDataCustom 弹窗 ====================
function openSelectDataCustom(field) {
  selectorInfo.type = field.selectDataType;
  selectorInfo.query = field.query || {};
  const currentId = field.asValue
    ? formValues.value[field.asValue]
    : formValues.value[field.value];
  if (currentId)
    selectorInfo.defaultSelected = String(currentId).split(",").filter(Boolean);
  selectorInfo.callback = (row) => {
    const rows = Array.isArray(row)
      ? row
      : row && typeof row === "object" && Object.keys(row).length
        ? [row]
        : [];
    const lf = field.labelField || "name";
    const vf = field.valueField || "id";
    if (rows.length) {
      formValues.value[field.value] = rows.map((r) => r[lf]).join(",");
      if (field.asValue)
        formValues.value[field.asValue] = rows.map((r) => r[vf]).join(",");
    } else {
      formValues.value[field.value] = "";
      if (field.asValue) formValues.value[field.asValue] = "";
    }
    emit("handleEvent", field, formValues.value);
  };
  selectorInfo.visible = true;
}

// ==================== 树节点点击 → 仅回显 ====================
async function handleNodeClick(data) {
  selectedPlanId.value = data.id;
  try {
    const res = await queryPlanDetail({ userPlanId: data.id });
    if (res.data && res.data.length) {
      applyPlanValues(res.data);
      return;
    }
  } catch {
    /* fallback */
  }
}
function applyPlanValues(saved) {
  saved.forEach((item) => {
    const field = fieldList.value.find((f) => f.value === item.fieldName);
    if (
      field &&
      Object.prototype.hasOwnProperty.call(formValues.value, field.value)
    ) {
      if (field.value === "accassitem" && item.value) {
        formValues.value[field.value] = JSON.parse(item.value);
      } else {
        formValues.value[field.value] = item.value;
      }
      if (field.asValue) {
        formValues.value[field.asValue] = item.asValue;
      }
    }
  });
}

// ==================== 底部按钮 ====================
function handleSearch() {
  const queryList = fieldList.value.map((field) => ({
    ...field,
    value: Array.isArray(formValues.value[field.value])
      ? JSON.stringify(formValues.value[field.value])
      : formValues.value[field.value],
    asValue: formValues.value[field.asValue] || "",
  }));
  emit("search", proxy.$fn.deepClone(queryList));
}
function handleClose() {
  emit("update:visible", false);
}

function setParams() {
  const queryList = [];
  fieldList.value.forEach((field) => {
    queryList.push({
      planId: field.id,
      value: Array.isArray(formValues.value[field.value])
        ? JSON.stringify(formValues.value[field.value])
        : formValues.value[field.value],
      asValue: formValues.value[field.asValue] || "",
    });
  });
  return queryList;
}
function openSaveDialog() {
  const query = setParams();
  formDialogInfo.type = "savePlanDialog";
  formDialogInfo.formData = {};
  formDialogInfo.callback = async (formData) => {
    if (!formData.name?.trim()) {
      proxy.$message.warning("请输入方案名称");
      return;
    }

    const res = await queryPlanSave({
      name: formData.name.trim(),
      menuId: menuId,
      userId: userId,
      details: query,
    });
    if (res?.success) {
      proxy.$message.success("保存成功");
      await loadPlans();
    }
  };
  formDialogInfo.visible = true;
}
async function handleDeletePlan() {
  if (!selectedPlanId.value) {
    proxy.$message.warning("请先选择一个方案");
    return;
  }
  try {
    await proxy.$confirm("确认删除该方案吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    const res = await queryPlanDelete([selectedPlanId.value]);
    if (res?.success) {
      proxy.$message.success("删除成功");
      selectedPlanId.value = "";
      formValues.value = proxy.$fn.deepClone(defaultValues.value);
      await loadPlans();
    }
  } catch {
    /* cancel */
  }
}

// ==================== 字段覆盖 ====================
/**
 * 将前端定义的覆盖配置应用到 fieldList
 * 优先级：组件 prop fieldOverrides > 公共 JSON defaultFieldOverrides > 后端接口返回
 */
function applyFieldOverrides(list) {
  if (!list || !list.length) return;
  // 合并覆盖配置：公共 JSON 为基础，prop 传参优先级更高
  const mergedOverrides = { ...defaultFieldOverrides, ...props.fieldOverrides };
  const overrideKeys = Object.keys(mergedOverrides);
  if (!overrideKeys.length) return;
  list.forEach((field) => {
    const key = field.fieldName;
    if (key && Object.prototype.hasOwnProperty.call(mergedOverrides, key)) {
      Object.assign(field, mergedOverrides[key]);
    }
    if (field.queryType === "IN") {
      field.multiple = true;
    }
  });
  return list;
}

// ==================== 初始化入口 ====================
async function doInit() {
  if (props.config) {
    fieldList.value = applyFieldOverrides(props.config.fields);
    initFormValues();
    loadPlans();
  } else {
    // 从后端动态获取配置
    try {
      const res = await queryPlanList({
        menuId: menuId,
      });
      if (res.data) {
        fieldList.value = applyFieldOverrides(res.data);
        console.log("fieldList", fieldList.value);
        initFormValues();
        loadPlans();
      }
    } catch (e) {
      console.error("[PlanSearch] 动态获取配置失败:", e);
    }
  }
}
function resetState() {
  treeData.value = [];
  fieldList.value = [];
  formValues.value = {};
  defaultValues.value = {};
  selectedPlanId.value = "";
}
</script>

<style lang="scss" scoped>
.plan-search-content {
  display: flex;
  min-height: 420px;
  max-height: 65vh;
}
.plan-tree-panel {
  width: 280px;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  :deep(.el-tree) {
    flex: 1;
    overflow-y: auto;
  }
}
.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 12px;
  padding-left: 10px;
}
.query-form-panel {
  flex: 1;
  overflow-y: auto;
}

/* 2 列网格，默认半行，span-full 占满整行 */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
}
.form-item {
  display: flex;
  align-items: center;
  min-width: 0;
  &.span-full {
    grid-column: span 2;
  }
}
.form-label {
  width: 100px;
  text-align: right;
  margin-right: 12px;
  color: #606266;
  font-size: 14px;
  flex-shrink: 0;
}
.form-control {
  flex: 1;
  min-width: 0;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .footer-left,
  .footer-right {
    display: flex;
    gap: 12px;
  }
}
</style>
