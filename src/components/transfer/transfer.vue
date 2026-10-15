<template>
  <PageDialog
      :title="title"
      :visible="showDialog"
      :btList="state.btList"
      @reset="cancel"
  >
  <el-transfer
      v-model="transferValue"
      :titles="['科目范围', '已选科目']"
      :props="ObjectKeys"
      :data="transferData"
      filterable
      :filter-method="filterMethod"
  >
    <template #default="{ option }">
      <span>{{ option[ObjectKeys.code] ? `${option[ObjectKeys.code]} ${option[ObjectKeys.label]}` : option[ObjectKeys.label] }}</span>
    </template>
    </el-transfer>
  </PageDialog>
</template>

<script setup>
import { computed, ref, getCurrentInstance, watch } from 'vue'
import PageDialog from "@/components/PageDialog/index.vue";

const { proxy } = getCurrentInstance()
const props = defineProps({
  title: {
    type: String,
    default: '科目范围值'
  },
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    // 所有数据
    type: Array,
    default: () => [],
  },
  selectValue: {
    // 右侧数据
    type: Array,
    default: () => [],
  },
  defaultProps: {
    type: Object,
    default: () => {
      return {
        key: '',
        code: '',
        label: '',
      }
    },
  },
});

const emit = defineEmits(["callback"]);

const transferData = ref([])
const transferValue = ref([])
const ObjectKeys = ref({})

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue)
  },
})

watch(
    () => showDialog,
    (val) => {
      if(val) {
        handleData()
      }
    },
    {
      immediate: true,
    }
)

const state = ref({
  ref: null,
  btList: [
    {
      type: 'primary',
      show: true,
      label: '确定',
      event: userUpdate,
    },
    { type: 'button', show: true, label: '取消', event: cancel },
  ],
})

// 已选择---右边
const getRightObjects = (currentKeys) => {
  return props.data.filter(item => currentKeys.includes(item[ObjectKeys.value.key]));
}


function handleData() {
  ObjectKeys.value = props.defaultProps || {}
  // v-model 控制右侧已选 key，data 永远传全部数据
  transferValue.value = props.selectValue.length > 0
    ? props.selectValue.map(it => it[ObjectKeys.value.key])
    : []
  transferData.value = proxy.$fn.deepClone(props.data) || []
}

const filterMethod = (query, item) => {
  const codeName = `${item.code}${item.name}`
  return codeName.includes(query)
}

function cancel() {
  showDialog.value = false
  emit('callback', false)
}
function userUpdate() {
  showDialog.value = false
  emit('callback', getRightObjects(transferValue.value))
}
</script>

<style scoped lang="scss">
.el-transfer {
  height: 500px;
}
:deep(.el-transfer-panel) {
  width: 38% !important;
  height: 100% !important;
}
:deep(.el-transfer-panel__body) {
  height: calc(100% - 40px);
}
</style>
