<template>
  <page-dialog
    title="辅助核算"
    :visible="visible"
    width="1200px"
    :bt-list="btList"
    @reset="handleClose"
  >
    <new-page-filter :filter-btn="filterBtn" />
    <vxe-table
        ref="financialTableRef"
        border
        :data="tableInfo.data"
        :checkbox-config="{ checkField: '_checked' }"
        :column-config="{ resizable: true }"
        :row-config="{ isCurrent: true, isHover: true, drag: true, resizable: true }"
        :virtual-y-config="{ enabled: true }"
        :scroll-y="{ enabled: true, mode: 'wheel', gt: 10 }"
        :sort-config="{ multiple: true, trigger: 'cell' }"
        width='100%'
        height='500px'
        show-overflow
        highlight-current-row
        @cell-click="handleEvent"
    >
      <template v-for="(item, index) in slotFields">
        <vxe-column :title="item.label" :field="item.value" align="center">
          <template #default="{ row, $rowIndex }">
            <div @keydown.capture="handleKeydown($event, $rowIndex, item.value, row)">
              <el-input
                  v-model="row.assVOList[index]['assValueName']"
              >
                <template #append>
                  <el-icon @click="selectAcc(item, row, index, $rowIndex)"><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </template>
        </vxe-column>
      </template>
      <!-- 借方（数字输入） -->
      <vxe-column title="借方金额" field="debitAmount" align="center" width="150">
        <template #default="{ row, $rowIndex }">
          <div @keydown.capture="handleKeydown($event, $rowIndex, 'debitAmount', row)">
            <el-input
                type="text"
                class="inputVoucherRinght"
                v-model="row.debitAmount"
            />
          </div>
        </template>
      </vxe-column>

      <!-- 贷方（数字输入） -->
      <vxe-column title="贷方金额" field="creditAmount" align="center" width="150">
        <template #default="{ row, $rowIndex }">
          <div @keydown.capture="handleKeydown($event, $rowIndex, 'creditAmount', row)">
            <el-input
                type="text"
                class="inputVoucherRinght"
                v-model="row.creditAmount"
            />
          </div>
        </template>
      </vxe-column>
      <!-- 操作列 -->
      <vxe-column title="操作" width="120" align="center" fixed="right">
        <template #default="{ row, $rowIndex }">
          <span class="btnStyle" @click="copyRow(row, $rowIndex)">
            复制行
          </span>
          <span class="btnStyle" @click="delRow(row, $rowIndex)">
            删除
          </span>
        </template>
      </vxe-column>
    </vxe-table>
  </page-dialog>
  <select-data ref="selectorRef" />

  <!-- 快速分摊弹窗 -->
  <QuickAllocationDialog
    v-model:visible="quickAllocationVisible"
    @confirm="handleQuickAllocationConfirm"
  />

  <!-- 导入（无UI，通过 ref.open() 触发） -->
  <UploadImport
    ref="uploadImportRef"
    action="/fnNew/auxiliaryAccounting/importExcel"
    :import-params="importParams"
    :limit="1"
    @success="handleImportSuccess"
  />

  <!-- 导出弹窗 -->
  <page-dialog
    title="导出"
    :visible="exportDialogVisible"
    width="500px"
    :bt-list="exportBtList"
    @reset="exportDialogVisible = false"
  >
    <page-form
      :data="exportForm"
      :field-list="exportFieldList"
      :rules="rules"
      label-width="100px"
    />
  </page-dialog>
</template>

<script setup name="AuxiliaryAccounting">
import { getCurrentInstance, ref, watch, computed } from "vue";
import QuickAllocationDialog from "./quickAllocationDialog.vue";
import UploadImport from "./UploadImport.vue";
import {accountQueryServlet} from "@/api/base";
import {useSelectData} from "@/hooks/useSelectData";
import {deepClone} from "@/utils";

const { proxy } = getCurrentInstance();
const emits = defineEmits(["update:visible", "confirm"]);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  accbookId: {
    type: String,
    default: '',
  },
  money: {
    type: Number,
    default: null,
  },
  // 科目辅助项
  assVoList: {
    type: Array,
    default: () => []
  },
  data: {
    type: Array,
    default: () => []
  },
});

const { selectorInfo, selectorRef } = useSelectData();
// ========== 快速分摊弹窗 ==========
const quickAllocationVisible = ref(false);

// ========== 导入 ==========
const uploadImportRef = ref(null);
const importParams = ref({});

const codeValue = ref('')
const idValue = ref('')
const nameValue = ref('')

// ========== 导出弹窗 ==========
const exportDialogVisible = ref(false);
const exportForm = ref({ fileName: "" });
let exportType = ""; // 当前导出类型：template | data | archive

const exportFieldList = ref([
  {
    label: "文件名称",
    value: "fileName",
    type: "input",
    required: true,
    width: '100%'
  },
]);
const rules = ref({
  fileName: [{ required: true, message: "请输入文件名称", trigger: "blur" }],
});

const exportBtList = ref([
  { label: "确定", type: "primary", event: handleExportConfirm, show: true },
  { label: "取消", type: "default", event: () => { exportDialogVisible.value = false; }, show: true },
]);

// 导出按钮默认文件名
const exportDefaultNames = {
  template: "辅助核算导出模板",
  data: "辅助核算导出数据",
  archive: "辅助核算导出档案数据",
};

const currentRow = ref()


const tableInfo = ref({
  data: [],
  fieldList: [],
})

// ========== 底部按钮 ==========
const btList = ref([
  { label: "确定", type: "primary", event: handleConfirm, show: true },
  { label: "取消", type: "default", event: handleClose, show: true },
]);

// ========== 工具栏按钮 ==========
const filterBtn = ref([
  {
    type: "dropdown",
    label: "默认配置",
    children: [
      { label: "覆盖", command: "overwrite", show: true },
      { label: "增量", command: "increment", show: true },
    ],
    event: handleDefaultConfig,
    show: true,
  },
  {
    type: "button",
    label: "快速分摊",
    event: () => {
      quickAllocationVisible.value = true;
    },
    show: true,
  },
  { type: "button", label: "清空数据", event: handleClearData, show: true },
  {
    type: "button",
    label: "导入",
    event: () => {
      importParams.value = {
        aaa: '1212'
      }; // TODO: 按需传入业务参数
      uploadImportRef.value?.open();
    },
    show: true,
  },
  {
    type: "button",
    label: "导出模板",
    event: () => openExportDialog("template"),
    show: true,
  },
  {
    type: "button",
    label: "导出数据",
    event: () => openExportDialog("data"),
    show: true,
  },
  {
    type: "button",
    label: "导出档案数据",
    event: () => openExportDialog("archive"),
    show: true,
  },
  { type: "button", label: "新增一行", event: handleAddRow, show: true },
]);


const slotFields = computed(() =>
    tableInfo.value.fieldList.filter((item) => item.type === 'slot'),
)

watch(
    () => props.visible,
    (val) => {
      if (val) {
        initialization();
      }
    }
)

function initialization() {
  console.log('辅助核算项列表-----', props.assVoList)
  if(props.assVoList.length === 0) return false
  tableInfo.value.data = []
  tableInfo.value.fieldList = []
  let assVo = props.assVoList.map((it, index) => {
    return {
      type: 'slot',
      label: it.accassitemName,
      value: index + 1 + ':assValueName',
      accassitemId: it.accassitemId,
    }
  })
  tableInfo.value.fieldList = [
      ...assVo,
  ]
  tableInfo.value.data = props.data.length > 0 ? props.data : [getTableRow()]
  renumberDetailIndex()
}

// ========== 行操作 ==========
function handleAddRow() {
  tableInfo.value.data.push(getTableRow());
  renumberDetailIndex();
}

// 单行空数据
function getTableRow() {
  return {
    assVOList: getAssVoRow(props.assVoList),
    debitAmount: '',
    creditAmount: '',
    detailIndex: tableInfo.value.data.length + 1,
  }
}

// 重新编号 detailIndex，保证每行唯一且连续
function renumberDetailIndex() {
  tableInfo.value.data.forEach((row, i) => {
    row.detailIndex = i + 1;
  });
}

function getAssVoRow(data) {
  let assVOList = data.map(it => {
    return {
      accassitemCode: it.accassitemCode,
      accassitemName: it.accassitemName,
      accassitemId: it.accassitemId,
      assValueCode: '',
      assValueName: '',
      assValue: '',
    }
  })
  return assVOList
}

function handleClearData() {
  tableInfo.value.data = [getTableRow()];
  renumberDetailIndex();
}

function copyRow(row, index) {
  const newRow = deepClone(row);
  // 清除表格内部主键，避免复制出的行与源行 key 重复
  delete newRow._X_ROW_KEY;
  tableInfo.value.data.splice(index + 1, 0, newRow);
  renumberDetailIndex();
}

function delRow(row, index) {
  if(tableInfo.value.data.length === 1) {
    tableInfo.value.data = [getTableRow()]
  } else {
    // tableInfo.value.data = tableInfo.value.data.filter((item) => item !== row);
    tableInfo.value.data.splice(index, 1);
  }
  renumberDetailIndex();
}


function handleEvent(event, data) {
  console.log('辅助核算单选一行', event, data)
  currentRow.value = data;
}


function handleKeydown(event, rowIndex, field) {


}

async function selectAcc(item, row, index, rowIndex) {
  let params = {
    accbookId: props.accbookId || '',
    accassitemId: item.accassitemId,
  }
  const { data, code } = await accountQueryServlet(params)
  if(code === 200) {

    codeValue.value = data.queryFieldVOs.filter(it => it.isCode === '1')[0].code;
    idValue.value = data.queryFieldVOs.filter(it => it.isKey === '1')[0].code;
    nameValue.value = data.queryFieldVOs.filter(it => it.isName === '1')[0].code;

    let selectObject = {
      title: data.title,
      checkBox: true,
      component: data.refType === '1' ? 'tree' : data.refType === '3' ? 'supTreeTable' : '',
    }
    if(data.refType === '1') {
      selectObject.showCheckbox = true
      selectObject.data = data.resultData;
    } else if(data.refType === '2') {
      selectObject.checkBox = true
      let fieldList = []
      data.queryFieldVOs.map(it => {
        if(it.isShow === '1') {
          fieldList.push({
            label: it.name,
            value: it.code,
          })
        }
      })
      selectObject.fieldList = fieldList
      selectObject.defaultDate = data.resultData;
      selectObject.total = data.total
      selectObject.curPage = data.curPage
      selectObject.pageSize = data.pageSize
      selectObject.query = {
        ...params,
      }
    } else if(data.refType === '3') {
      selectObject.checkBox = true
      selectObject.defaultDate = data.resultData
      selectObject.checkBox = true
      selectObject.query = {
        ...params,
        refFieldCode: data.refFieldCode,
      }
      selectObject.clickParams = 'refFieldValue'
      selectObject.code = 'id'
      selectObject.tableDataName = 'resultData'
      selectObject.apiList = accountQueryServlet
    }

    selectObject.callback = (vals) => {
      tableBack(vals, row, index, rowIndex)
    }
    selectorRef.value.show(selectObject)
  }

}

function tableBack(data, row, index, rowIndex) {
  if (!data.length) return;

  // 第一个选中值填充当前（点击）行
  let codeName = `【${row.assVOList[index].accassitemName}：${data[0][codeValue.value]}/${data[0][nameValue.value]}】`
  row.assVOList[index].assValueCode = data[0][codeValue.value];
  row.assVOList[index].assValueName = codeName;
  row.assVOList[index].assValue = data[0][idValue.value];

  // 其余选中值插入到点击行的下侧
  const rest = data.slice(1);
  if (rest.length) {
    const assVos = splicingAssVo(rest, row, index);
    const insertAt = tableInfo.value.data.indexOf(row);
    if (insertAt > -1) {
      tableInfo.value.data.splice(insertAt + 1, 0, ...assVos);
    }
  }
  renumberDetailIndex();
  console.log('-----------辅助核算选择数据', row, tableInfo.value.data)
}

// 辅助核算拼接
function splicingAssVo(data, row, index) {
  return data.map((it) => {
    const newRow = deepClone(row);
    delete newRow._X_ROW_KEY;
    let codeName = `【${newRow.assVOList[index].accassitemName}：${it[codeValue.value]}/${it[nameValue.value]}】`
    newRow.assVOList[index].assValueCode = it[codeValue.value];
    newRow.assVOList[index].assValueName = codeName;
    newRow.assVOList[index].assValue = it[idValue.value];
    return newRow;
  });
}

// ========== 默认配置下拉 ==========
function handleDefaultConfig(command) {
  if (command === "overwrite") {
    proxy.$message.info("覆盖模式");
  } else if (command === "increment") {
    proxy.$message.info("增量模式");
  }
}

// ========== 确定 / 取消 ==========
function handleConfirm() {

  const assVoData = tableInfo.value.data.filter(it => it.debitAmount || it.creditAmount)
  console.log('-----------确定辅助核算弹框数据', assVoData)

  emits("confirm", assVoData);
  emits("update:visible", false);
}

function handleClose() {
  emits("update:visible", false);
}

// ========== 快速分摊确认 ==========
function handleQuickAllocationConfirm(data) {
  console.log("快速分摊数据:", data);
  // TODO: 根据 data 更新表格数据
  // data 包含：allocationAmount, ruleId, ruleName, details
  proxy.$message.success("快速分摊数据已应用");
}

// ========== 导入成功 ==========
function handleImportSuccess(response) {
  console.log("导入成功:", response);
  // TODO: 刷新表格数据
  // 如需要可在此处调用接口重新获取表格数据
}

// ========== 导出 ==========
function openExportDialog(type) {
  // "导出数据" 需要校验每行至少有一个借方或贷方金额
  if (type === "data") {
    const hasAmount = tableInfo.value.data.every(
      (row) => row.debitAmount || row.creditAmount
    );
    if (!hasAmount) {
      proxy.$message.warning("请填写金额");
      return;
    }
  }
  exportType = type;
  exportForm.value.fileName = exportDefaultNames[type];
  exportDialogVisible.value = true;
}

function handleExportConfirm() {
  if (!exportForm.value.fileName) {
    proxy.$message.warning("请输入文件名称");
    return;
  }
  // TODO: 根据 exportType 和 exportForm.value.fileName 调用导出接口
  proxy.$message.info(`${exportType} 导出功能待接口联调: ${exportForm.value.fileName}`);
  exportDialogVisible.value = false;
}
</script>

<style lang="scss" scoped>


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
  min-width: fit-content !important;
}
.btnStyle {
  color: #165dff;
  cursor: pointer;
}
:deep(.vxe-body--column>.vxe-cell) {
  min-height: 28px !important;
  line-height: 28px;
}
:deep(.el-date-editor) {
  min-width: fit-content;
}
:deep(.vxe-body--column>.vxe-cell) {
  min-height: 28px !important;
  line-height: 28px;
}
.inputVoucherRinght :deep(.el-input__inner) {
  text-align: right !important;
}
</style>
