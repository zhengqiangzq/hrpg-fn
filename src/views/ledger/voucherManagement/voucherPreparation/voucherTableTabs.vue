<template>
  <div class="voucher-tabs">
    <el-tabs v-model="activeTab">
      <!-- ===== 明细数据 Tab ===== -->
      <el-tab-pane label="明细数据" name="detail">
        <el-form ref="formRef" :model="formData" class="voucher-form">
          <!-- 双分录上下模式 -->
          <div v-if="displayMode === 'updown'" class="table-section">
            <div class="table-updown">
              <page-table
                ref="financialTableRef"
                :data="financialData"
                :field-list="commonFieldList"
                :handle="tableHandle"
                :pager="false"
                :tab-index="false"
                :check-box="true"
                :maxHeight="195"
              >
                <template #col-entryNo="scope">
                  <div class="entry-no-cell">
                    <span>{{ scope.$index + 1 }}</span>
                    <span class="entry-flag entry-flag-c" data-flag="C"></span>
                  </div>
                </template>
                <template #col-summary="scope">
                  <el-input
                    v-model="scope.row.summary"
                    placeholder="请输入摘要"
                  >
                    <template #append>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </template>
                <template #col-accountName="scope">
                  <el-input
                    v-model="scope.row.accountName"
                    class="not-mongolia"
                    placeholder="请选择会计科目"
                  >
                    <template #append>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </template>
                <template #col-auxiliaryName="scope">
                  <el-input
                    v-model="scope.row.auxiliaryName"
                    class="not-mongolia"
                    placeholder="辅助核算"
                  >
                    <template #append>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </template>
                <template #col-financialDebit="scope">
                  <el-input-number
                    v-model="scope.row.financialDebit"
                    :precision="2"
                    :min="-999999999999"
                    :max="999999999999"
                    controls-position="right"
                    style="width: 100%"
                    @change="onDebitChange(scope.row)"
                  />
                </template>
                <template #col-financialCredit="scope">
                  <el-input-number
                    v-model="scope.row.financialCredit"
                    :precision="2"
                    :min="-999999999999"
                    :max="999999999999"
                    controls-position="right"
                    style="width: 100%"
                    @change="onCreditChange(scope.row)"
                  />
                </template>
              </page-table>
            </div>
            <!-- 预算表格（上下模式时单独显示） -->
            <div class="table-section table-section-budget">
              <page-table
                ref="budgetTableRef"
                :data="budgetData"
                :field-list="commonFieldList"
                :handle="budgetTableHandle"
                :pager="false"
                :tab-index="false"
                :check-box="true"
                :maxHeight="195"
              >
                <template #col-entryNo="scope">
                  <div class="entry-no-cell">
                    <span>{{ scope.$index + 1 }}</span>
                    <span class="entry-flag entry-flag-y" data-flag="Y"></span>
                  </div>
                </template>
                <template #col-summary="scope">
                  <el-input
                    v-model="scope.row.summary"
                    placeholder="请输入摘要"
                  >
                    <template #append>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </template>
                <template #col-accountName="scope">
                  <el-input
                    v-model="scope.row.accountName"
                    class="not-mongolia"
                    placeholder="请选择会计科目"
                  >
                    <template #append>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </template>
                <template #col-auxiliaryName="scope">
                  <el-input
                    v-model="scope.row.auxiliaryName"
                    class="not-mongolia"
                    placeholder="辅助核算"
                  >
                    <template #append>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </template>
                <template #col-financialDebit="scope">
                  <el-input-number
                    v-model="scope.row.financialDebit"
                    :precision="2"
                    :min="-999999999999"
                    :max="999999999999"
                    controls-position="right"
                    style="width: 100%"
                    @change="onDebitChange(scope.row)"
                  />
                </template>
                <template #col-financialCredit="scope">
                  <el-input-number
                    v-model="scope.row.financialCredit"
                    :precision="2"
                    :min="-999999999999"
                    :max="999999999999"
                    controls-position="right"
                    style="width: 100%"
                    @change="onCreditChange(scope.row)"
                  />
                </template>
              </page-table>
            </div>
          </div>

          <!-- 双分录左右模式 -->
          <div v-else-if="displayMode === 'leftright'" class="table-section">
            <div class="table-leftright">
              <div class="table-half">
                <page-table
                  ref="financialTableRef"
                  :data="financialData"
                  :field-list="commonFieldList"
                  :handle="tableHandle"
                  :pager="false"
                  :tab-index="false"
                  :check-box="true"
                  :maxHeight="400"
                >
                  <template #col-entryNo="scope">
                    <div class="entry-no-cell">
                      <span>{{ scope.$index + 1 }}</span>
                      <span
                        class="entry-flag entry-flag-c"
                        data-flag="C"
                      ></span>
                    </div>
                  </template>
                  <template #col-summary="scope">
                    <el-input
                      v-model="scope.row.summary"
                      placeholder="请输入摘要"
                    >
                      <template #append>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </template>
                  <template #col-accountName="scope">
                    <el-input
                      v-model="scope.row.accountName"
                      class="not-mongolia"
                      placeholder="请选择会计科目"
                    >
                      <template #append>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </template>
                  <template #col-auxiliaryName="scope">
                    <el-input
                      v-model="scope.row.auxiliaryName"
                      class="not-mongolia"
                      placeholder="辅助核算"
                    >
                      <template #append>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </template>
                  <template #col-financialDebit="scope">
                    <el-input-number
                      v-model="scope.row.financialDebit"
                      :precision="2"
                      :min="-999999999999"
                      :max="999999999999"
                      controls-position="right"
                      style="width: 100%"
                      @change="onDebitChange(scope.row)"
                    />
                  </template>
                  <template #col-financialCredit="scope">
                    <el-input-number
                      v-model="scope.row.financialCredit"
                      :precision="2"
                      :min="-999999999999"
                      :max="999999999999"
                      controls-position="right"
                      style="width: 100%"
                      @change="onCreditChange(scope.row)"
                    />
                  </template>
                </page-table>
              </div>
              <div class="table-half">
                <page-table
                  ref="budgetTableRef"
                  :data="budgetData"
                  :field-list="commonFieldList"
                  :handle="budgetTableHandle"
                  :pager="false"
                  :tab-index="false"
                  :check-box="true"
                  :maxHeight="400"
                >
                  <template #col-entryNo="scope">
                    <div class="entry-no-cell">
                      <span>{{ scope.$index + 1 }}</span>
                      <span
                        class="entry-flag entry-flag-y"
                        data-flag="Y"
                      ></span>
                    </div>
                  </template>
                  <template #col-summary="scope">
                    <el-input
                      v-model="scope.row.summary"
                      placeholder="请输入摘要"
                    >
                      <template #append>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </template>
                  <template #col-accountName="scope">
                    <el-input
                      v-model="scope.row.accountName"
                      class="not-mongolia"
                      placeholder="请选择会计科目"
                    >
                      <template #append>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </template>
                  <template #col-auxiliaryName="scope">
                    <el-input
                      v-model="scope.row.auxiliaryName"
                      class="not-mongolia"
                      placeholder="辅助核算"
                    >
                      <template #append>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </template>
                  <template #col-financialDebit="scope">
                    <el-input-number
                      v-model="scope.row.financialDebit"
                      :precision="2"
                      :min="-999999999999"
                      :max="999999999999"
                      controls-position="right"
                      style="width: 100%"
                      @change="onDebitChange(scope.row)"
                    />
                  </template>
                  <template #col-financialCredit="scope">
                    <el-input-number
                      v-model="scope.row.financialCredit"
                      :precision="2"
                      :min="-999999999999"
                      :max="999999999999"
                      controls-position="right"
                      style="width: 100%"
                      @change="onCreditChange(scope.row)"
                    />
                  </template>
                </page-table>
              </div>
            </div>
          </div>

          <!-- 多分录模式：合并表格，根据数据 entryType 区分财务/预算 -->
          <div v-else class="table-section">
            <page-table
              ref="financialTableRef"
              :data="mergedData"
              :field-list="commonFieldList"
              :handle="tableHandle"
              :pager="false"
              :tab-index="false"
              :check-box="true"
              :maxHeight="400"
            >
              <template #col-entryNo="scope">
                <div class="entry-no-cell">
                  <span>{{ scope.$index + 1 }}</span>
                  <span
                    class="entry-flag"
                    :class="
                      scope.row.entryType === 'budget'
                        ? 'entry-flag-y'
                        : 'entry-flag-c'
                    "
                    :data-flag="scope.row.entryType === 'budget' ? 'Y' : 'C'"
                  />
                </div>
              </template>
              <template #col-summary="scope">
                <el-input v-model="scope.row.summary" placeholder="请输入摘要">
                  <template #append>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #col-accountName="scope">
                <el-input
                  v-model="scope.row.accountName"
                  class="not-mongolia"
                  placeholder="请选择会计科目"
                >
                  <template #append>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #col-auxiliaryName="scope">
                <el-input
                  v-model="scope.row.auxiliaryName"
                  class="not-mongolia"
                  placeholder="辅助核算"
                >
                  <template #append>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #col-financialDebit="scope">
                <el-input-number
                  v-model="scope.row.financialDebit"
                  :precision="2"
                  :min="-999999999999"
                  :max="999999999999"
                  controls-position="right"
                  style="width: 100%"
                  @change="onDebitChange(scope.row)"
                />
              </template>
              <template #col-financialCredit="scope">
                <el-input-number
                  v-model="scope.row.financialCredit"
                  :precision="2"
                  :min="-999999999999"
                  :max="999999999999"
                  controls-position="right"
                  style="width: 100%"
                  @change="onCreditChange(scope.row)"
                />
              </template>
            </page-table>
          </div>
        </el-form>
      </el-tab-pane>

      <!-- ===== 汇总显示 Tab ===== -->
      <el-tab-pane label="汇总显示" name="summary">
        <div class="summary-table-wrapper">
          <page-table
            ref="summaryTableRef"
            :data="summaryData"
            :field-list="summaryFieldList"
            :pager="false"
            :tab-index="false"
            :check-box="false"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
    <el-slider v-model="tableRowHeight" :min="1" :max="5" vertical class="slider"/>
  </div>
</template>

<script setup name="voucherTableTabs">
const { proxy } = getCurrentInstance();
const emit = defineEmits([
  "update:activeTab",
  "update:financialData",
  "update:budgetData",
]);
const props = defineProps({
  activeTab: { type: String, default: "detail" },
  financialData: { type: Array, default: () => [] },
  budgetData: { type: Array, default: () => [] },
  summaryData: { type: Array, default: () => [] },
});
const tableRowHeight = ref(1);
const activeTab = computed({
  get: () => props.activeTab,
  set: (val) => emit("update:activeTab", val),
});
const financialData = computed({
  get: () => props.financialData,
  set: (val) => emit("update:financialData", val),
});
const budgetData = computed({
  get: () => props.budgetData,
  set: (val) => emit("update:budgetData", val),
});

// 借方和贷方互斥：输入借方清空贷方，输入贷方清空借方
function onDebitChange(row) {
  if (Number(row.financialDebit) !== 0) {
    row.financialCredit = 0;
  }
}

function onCreditChange(row) {
  if (Number(row.financialCredit) !== 0) {
    row.financialDebit = 0;
  }
}

// ========== 系统参数 ==========
const systemConfig = computed(
  () => proxy.$store.state.permission.systemConfig || {},
);
/**
 * 显示模式：
 * updown - 双分录上下（财务表格在上，预算表格在下）
 * leftright - 双分录左右（两个表格左右等宽）
 * multi - 多分录模式（一个合并表格）
 */
const displayMode = computed(() => {
  const sysMode = systemConfig.value?.voucher_display_mode;
  if (sysMode === "leftright") return "leftright";
  if (sysMode === "multi") return "multi";
  return "updown";
});
// 多分录模式：合并财务和预算数据，添加 entryType 标识，字段名与其他模式一致
const mergedData = computed(() => [
  ...financialData.value,
  ...budgetData.value,
]);
// ========== 内部静态配置（三种模式共用） ==========
const commonFieldList = ref([
  { label: "分录号", value: "entryNo", type: "slot", width: "70" },
  { label: "摘要", value: "summary", type: "slot", minWidth: "300" },
  { label: "会计科目", value: "accountName", type: "slot", minWidth: "300" },
  { label: "辅助核算", value: "auxiliaryName", type: "slot", minWidth: "300" },
  {
    label: "借方",
    value: "financialDebit",
    type: "slot",
    width: "180",
  },
  {
    label: "贷方",
    value: "financialCredit",
    type: "slot",
    width: "180",
  },
]);

const summaryFieldList = ref([
  { label: "分录号", value: "entryNo", width: "70" },
  { label: "摘要", value: "summary" },
  { label: "会计科目", value: "accountName" },
  { label: "借方", value: "financialDebit", align: "right", width: "180" },
  { label: "贷方", value: "financialCredit", align: "right", width: "180" },
]);
// 操作栏
const tableHandle = ref({
  fixed: "right",
  label: "操作",
  width: "120",
  btList: [
    { label: "新增行", event: addFinancialRow, show: true },
    {
      label: "删除",
      event: deleteFinancialRow,
      show: true,
      popconfirmText: "确认删除该行吗？",
    },
  ],
});

const budgetTableHandle = ref({
  fixed: "right",
  label: "操作",
  width: "120",
  btList: [
    { label: "新增行", event: addBudgetRow, show: true },
    {
      label: "删除",
      event: deleteBudgetRow,
      show: true,
      popconfirmText: "确认删除该行吗？",
    },
  ],
});
// ========== 内部行操作 ==========
function addFinancialRow(row) {
  financialData.value.push({
    financialDebit: 0,
    financialCredit: 0,
    entryType: row.entryType || "financial",
  });
}

function deleteFinancialRow(row) {
  if (financialData.value.length <= 1) return;
  financialData.value = financialData.value.filter((item) => item !== row);
}

function addBudgetRow() {
  budgetData.value.push({
    financialDebit: 0,
    financialCredit: 0,
    entryType: "budget",
  });
}

function deleteBudgetRow(row) {
  if (budgetData.value.length <= 1) return;
  budgetData.value = budgetData.value.filter((item) => item !== row);
}
</script>

<style lang="scss" scoped>
.voucher-tabs {
  display: flex;
  flex-direction: column;
  position: relative;
  padding-right: 36px!important;
  :deep(.el-tabs__content) {
    flex: 1;
    overflow: auto;
  }
  .slider {
    position: absolute;
    top: 50px;
    right: 0;
    height: calc(100% - 60px);
  }
}
.table-section-budget {
  margin-top: 12px;
}
.table-updown {
}
.table-leftright {
  display: flex;
  gap: 10px;
  .table-half {
    flex: 1;
    min-width: 0;
  }
}
.entry-no-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  .entry-flag {
    position: absolute;
    right: 0;
    top: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 30px 30px 0;
  }
  .entry-flag::after {
    content: attr(data-flag);
    position: absolute;
    left: 16px;
    top: -2px;
    font-size: 14px;
    font-weight: bold;
    color: #fff;
  }
  .entry-flag-c {
    border-color: transparent #165dff transparent transparent;
  }
  .entry-flag-y {
    border-color: transparent #ec818f transparent transparent;
  }
}
</style>
