<template>
  <div class="view-fill">
    <div v-if="!modifyInfo.visible" class="app-container-flex">
      <NewFullScreen
        v-model="showDialog"
        :btn-list="fullInfo.btnList"
        :title="'科目交叉校验规则详情'"
        :needReturn="!$route.query.processInstanceId"
        @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button v-if="canUpdate" @click="update"
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
            />
          </div>
        </div>
        <div class="model-panel">
          <div class="model-panel-title"><p>控制明细</p></div>
          <div class="model-panel-body">
            <page-table
              :refresh="tableInfo.refresh"
              :init-curpage="tableInfo.initCurpage"
              v-model:data="tableInfo.data"
              :field-list="tableInfo.fieldList"
              :pager="false"
              :tabIndex="true"
              :check-box="false"
            />
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
import { defineAsyncComponent } from 'vue'
import { parallelAccountRuleGetbyId } from '@/api/rulesAndInitial/accountCrossCheckRule'
const modify = defineAsyncComponent(() => import('./modify'))
const { proxy } = getCurrentInstance()
const emit = defineEmits(['update:visible', 'returnBack'])
const props = defineProps(['visible', 'id','title'])

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue)
  },
})

const basicInfo = ref({
  data: {},
  fieldList: [
    { label: '核算账簿', value: 'accbookName' },
    { label: '会计科目', value: 'accasoaName' },
    { label: '辅助核算项', value: 'accassItemName' },
    { label: '启用状态', value: 'statusValue' },
    { label: '规则说明', value: 'remark' },
  ],
  labelWidth: '130px',
})

const fullInfo = ref({ btnList: [{ value: 'button', type: 'slot' }] })

const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  fieldList: [
    { label: '辅助核算项', value: 'accassitemCodeName' },
    { label: '辅助核算项值', value: 'ass' },
  ],
})

const modifyInfo = ref({ visible: false, title: '', id: '' })
const canUpdate = computed(() => proxy.$permission('accountCrossCheckRule:update')&&(basicInfo.value.data.status === '0'))

onMounted(() => {
  getMain()
})

function getMain() {
  if (props.id) {
    parallelAccountRuleGetbyId(props.id,'accountCrossCheckRule:detail').then((res) => {
      basicInfo.value.data = res.data
      tableInfo.value.data = res.data.detailList
    })
  }
}
function returnBack() {
  emit('returnBack', false)
}
function update() {
  modifyInfo.value.title = '修改科目交叉校验规则'
  modifyInfo.value.id = basicInfo.value.data.id
  modifyInfo.value.visible = true
}
function returnModify() {
  getMain()
}
</script>
