<template>
  <div class="app-container voucher-modify-container">
    <!-- ========== 顶部按钮栏 ========== -->
    <div class="btn-bar-wrapper">
      <NewPageFilter :filter-btn="btnList" />
    </div>
      <!-- ========== 核算账簿筛选行 ========== -->
      <collapseForm
          ref="collapse"
          v-model:formData="formData"
          :id="props.id"
          :voucherTypeData="voucherTypeData"
      />
    <el-tabs v-model="activeTab">
      <el-tab-pane label="明细数据" name="detail"></el-tab-pane>
      <el-tab-pane label="汇总显示" name="summary"></el-tab-pane>
    </el-tabs>
    <div
        v-show="activeTab === 'detail'"
        class="multipleTable_box"
        :class="
              displayMode === '2'
                ? 'leftRight_box'
                : displayMode === '3'
                ? 'cross_box'
                : ''
            "
    >
      <div class="content-table">
            <financeTable
              ref="financeRef"
              v-model:financialData="financialData"
              :formData="formData"
              :accasoaList="accasoaList"
              @changeTabRow="changeTabHandle"
              @checkBoxRows="changeCheckBox"
            />
      </div>
      <div
          class="content-table"
          v-if="displayMode !== '3'"
          :style="Manualbudget ? '' : { display: 'contents' }"
      >
        <budgetTable
            ref="budgetRef"
            v-show="Manualbudget"
            v-model:budgetData="budgetData"
            :formData="formData"
            :accasoaList="accasoaList"
            @changeTabRow="changeTabHandle"
            @checkBoxRows="changeBudCheckBox"
        />
      </div>
    </div>
    <div v-show="activeTab === 'summary'"
         class="multipleTable_box"
         :class="
              displayMode === '2'
                ? 'leftRight_box'
                : displayMode === '3'
                ? 'cross_box'
                : ''
            ">
      <div class="content-table">
        <summaryTable
            v-model:data="financialData"
        />
      </div>
      <div
          class="content-table"
          v-if="displayMode !== '3'"
          :style="Manualbudget ? '' : { display: 'contents' }"
      >
        <summaryTable
            v-show="Manualbudget"
            v-model:data="budgetData"
        />
      </div>
    </div>
    <!-- ========== 底部表单信息（全部禁用） ========== -->
    <div class="bottom-info">
      <page-form
        ref="bottomFormRef"
        :data="bottomInfo"
        :field-list="bottomFieldList"
        :disabled="true"
        label-width="130px"
      />
    </div>
    <!-- ========== 弹窗组件 ========== -->
    <select-data ref="bookSelectorRef" />
    <select-data ref="commonVoucherSelectorRef" />
    <LocateDialog
      v-model:visible="locateDialogVisible"
      :book-name="formData.accbookName"
      :book-id="formData.accbookId"
      @confirm="onLocateConfirm"
    />
    <AddCommonVoucherDialog
      v-model:visible="addCommonVoucherVisible"
      @confirm="onAddCommonVoucherConfirm"
    />
    <!-- 联查弹窗（冲销凭证/被冲销凭证/来源凭证/目的凭证） -->
    <el-dialog
      v-model="linkDialogVisible"
      :title="linkDialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <div style="text-align: center; padding: 20px; color: #909399;">
        {{ linkDialogTitle }} 内容待开发
      </div>
    </el-dialog>
    <!-- 附件上传弹窗 -->
    <AttachmentDialog
      v-model:visible="attachmentVisible"
      @confirm="onAttachmentConfirm"
    />
  </div>
</template>

<script setup name="voucherPreparationModify">

import {bottomFromFieldList} from "@/views/ledger/voucherManagement/voucherPreparation/components/pageForm";

const financeTable = defineAsyncComponent(() => import("./components/financeTable.vue"));
const budgetTable = defineAsyncComponent(() => import("./components/budgetTable.vue"));
const summaryTable = defineAsyncComponent(() => import("./components/summaryTable.vue"));
const collapseForm = defineAsyncComponent(() => import("./components/collapseForm.vue"));
const LocateDialog = defineAsyncComponent(() => import("./components/locateDialog.vue"));
const AddCommonVoucherDialog = defineAsyncComponent(() => import("./components/addCommonVoucherDialog.vue"));
const AttachmentDialog = defineAsyncComponent(() => import("./components/attachmentDialog.vue"));
import { useSelectData } from "@/hooks/useSelectData";
import {
  voucherInitcreate,
  voucherInitVoucher,
  voucherDetail,
  voucherupdate,
  voucherparallel
} from "@/api/ledger/voucherManagement";
import {getCurrentInstance, onMounted, ref, computed} from "vue";
import { Session } from '@/utils/storage.js'

// ========== 选择器 Hooks ==========
const { selectorInfo: bookSelectorInfo, selectorRef: bookSelectorRef } =
useSelectData();
const { selectorInfo: commonVoucherSelectorInfo, selectorRef: commonVoucherSelectorRef } =
useSelectData();

const { proxy } = getCurrentInstance();
const emit = defineEmits(["returnModify", "update:visible"]);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  id: {
    type: [String, Number],
    default: "",
  },
  mode: {
    type: String,
    default: "add", // add | edit | copy
  },
  defaultBookId: {
    type: [String, Number],
    default: "",
  },
  defaultBookName: {
    type: String,
    default: "",
  },
});
// ========== 系统参数 ==========
const systemConfig = computed(
    () => proxy.$store.state.permission.systemConfig || {},
);


const userInfo = proxy.$store.state.systemConfig?.userLoginConfig || {}
const voucherTypeData = ref([])
const accasoaList = ref([])

const voucherMode = computed({
  get: () => props.mode,
});

// ========== 核算账簿必选校验包装 ==========
// 除"返回"外，所有按钮操作前必须先选择核算账簿
const requireBook = (fn) =>
  function (...args) {
    if (!formData.value.accbookId) {
      proxy.$message.warning("请选择核算账簿");
      return;
    }
    return fn.apply(this, args);
  };

// ========== 按钮配置 ==========
const btnList = ref([
  { type: "button", label: "保存新增(A)", event: requireBook(saveAndAdd), show: true },
  { type: "button", label: "保存(S)", event: () => save(), show: true },
  { type: "button", label: "返回(R)", event: goBack, show: true },
  { type: "button", label: "定位", event: requireBook(handleLocate), show: true },
  { type: "button", label: "刷新", event: requireBook(handleRefresh), show: true },
  {
    type: "dropdown",
    label: "常用凭证",
    children: [
      { label: "调用常用", command: "callCommon" },
      { label: "新增常用", command: "addCommon" },
    ],
    event: requireBook(handleCommonVoucher),
  },
  {
    type: "dropdown",
    label: "凭证管理",
    children: [
      { label: "纠错", command: "correct" },
      { label: "作废", command: "void" },
      { label: "取消作废", command: "cancelVoid" },
      { label: "删除", command: "deleteVoucher" },
      { label: "复制凭证", command: "copyVoucher" },
      { label: "凭证暂存(T)", command: "tempSave" },
    ],
    event: requireBook(handleVoucherManage),
  },
  {
    type: "dropdown",
    label: "分录",
    children: [
      { label: "增行", command: "addRow" },
      { label: "删行(D)", command: "deleteRow" },
      { label: "复制行(C)", command: "copyRow" },
      { label: "粘贴行(V)", command: "pasteRow" },
      { label: "插入行(I)", command: "insertRow" },
      { label: "辅助信息(H)", command: "auxiliaryInfo" },
    ],
    event: requireBook(handleEntryMenu),
  },
  {
    type: "dropdown",
    label: "联查",
    children: [
      { label: "联查单据", command: "linkDoc" },
      { label: "联查科目余额", command: "linkBalance" },
      { label: "联查辅助余额", command: "linkAuxBalance" },
      { label: "联查科目明细", command: "linkDetail" },
      { label: "联查时序账", command: "linkChrono" },
      { label: "联查冲销凭证", command: "linkOffset" },
      { label: "联查被冲销凭证", command: "linkOffsetBy" },
      { label: "联查来源凭证", command: "linkSource" },
      { label: "联查目的凭证", command: "linkTarget" },
    ],
    event: requireBook(handleLinkQuery),
  },
  { type: "button", label: "辅助核算", event: requireBook(handleAccounting), show: true },
  { type: "button", label: "平行记账(P)", event: requireBook(handleParallel), show: true },
  { type: "button", label: "现金流量(M)", event: requireBook(handleCashFlow), show: true },
  {
    type: "button",
    label: "差异分析(G)",
    event: requireBook(handleDiffAnalysis),
    show: true,
  },
  { type: "button", label: "附件", event: requireBook(handleAttachment), show: true },
  { type: "button", label: "打印", event: requireBook(handlePrint), show: true },
  { type: "button", label: "上一张", event: requireBook(handlePrev), show: true },
  { type: "button", label: "下一张", event: requireBook(handleNext), show: true },
  { type: "button", label: "末尾", event: requireBook(handleLast), show: true },
]);

// ========== Tab ==========
const activeTab = ref("detail");
/**
 * 显示模式：
 * 1 - 双分录上下（财务表格在上，预算表格在下）
 * 2 - 双分录左右（两个表格左右等宽）
 * 3 - 多分录模式（一个合并表格）
 */
const displayMode = computed(() => {
  return systemConfig.value?.fn_new_voucher_model || '1';
});

// 是否显示预算会计
const Manualbudget = ref(true)

// ========== 定位弹窗 ==========
const locateDialogVisible = ref(false);
// ========== 新增常用凭证弹窗 ==========
const addCommonVoucherVisible = ref(false);
// ========== 联查弹窗 ==========
const linkDialogVisible = ref(false);
const linkDialogTitle = ref("");

// ========== 附件弹窗 ==========
const attachmentVisible = ref(false);

const uploadVOList = ref([])

// ========== 表单数据 ==========
const formData = ref({
  preparedDate: Session.get('financeDatePicker'),
  accbookName: userInfo.accbookName,
  accbookId: userInfo.accbookId,
});

// ========== 底部信息 ==========
const bottomInfo = ref({
});

// 底部字段配置（pageForm 使用）
// PageForm disabled 模式下会将 computed 值同步到 data 上显示
const bottomFieldList = ref(bottomFromFieldList);

// ========== 财务表格 ==========
const financialData = ref([
  {
    sortNum: 1,
    commonCreditAmount: 1000,
    commonDebitAmount: '',
    explanation: "支付XXX款项",
    accasoaName: "9003/财政基本拨款/人员经费",
    accasoaId: "2084154555495591937",
    assCommonName: "",
    accAttribute: "1",
  },
]);

// ========== 预算表格 ==========
const budgetData = ref([
  {
    sortNum: 1,
    commonCreditAmount: '',
    commonDebitAmount: '',
    explanation: "",
    accasoaName: "",
    assCommonName: "",
    accAttribute: "2",
  },
]);

// ========== 多分录合并表格 ==========
// 多分录模式：合并财务和预算数据
const mergedData = computed(() => [
  ...financialData.value,
  ...budgetData.value,
]);
const financialDebitTotal = computed(() => formatNum(sumByType('financial', 'commonDebitAmount')));
const financialDebitDiff = computed(() => formatNum(sumByType('financial', 'commonDebitAmount') - sumByType('financial', 'commonCreditAmount')));
const financialCreditTotal = computed(() => formatNum(sumByType('financial', 'commonCreditAmount') - sumByType('financial', 'commonDebitAmount')));
const budgetDebitTotal = computed(() => formatNum(sumByType('budget', 'commonDebitAmount')));
const budgetDebitDiff = computed(() => formatNum(sumByType('budget', 'commonDebitAmount') - sumByType('budget', 'commonCreditAmount')));
const budgetCreditTotal = computed(() => formatNum(sumByType('budget', 'commonCreditAmount') - sumByType('budget', 'commonDebitAmount')));


// 将 computed 值同步到 bottomInfo，供 PageForm 在 disabled 模式下显示
watchEffect(() => {
  bottomInfo.value.financialDebitDiff = financialDebitDiff.value;
  bottomInfo.value.financialDebitTotal = financialDebitTotal.value;
  bottomInfo.value.financialCreditTotal = financialCreditTotal.value;
  bottomInfo.value.budgetDebitDiff = budgetDebitDiff.value;
  bottomInfo.value.budgetDebitTotal = budgetDebitTotal.value;
  bottomInfo.value.budgetCreditTotal = budgetCreditTotal.value;
});

// ========== 生命周期 ==========
onMounted(() => {
  if (props.id) {
    loadDetail();
  } else {
    initNewVoucher();
  }
  initialization();
});

// ========== 数据加载 ==========
function initNewVoucher() {
  // 读取默认账簿（由父组件 index.vue 传入）
  if (props.defaultBookId) {
    formData.value.accbookId = props.defaultBookId;
    formData.value.accbookName = props.defaultBookName;
  }
}

async function initialization() {
  const { data, code } = await voucherInitVoucher({
    accbookId: formData.value.accbookId,
    preparedDate: formData.value.preparedDate,
  })
  if(code === 200) {
    voucherTypeData.value = (data?.voucherTypeList || []).map((it) => ({
      label: it.name,
      value: it.id,
    }))
    formData.value.voucherTypeId = voucherTypeData.value[0]?.value
    accasoaList.value = data.accasoaList || []
  }
}

// 编辑查询
async function loadDetail() {
  financialData.value = []
  const { data, code } = await voucherDetail(props.id, "voucherPreparation:detail")
  if(code === 200) {
    formData.value = {
      ...data,
      detailCommonVOVOList: null,
      uploadVOList: null,
    }
    financialData.value = data.detailCommonVOVOList.filter(it => it.accAttribute === '1');
    budgetData.value = data.detailCommonVOVOList.filter(it => it.accAttribute === '2');

    uploadVOList.value = data.uploadVOList;
  }
}
// ========== 计算属性：合计（基于 mergedData，按 accAttribute 区分财务/预算） ==========
function sumByType(type, field) {
  return mergedData.value
    .filter((row) => row.accAttribute === type)
    .reduce((acc, row) => acc + (Number(row[field]) || 0), 0);
}

function formatNum(val) {
  return proxy.$fn?.TripartiteReturnNumber(val) ?? val.toFixed(2);
}

function saveAndAdd() {

  voucherMode.value = 'add'
  // TODO: 先保存当前凭证，再新增一个凭证，凭证号+1
  proxy.$message.info("保存新增功能待接口联调");
}
const currentRow = ref(null)

function changeTabHandle(row) {
  currentRow.value = row
}
const finSelectRecords = ref([])
const budSelectRecords = ref([])

function changeCheckBox(rows) {
  finSelectRecords.value = rows
}
function changeBudCheckBox(rows) {
  budSelectRecords.value = rows
}

// 页面数据
function handeData() {
  const finance = financialData.value.filter(it => it.accasoaId) || []
  const budget = budgetData.value.filter(it => it.accasoaId) || []
  return {
    voucherCommonVO: {
      ...formData.value,
      detailCommonVOVOList: [
        ...finance,
        ...budget,
      ],
      uploadVOList: [],
    }
  }
}

// ========== 保存 ==========
async function save(hashCode = '') {
  let fromData = handeData()
  fromData.hashCode = hashCode;
  // 新增  插入  都走新增接口
  const API = voucherMode.value === 'edit' ? voucherupdate : voucherInitcreate
  const { code, data } = await API(fromData)
  if(code === 200) {
    if(!data.success && !data.strongPass) {
    //   强校验
     return proxy.$message.error(data.message);
    }
    if(!data.success && data.strongPass && data.weakConfirm) {
      //   弱检验确认提示框
      proxy
          .$confirm(data.message, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
          .then(() => {
            save(data.hashCode)
          });
      return proxy.$message.error(data.message);
    }
    if(data.success) {
      proxy.$message.success('保存成功');
    //   保存成功重绘页面
      handleModify(data.data)
    }
  }
}

function handleModify(data) {
  formData.value = {
    ...data,
    detailCommonVOVOList: null,
    uploadVOList: null,
  }
  financialData.value = data.detailCommonVOVOList.filter(it => it.accAttribute === '1');
  budgetData.value = data.detailCommonVOVOList.filter(it => it.accAttribute === '2');
  uploadVOList.value = data.uploadVOList;
}


// ========== 返回 ==========
function goBack() {
  emit("update:visible", false);
  // emit("returnModify", !!props.id);
}

// ========== 按钮事件处理 ==========
function handleLocate() {
  locateDialogVisible.value = true;
}

function onLocateConfirm(data) {
  // TODO: 根据 data (bookId, year, month, voucherTypeCode, num) 调用接口定位凭证
  proxy.$message.info(`定位功能待接口联调: 账簿=${data.accbookName} ${data.year}年${String(data.month).padStart(2, "0")}月 凭证号=${data.num}`);
}

function handleRefresh() {
  if (props.id) {
    loadDetail();
  }
}

function handleCommonVoucher(command) {
  if (command === "callCommon") {
    commonVoucherSelectorInfo.type = "commonVoucher";
    commonVoucherSelectorInfo.callback = (rows) => {

    };
    commonVoucherSelectorInfo.visible = true;
  } else if (command === "addCommon") {
    addCommonVoucherVisible.value = true;
  }
}

function onAddCommonVoucherConfirm(data) {
  console.log(data)
  // TODO: 根据 data 调用接口新增常用凭证
  proxy.$message.info("新增常用凭证功能待接口联调");
}

function handleVoucherManage(command) {
  const actions = {
    correct: "纠错",
    void: "作废",
    cancelVoid: "取消作废",
    deleteVoucher: "删除",
    copyVoucher: "复制凭证",
    tempSave: "凭证暂存",
  };
  if (command === "copyVoucher") {
    proxy
      .$confirm("确定要复制当前凭证吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        // TODO: 调用接口复制凭证
        proxy.$message.info("复制凭证功能待接口联调");
      })
      .catch(() => {});
  } else {
    proxy.$message.info(`${actions[command] || command} 功能待接口联调`);
  }
}

function handleEntryMenu(command) {
  const actions = {
    addRow: () => {
      proxy.$refs.financeRef.addFinancialRow();
    },
    copyRow: () => {
      // TODO: 复制多选行
      const copys = finSelectRecords.value.concat(budSelectRecords.value)
      Session.set('copyVoucherRows', copys)
    },
    pasteRow: () => {
      // TODO: 粘贴行
      proxy.$refs.financeRef.pasteLine();
      proxy.$refs.budgetRef.pasteLine();
    },
    insertRow: () => {
      // TODO: 在选中行前插入一行
    },
    auxiliaryInfo: () => {
      // TODO: 弹出辅助信息框
    },
  };
  const fn = actions[command];
  if (fn) fn();
}

function handleLinkQuery(command) {
  // 打开弹窗的联查项
  const dialogActions = {
    linkOffset: "联查冲销凭证",
    linkOffsetBy: "联查被冲销凭证",
    linkSource: "联查来源凭证",
    linkTarget: "联查目的凭证",
  };
  // 跳转页面的联查项（预留）
  const pageActions = {
    linkDoc: "联查单据",
    linkBalance: "联查科目余额",
    linkAuxBalance: "联查辅助余额",
    linkDetail: "联查科目明细",
    linkChrono: "联查时序账",
  };

  if (dialogActions[command]) {
    linkDialogTitle.value = dialogActions[command];
    linkDialogVisible.value = true;
  } else if (pageActions[command]) {
    // TODO: 跳转到具体页面
    proxy.$message.info(`${pageActions[command]} 功能待接口联调`);
  }
}
function handleAccounting() {
  /*
  *  根据制单模式区分  打开那个辅助核算弹框
  * */
  const accAttribute = currentRow.value.accAttribute;
  if(displayMode.value !== '3') {
    if(accAttribute === '1') {
      proxy.$refs.financeRef.openOuxiliary(currentRow.value);
    } else {
      proxy.$refs.budgetRef.openOuxiliary(currentRow.value);
    }
  } else {
    proxy.$refs.financeRef.openOuxiliary(currentRow.value);
  }
}

async function handleParallel() {
  let fromData = handeData()
  const { data, code } = await voucherparallel({
    ...fromData.voucherCommonVO
  })
  if(code === 200) {
    formData.value = {
      ...data,
      detailCommonVOVOList: null,
      uploadVOList: null,
    }
    financialData.value = data.detailCommonVOVOList.filter(it => it.accAttribute === '1');
    budgetData.value = data.detailCommonVOVOList.filter(it => it.accAttribute === '2');
    uploadVOList.value = data.uploadVOList;
  }
}

function handleCashFlow() {
  proxy.$message.info("现金流量功能待接口联调");
}

function handleDiffAnalysis() {
  proxy.$message.info("差异分析功能待接口联调");
}

function handleAttachment() {
  attachmentVisible.value = true;
}

function onAttachmentConfirm(data) {
  console.log("附件数据:", data);
  // TODO: 处理附件数据，如保存到凭证中
}

function handlePrint() {
  proxy.$message.info("打印功能待接口联调");
}

function handlePrev() {
  proxy.$message.info("上一张功能待接口联调");
}

function handleNext() {
  proxy.$message.info("下一张功能待接口联调");
}

function handleLast() {
  proxy.$message.info("末尾功能待接口联调");
}
</script>

<style lang="scss" scoped>
.voucher-modify-container {
  padding: 0;
  height: 100%;
  overflow-y: hidden;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  :deep(.btn-bar-wrapper) {
    .el-button {
      padding: 0 6px;
    }
  }
}

.content-table {
  display: flex;
  flex-direction: column;
}

.multipleTable_box {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  .content-table {
    height: 0;
    min-height: 0;
    flex: 1 1 50%;
  }
}
.voucher-modify-container {
  .leftRight_box {
    display: flex;
    flex-direction: row;
    .content-table {
      height: 100%;
      min-height: initial;
      min-width: 0;
      width: 0;

      &:nth-child(2) {
        padding-left: 10px;
      }
    }
  }

  .cross_box {
    display: block;
    min-height: 300px;
    .content-table {
      height: 100%;
      flex: initial;
      display: block;
      &:nth-child(1) {
        border-bottom: 1px solid #9c9ea3;
      }
      &:nth-child(2) {
        transform: translateY(0);
      }

      .table-container {
        height: 100%;
      }

      .el-table {
        height: auto !important;
      }

      .el-table__body-wrapper {
        overflow-x: hidden;
        overflow-y: auto;
        //height: auto !important;
        .el-table__body {
          padding: 0 !important;
        }
      }
    }
  }
}
.el-tabs {
  background-color: #fff;
}
.btn-bar-wrapper {
  background-color: #fff;
  border-radius: 8px;
  padding: 8px 8px 0 8px;
}
/* ========== 底部信息 ========== */
.bottom-info {
  background-color: #fff;
  :deep(.pageForm) {
    .el-form-item {
      margin-bottom: 0px !important;
    }
  }
}
</style>
