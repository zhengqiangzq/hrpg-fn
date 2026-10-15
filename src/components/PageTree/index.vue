<script setup>
import {ref, watch} from "vue";
import {mergeWith} from "lodash";

const emits = defineEmits(['node-click', 'check-change'])
const props = defineProps({
  treeInfo: Object
})

const tree = ref()
const _treeInfo = ref({
  filterText: undefined,
  nodeKey: 'id',
  defaultProps: {
    children: 'children',
    label: 'name',
    disabled: undefined
  },
  showCheckbox: false,
  checkStrictly: false,
  defaultCheckedKeys: [],
  defaultExpandedKeys: [],
  defaultExpandAll: false,
  expandOnClickNode: true,
  filterControls: [],
  data: []
})

watch(() => props.treeInfo, (info) => {
  const filterText = _treeInfo.value.filterText
  _treeInfo.value = mergeWith(_treeInfo.value, info, (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      return srcValue
    }
  })
  _treeInfo.value.filterText = filterText
}, { immediate: true, deep: true })

function treeSearch() {
  tree.value.filter(_treeInfo.value.filterText)
}

function filterNodeMethod(value, data, node) {
  const childrenKey = _treeInfo.value.defaultProps?.children || 'children'
  // 复选框过滤：所有勾选的复选框 AND 关系
  const activeFilters = (_treeInfo.value.filterControls || []).filter(c => c.value)
  const matchFilter = (item, f) => String(item[f.field]) === String(f.queryValue)

  // 复选框条件：父节点要求子节点中至少有一个满足所有勾选条件
  let passFilter = true
  if (activeFilters.length) {
    if (data[childrenKey]?.length) {
      passFilter = data[childrenKey].some(child =>
        activeFilters.every(f => matchFilter(child, f))
      )
    } else {
      passFilter = activeFilters.every(f => matchFilter(data, f))
    }
  }
  if (!passFilter) return false

  // 搜索框条件
  if (!value?.length) return true
  if (props.treeInfo.filterNodeMethod) {
    return props.treeInfo.filterNodeMethod(value, data, node)
  }
  let __label
  if (typeof _treeInfo.value.defaultProps.label === 'string') {
    __label = data[_treeInfo.value.defaultProps.label]
  } else {
    __label = _treeInfo.value.defaultProps.label(data, node)
  }
  return __label.indexOf(value) !== -1
}

function handleFilterControlChange() {
  tree.value?.filter(_treeInfo.value.filterText)
}

function handleNodeClick(...args) {
  emits('node-click', ...args)
}
function handleCheckChange(...args) {
  emits('check-change', ...args)
}

// 暴露 el-tree 常用方法供父组件调用
defineExpose({
  setCheckedKeys: (...args) => tree.value?.setCheckedKeys(...args),
  setCheckedNodes: (...args) => tree.value?.setCheckedNodes(...args),
  getCheckedNodes: (...args) => tree.value?.getCheckedNodes(...args),
  getCheckedKeys: (...args) => tree.value?.getCheckedKeys(...args),
  setCurrentKey: (...args) => tree.value?.setCurrentKey(...args),
  getCurrentNode: (...args) => tree.value?.getCurrentNode(...args),
  getCurrentKey: (...args) => tree.value?.getCurrentKey(...args),
  /** 获取内部 el-tree ref */
  getTreeRef: () => tree.value,
})
</script>

<template>
  <div>
    <div style="display: flex; align-items: center; margin-bottom: 10px">
      <el-input
          v-model="_treeInfo.filterText"
          style="flex: 1; margin-right: 10px"
          :clearable="true"
          :placeholder="_treeInfo.filterPlaceholder || '请输入文字筛选'"
          class="show-placeholder"
          @keyup.enter="treeSearch"
      ></el-input>
      <el-checkbox
          v-for="(ctrl, idx) in _treeInfo.filterControls"
          :key="idx"
          v-model="ctrl.value"
          @change="handleFilterControlChange"
      >{{ ctrl.label }}</el-checkbox>
    </div>
    <el-tree
        ref="tree"
        :data="_treeInfo.data"
        highlight-current
        :props="_treeInfo.defaultProps"
        :node-key="_treeInfo.nodeKey"
        :show-checkbox="_treeInfo.showCheckbox"
        :check-strictly="_treeInfo.checkStrictly"
        :default-checked-keys="_treeInfo.defaultCheckedKeys"
        :default-expanded-keys="_treeInfo.defaultExpandedKeys"
        :default-expand-all="_treeInfo.defaultExpandAll"
        :accordion="_treeInfo.accordion"
        :current-node-key="_treeInfo.currentNodeKey"
        :filter-node-method="filterNodeMethod"
        :expand-on-click-node="_treeInfo.expandOnClickNode"
        @node-click="handleNodeClick"
        @check-change="handleCheckChange"
        style="max-height: 400px;overflow-y: auto;"
    >
      <template #default="{ node, data }">
        <div class="custom-label">
          <slot name="label" :node="node" :data="data">
            <span>{{ node.label }}</span>
          </slot>
          <div class="menus">
            <slot name="operate" :node="node" :data="data" />
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<style scoped lang="scss">
.custom-label {
  display: flex;
  align-items: center;
  width: 100%;
  .menus {
    margin-left: auto;
    color: #c0c0c0;
    >* {
      margin-left: 3px;
      margin-right: 3px;
    }
  }
}
</style>