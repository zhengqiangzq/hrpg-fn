/**
 * v-showtip 溢出显示
 * Copyright (c) 2022 slp
 */
import { nextTick } from 'vue';
import commonJson from '@/common/js/commonJson.js'

export default {
  mounted(el, binding, vnode) {
    setBtnPrimary(el)
  },
  updated(el, binding) {
    setBtnPrimary(el)
  },
  inserted: (el) => {
    setBtnPrimary(el)
  },
}
function setBtnPrimary(el) {
  nextTick(() => {
    const btns = el.querySelectorAll('.el-button');
    btns.forEach(btn => {
      if (btn && commonJson.btnPrimaryOptions.includes(btn.innerText.trim())) {
        btn.classList.add('el-button--primary');
      }
    })
  })
}
