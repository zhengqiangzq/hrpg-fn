<template>
  <div class="view-fill">
    <div v-if="!modifyInfo.visible" class="app-container-flex">
      <NewFullScreen
        v-model="showDialog"
        :title="'平行记账规则详情'"
        :btn-list="fullInfo.btnList"
        :needReturn="!$route.query.processInstanceId"
        @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button @click="update">编辑</el-button>
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
            <p>对照关系</p>
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
                :is-row-click-select="true"
                :isDynamic="true"
              >
                <template v-slot:col-afterPrice="scope">
                  <p>{{ $fn.TripartiteMethod(scope.row.afterPrice) ?? '' }}</p>
                </template>
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

<script setup>
const modify = defineAsyncComponent(() => import('./modify'))
import { parallelAccountRuleGetbyId } from '@/api/rulesAndInitial/parallelAccountRule'
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
      label: '规则编码',
      value: 'code',
    },
    {
      label: '规则名称',
      value: 'name',
    },
    {
      label: '规则类型',
      value: 'typeValue',
    },
    {
      label: '分录生成规则',
      value: 'genRuleValue',
    },
    {
      label: '规则说明',
      value: 'remark',
    },
  ],
  labelWidth: '130px',
})
const fullInfo = ref({
  btnList: [{ value: 'button', type: 'slot' }],
})
// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  fieldList: [
    {
      label: '来源科目',
      value: 'sourceAccasoaName',
    },
    {
      label: '来源辅助核算',
      value: 'sourceAssValue',
    },
    {
      label: '来源方向',
      value: 'sourceDirectionValue',
    },
    {
      label: '目的科目',
      value: 'targetAccasoaName',
    },
    {
      label: '目的辅助核算',
      value: 'targetAssValue',
    },
    {
      label: '目的方向',
      value: 'targetDirectionValue',
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
onMounted(() => {
  if (props.id) {
    getMain()
  }
})
function returnBack() {
  emit('returnBack', false)
}
function update() {
  modifyInfo.value.title = '修改平行记账规则'
  modifyInfo.value.id = basicInfo.value.data.id
  modifyInfo.value.visible = true
}
function getMain() {
  parallelAccountRuleGetbyId(props.id, 'parallelAccountRule:detail').then(
    (resp) => {
      if (resp && resp.success) {
        basicInfo.value.data = resp.data
        tableInfo.value.data = resp.data.detailVOList
      }
    },
  )
}
function returnModify() {
  getMain()
}
</script>
