<template>
  <div class="view-fill">
    <div v-if="!modifyInfo.visible" class="app-container-flex">
      <NewFullScreen
        v-model="showDialog"
        :btn-list="fullInfo.btnList"
        :title="'凭证类型约束规则详情'"
        :needReturn="true"
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
            <!-- form -->
            <basic-information
              :info="basicInfo"
            >
            </basic-information>
          </div>
        </div>

        <div class="model-panel">
          <div class="model-panel-title">
          <p>控制科目</p>
        </div>
          <div class="model-panel-body">
            <div class="flex_full_item">
              <!-- 表格 -->
              <page-table
                :refresh="tableInfo.refresh"
                :init-curpage="tableInfo.initCurpage"
                v-model:data="tableInfo.data"
                :pager="false"
                :field-list="tableInfo.fieldList"
                :check-box="false"
                :tab-index="true"
                :isDynamic="true"
              >
              </page-table>
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

<script setup name="voucherTypeConstraintDetail">
import {
  voucherTypeConstraintGetbyId,
} from '@/api/rulesAndInitial/voucherTypeConstraint'
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
      label: '凭证类型',
      value: 'voucherTypeName',
    },
    {
      label: '限制类型',
      value: 'limitTypeValue',
    },
    {
      label: '启用状态',
      value: 'statusValue',
    },
    {
      label: '规则说明',
      value: 'remark',
    },
  ],
})
const fullInfo = ref({
  btnList: [{ value: 'button', type: 'slot' }],
})
// 表格相关
const tableInfo = ref({
  data: [],
  fieldList: [
    {
      label: '会计科目',
      value: 'accasoaName',
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
    emit('update:visible', newValue) // 更新父组件visible
  },
})

const canUpdate = computed(() => {
  return (
    proxy.$permission('voucherTypeConstraint:update') &&basicInfo.value.data.status === '0'
  )
})

onMounted(() => {
  if(props.id){
    getMain()
  }
})
function returnBack() {
  emit('returnBack', false)
}
function update() {
  modifyInfo.value.title = '修改凭证类型约束规则'
  modifyInfo.value.id = basicInfo.value.data.id
  modifyInfo.value.visible = true
}
function getMain() {
voucherTypeConstraintGetbyId(props.id,'voucherTypeConstraint:detail').then((resp) => {
    if (resp && resp.success) {
      basicInfo.value.data = resp.data;
      tableInfo.value.data = resp.data.detailList;
    }
  })
}
// }
function returnModify() {
  getMain()
}
</script>

<style scoped></style>
