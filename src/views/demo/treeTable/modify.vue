<template>
  <ModifyPage ref="pageRef" flex v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm :form-info="formInfo" :listTypeInfo="formInfo.listType">
      <template #form-deptName="{ row }">
        <el-input
            v-model="formInfo.data.deptName"
            style="width: 100%"
            class="not-mongolia"
            :required="true"
            :disabled="true"
            placeholder="请选择科室"
        >
          <template #append>
            <el-icon @click="selectDept(row)"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
    <ModifyTable class="table-box" :table-info="tableInfo" @handleEvent="tableHandler">

      <template #col-settlementMethodName="{ row }">
        <el-input
            v-model="row.settlementMethodName"
            style="width: 100%"
            class="not-mongolia"
            :required="true"
            :disabled="true"
            placeholder="请选择结算方式"
        >
          <template #append>
            <el-icon @click="selectSettlementMethod(row)"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyTable>
  </ModifyPage>
  <select-data ref="selectorRef" />
</template>
<script setup>
import {computed, getCurrentInstance, onMounted, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {useSelectData} from "@/hooks/useSelectData";
const { proxy } = getCurrentInstance();
const API = {
  add: null,
  update: null,
  detail: null,
}
const emit = defineEmits(['returnModify'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: '',
  },
  batch: {
    type: Boolean,
    default: false,
  },
})

const { selectorInfo, selectorRef } = useSelectData()
const pageBtn = ref([
  { label: '保存并新增', event: saveAndAdd, show: props.batch }
])
const pageRef = ref()
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    // 更新父组件visible
    emit('update:visible', newValue)
  },
})
const formInfo = ref({
  modifyFormRef: null,
  title: '基础信息',
  labelWidth: '120px',
  listType: {
    dataType: [{ key: '已结算', value: '1' }, { key: '未结算', value: '2' }],
  },
  fieldList: [
    { label: '账户编码', value: 'code', type: 'input', disabled: !!props.id },
    { label: '账户名称', value: 'name', type: 'input' },
    { label: '科室信息', value: 'deptName', type: 'slot' },
    { label: '期初金额', value: 'balance', type: 'money', disabled: true },
    { label: '拆分方法', value: 'way', type: 'select-model', code: 'cost_split_method'},
    { label: '结算状态', value: 'status', type: 'select', list: 'dataType'},
    { label: '备注', value: 'remark', type: 'textarea' },
  ],
  rules: {
  },
  data: {}
})
const tableInfo = ref({
    title: '明细信息',
  filterbtn: [
    { type: 'button', btType: 'primary', label: '增加行', event: () => addTabData() },
    { type: 'button', label: '删除行', disabled: () => deleteRowDisabled(), event: () => deleteTabData() },
  ],
  fieldList: [
    { label: '交易日期', value: 'businessTime', type: 'date', required: true, valueFormat: 'YYYY-MM-DD 00:00:00', rules: [{ required: true, message: '请选择业务日期' }] },
    { label: '摘要', value: 'summary', type: 'input', required: true, rules: [{ required: true, message: '请输入摘要' }] },
    { label: '收款金额', value: 'inMoney', type: 'money', align: 'right', required: true },
    { label: '付款金额', value: 'outMoney', type: 'money', align: 'right' },
    { label: '往来单位', value: 'businessPartners', type: 'input' },
    { label: '结算方式', value: 'settlementMethodName', type: 'slot' },
    { label: '票据号', value: 'billNum', type: 'input' },
    { label: '票据日期', value: 'billDate', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '删除',
        show: true,
        event: deleteTabData,
      },
    ]
  },
  summaryFieldList: [
  ],
  data: [],
  sectionRows: []
})
const deleteRowDisabled = computed(() => !tableInfo.value.sectionRows.length)

onMounted(() => {
  if (props.id) {
    initData()
  }
})

 function initData() {
  API.detail(props.id).then(({ data }) => {
    formInfo.value.data = data
    tableInfo.value.data = data.detail
  })
}

function addTabData() {
  tableInfo.value.data.push({
    summary: '新增一行',
  })
}

function deleteTabData(row) {
  const selections = row ? [row] : tableInfo.value.sectionRows
  tableInfo.value.data = tableInfo.value.data.filter(it => !selections.find(itt => itt === it))
}

function saveAndAdd() {
  pageRef.value.validate().then(res => {
    save(null, false)
  }).catch(err => {
    save(err)
  })
}
const save = (err, close = true) => {
  if (err) return
  if (!tableInfo.value.data.length) {
    proxy.$message.warning('请至少添加一行账单信息')
    return
  }
  const api = props.id ? API.update : API.add
  const form = {
    ...formInfo.value.data,
    table: tableInfo.value.data,
  }
  api(form).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      if (!close) {
        formInfo.value.data = {}
        return
      }
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

function tableHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function selectSettlementMethod(row) {
  selectorInfo.type = 'voucherType'
  selectorInfo.query = {
  }
  selectorInfo.callback = (data) => {
    row.settlementMethodId = data.id
    row.settlementMethodName = data.name
  }
  selectorInfo.visible = true
}
function selectDept(row) {
  selectorInfo.type = 'voucherType'
  selectorInfo.query = {
  }
  selectorInfo.callback = (data) => {
    row.deptId = data.id
    row.deptName = data.name
  }
  selectorInfo.visible = true
}
</script>
