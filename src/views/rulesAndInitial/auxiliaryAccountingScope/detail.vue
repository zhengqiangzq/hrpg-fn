<template>
  <div class="view-fill">
    <div v-if="!modifyInfo.visible" class="app-container-flex">
      <NewFullScreen
        v-model="showDialog"
        :btn-list="fullInfo.btnList"
        :title="'辅助核算范围控制详情'"
        :needReturn="!$route.query.processInstanceId"
        @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button v-if="canUpdate" @click="update">编辑</el-button>
        </template>
        <div class="model-panel">
          <div class="model-panel-title"><p>基本信息</p></div>
          <div class="model-panel-body">
            <basic-information
              :info="basicInfo"
              :label-width="basicInfo.labelWidth"
            />
          </div>
        </div>
        <div class="model-panel">
          <div class="model-panel-title"><p>控制规则</p></div>
          <div class="model-panel-body">
            <div style="margin-bottom: 8px">
              <span> 条件显示名称： </span>
              <div class="w-full" style="display: inline-block; width: 94%">
                <el-input :value="resultStr" disabled></el-input>
              </div>
            </div>
            <page-table
              :refresh="tableInfo.refresh"
              :init-curpage="tableInfo.initCurpage"
              v-model:data="tableInfo.data"
              :field-list="tableInfo.fieldList"
              :pager="false"
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
import { auxiliaryAccountingScopeGetbyId } from '@/api/rulesAndInitial/auxiliaryAccountingScope'
const modify = defineAsyncComponent(() => import('./modify'))
const { proxy } = getCurrentInstance()
const emit = defineEmits(['update:visible', 'returnBack'])
const props = defineProps(['visible', 'id'])

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
    {
      label: '核算账簿',
      value: 'accbookName',
    },
    {
      label: '科目表',
      value: 'accchartName',
    },
    {
      label: '会计科目',
      value: 'accasoaName',
    },
    {
      label: '控制维度',
      value: 'dimName',
    },
    {
      label: '启用状态',
      value: 'statusValue',
    },
    {
      label: '备注',
      value: 'remark',
    },
  ],
  labelWidth: '130px',
})

const fullInfo = ref({ btnList: [{ value: 'button', type: 'slot' }] })

const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  fieldList: [
    {
      label: '左括号',
      value: 'leftBracketValue',
    },
    {
      label: '名称',
      value: 'fieldName',
    },

    {
      label: '逻辑运算符',
      value: 'operatorValue',
    },
    {
      label: '条件值',
      value: 'fieldValueName',
    },
    {
      label: '右括号',
      value: 'rightBracketValue',
    },
    {
      label: '满足',
      value: 'logicalOperatorValue',
    },
  ],
})

const modifyInfo = ref({ visible: false, title: '', id: '' })
const canUpdate = computed(() => {
  return (
    proxy.$permission('auxiliaryAccountingScope:update') &&
    basicInfo.value.data.status == '0'
  )
})
const resultStr = computed(() => {
  console.log('翻页翻页')

  // 1. 安全检查，防止 data 为空报错
  if (!tableInfo.value?.data) return ''
  const parts = tableInfo.value.data.map((row) => {
    const left = row.leftBracketValue || ''
    const factor = row.fieldName || ''
    // 逻辑运算符，出现在...之间这种带有3个省略号的，需要将省略号替换成条件值
    const operator = row.operatorValue
    let isEllip = operator.includes('...')
    // 下拉引用的翻译值存在fieldValueName中；多选数组兜底用顿号拼接
    let condVal = row.fieldValueName || ''
    if (Array.isArray(condVal)) condVal = condVal.join(',')

    let finalOperator = ''
    if (isEllip) {
      finalOperator = operator.replace(/\.+/g, condVal)
    }
    const right = row.rightBracketValue || ''
    const query = row.logicalOperatorValue || ''
    // 3. 拼接 (去掉了多余的 + 号字符串，直接用空格分隔可能更美观，看你需求)
    if (isEllip) {
      return `${left}${factor}${finalOperator}${right}${query}`
    } else {
      return `${left}${factor}${operator}${condVal}${right}${query}`
    }
  })

  // 4. 过滤掉空字符串，避免产生多余的空格
  return parts.filter((item) => item.trim() !== '').join('')
})
onMounted(() => {
  getMain()
})

function getMain() {
  auxiliaryAccountingScopeGetbyId(
    props.id,
    'auxiliaryAccountingScope:detail',
  ).then((res) => {
    basicInfo.value.data = res.data
    tableInfo.value.data = res.data.detailVOList
  })
}
function returnBack() {
  emit('returnBack', false)
}
function update() {
  modifyInfo.value.title = '修改辅助核算范围控制'
  modifyInfo.value.id = basicInfo.value.data.id
  modifyInfo.value.visible = true
}
function returnModify() {
  getMain()
}
</script>
