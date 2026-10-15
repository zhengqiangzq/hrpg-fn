<template>
  <div class="view-fill">
    <div v-if="!modifyInfo.visible" class="app-container-flex">
      <NewFullScreen
        v-model="showDialog"
        :title="'辅助核算默认设置详情'"
        :btn-list="fullInfo.btnList"
        :needReturn="!$route.query.processInstanceId"
        @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button v-if="canUpdate" @click="update">编辑</el-button>
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
            <p>默认信息</p>
          </div>
          <div class="model-panel-body">
            <div class="flex_full_item">
              <page-table
                :refresh="tableInfo.refresh"
                :init-curpage="tableInfo.initCurpage"
                v-model:data="tableInfo.data"
                :field-list="tableInfo.fieldList"
                :pager="false"
                :check-box="false"
                :tab-index="true"
                :isDynamic="true"
                :is-row-click-select="true"
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

<script setup>
import { defineAsyncComponent } from 'vue'
import NewFullScreen from '@/components/NewFullScreen/index.vue'
import { defaultAuxiliarySettingGetbyId } from '@/api/rulesAndInitial/defaultAuxiliarySetting'
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
      label: '科目表',
      value: 'accchartName',
    },
    {
      label: '会计科目',
      value: 'accasoaName',
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

const fullInfo = ref({
  btnList: [{ value: 'button', type: 'slot' }],
})

const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  fieldList: [],
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
    proxy.$permission('defaultAuxiliarySetting:update') &&
    basicInfo.value.data.status === '0'
  )
})

onMounted(() => {
  getMain()
})
function objToArr(rowArr) {
  let obj = {}
  rowArr.forEach((item, index) => {
    obj[`${index + 1}:${item.accassitemId}`] = item.assValueName
      ? `【${item.accassitemName}:${item.assValueName}】`
      : ''
    obj[`${index + 1}:${item.accassitemId}Value`] = item.assValue
      ? item.assValue
      : ''
  })
  return obj
}
function getMain() {
  tableInfo.value.data = []
  tableInfo.value.fieldList = []
  defaultAuxiliarySettingGetbyId(
    props.id,
    'defaultAuxiliarySetting:detail',
  ).then((res) => {
    if (res && res.success) {
      basicInfo.value.data = res.data
      if (res.data.detailVOList.length > 0) {
        // 1.直接取反参里面取表头 不调接口查，先这样写，有问题再改成接口查
        res.data.detailVOList[0].assVOs.forEach((item, index) => {
          tableInfo.value.fieldList.push({
            label: item.accassitemName,
            value: index + 1 + ':' + item.accassitemId,
          })
        })
      }
      res.data.detailVOList.forEach((item) => {
        // 获取每一行的数据
        tableInfo.value.data.push(objToArr(item.assVOs))
      })
    }
  })
}

function returnBack() {
  emit('returnBack', false)
}

function update() {
  modifyInfo.value.title = '修改辅助核算默认'
  modifyInfo.value.id = basicInfo.value.data.id
  modifyInfo.value.visible = true
}

function returnModify() {
  getMain()
}
</script>
