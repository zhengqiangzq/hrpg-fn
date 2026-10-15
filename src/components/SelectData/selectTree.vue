<template>
  <page-tree
    ref="pageTreeRef"
    :tree-info="treeInfo"
    @node-click="handleNodeClick"
    @check-change="handleCheckChange"
  >
    <!-- 自定义 label：优先使用 info.renderLabel 渲染函数，其次转发父组件 label 插槽 -->
    <template #label="slotProps">
      <slot name="label" v-bind="slotProps">
        <component
          v-if="treeInfo.renderLabel"
          :is="() => treeInfo.renderLabel(h, slotProps)"
        />
        <span v-else>{{ slotProps.node.label }}</span>
      </slot>
    </template>
  </page-tree>
</template>

<script setup>
import { h } from 'vue'
const emits = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: null,
  info: { type: Object, default: () => ({}) },
})

const pageTreeRef = ref(null)

const selectRow = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val),
})

// ---- 树配置 ----
const treeInfo = ref({
  nodeKey: 'id',
  defaultProps: {
    children: 'children',
    label: (data) => (data.codeAndName?data.codeAndName:data.code ? `${data.code}-${data.name}` : data.name),
    disabled: undefined,
  },
  showCheckbox: false,
  checkStrictly: false,
  expandOnClickNode: false,
  defaultExpandAll: true,
  defaultCheckedKeys: [],
  filterText: '',
  data: [],
})

// ---- 初始化 ----
onMounted(async () => {
  const info = props.info || {}

  // 合并配置
  const merged = { ...treeInfo.value, ...info }

  // disabledLevel / onlyLeaf → disabled 函数 + 自定义 class
  if (info.disabledLevel?.length) {
    merged.defaultProps = buildDisabledProps(merged, buildDisabledFn(info.disabledLevel))
  } else if (info.onlyLeaf) {
    const childrenKey = merged.defaultProps?.children || 'children'
    merged.defaultProps = buildDisabledProps(merged, (data) => data[childrenKey]?.length > 0)
  } else if (info.defaultProps?.disabled) {
    merged.defaultProps = { ...merged.defaultProps, ...info.defaultProps }
  }

  // label 兼容字符串和函数
  if (info.defaultProps?.label) {
    merged.defaultProps.label = info.defaultProps.label
  }

  treeInfo.value = merged

  // 加载数据
  if (info.api) {
    const res = await info.api(info.query || {})
    if (res.success) {
      const childrenKey = merged.defaultProps?.children || 'children'
      // 有 rootName 时，前端追加根节点包装
      if (info.rootName) {
        treeInfo.value.data = [
          {
            id: '-2',
            name: info.rootName,
            code: '',
            [childrenKey]: res.data || [],
          },
        ]
      } else {
        treeInfo.value.data = res.data || []
      }
      await nextTick()
      applyDefaultSelected()
    }
  } else {
    applyDefaultSelected()
  }
  if (info.defaultDate) {
    treeInfo.value.data = info.defaultDate || []
    await nextTick()
    applyDefaultSelected()
  }
})

/**
 * 回显默认选中
 */
function applyDefaultSelected() {
  const info = props.info || {}
  const defaultVal = info.defaultSelected
  if (!defaultVal && defaultVal !== 0) return
  const nodeKey = treeInfo.value.nodeKey || 'id'
  const childrenKey = treeInfo.value.defaultProps?.children || 'children'

  if (treeInfo.value.showCheckbox) {
    // 复选模式
    const arr = Array.isArray(defaultVal) ? defaultVal : [defaultVal]
    const keys = arr.map((item) => (typeof item === 'object' ? item[nodeKey] : item))
    selectRow.value = arr.every((item) => typeof item === 'object')
      ? arr
      : findNodesByKeys(treeInfo.value.data, keys, nodeKey, childrenKey)

    nextTick(() => {
      pageTreeRef.value?.setCheckedKeys(keys)
    })
  } else {
    // 单选模式
    const item = typeof defaultVal === 'object' ? defaultVal : null
    const key = item ? item[nodeKey] : defaultVal
    selectRow.value = item || findNodesByKeys(treeInfo.value.data, [defaultVal], nodeKey, childrenKey)[0]

    nextTick(() => {
      pageTreeRef.value?.setCurrentKey(key)
    })
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
 * 构建 defaultProps 的 disabled + class 配置
 */
function buildDisabledProps(merged, disabledFn) {
  return {
    ...merged.defaultProps,
    disabled: disabledFn,
    class: (_data, node) => node.disabled ? 'disabledLevel' : '',
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
// ---- 事件处理 ----

/**
 * 节点点击
 * - 单选模式：点击已选中节点取消选中，否则选中该节点
 * - 复选模式：点击 label 勾选/取消该节点（disabled 节点除外）
 */
function handleNodeClick(data, node) {
  if (node?.disabled) {
    // 点击禁用节点：保持当前选中不变，高亮切回之前选中的节点
    const nodeKey = treeInfo.value.nodeKey || 'id'
    const prevKey = selectRow.value?.[nodeKey]
    nextTick(() => {
      pageTreeRef.value?.setCurrentKey(prevKey ?? null)
    })
    return
  }
  if (treeInfo.value.showCheckbox) {
    // 点击 label 勾选复选框
    const treeRef = pageTreeRef.value?.getTreeRef()
    if (!treeRef) return
    const key = data[treeInfo.value.nodeKey || 'id']
    const checkedKeys = treeRef.getCheckedKeys()
    treeRef.setChecked(key, !checkedKeys.includes(key), !treeInfo.value.checkStrictly)
    return
  } else {
    // 单选模式：再次点击已选中节点取消选中
    const nodeKey = treeInfo.value.nodeKey || 'id'
    const currentKey = selectRow.value?.[nodeKey]
    if (currentKey !== undefined && currentKey === data[nodeKey]) {
      selectRow.value = null
      pageTreeRef.value?.setCurrentKey(null)
    } else {
      selectRow.value = data
    }
  }
}

/**
 * 复选框变化
 */
function handleCheckChange() {
  if (!treeInfo.value.showCheckbox) return
  const treeRef = pageTreeRef.value?.getTreeRef()
  if (!treeRef) return

  if (treeInfo.value.checkStrictly) {
    // 非级联：取所有勾选节点
    selectRow.value = treeRef.getCheckedNodes()
  } else {
    // 级联模式：默认只取叶子节点
    selectRow.value = treeRef.getCheckedNodes(true)
  }
}
</script>

<style scoped lang="scss">
</style>
