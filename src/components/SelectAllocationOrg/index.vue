<template>
  <page-dialog
    :title="title"
    v-model:visible="shows"
    :width="width"
    :bt-loading="dialogInfo.btLoading"
    :bt-list="dialogInfo.btList"
  >
    <!-- 条件栏 -->
    <new-page-filter
      v-model:query="filterInfo.query"
      :filter-list="filterInfo.list"
    >
      <template v-slot:filter-allocationPlan>
        <el-select
          v-model="allocationPlan"
          placeholder="请选择分配方案"
          @change="handleAllocationPlanChange"
        >
          <el-option
            v-for="item in allocationPlanList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </template>
    </new-page-filter>
    <!-- 树搜索框 -->
    <el-input
      v-model="filterInfo.query.keyword"
      style="flex: 1"
      :clearable="true"
      placeholder="请输入编码/名称"
      class="show-placeholder"
      @keyup.enter.native="search"
    >
      <template #suffix>
        <i
          class="el-icon-search"
          @click="search"
          style="display: flex; align-items: center"
          ><el-icon><Search /></el-icon
        ></i>
      </template>
    </el-input>
    <div class="tree-box">
      <el-tree
        :data="treeInfo.data"
        ref="treeRef"
        :show-checkbox="checkBox"
        node-key="id"
        :check-strictly="checkStrictly"
        :highlight-current="highlightCurrent"
        default-expand-all
        :expand-on-click-node="false"
        :check-on-click-node="true"
        :filter-node-method="filterNode"
        :default-checked-keys="treeInfo.checked"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <span class="iconNode">{{ data.icon }}</span>
            <span>{{ data.code }}</span>
            -
            <span>{{ data.name }}</span>
          </div>
        </template>
      </el-tree>
    </div>
  </page-dialog>
</template>

<script setup name="SelectAllocationOrg">
import PageDialog from '../PageDialog/index'
import NewPageFilter from '@/components/NewPageFilter'
import { getOrgTree, getAllocationById, getAllocationList } from '@/api/base'
const emits = defineEmits()
const { proxy } = getCurrentInstance()
const props = defineProps({
  title: {
    type: String,
    default: '分配组织',
  },
  checkBox: {
    type: Boolean,
    default: false,
  },
  checkStrictly: {
    //是否不关联勾选子节点
    type: Boolean,
    default: true,
  },
  api: {
    type: Function,
    default: getOrgTree,
  },
  showDialog: {
    type: Boolean,
  },
  query: {
    type: Object,
    default: function () {
      return {}
    },
  },
  checkedList: {
    //多选回显
    type: Array,
    default: function () {
      return []
    },
  },
  treenName: {
    //作为查询条件时区分是哪一个弹窗
    type: String,
    default: '',
  },
  checkedKey: {
    //单选回显
    type: String,
    default: '',
  },
  highlightCurrent: {
    //高亮代表单选
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: '640px',
  },
  showAllocationPlan: {
    type: Array,
    default: true
  }
})
const fillTitle = ref('')
// 过滤相关配置
const filterInfo = ref({
  query: {
    ...props.query,
  },
  list: [
    {
      slot: true,
      label: '分配方案',
      value: 'allocationPlan',
      show: props.showAllocationPlan,
    },
  ],
})
// 表格相关
const treeInfo = ref({
  data: [],
  checked: [],
})
const allocationPlan = ref('')
const allocationPlanList = ref([])
// 弹窗相关
const dialogInfo = ref({
  width: '640px',
  btLoading: false,
  btList: [
    {
      label: '确定',
      type: 'primary',
      event: save,
      show: true,
    },
    { label: '取消', event: handleClose, show: true },
  ],
})

const shows = computed({
  get() {
    return props.showDialog
  },
  set(newValue) {
    emits('update:showDialog', newValue) // 更新父组件shows
  },
})

onMounted(() => {
  if(props.showAllocationPlan){
    init()
  }
  getList()
})

function init() {
  getAllocationList().then((res) => {
    if (res && res.success) {
      allocationPlanList.value = res.data
    }
  })
}
// 获取列表
function getList() {
  props.api(filterInfo.value.query).then((res) => {
    if (res && res.success) {
      treeInfo.value.data = res.data
      setDisabled(treeInfo.value.data)
    }
  })
}
function setDisabled(data) {
  let seting = sessionStorage.getItem('setting')
  if (seting) {
    seting = JSON.parse(seting)
  }
  data.map((item) => {
    item.disabled = false
    if (props.showAllocationPlan && (item.id === seting?.hospitalId)) {
      item.disabled = true
    }
    if (item.children && item.children.length) {
      setDisabled(item.children)
    }
  })
}
function handleAllocationPlanChange() {
  proxy.$refs.treeRef.setCheckedKeys([], true)
  getAllocationById(allocationPlan.value).then((res) => {
    treeInfo.value.checked = []
    let seting = sessionStorage.getItem('setting')
    if (seting) {
      seting = JSON.parse(seting)
    }
    res.data.detailVOList?.map((item) => {
      if (item.treeId !== seting?.hospitalId) {
        treeInfo.value.checked.push(item.treeId)
      }
    })
  })
}
function search() {
  proxy.$refs.treeRef.filter(filterInfo.value.query.keyword)
}
function filterNode(value, data, node) {
  if (!value) return true
  // 如果传入的value和data中的label相同说明是匹配到了
  if (data.name?.includes(value) || data.code?.includes(value)) {
    return true
  }
  // 否则要去判断它是不是选中节点的子节点
  return checkBelongToChooseNode(value, data, node)
}
function checkBelongToChooseNode(value, data, node) {
  const level = node.level
  // 如果传入的节点本身就是一级节点就不用校验了
  if (level === 1) {
    return false
  }
  // 先取当前节点的父节点
  let parentData = node.parent
  // 遍历当前节点的父节点
  let index = 0
  while (index < level - 1) {
    // 如果匹配到直接返回
    if (
      parentData.data.name?.includes(value) ||
      parentData.data.code?.includes(value)
    ) {
      return true
    }
    // 否则的话再往上一层做匹配
    parentData = parentData.parent
    index++
  }
  // 没匹配到返回false
  return false
}
function save() {
  const allNodes = proxy.$refs.treeRef.getCheckedNodes()
  emits('callback', allNodes)
  handleClose()
}
// 关闭弹窗前的回调
function handleClose() {
  shows.value = false
  emits('reset')
}
</script>
<style lang="scss" scoped>
.tree-box {
  width: 100%;
  height: 350px;
  overflow: hidden;
  overflow-y: auto;
  .iconNode {
    font-weight: 700;
    margin-right: 4px;
    color: rgb(22, 93, 255);
  }
}
</style>
