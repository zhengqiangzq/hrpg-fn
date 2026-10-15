<template>
  <ModifyPage v-show="!modifyInfo.visible" ref="pageRef" flex v-model:visible="showDialog" :title="title" :noFullButton="true" :btnList="pageBtn">
    <template #full-button>
      <el-button
          v-if="proxy.$permission('table:update')"
          type="primary"
          class="el-button el-button--medium filter-button"
          @click="openModify"
      >编辑</el-button
      >
    </template>
    <div class="model-panel">
      <div class="model-panel-title">
        <p>科目信息</p>
      </div>
      <div class="model-panel-body">
        <!-- form -->
        <basic-information
            :info="formInfo"
            :label-width="formInfo.labelWidth"
        >
        </basic-information>
      </div>
    </div>
    <ModifyTable class="table-box" title="日记账明细" :checkbox="false"  :table-info="tableInfo">
    </ModifyTable>
  </ModifyPage>
  <modify
      v-if="modifyInfo.visible"
      v-model:visible="modifyInfo.visible"
      :id="modifyInfo.id"
      :title="modifyInfo.title"
  />
</template>
<script setup>
import {computed, getCurrentInstance, onMounted, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import Modify from "./modify.vue";
const { proxy } = getCurrentInstance();
const API = {
  detail: null,
  update: null,
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
})

const pageBtn = ref([
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
  },
  fieldList: [
    { label: '账户编码', value: 'code' },
    { label: '账户名称', value: 'name' },
    { label: '账户信息', value: 'fundsCompareAccountName' },
    { label: '期初金额', value: 'balance' },
  ],
  rules: {
  },
  data: {}
})
const tableInfo = ref({
  btnList: [],
  fieldList: [
    { label: '交易日期', value: 'businessTime' },
    { label: '摘要', value: 'summary' },
    { label: '收款金额', value: 'inMoney', align: 'right' },
    { label: '付款金额', value: 'outMoney', align: 'right' },
    { label: '余额', value: 'balance', align: 'right'},
    { label: '内部对方账户', value: 'innerAccountName' },
    { label: '往来单位', value: 'businessPartners' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '票据号', value: 'billNum' },
    { label: '票据日期', value: 'billDate' },
  ],
  summaryFieldList: [
  ],
  data: [],
  sectionRows: []
})

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

const modifyInfo = ref({
  id: null,
  form: {},
  title: '新增资金日记账',
  visible: false
})

function openModify() {
  modifyInfo.value.id = props.id
  modifyInfo.value.visible = true
}
</script>

<style scoped lang="scss">
:deep(.model-panel-body) {
  padding: 10px!important;
}
</style>
