<template>
  <div class="content-box">
    <!-- 左侧树 -->
    <div class="left-container">
      <div class="left-container-header show-placeholder">
        <el-input
          v-model="treeFilter.query.keyword"
          :clearable="true"
          placeholder="请输入编码/名称"
          class="show-placeholder"
          @keyup.enter.native="treeSearch"
        >
          <template #suffix>
            <i
              class="el-icon-search"
              @click="treeSearch"
              style="display: flex; align-items: center"
            >
              <el-icon><Search /></el-icon>
            </i>
          </template>
        </el-input>
      </div>
      <el-tree
        ref="treeRef"
        :data="treeData"
        node-key="id"
        :props="treeProps"
        :show-checkbox="treeCheckbox"
        :check-strictly="checkStrictly"
        default-expand-all
        highlight-current
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
        :filter-node-method="filterNode"
        @check-change="handleCheckChange"
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
        :api="listApi"
        :query="query"
        :highlight-row="highlightRow"
        @handleEvent="handleEvent"
      />
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import DialogTable from '@/components/DialogTable/index.vue'
import NewPageFilter from '@/components/NewPageFilter/index.vue'

const { proxy } = getCurrentInstance()
const store = useStore()

const emits = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: null,
  info: { type: Object, default: () => ({}) },
})

const treeRef = ref(null)
const tableRef = ref(null)
// 树过滤信息
const treeFilter = ref({
  query: {
    keyword: '',
  },
})
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
// 是否显示复选框（多选模式）
const treeCheckbox = ref(false)
// 复选框是否严格模式（父子不联动）
const checkStrictly = ref(false)
// newpagefilter数据
const formData = ref([])
// ---- 表格相关 ----
const tableData = ref([])
const refreshFlag = ref(1)
const query = ref({})
const fieldList = ref([])
const listApi = ref(null)
const pager = ref(false)
const checkBox = ref(false)
const tabIndex = ref(false)
const highlightRow = ref(true)
const searchList = ref([])
const formList = ref([])

// 选择模式：'table'（默认，选表格行）| 'tree'（选树节点，禁用表格点击）
const selectMode = ref('table')

// ---- 初始化 ----
onMounted(() => {
  initConfig()
  loadTreeData()
})

/**
 * 初始化配置
 */
function initConfig() {
  console.log('jjjhhhhh');
  
  const info = props.info || {}
  // 表格配置
  fieldList.value = info.fieldList || []
  pager.value = info.pager ?? false
  checkBox.value = info.checkBox ?? false
  tabIndex.value = info.tabIndex ?? false
  // 选择模式：tree 模式下禁用表格行高亮与点击
  selectMode.value = info.selectMode === 'tree' ? 'tree' : 'table'
  highlightRow.value = selectMode.value === 'tree' ? false : (info.highlightRow !== false)
  // 树多选配置
  treeCheckbox.value = info.showCheckbox ?? false
  checkStrictly.value = info.checkStrictly ?? false
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
  listApi.value = info.apiList || null
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
// ========== 树相关方法 ==========
function treeSearch() {
  proxy.$refs.treeRef.filter(treeFilter.value.query.keyword)
}
/** 树节点过滤 */
function filterNode(value, data) {
  if (!value) return true
  return (
    data.name.includes(value) || data.code.includes(value) || data.id === '-2'
  )
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
    applyDefaultSelected()
    return
  }
  const childrenKey = treeProps.value.children || 'children'
  const nameKey = treeProps.value.label || 'name'
  // 2. 从接口获取树数据
  if (info.api) {
    try {
      const res = await info.api(info.query || {})
      if (res?.success && res.data) {
        // 有 rootName 时，前端追加根节点包装
        if (info.rootName) {
          treeData.value = [
            {
              id: '-2',
              [nameKey]: info.rootName,
              code: '',
              [childrenKey]: res.data,
            },
          ]
        } else {
          treeData.value = res.data || []
        }
        console.log(treeData.value);
        await nextTick()
      }
    } catch (e) {
      console.error('加载树数据失败:', e)
    }
    applyDefaultSelected()
    return
  }

  // 3. 从字典获取树数据
  if (info.dictKey) {
    const dictData = store.state.permission.dict?.[info.dictKey]
    if (dictData?.length) {
      // 有 rootName 时，前端追加根节点包装
      if (info.rootName) {
        treeData.value = [
          {
            id: '-2',
            [nameKey]: info.rootName,
            code: '',
            [childrenKey]: dictData,
          },
        ]
      } else {
        treeData.value = dictData
      }
      await nextTick()
    }
    applyDefaultSelected()
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
  applyDefaultSelected()
}
/**
 * 回显默认选中
 */
function applyDefaultSelected() {
  const info = props.info || {}
  const defaultVal = info.defaultSelected
  if (!defaultVal && defaultVal !== 0) return
  const childrenKey = treeProps.value.children || 'children'

  if (treeCheckbox.value) {
    // 复选模式
    const arr = Array.isArray(defaultVal) ? defaultVal : [defaultVal]
    const keys = arr.map((item) => (typeof item === 'object' ? item['id'] : item))
    selectRow.value = arr.every((item) => typeof item === 'object')
      ? arr
      : findNodesByKeys(treeData.value, keys, 'id', childrenKey)
    nextTick(() => {
      treeRef.value?.setCheckedKeys(keys)
    })
  } else {
    // 单选模式
    const item = typeof defaultVal === 'object' ? defaultVal : null
    const key = item ? item['id'] : defaultVal
    const node = item || findNodesByKeys(treeData.value, [defaultVal], 'id', childrenKey)[0]
    if (!node) return
    selectRow.value = node
    nextTick(() => {
      treeRef.value?.setCurrentKey(key)
    })
    syncQueryAndRefresh(node)
  }
}
/**
 * 从树数据中根据 key 数组查找节点对象
 */
function findNodesByKeys(data, keys, nodeKey = 'id', childrenKey = 'children') {
  const result = []
  const keySet = new Set(keys)
  const walk = (list) => {
    for (const item of list) {
      if (keySet.has(item[nodeKey])) result.push(item)
      if (item[childrenKey]?.length) walk(item[childrenKey])
      if (result.length === keySet.size) return
    }
  }
  walk(data)
  return result
}
/**
 * 单选节点选中后的联动：写入 query 并触发列表/表单刷新
 */
function syncQueryAndRefresh(node) {
  const info = props.info || {}
  // 将树节点值写入 query
  if (info.clickParams) {
    query.value[info.clickParams] = node[info.code || 'code']
  } else if (node.id) {
    // 目前这个没用，只是防止没写info.clickParams时，使用node.id
    query.value.id = node.id
  }
  if (formList.value.length > 0) {
    info.apiList(node.id).then((res) => {
      formData.value = res.data
      tableData.value = res.data[info.tableDataName] || []
    })
  } else {
    refreshTable()
  }
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

function handleNodeClick(node, nodeObj) {
  if (nodeObj?.disabled) {
    // 点击禁用节点：保持当前选中不变，高亮切回之前选中的节点
    const nodeKey = props.info.nodeKey || 'id'
    const prevKey = selectRow.value?.[nodeKey]
    nextTick(() => {
      treeRef.value?.setCurrentKey(prevKey ?? null)
    })
    return
  }

  tableData.value = []
  // tree 模式：选中值取树节点；table 模式：清空表格选中
  if (selectMode.value === 'tree') {
    selectRow.value = node
  } else {
    selectRow.value = null
  }
  // 多选模式：点击节点切换勾选
  if (treeCheckbox.value) {
    const key = node.id
    const checkedKeys = treeRef.value?.getCheckedKeys() || []
    treeRef.value?.setChecked(key, !checkedKeys.includes(key), !checkStrictly.value)
  } else {
    const currentKey = selectRow.value?.id
    if (currentKey !== undefined && currentKey === node.id && selectMode.value === 'tree') {
      treeRef.value?.setCurrentKey(null)
      selectRow.value = null
    }
  }
  syncQueryAndRefresh(node)
}

/**
 * 复选框变化（多选模式）
 */
function handleCheckChange() {
  if (!treeCheckbox.value) return
  const checkedNodes = checkStrictly.value
    ? treeRef.value?.getCheckedNodes()
    : treeRef.value?.getCheckedNodes(true)
  selectRow.value = checkedNodes || []
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
