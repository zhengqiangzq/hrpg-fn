<template>
  <div class="voucher-tabs">
    <vxe-table
        ref="financialTableRef"
        border
        :data="financeData"
        :checkbox-config="{ checkField: '_checked' }"
        :column-config="{ resizable: true }"
        :row-config="{ isCurrent: true, isHover: true, drag: true, resizable: true }"
        :virtual-y-config="{ enabled: true }"
        :menu-config="menuConfig"
        :scroll-y="{ enabled: true, mode: 'wheel', gt: 15 }"
        :sort-config="{ multiple: true, trigger: 'cell' }"
        width='100%'
        height='100%'
        show-overflow
        highlight-current-row
        @cell-click="onCellClick"
        @menu-click="contextMenuClickEvent"
        @checkbox-change="handleSelectionChange"
    >
      <!-- 复选框列 -->
      <vxe-column type="checkbox" align="center" width="50" />

      <!-- 分录号（只读） -->
      <vxe-column title="分录号" align="center" width="70">
        <template #default="{ row, $rowIndex }">
          <div class="top-tag budget">
            {{ row.sortNum }}
            <span class="tag-letter">Y</span>
          </div>
        </template>
      </vxe-column>

      <!-- 摘要（可输入） -->
      <vxe-column title="摘要" field="explanation" align="center" min-width="300">
        <template #default="{ row, $rowIndex }">
          <div @keydown.capture="handleKeydown($event, $rowIndex, 'explanation')">
            <el-input
                v-model="row.explanation"
                placeholder="请输入摘要"
            >
              <template #append>
                <el-icon @click="seachSummary(row, $rowIndex)"><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </template>
      </vxe-column>

      <!-- 会计科目（可输入） -->
      <vxe-column title="会计科目" field="accasoaName" align="center" min-width="300">
        <template #default="{ row, $rowIndex }">
          <div @keydown.capture="handleKeydown($event, $rowIndex, 'accasoaName')">
            <el-autocomplete
                v-model="row.accasoaName"
                :fetch-suggestions="querySearch"
                :trigger-on-focus="false"
                :highlight-first-item="true"
                :select-when-unmatched="true"
                style="width: 100%"
                @select="(item) => handleSelect(item, row)"
                @visible-change="(visible) => autocompleteOpen = visible"
            >
              <template #default="{ item }">
                <div class="value">{{ item.dispname }}</div>
              </template>
              <template #append>
                <el-icon @click="seachAccasoa(row, $rowIndex)"><Search /></el-icon>
              </template>
            </el-autocomplete>
          </div>
        </template>
      </vxe-column>

      <!-- 辅助核算（可输入） -->
      <vxe-column title="辅助核算" field="assCommonName" align="center" min-width="300">
        <template #default="{ row, $rowIndex }">
          <div @keydown.capture="handleKeydown($event, $rowIndex, 'assCommonName')">
            <el-input
                readonly
                v-model="row.assCommonName"
                class="not-mongolia"
                placeholder="辅助核算"
            >
              <template #append>
                <el-icon @click="auxiliaryDiaAccounting(row, $rowIndex)"><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </template>
      </vxe-column>

      <!-- 借方（数字输入） -->
      <vxe-column title="借方" field="commonDebitAmount" align="center" width="180">
        <template #default="{ row, $rowIndex }">
          <div @keydown.capture="handleKeydown($event, $rowIndex, 'commonDebitAmount', row)">
            <ThousandInput
                v-model="row.commonDebitAmount"
                class="inputVoucherRinght"
                @ChangeInput="onDebitInput"
                @blur="(num) => onBlurInput(num,'commonDebitAmount')"
            />
          </div>
        </template>
      </vxe-column>

      <!-- 贷方（数字输入） -->
      <vxe-column title="贷方" field="commonCreditAmount" align="center" width="180">
        <template #default="{ row, $rowIndex }">
          <div @keydown.capture="handleKeydown($event, $rowIndex, 'commonCreditAmount', row)">
            <ThousandInput
                v-model="row.commonCreditAmount"
                class="inputVoucherRinght"
                @ChangeInput="onCreditInput"
                @blur="(num) => onBlurInput(num,'commonCreditAmount')"
            />
          </div>
        </template>
      </vxe-column>

      <!-- 操作列 -->
      <vxe-column title="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <span class="btnStyle" @click="deleteFinancialRow(row)">
            删除
          </span>
        </template>
      </vxe-column>
    </vxe-table>
    <select-data ref="selectorRef" />
    <!-- 辅助核算弹窗 -->
    <AuxiliaryAccounting
        v-model:visible="auxiliary.visible"
        :data="auxiliary.data"
        :accbookId="props.formData.accbookId"
        :money="auxiliary.totalMoney"
        :assVoList="auxiliary.assVoList"
        @confirm="onAuxiliaryAccountingConfirm"
    />
  </div>
</template>

<script setup name="financeTable">
import { nextTick, ref, computed } from 'vue';
import {useSelectData} from "@/hooks/useSelectData";
import {deepClone} from "@/utils";
import {rightBudBtn} from "./pageForm";
import {Session} from "@/utils/storage";

const ThousandInput = defineAsyncComponent(() => import("@/components/ThousandInput/index.vue"));
const AuxiliaryAccounting = defineAsyncComponent(() => import("./auxiliaryAccounting.vue"));

const { proxy } = getCurrentInstance();
const emit = defineEmits(['update:financialData', 'changeTabRow']);
const props = defineProps({
  formData: { type: Object, default: {} },
  budgetData: { type: Array, default: () => [] },
  accasoaList: { type: Array, default: () => [] },
});

const financeData = computed({
  get: () => props.budgetData,
  set: (val) => emit('update:budgetData', val),
});

const menuConfig = ref({
  className: 'my-menus',
  body: {
    options: [rightBudBtn]
  },
})

const currentRow = ref({})
const sectionRows = ref([])
// el-autocomplete 下拉是否打开（打开时禁用表格自定义键盘导航）
const autocompleteOpen = ref(false)


const { selectorInfo, selectorRef } = useSelectData();

// ========== 辅助核算弹窗 ==========
const auxiliary = ref({
  visible: false,
  data: [],
  totalMoney: null,
  assVoList: [],
});
// 可编辑字段顺序（用于键盘导航）
const editableFields = [
  'explanation',
  'accasoaName',
  'assCommonName',
  'commonDebitAmount',
  'commonCreditAmount',
];

// ========== 键盘导航 ==========
const financialTableRef = ref(null);
const selectRecords = ref([])

function handleSelectionChange() {
  selectRecords.value = financialTableRef.value.getCheckboxRecords()

  emit('checkBoxRows', selectRecords.value)
}

/** 点击单行 */
function onCellClick({ row, rowIndex, column }) {
  console.log('--------一行', row)
  currentRow.value = row;
  if (!column.field) return;
  const lastIndex = rowIndex === 0 ? 0 : rowIndex - 1;
  row.explanation = row.explanation || financeData.value[lastIndex].explanation;
  // 判断最后一行
  if(financeData.value.length - 1 === rowIndex) {
    addFinancialRow()
  }
  nextTick(() => {
    focusCellInput(rowIndex, column.field);
  });
  emit('changeTabRow', row)
}

function contextMenuClickEvent({ menu, row, column }) {
  if(!column) return
  const table = financialTableRef.value;
  if (table) {
    table.setCurrentRow(row);
  }
  currentRow.value = row;
  switch (menu.code) {
    case 'InsertLine':
      InsertLine()
      break
    case 'delLine':
      delLine()
      break
    case 'copyLine':
      copyLine()
      break
    case 'pasteLine':
      pasteLine()
      break
    case 'addSummary':
      addSummary()
      break
    case 'showBudget':
      showBudget()
      break
    case 'showColumn':
      showColumn()
      break
    case 'accountBalance':
      accountBalance()
      break
  }
}

// ========== 右键菜单：插行 / 删行 / 复制行 / 粘贴行 ==========

/** 获取当前选中索引 */
function getCurrentRowIndex() {
  return financeData.value.indexOf(currentRow.value);
}

/** 重新排序分录号 */
function renumberSortNum() {
  financeData.value.forEach((row, index) => {
    row.sortNum = index + 1;
  });
}

/** 生成空白行 */
function createBlankRow(sourceRow) {
  return {
    sortNum: '',
    commonDebitAmount: '',
    commonCreditAmount: '',
    explanation: sourceRow?.explanation || '',
    detailSingleVOList: [],
    accasoaName: '',
    assCommonName: '',
    accAttribute: '2',
  };
}

/** 插行 */
function InsertLine() {
  const index = getCurrentRowIndex();
  const blankRow = createBlankRow(currentRow.value);
  if (index === -1) {
    financeData.value.push(blankRow);
  } else {
    financeData.value.splice(index, 0, blankRow);
  }
  renumberSortNum();
}

/** 删行 */
function delLine() {
  if (financeData.value.length === 1) {
    financeData.value = [
      {
        sortNum: 1,
        accAttribute: '2',
      }
    ]
    return false;
  }
  const index = getCurrentRowIndex();
  if (index === -1) return;
  financeData.value.splice(index, 1);
  renumberSortNum();
}

/** 复制行 */
function copyLine() {
  Session.set('copyVoucherRows', [currentRow.value])
}

/** 粘贴行 */
function pasteLine() {
  if (!copiedRow.value) {
    return proxy.$message.warning('请先复制行');
  }
  const index = getCurrentRowIndex();
  const newRows = handleCopy();
  if (index === -1) {
    financeData.value.splice(financeData.value.length, 0, ...newRows);
  } else {
    financeData.value.splice(index, 1, ...newRows);
    financeData.value = [...financeData.value]
  }
  renumberSortNum();
}
// 处理粘贴数据
function handleCopy() {
  const data = Session.get('copyVoucherRows') || []
  let copyData = []
  data.forEach(it => {
    if(it.accAttribute === '2') {
      it.detailSingleVOList && it.detailSingleVOList.forEach(item => {
        delete item.id
        delete item.assId
        item.cashflowList = []
        item.diffanalyList = []
      })
      let row = {
        sortNum: it.sortNum,
        commonDebitAmount: it.commonDebitAmount,
        commonCreditAmount: it.commonCreditAmount,
        detailSingleVOList: it.detailSingleVOList,
        explanation: it.explanation,
        accasoaId: it.accasoaId,
        accasoaName: it.accasoaName,
        assCommonName: it.assCommonName,
        accAttribute: it.accAttribute,
      }
      copyData.push(row)
    }
  })
  return copyData;
}

function addSummary() {

}

function showBudget() {

}

function showColumn() {

}

function accountBalance() {

}

// ========== 借方/贷方互斥逻辑 ==========
function onDebitInput(num) {
  if(!currentRow.value.accasoaId) return proxy.$message.warning('请选择会计科目');
  if (Number(num) !== 0) {
    currentRow.value.commonCreditAmount = null;
  }
}

function onCreditInput(num) {
  if(!currentRow.value.accasoaId) return proxy.$message.warning('请选择会计科目');
  if (Number(num) !== 0) {
    currentRow.value.commonDebitAmount = null;
  }
}

function onBlurInput(num, key) {
  console.log('----------失焦', num)
  let keys = key === 'commonDebitAmount' ? 'debitAmount' : 'creditAmount'
  if(currentRow.value.detailSingleVOList?.length === 1) {
    currentRow.value.detailSingleVOList[0][keys] = num;
  }
}

// ========== 末尾添加一行 ==========
function addFinancialRow() {
  financeData.value.push({
    sortNum: financeData.value.length + 1,
    commonDebitAmount: '',
    commonCreditAmount: '',
    explanation: financeData.value[financeData.value.length - 1].explanation,
    detailSingleVOList: [],
    accasoaName: '',
    assCommonName: '',
    accAttribute: '2',
  });
}

function deleteFinancialRow(row) {
  if (financeData.value.length <= 1) return;
  financeData.value = financeData.value.filter((item) => item !== row);
  renumberSortNum();
}

function seachSummary(row, index) {
  selectorInfo.type = "accountingBook";
  selectorInfo.query = {};
  selectorInfo.callback = (data) => {
    row.explanation = data.name;
  };
  selectorInfo.visible = true;
}

function seachAccasoa(row, index) {
  selectorInfo.type = "Account";
  // selectorInfo.onlyLeaf = true;
  selectorInfo.defaultSelected = row.accasoaId;
  selectorInfo.query = {
    accbookId:  props.formData.accbookId,
    isLastversion: true,
    accAttribute: '2'
  };
  selectorInfo.callback = (data) => {
    row.accasoaId = data?.id;
    row.accasoaName = data?.dispname;
    row.assCommonName = '';
    row.detailSingleVOList = []
    // 重置科目 --- 检查是否打开辅助弹框
    auxiliaryDiaAccounting(row)
  };
  selectorInfo.visible = true;
}

const querySearch = (queryString, cb) => {
  autocompleteOpen.value = true;
  const results = queryString
      ? props.accasoaList.filter((it) => (it.dispname.includes(queryString) && it.accAttribute === '2'))
      : []
  cb(results)
}

const handleSelect = (item, row) => {
  autocompleteOpen.value = false;
  currentRow.value = row;
  currentRow.value.accasoaName = item.dispname;
  currentRow.value.accasoaId = item.id;
  currentRow.value.assCommonName = '';

  // 重置科目 --- 检查是否打开辅助弹框
  auxiliaryDiaAccounting(row)
  financialTableRef.value?.setCurrentRow(currentRow.value)
}

function auxiliaryDiaAccounting(row, index) {
  if(!row.accasoaId) return proxy.$message.warning('请选择会计科目');


  openOuxiliary(row)
}

// 打开辅助核算
function openOuxiliary(row) {
  if(!row || !row.accasoaId) return false
  auxiliary.value.data = row.detailSingleVOList || [];
  auxiliary.value.totalMoney = row.commonDebitAmount || row.commonCreditAmount;
  auxiliary.value.assVoList = props.accasoaList.filter(it => it.id === row.accasoaId)[0].accassList
  if(auxiliary.value.assVoList.length === 0) return false
  auxiliary.value.visible = true;
}



function onAuxiliaryAccountingConfirm(data) {
  console.log("辅助核算确认数据:", data);
  /**
   * 合并  辅助核算方式
   * **/
  // let debit = tatolAmount(data, 'debitAmount')     //  借
  // let credit = tatolAmount(data, 'creditAmount')     //  贷
  // currentRow.value.commonDebitAmount = debit
  // currentRow.value.commonCreditAmount = credit
  // currentRow.value.detailSingleVOList = [...data];

  /**
   * 拆分  辅助核算方式
   * **/
  splitAssVo(data)



  renumberSortNum();
}

function splitAssVo(data) {
  if (!data.length) return;
  currentRow.value.commonDebitAmount = data[0].debitAmount
  currentRow.value.commonCreditAmount = data[0].creditAmount
  currentRow.value.assCommonName = data[0].assVOList.reduce((all, cur) => {
    all += `${cur.assValueName}`
    return all;
  }, '')
  currentRow.value.detailSingleVOList = [data[0]];

  // 其余选中值插入到点击行的下侧
  const rest = data.slice(1);
  if (rest.length) {
    const assVos = splicingEntry(rest, currentRow.value);
    const insertAt = financeData.value.indexOf(currentRow.value);
    if (insertAt > -1) {
      financeData.value.splice(insertAt + 1, 0, ...assVos);
    }
  }
}

function splicingEntry(data, row) {
  return data.map((it) => {
    const newRow = deepClone(row);
    delete newRow._X_ROW_KEY;
    newRow.commonDebitAmount = it.debitAmount;
    newRow.commonCreditAmount = it.creditAmount;
    newRow.assCommonName = it.assVOList.reduce((all, cur) => {
      all += `${cur.assValueName}`
      return all;
    }, '')
    newRow.detailSingleVOList = [it];
    return newRow;
  });
}


function tatolAmount(data, key) {
  return data.reduce((sum, item) => {
    const num = parseFloat(item[key]) || 0;
    return sum + num;
  }, 0);
}


/**
 * 处理可编辑单元格中的键盘事件
 * ↑ ↓ ← → 切换到有值单元格时先全选内容；
 * 再次同方向 ← → 光标移到内容首/尾，之后允许在内容中自由左右移动；
 * 光标已在最左再次 ← 或已在最右再次 → 才跳转到相邻单元格。
 * 跨行时自动高亮目标行。
 */
function handleKeydown(event, rowIndex, field, row) {
  // autocomplete 下拉打开时，键盘事件交给下拉选项使用，不拦截
  if (autocompleteOpen.value) return;

  const keyMap = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    Enter: [1, 0],
  };

  //  空格
  if(event.key === ' ') {
    event.preventDefault();
    event.stopPropagation();
    return spaceBar(rowIndex, field, row)
  }
  //  等于
  if(event.key === '=') {
    event.preventDefault();
    event.stopPropagation();
    return equalToEvent(rowIndex, field, row)
  }
  const delta = keyMap[event.key];
  if (!delta) return;

  const [dx, dy] = delta;
  // ———— 左右方向：全选 → 边缘 → 自由移动 → 跳转 ————
  if (dy === 0 && dx !== 0) {
    const input = event.target;
    if (input && input.tagName === 'INPUT') {
      const val = input.value || '';
      // number 类型 input 浏览器不暴露 selectionStart/selectionEnd（返回 null），
      // 无法判断光标是否位于首/尾，因此左右键始终跳转到相邻单元格
      if (input.type !== 'number') {
        const { selectionStart, selectionEnd } = input;
        const isEmpty = val.length === 0;
        const isAllSelected = selectionStart === 0 && selectionEnd === val.length;

        if (isEmpty) {
          // 空内容直接跳转
        } else if (isAllSelected) {
          // ① 刚切过来全选状态 → 光标移到内容首/尾
          event.preventDefault();
          event.stopPropagation();
          if (dx === -1) {
            input.setSelectionRange(0, 0);
          } else {
            input.setSelectionRange(val.length, val.length);
          }
          return;
        } else if (dx === -1) {
          // ←：光标已在最左 → 跳转；否则浏览器正常移动光标
          const isAtStart = selectionStart === 0 && selectionEnd === 0;
          if (!isAtStart) return;
        } else {
          // →：光标已在最右 → 跳转；否则浏览器正常移动光标
          const isAtEnd = selectionStart === val.length && selectionEnd === val.length;
          if (!isAtEnd) return;
        }
      }
    }
  }

  event.preventDefault();
  event.stopPropagation();

  const colIndex = editableFields.indexOf(field);
  let newRow = rowIndex + dy;
  let newCol = colIndex + dx;

  // 左右跨行边界处理：
  //   ← 已在行首 → 跳转到上一行行尾
  //   → 已在行尾 → 跳转到下一行行首
  if (dx === -1 && newCol < 0) {
    if (rowIndex > 0) {
      newRow = rowIndex - 1;
      newCol = editableFields.length - 1;
    } else {
      return; // 已是首行首列
    }
  }
  if (dx === 1 && newCol >= editableFields.length) {
    if (rowIndex < financeData.value.length - 1) {
      newRow = rowIndex + 1;
      newCol = 0;
    } else {
      return; // 已是末行末列
    }
  }

  // 上下边界检查
  if (newRow < 0 || newRow >= financeData.value.length) return;

  const targetField = editableFields[newCol];
  const targetRow = financeData.value[newRow];
  const rowChanged = newRow !== rowIndex;

  // 跨行时：高亮目标行
  if (rowChanged) {
    const table = financialTableRef.value;
    if (table) {
      table.setCurrentRow(targetRow);
    }
    currentRow.value = targetRow;
    // 导航到末尾行时自动追加新行
    if (financeData.value.length - 1 === newRow) {
      addFinancialRow();
    }
  }

  nextTick(() => {
    focusCellInput(newRow, targetField);
  });
}

/** 空格 */
function spaceBar(index, key, row) {
  // 借贷互斥：把当前字段金额移到对面字段，当前字段清空
  if(key === 'commonDebitAmount') {
    if(row.commonDebitAmount) {
      row.commonCreditAmount = -row.commonDebitAmount
      row.commonDebitAmount = null
    } else {
      row.commonDebitAmount = -row.commonCreditAmount
      row.commonCreditAmount = null
    }

  }
  if(key === 'commonCreditAmount') {
    if(row.commonCreditAmount) {
      row.commonDebitAmount = -row.commonCreditAmount
      row.commonCreditAmount = null
    } else {
      row.commonCreditAmount = -row.commonDebitAmount
      row.commonDebitAmount = null

    }

  }
}

/** 等于 */
function equalToEvent(rowIndex, key, row) {
  let budDebitMoney = 0;
  let budCreditMoney = 0;

  //  计算预算  借贷方总金额
  financeData.value.forEach((it, index) => {
    if(index !== rowIndex) {
      budDebitMoney += it.commonDebitAmount
      budCreditMoney += it.commonCreditAmount
    }
  })
  // 计算金额相差金额
  row[key] = key === "commonCreditAmount" ? (budCreditMoney - budDebitMoney) : (budDebitMoney - budCreditMoney);
  if(key === 'commonDebitAmount') {
    row['commonCreditAmount'] = null
  } else if(key === 'commonCreditAmount') {
    row['commonDebitAmount'] = null
  }
}

/** 聚焦指定行列单元格内的 input */
function focusCellInput(rowIndex, field) {
  const table = financialTableRef.value;
  if (!table) return;

  const tableEl = table.$el;
  if (!tableEl) return;

  // 通过 getColumns 找到目标列的视觉索引
  const columns = table.getColumns();
  const colIndex = columns.findIndex((col) => col.field === field);
  if (colIndex === -1) return;

  // 定位目标行
  const rowEls = tableEl.querySelectorAll('.vxe-body--row');
  const rowEl = rowEls[rowIndex];
  if (!rowEl) return;

  // 定位目标列对应的单元格
  const colEls = rowEl.querySelectorAll('.vxe-body--column');
  const cellEl = colEls[colIndex];
  if (!cellEl) return;

  // 聚焦该单元格内的第一个 input
  const input = cellEl.querySelector('input');
  if (input) {
    input.focus();
    input.select();
  }
}


defineExpose({
  openOuxiliary,
});
</script>

<style lang="scss" scoped>
.voucher-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.top-tag {
  &::after {
    content: "";
    width: 0;
    height: 0;
    display: inline-block;
    border-right: 25px solid #165dff;
    border-bottom: 23px solid transparent;
    position: absolute;
    right: 0;
    top: 0;
  }

  .tag-letter {
    position: absolute;
    right: 1px;
    top: 1px;
    color: #fff;
    z-index: 10;
    font-size: 14px;
    display: inline-block;
    line-height: 14px;
  }
}
.budget {
  &::after {
    border-right: 25px solid #e73535;
    border-bottom: 23px solid transparent;
  }
}
:deep(.vxe-header--column),
:deep(.vxe-body--column) {
  padding: 4px 0;
}
:deep(.vxe-header--column>.vxe-cell) {
  min-height: 23px !important;
  line-height: 23px;
}
:deep(.vxe-header--column>.vxe-cell),
:deep(.vxe-body--column>.vxe-cell) {
  height: auto !important;
  display: block;
  padding: 0 12px !important;
}
.btnStyle {
  color: #e73535;
  cursor: pointer;
}
:deep(.vxe-body--column>.vxe-cell) {
  min-height: 28px !important;
  line-height: 28px;
}
.inputVoucherRinght :deep(.el-input__inner) {
  text-align: right !important;
}

/* 隐藏 number 类型 input 的上下箭头（spinner） */
:deep(input[type='number']) {
  text-align: right;
  appearance: textfield;
  -moz-appearance: textfield;
}
:deep(input[type='number']::-webkit-outer-spin-button),
:deep(input[type='number']::-webkit-inner-spin-button) {
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
}
</style>
