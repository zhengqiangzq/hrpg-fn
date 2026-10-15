<template>
  <div>
    <page-dialog
      :title="dialogInfo.title"
      v-model:visible="showDialog"
      :width="dialogInfo.width"
      :bt-list="dialogInfo.btList"
    >
      <div class="model-panel">
        <div class="model-panel-body" style="padding: 0;">
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="表格显示设置" name="showLevel">
              <el-row class="set-preference-wrap">
                <el-col :span="6">
                  <el-button
                    style="margin-bottom: 8px;"
                    type="primary"
                    :disabled="!fieldList1.length"
                    @click="rightMove('showLevel')"
                    >一键右移</el-button
                  >
                  <div class="set-preference-item margin-right">
                    <div class="draggable-wrap-item background-color">未选</div>
                    <draggable
                      class="draggable-wrap"
                      :list="fieldList1"
                      @add="fieldAddshow1"
                      tag="ul"
                      v-bind="{
                        animation: 200,
                        group: 'fieldSite',
                      }"
                    >
                      <template #item="{ element, index }">
                        <div
                          class="draggable-wrap-item"
                          :key="Math.random() + index"
                        >
                          {{ element.label }}
                        </div>
                      </template>
                    </draggable>
                  </div>
                </el-col>
                <el-col :span="18">
                  <el-button
                    style="margin-bottom: 8px;"
                    type="primary"
                    :disabled="!fieldList2.length"
                    @click="leftMove('showLevel')"
                    >一键左移</el-button
                  >
                  <div class="set-preference-item">
                    <div class="draggable-wrap-item background-color">
                      <span>已选</span>
                      <div class="draggable-wrap-item-right">
                        <div class="draggable-wrap-item-right-form-width-title">
                          单元格宽度
                        </div>
                        <span class="slip-edit">操作</span>
                      </div>
                    </div>
                    <draggable
                      class="draggable-wrap"
                      v-model="fieldList2"
                      @add="fieldAddshow2"
                      @update="datadragFieldEnd2"
                      tag="ul"
                      v-bind="{
                        animation: 300,
                        group: 'fieldSite',
                      }"
                    >
                      <template #item="{ element, index }">
                        <div
                          class="draggable-wrap-item"
                          :key="Math.random() + index"
                        >
                          <span> {{ element.label }}</span>
                          <div class="draggable-wrap-item-right">
                            <el-input-number
                              style="width: 100px; margin-right: 24px"
                              clearable
                              controls-position="right"
                              v-model="element.minWidth"
                              :min="0"
                            ></el-input-number>
                            <span
                              class="slip-edit"
                              @click="setTop(element, fieldList2, 'showLevel')"
                            >
                              {{ index ? '置顶' : '' }}
                            </span>
                          </div>
                        </div>
                      </template>
                    </draggable>
                  </div>
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane
              label="表格分组设置"
              v-if="groupLevelShow"
              name="groupLevel"
            >
              <el-row class="set-preference-wrap">
                <el-col :span="6">
                  <el-button
                    style="margin-bottom: 8px;"
                    type="primary"
                    :disabled="!fieldList1.length"
                    @click="rightMove('groupLevel')"
                    >一键右移</el-button
                  >
                  <div class="set-preference-item margin-right">
                    <div class="draggable-wrap-item background-color">未选</div>
                    <draggable
                      class="draggable-wrap"
                      v-model="fieldList1"
                      tag="ul"
                      v-bind="{
                        animation: 200,
                        group: 'fieldSite',
                      }"
                      @add="fieldAddGroup1"
                    >
                      <template #item="{ element, index }">
                        <div
                          class="draggable-wrap-item"
                          :key="Math.random() + index"
                        >
                          {{ element.label }}
                        </div>
                      </template>
                    </draggable>
                  </div>
                </el-col>
                <el-col :span="18">
                  <el-button
                    style="margin-bottom: 8px;"
                    type="primary"
                    :disabled="!fieldList2.length"
                    @click="leftMove('groupLevel')"
                    >一键左移</el-button
                  >
                  <div class="set-preference-item">
                    <div class="draggable-wrap-item background-color">
                      <span>已选</span>
                      <span style="marginright: 100px">操作</span>
                    </div>
                    <draggable
                      class="draggable-wrap"
                      v-model="fieldList2"
                      tag="ul"
                      v-bind="{
                        animation: 200,
                        group: 'fieldSite',
                      }"
                      @add="fieldAddGroup2"
                      @update="datadragFieldEnd3"
                    >
                      <template #item="{ element, index }">
                        <span> {{ element.label }}</span>
                        <span
                          style="marginright: 100px"
                          class="slip-edit"
                          @click="setTop(element, fieldList2, 'groupLevel')"
                        >
                          {{ index ? '置顶' : '' }}
                        </span>
                      </template>
                    </draggable>
                  </div>
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane name="sortLevel">
              <template #label>
                <div style="display: flex;align-items: center;">
                  <span class="margin-right">表格排序设置</span>
                </div>
              </template>
              <el-row class="set-preference-wrap">
                <el-col :span="6">
                  <!-- 隐藏排序一键右移按钮 -->
                  <el-button
                    style="margin-bottom: 8px;visibility: hidden;"
                    type="primary"
                    :disabled="!fieldList1.length"
                    @click="rightMove('sortLevel')"
                    >一键右移</el-button
                  >
                  <div class="set-preference-item margin-right">
                    <div class="draggable-wrap-item background-color">未选</div>
                    <draggable
                      class="draggable-wrap"
                      v-model="fieldList1"
                      tag="ul"
                      v-bind="{
                        animation: 300,
                        group: 'fieldSite',
                      }"
                      @add="fieldAddSort1"
                    >
                      <template #item="{ element, index }">
                        <div
                          class="draggable-wrap-item"
                          :key="Math.random() + index"
                        >
                          {{ element.label }}
                        </div>
                      </template>
                    </draggable>
                  </div>
                </el-col>
                <el-col :span="18">
                  <el-button
                    style="margin-bottom: 8px;"
                    type="primary"
                    :disabled="!fieldList2.length"
                    @click="leftMove('sortLevel')"
                    >一键左移</el-button
                  >
                  <div class="set-preference-item">
                    <div class="draggable-wrap-item background-color">
                      <span>已选</span>
                      <span style="marginright: 100px">操作</span>
                    </div>
                    <draggable
                      class="draggable-wrap"
                      v-model="fieldList2"
                      tag="ul"
                      v-bind="{
                        animation: 300,
                        group: 'fieldSite',
                      }"
                      @add="fieldAddSort2"
                      @update="datadragFieldEnd4"
                    >
                      <template #item="{ element, index }">
                        <div
                          class="draggable-wrap-item"
                          :key="Math.random() + index"
                        >
                          <span>{{ element.label }}</span>
                          <span
                            style="marginright: 100px"
                            class="slip-edit"
                            @click="
                              changeSort(element.sortControllerType, index)
                            "
                          >
                            {{
                              element.sortControllerType === 1
                                ? '升序'
                                : element.sortControllerType === 2
                                ? '降序'
                                : ''
                            }}
                          </span>
                        </div>
                      </template>
                    </draggable>
                  </div>
                </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </page-dialog>
  </div>
</template>
<script setup name="ConsumeSetPreference">
import draggable from 'vuedraggable'
const emits = defineEmits()
const { proxy } = getCurrentInstance()
const PageDialog = defineAsyncComponent(() =>
  import('@/components/PageDialog/index')
)
const SelectModel = defineAsyncComponent(() =>
  import('@/components/SelectModel/index')
)
//偏好设置
const props = defineProps({
  visible: {
    type: Boolean,
  },
  searchList: {
    type: Array,
    default: function () {
      return []
    },
  },
  fieldList: {
    type: Array,
    default: function () {
      return []
    },
  },
  customizeUserVO: {
    type: Object,
    default: function () {
      return {}
    },
  },
  groupLevelShow: {
    type: Boolean,
    default: false,
  },
})
const activeName = ref('showLevel')
// 弹窗相关
const dialogInfo = ref({
  title: '偏好设置',
  width: '800px',
  btLoading: false,
  btList: [
    {
      label: '确定',
      type: 'primary',
      disabled: false,
      event: save,
      show: true,
    },
    { label: '取消', event: handleClose, show: true },
  ],
})
const searchList1 = ref([])
const searchList2 = ref([])
const fieldList1 = ref([])
const fieldList2 = ref([])
const newFieldList = ref([])
const newCustomizeUserVO = ref({})
const showDialog = computed({
  get() {
    return props.visible
  },
  set(val) {
    emits('update:visible', val)
  },
})

setData()
function setData() {
  newCustomizeUserVO.value = JSON.parse(JSON.stringify(props.customizeUserVO))
  newFieldList.value = proxy.$fn.deepClone(props.fieldList)
  if (newFieldList.value.length) {
    fieldList1.value = newFieldList.value.filter((item) => item.showLevel === 0)
    newFieldList.value.sort(compare('showLevel'))
    fieldList2.value = newFieldList.value.filter((item) => item.showLevel > 0)
  }
}
function setTop(row, arr, str) {
  //置顶
  arr = arr.filter((item) => item !== row)
  switch (str) {
    case 'queryLevel':
      arr.unshift(row)
      arr.forEach((item, index) => {
        item.searchLevel = index + 1
      })
      searchList2.value = arr
      break
    case 'showLevel':
      arr.unshift(row)
      arr.forEach((item, index) => {
        item.showLevel = index + 1
      })
      fieldList2.value = arr
      break
    case 'groupLevel':
      arr.unshift(row)
      arr.forEach((item, index) => {
        item.groupLevel = index + 1
      })
      fieldList2.value = arr
      break
  }
}
function rightMove(str) {
  //右移
  switch (str) {
    case 'queryLevel':
      searchList2.value = searchList2.value.concat(searchList1.value)
      searchList2.value.forEach((item, index) => {
        item.show = true
        item.searchLevel = index + 1
      })
      searchList1.value = []
      break
    case 'showLevel':
      fieldList2.value = fieldList2.value.concat(fieldList1.value)
      fieldList2.value.forEach((item, index) => {
        item.hidden = false
        item.showLevel = index + 1
      })
      fieldList1.value = []
      break
    case 'groupLevel':
      fieldList2.value = fieldList2.value.concat(fieldList1.value)
      fieldList2.value.forEach((item, index) => {
        item.groupLevel = index + 1
      })
      fieldList1.value = []
      break
    case 'sortLevel':
      fieldList2.value = fieldList2.value.concat(fieldList1.value)
      fieldList2.value.forEach((item, index) => {
        item.sortable = true
        item.sortControllerType = 1
        item.sortLevel = index + 1
      })
      fieldList1.value = []
      break
  }
}
function leftMove(str) {
  //左移
  switch (str) {
    case 'queryLevel':
      searchList1.value = searchList1.value.concat(searchList2.value)
      searchList1.value.forEach((item) => {
        item.show = false
        item.searchLevel = 0
      })
      searchList2.value = []
      break
    case 'showLevel':
      fieldList1.value = fieldList1.value.concat(fieldList2.value)
      fieldList1.value.forEach((item) => {
        item.hidden = true
        item.showLevel = 0
      })
      fieldList2.value = []
      break
    case 'groupLevel':
      fieldList1.value = fieldList1.value.concat(fieldList2.value)
      fieldList1.value.forEach((item) => {
        item.groupLevel = 0
      })
      fieldList2.value = []
      break
    case 'sortLevel':
      fieldList1.value = fieldList1.value.concat(fieldList2.value)
      fieldList1.value.forEach((item) => {
        item.sortable = false
        item.sortControllerType = 0
        item.sortLevel = 0
      })
      fieldList2.value = []
      break
  }
}
function handleClose() {
  showDialog.value = false
}
function save() {
  let customizeUserVO = newCustomizeUserVO.value
  let searchList = searchList2.value.concat(searchList1.value)
  let fieldList = newFieldList.value
  searchList.forEach((item) => {
    if (Object.keys(customizeUserVO.detail).includes(item.value)) {
      customizeUserVO.detail[item.value].searchLevel = item.searchLevel
    }
  })
  fieldList.forEach((item) => {
    if (Object.keys(customizeUserVO.detail).includes(item.value)) {
      customizeUserVO.detail[item.value].showLevel = item.showLevel
      customizeUserVO.detail[item.value].sortControllerType =
        item.sortControllerType
      customizeUserVO.detail[item.value].sortLevel = item.sortLevel
      customizeUserVO.detail[item.value].formWidth = item.minWidth
    }
  })
  emits('callback', {
    searchList: searchList,
    fieldList: fieldList,
    customizeUserVO: customizeUserVO,
  })
  handleClose()
}
function compare(property) {
  return function (a, b) {
    return a[property] - b[property]
  }
}
function handleClick() {
  proxy.$nextTick(() => {
    let fieldList = newFieldList.value
    if (activeName.value === 'showLevel') {
      fieldList1.value = fieldList.filter((item) => item.showLevel === 0)
      fieldList.sort(compare('showLevel'))
      fieldList2.value = fieldList.filter((item) => item.showLevel > 0)
    } else if (activeName.value === 'sortLevel') {
      fieldList.sort(compare('showLevel'))
      fieldList1.value = fieldList.filter(
        (item) => item.sortControllerType === 0 && item.showLevel > 0
      )
      fieldList2.value = fieldList.filter(
        (item) => item.sortControllerType > 0 && item.showLevel > 0
      )
    } else if (activeName.value === 'groupLevel') {
      fieldList1.value = fieldList.filter(
        (item) => item.groupLevel === 0 && item.showLevel > 0
      )
      fieldList2.value = fieldList.filter(
        (item) => item.groupLevel > 0 && item.showLevel > 0
      )
    }
  })
}
function changeSort(num, index) {
  if (num === 1) {
    fieldList2.value[index].sortControllerType = 2
  } else if (num === 2) {
    fieldList2.value[index].sortControllerType = 1
  }
}
//查询
function add1(e) {
  searchList1.value.forEach((item) => {
    item.show = false
    item.searchLevel = 0
  })
}
function add2(e) {
  searchList2.value.forEach((item, index) => {
    item.show = true
    item.searchLevel = index + 1
  })
}
function datadragSearchEnd2() {
  searchList2.value.forEach((item, index) => {
    item.searchLevel = index + 1
  })
}
//显示
function fieldAddshow1() {
  fieldList1.value.forEach((item) => {
    item.hidden = true
    item.showLevel = 0
  })
}
function fieldAddshow2() {
  fieldList2.value.forEach((item, index) => {
    item.hidden = false
    item.showLevel = index + 1
  })
}
function datadragFieldEnd2() {
  fieldList2.value.forEach((item, index) => {
    item.showLevel = index + 1
  })
}
//分组
function fieldAddGroup1() {
  fieldList1.value.forEach((item) => {
    item.groupLevel = 0
  })
}
function fieldAddGroup2() {
  fieldList2.value.forEach((item, index) => {
    item.groupLevel = index + 1
  })
}
function datadragFieldEnd3() {
  fieldList2.value.forEach((item, index) => {
    item.groupLevel = index + 1
  })
}
//排序
function fieldAddSort1(e) {
  fieldList1.value.forEach((item) => {
    item.sortable = false
    item.sortControllerType = 0
    item.sortLevel = 0
  })
}
function fieldAddSort2(e) {
  let newIndex = e.newIndex;
  let oldIndex = e.oldIndex;
  // 最多只允许5个排序字段
  if (fieldList2.value.length === 6) {
    fieldList2.value.splice(newIndex, 1); //清除多余右移字段
    fieldList1.value.splice(oldIndex, 0, e.item._underlying_vm_); //复原多余右移字段
    proxy.$message.error({
      message: "排序字段不能超过5个",
      showClose: true,
      duration: 3500,
    });
    return;
  }
  fieldList2.value.forEach((item, index) => {
    item.sortable = true
    item.sortControllerType = newIndex === index ? 1 : item.sortControllerType
    item.sortLevel = index + 1
  })
}
function datadragFieldEnd4(e) {
  fieldList2.value.forEach((item, index) => {
    item.sortLevel = index + 1
  })
}
function choose1(evt) {
  // const ITEM_HEIGHT = 153;
  const ITEM_HEIGHT = evt.item.offsetHeight
  let container = evt.path[1]
  let index = evt.oldIndex

  if (index * ITEM_HEIGHT < container.scrollTop) {
    container.scrollTo({
      top: index * ITEM_HEIGHT,
    })
  } else if (
    (index + 1) * ITEM_HEIGHT >
    container.scrollTop + container.offsetHeight
  ) {
    container.scrollTo({
      top: (index + 1) * ITEM_HEIGHT - container.offsetHeight,
    })
  }
}
function choose2(evt) {
  // const ITEM_HEIGHT = 153;
  const ITEM_HEIGHT = evt.item.offsetHeight
  let container = evt.path[1]
  let index = evt.oldIndex

  if (index * ITEM_HEIGHT < container.scrollTop) {
    container.scrollTo({
      top: index * ITEM_HEIGHT,
    })
  } else if (
    (index + 1) * ITEM_HEIGHT >
    container.scrollTop + container.offsetHeight
  ) {
    container.scrollTo({
      top: (index + 1) * ITEM_HEIGHT - container.offsetHeight,
    })
  }
}
</script>
<style scoped lang="scss">
.set-preference-wrap {
  box-sizing: border-box;
  .set-preference-item {
    border: 1px solid #dae2ea;
    height: 300px;
    overflow: hidden;
    overflow-y: scroll;
  }
}
.draggable-wrap {
  height: 100%;
  .draggable-wrap-group {
    height: 100%;
    width: 100%;
    display: inline-block;
  }
}
.draggable-wrap-item {
  height: 36px;
  width: 100%;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #dae2ea;
  padding: 0 5px;
  box-sizing: border-box;
  color: #606266;
  .draggable-wrap-item-right {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .draggable-wrap-item-right-form-width {
      margin-right: 24px;
    }
    .draggable-wrap-item-right-form-width-title {
      width: 100px;
      margin-right: 24px;
      text-align: center;
    }
  }
}
.background-color {
  background: #fff;
  border-top: 0;
  color: #333;
  font-weight: 600;
}
.margin-right {
  margin-right: 24px;
}
.slip-edit {
  display: inline-block;
  width: 40px;
}
</style>
