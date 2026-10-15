<template>
  <div class="view-fill">
    <div v-if="!modifyInfo.visible" class="app-container-flex">
      <NewFullScreen
        v-model="showDialog"
        :title="'常用凭证详情'"
        :btn-list="fullInfo.btnList"
        :needReturn="!$route.query.processInstanceId"
        @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button v-if="canUpdate && !$fn.getIsOtherOrg()" @click="update"
            >编辑</el-button
          >
        </template>
        <div class="model-panel">
          <div class="model-panel-title">
            <p>基本信息</p>
          </div>
          <div class="model-panel-body">
            <basic-information
              :info="basicInfo"
              :label-width="basicInfo.labelWidth"
            >
            </basic-information>
          </div>
        </div>

        <div class="model-panel">
          <div class="model-panel-title">
            <p>分录明细</p>
          </div>
          <div class="model-panel-body">
            <div class="flex_full_item">
              <page-table
                :refresh="tableInfo.refresh"
                :init-curpage="tableInfo.initCurpage"
                v-model:data="tableInfo.data"
                :pager="false"
                :field-list="tableInfo.fieldList"
                :check-box="false"
                :tab-index="true"
              />
            </div>
          </div>
        </div>
      </NewFullScreen>
    </div>
    <modify
      v-if="modifyInfo.visible"
      v-model:visible="modifyInfo.visible"
      :id="modifyInfo.id"
      :title="modifyInfo.title"
      @returnModify="returnModify"
    />
  </div>
</template>

<script setup>
import { commonVoucherGetbyId } from '@/api/ledger/commonVoucher'
import { defineAsyncComponent } from 'vue'

const modify = defineAsyncComponent(() => import('./modify'))
const { proxy } = getCurrentInstance()
const emit = defineEmits()
const props = defineProps(['visible', 'id'])
const basicInfo = ref({
  data: {},
  fieldList: [
    {
      label: '核算账簿',
      value: 'accbookName',
    },
    {
      label: '常用凭证编码',
      value: 'code',
    },
    {
      label: '常用凭证名称',
      value: 'name',
    },
    {
      label: '常用凭证属性',
      value: 'propertyName',
    },
    {
      label: '凭证类别',
      value: 'voucherTypeName',
    },
  ],
  labelWidth: '130px',
})
const fullInfo = ref({
  btnList: [{ value: 'button', type: 'slot' }],
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  fieldList: [
    {
      label: '摘要',
      value: 'explanation',
    },
    {
      label: '会计科目',
      value: 'accountName',
    },
    {
      label: '辅助核算',
      value: 'assName',
    },
    {
      label: '借方',
      value: 'debitAmount',
    },
    {
      label: '贷方',
      value: 'creditAmount',
    },
  ],
})
const modifyInfo = ref({
  visible: false,
  title: '',
  id: '',
})

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue)
  },
})

const canUpdate = computed(() => {
  return (
    proxy.$permission('commonVoucher:update') 
  )
})

onMounted(() => {
  getMain()
})

function returnBack() {
  emit('returnBack', false)
}

function update() {
  modifyInfo.value.title = '修改常用凭证'
  modifyInfo.value.id = basicInfo.value.data.id
  modifyInfo.value.visible = true
}


function getMain() {
   commonVoucherGetbyId(props.id, "commonVoucher:detail").then((resp) => {
    if (resp && resp.success) {
      basicInfo.value.data = resp.data;
      tableInfo.value.data = resp.data.detailVOList;
    }
  });
}

function returnModify() {
  getMain()
}

</script>

<style scoped></style>
