<template>
  <div class="view-fill">
    <div v-if="!modifyInfo.visible" class="app-container-flex">
      <NewFullScreen
        v-model="showDialog"
        :btn-list="fullInfo.btnList"
        :title="'账龄区间详情'"
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
          <div class="model-panel-title"><p>默认信息</p></div>
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
import { agingRangeSetGetbyId } from '@/api/rulesAndInitial/agingRangeSetting'
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
    { label: '账龄编码', value: 'code' },
    { label: '账龄名称', value: 'name' },
    { label: '时间单位', value: 'unitName' },
    { label: '单位天数', value: 'day' },
    { label: '启用状态', value: 'statusValue' },
    { label: '备注', value: 'remark' },
  ],
  labelWidth: '130px',
})

const fullInfo = ref({ btnList: [{ value: 'button', type: 'slot' }] })

const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  fieldList: [
    { label: '账期描述', value: 'agingDesc' },
    { label: '账期开始', value: 'agingStart' },
    { label: '账期结束', value: 'agingEnd' },
    { label: '账期总数', value: 'agingTotal' },
  ],
})

const modifyInfo = ref({ visible: false, title: '', id: '' })
const canUpdate = computed(() => proxy.$permission('agingRangeSetting:update')&&(basicInfo.value.data.status === '0'))

onMounted(() => {
  getMain()
})

function getMain() {
  if (props.id) {
    agingRangeSetGetbyId(props.id,'agingRangeSetting:detail').then((res) => {
      basicInfo.value.data = res.data
      tableInfo.value.data = res.data.detailList
    })
  }
}
function returnBack() {
  emit('returnBack', false)
}
function update() {
  modifyInfo.value.title = '修改账龄区间'
  modifyInfo.value.id = basicInfo.value.data.id
  modifyInfo.value.visible = true
}
function returnModify() {
  getMain()
}
</script>
