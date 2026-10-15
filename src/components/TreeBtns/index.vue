<template>
  <div class="page-filter newFilter">
    <span class="fontWeight">{{title}}</span>
    <div class="filter-btn w-full">
      <div class="flex justify-end">
        <div
          v-for="(item, index) in btns"
          :key="index"
          :class="index < showBtnsNum ? 'filter-item' : ''"
        >
          <div v-if="index < showBtnsNum">
            <template v-if="item.type === 'slot'">
              <slot :name="'filter-' + item.value" />
            </template>
            <!-- <el-tooltip
              v-else-if="item.type === 'button'"
              effect="light"
              :content="item.label"
            > -->
              <el-button
                :class="[`iconBtn`]"
                :icon="iconMap[item.label] || item.icon"
                :disabled="setBtnDisabled(item.disabled)"
                @click="item.event"
              ></el-button>
            <!-- </el-tooltip> -->
          </div>
        </div>
        <el-dropdown v-if="btns.length > showBtnsNum" class="filter-item">
          <el-button icon="MoreFilled" class="iconBtn" />
          <template #dropdown>
            <el-dropdown-menu>
              <span v-for="(item, i) in btns">
                <el-dropdown-item
                  v-if="i >= showBtnsNum"
                  :key="item.value"
                  :disabled="setBtnDisabled(item.disabled)"
                  @click="item.event"
                >
                  <div
                    style="width: 100%; height: 100%; padding: 0 10px"
                    :plain="true"
                  >
                    {{ item.label }}
                  </div>
                </el-dropdown-item>
              </span>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>
<script setup name="TreeBtns">
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  filterBtn: {
    type: Array,
    default: function () {
      return []
    },
  },
})

const iconMap = ref({
  新增: 'Plus',
  编辑: 'Edit',
  删除: 'Delete',
  查询: 'Search',
  返回: 'CircleClose',
  保存: 'Document',
})
const showBtnsNum = ref(2)

const btns = computed(() => getConfigList())

// 获取列表
function getConfigList() {
  if (props.filterBtn) {
    return props.filterBtn.filter(
      (item) =>
        !item.hasOwnProperty('show') ||
        (item.hasOwnProperty('show') && item.show)
    )
  }
}

function setBtnDisabled(btnDisabled) {
  if (typeof btnDisabled === 'string' || typeof btnDisabled === 'boolean') {
    return btnDisabled
  } else if (btnDisabled && typeof btnDisabled === 'function') {
    return btnDisabled()
  }
}
</script>
<style lang="scss" scoped>
.justify-end{
  display: flex;
  justify-content: flex-end;
}
</style>
