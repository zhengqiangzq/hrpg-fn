<template>
  <div class="fullModel">
    <div class="slipui-row fullBox slipui-col-space15">
      <div class="slipui-col-md12 fullBox">
        <div class="slipui-card fullBox">
          <div class="slipui-card-header flex_wrap_between_middle fullTitle">
            <div class="tittle fullModel-title">{{ title }}</div>
            <div class="right-box" v-set-btn-primary>
              <slot name="full-button" />
              <template v-for="(item, index) in btnList">
                <el-button
                  v-if="item.show"
                  :disabled="item.disabled"
                  :key="index"
                  @click="item.event"
                  :loading="item.loading"
                  :type="getItemType(item)"
                  >{{ item.label }}</el-button
                >
              </template>
              <el-button v-if="needOperateAffair" @click="operateAffairClick"
                >操作流水</el-button
              >
              <el-button v-if="needReturn" @click="turnBack"
                >返回</el-button
              >
            </div>
          </div>
          <div class="slipui-card-body box-scroll-y" :class="newFullScreenClass" id="newFullScreenScroll">
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
    <OperateAffair
      :visible="operateAffairInfo.visible"
      :info="operateAffairData"
      @callBack="operateAffairClose"
    />
  </div>
</template>
<script setup name="NewFullScreen">
const props = defineProps({
  btnList: {
    type: Array,
    default: function () {
      return []
    },
  },
  modelValue: {
    type: Boolean,
  },
  title: {
    type: String,
    default: '订单信息',
  },
  needReturn: {
    type: Boolean,
    default: true,
  },
  operateAffairData: {
    type: Object,
    default: function () {
      return {}
    },
  },
  needOperateAffair: {
    type: Boolean,
    default: false,
  },
  newFullScreenClass: {
    type: String,
    default: ''
  }
})

const { proxy } = getCurrentInstance()

const state = reactive({
  parentEl: '',
})
const operateAffairInfo = ref({
  visible: false,
  data: [],
})

const emit = defineEmits(['update:modelValue', 'returnBack'])
// model: {
//   prop: "modelValue",
//   event: "returnBack"
// }
function turnBack() {
  const goBackUrl = getQueryParams()?.goBackUrl
  if(goBackUrl) {
    window.$wujie?.bus.$emit('subMicroAppRouteChange',{
        toBackRouter: true
      })
  } else {
    emit('returnBack', false)
    emit('update:modelValue', false)
  }
}
function getQueryParams() {
  const params = new URLSearchParams(window.parent.location.search);
  return Object.fromEntries(params.entries());
}
const append = () => {
  state.parentEl.appendChild(proxy.$el)
}
const destroyed = () => {
  state.parentEl.removeChild(proxy.$el)
}
function operateAffairClick() {
  operateAffairInfo.value.visible = true
}
function operateAffairClose() {
  operateAffairInfo.value.visible = false
}
function getItemType(item) {
  if(item.btType) {
    return item.btType
  }
  const primaryArr = ['保存', '保存并提交', '打印', '导出', '编辑']
  if(primaryArr.includes(item.label)) {
    return 'primary'
  }
  return 'default'
}

</script>

<style scoped>
.tittle {
  font-weight: bold;
}

.slipui-card-header {
  padding: 0 5px;
  flex-wrap: nowrap;
}

.fullModel {
  /* background-color: #f2f2f2; */
  background: #fff;
  border: 1px solid #f2f2f2;
  /* height: calc(100% - 10px); */
  height: 100%;
  padding: 0px;
  /* width: calc(100% - 24px); */
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 4;
}
.right-box {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-width: 70%;
  flex-wrap: wrap;
}
</style>
