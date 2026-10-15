<template>
  <div class="content-box">
    <!-- 左侧树 -->
    <div class="left-container">
      <el-tree
        ref="treeRef"
        :data="treeData"
        node-key="id"
        :props="treeProps"
        default-expand-all
        highlight-current
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
      />
    </div>
    <!-- 右侧搜索/表单 + 表格 -->
    <div class="right-container">
      <NewPageFilter
        v-if="searchList.length"
        v-model:query="query"
        :filter-list="searchList"
      />
      <PageForm
        v-if="formList.length"
        :field-list="formList"
        :data="formData"
      />
      <DialogTable
        ref="tableRef"
        :refresh="refreshFlag"
        v-model:data="tableData"
        :pager="pager"
        :check-box="checkBox"
        :field-list="fieldList"
        :tab-index="tabIndex"
        :api="null"
        :query="query"
        :highlight-row="highlightRow"
        :reserveSelection="true"
        :checked-row-list="checkedRowList"
        :checkedList="checkedList"
        @handleEvent="handleEvent"
      />
      <!-- :api="listApi" -->
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import DialogTable from '@/components/DialogTable/index.vue'
import NewPageFilter from '@/components/NewPageFilter/index.vue'

const { proxy } = getCurrentInstance()
const store = useStore()

const emits = defineEmits(['update:modelValue', 'titleChange'])
const props = defineProps({
  modelValue: null,
  info: { type: Object, default: () => ({}) },
})

const treeRef = ref(null)
const tableRef = ref(null)

// ---- 选中行 ----
const selectRow = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val),
})

// ---- 树相关 ----
const treeData = ref([])
// 在 setup 阶段就合并 defaultProps，确保 el-tree 初次渲染就用正确的配置
const treeProps = ref({
  children: 'children',
  label: 'name',
  ...(props.info?.defaultProps || {}),
})
// newpagefilter数据
const formData = ref([])
// ---- 表格相关 ----
const tableData = ref([])
const refreshFlag = ref(1)
const query = ref({})
const fieldList = ref([])
const checkedRowList = ref([])
const checkedList = ref([])
// const listApi = ref(null)
const pager = ref(false)
const checkBox = ref(false)
const tabIndex = ref(false)
const highlightRow = ref(true)
const searchList = ref([])
const formList = ref([])
// 默认选中值
const defaultSelected = ref(null)
// 当前选中的树节点信息
const currentNode = ref(null)

// 选择模式：'table'（默认，选表格行）| 'tree'（选树节点，禁用表格点击）
const selectMode = ref('table')

watch(tableData, (val) => {
  if (!val?.length || !defaultSelected.value) return
  if (!checkBox.value) {
    // 单选模式：高亮当前行
    nextTick(() => {
      tableRef.value?.setCurrentRow(defaultSelected.value)
    })
  }
})
// ---- 初始化 ----
onMounted(() => {
  initConfig()
  loadTreeData()
})

/**
 * 初始化配置
 */
function initConfig() {
  const info = props.info || {}
  // 表格配置
  fieldList.value = info.fieldList || []
  pager.value = info.pager ?? false
  checkBox.value = info.checkBox ?? false
  tabIndex.value = info.tabIndex ?? false
  // 选择模式：tree 模式下禁用表格行高亮与点击
  selectMode.value = info.selectMode === 'tree' ? 'tree' : 'table'
  highlightRow.value =
    selectMode.value === 'tree' ? false : info.highlightRow !== false
  // disabledLevel / onlyLeaf → disabled 函数 + 自定义 class
  if (info.disabledLevel?.length) {
    treeProps.value.disabled = buildDisabledFn(info.disabledLevel)
    treeProps.value.class = (_data, node) => node.disabled ? 'disabledLevel' : ''
  } else if (info.onlyLeaf) {
    const childrenKey = treeProps.value.children || 'children'
    treeProps.value.disabled = (data) => data[childrenKey]?.length > 0
    treeProps.value.class = (_data, node) => node.disabled ? 'disabledLevel' : ''
  }
  // 列表接口
  //   listApi.value = info.apiList || null
  // 搜索栏
  if (info.searchList?.length) {
    searchList.value = info.searchList.map((item) => {
      const it = { ...item }
      if (!it.slot) it.event = refreshTable
      return it
    })
  }
  if (info.formList?.length) {
    formList.value = [...info.formList]
  }
  // 初始化 query
  if (info.query) {
    Object.assign(query.value, info.query)
  }
}
/**
 * 根据 disabledLevel 生成 disabled 判断函数
 * @param {number|number[]} levels - 禁选层级（1-based），如 1 表示根节点不可选
 */
function buildDisabledFn(levels) {
  const set = new Set(Array.isArray(levels) ? levels : [levels])
  return (_data, node) => set.has(node.level)
}
/**
 * 加载树数据
 * 优先级：treeData（父组件传入） > api（接口获取） > dictKey（字典获取）
 */
async function loadTreeData() {
  const info = props.info || {}
  // 1. 父组件直接传入树数据
  if (info.treeData?.length) {
    treeData.value = info.treeData
    await nextTick()
    selectFirstNode()
    return
  }
  const childrenKey = treeProps.value.children || 'children'
  const nameKey = treeProps.value.label || 'name'
  if (info.defaultDate) {
    // 有 rootName 时，前端追加根节点包装
    if (info.rootName) {
      treeData.value = [
        {
          id: '-2',
          [nameKey]: info.rootName,
          code: '',
          [childrenKey]: info.defaultDate,
        },
      ]
    } else {
      treeData.value = info.defaultDate
    }
    await nextTick()
    selectFirstNode()
    return
  }
  // 4. 无数据源，仅显示根节点
  treeData.value = [
    {
      id: '-2',
      [nameKey]: info.rootName || '全部',
      code: '',
      [childrenKey]: info.treeChildren || [],
    },
  ]
  await nextTick()
  selectFirstNode()
}

/**
 * 默认选中第一个节点
 */
function selectFirstNode() {
  if (!treeData.value.length) return
  const firstNode = treeData.value[0]

  // 如果有子节点，选中第一个子节点；否则选中根节点
  const children = firstNode[treeProps.value.children]
  const targetNode = children?.length ? children[0] : firstNode

  treeRef.value?.setCurrentKey(targetNode.id || targetNode.code)
  handleNodeClick(targetNode)
}

async function handleNodeClick(node, nodeObj) {
  if (nodeObj?.disabled) {
    // 点击禁用节点：保持当前选中不变，高亮切回之前选中的节点
    const nodeKey = props.info.nodeKey || 'id'
    const prevKey = selectRow.value?.[nodeKey]
    nextTick(() => {
      treeRef.value?.setCurrentKey(prevKey ?? null)
    })
    return
  }
  const info = props.info || {}
  currentNode.value = node

  tableData.value = []

  // 将树节点值写入 query
  if (info.clickParams) {
    query.value[info.clickParams] = String(node[info.code || 'code'])
  } else if (node.id) {
    // 目前这个没用，只是防止没写info.clickParams和node.id时，使用node.id
    query.value.id = node.id
  }
  if (formList.value.length > 0) {
    let params = node.id
    info.apiList(params).then((res) => {
      formData.value = res.data
      tableData.value = res.data[info.tableDataName] || []
    })
  } else {
    await info.apiList(query.value).then((res) => {
      if (res.data.queryFieldVOs) {
        let arr = []
        res.data.queryFieldVOs.filter((it) => {
          if (it.isShow == '1') {
            arr.push({
              label: it.name,
              value: it.code,
            })
          }
        })
        fieldList.value = arr
      }
      tableData.value = res.data[info.tableDataName] || []
      emits('titleChange', res.data.title ? res.data.title : '选择数据')
    })
  }

  // tree 模式：选中值取树节点；table 模式：切换节点时清空表格选中
  if (selectMode.value === 'tree') {
    selectRow.value = node
  } else {
    // 默认选中
    if (info.defaultSelected !== undefined && info.defaultSelected !== null) {
      defaultSelected.value = info.defaultSelected
      if (checkBox.value) {
        const arr = Array.isArray(info.defaultSelected)
          ? info.defaultSelected
          : [info.defaultSelected]
        selectRow.value = arr
        checkedList.value = arr
        // 如果有 defaultDate（不走 API），从数据中找到行对象传给 checkedRowList
        if (tableData.value?.length) {
          const rowKey = tableRef.value?.rowKey || 'id'
          const matchedRows = tableData.value.filter((row) =>
            arr.includes(row[rowKey]),
          )
          checkedRowList.value = matchedRows
        } else {
          // 走 API 时，暂存 ID，由 DialogTable getList 加载后匹配
          checkedRowList.value = arr
        }
      } else {
        selectRow.value = info.defaultSelected
      }
    } else {
      selectRow.value = null
    }
  }
}

/**
 * 刷新表格
 */
function refreshTable() {
  refreshFlag.value = Math.random()
}

/**
 * 表格事件
 */
function handleEvent(event, data) {
  // console.log('‘enenene',event,data)
  if (selectMode.value === 'tree') return
  switch (event) {
    case 'tableClickRow':
      if (checkBox.value) return
      selectRow.value = data
      break
    case 'tableCheck':
      selectRow.value = data
      break
  }
}
</script>

<style scoped lang="scss">
.content-box {
  width: 100%;
  height: 470px;
  overflow: auto;
  display: flex;
}
.left-container {
  width: 30%;
  min-width: 150px;
  overflow: auto;
}
.right-container {
  flex: 1;
  overflow: auto;
}
</style>
