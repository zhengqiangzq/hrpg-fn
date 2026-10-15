/**
 * v-showtip 溢出显示
 * Copyright (c) 2022 slp
 */

export default {
  mounted(el, binding, vnode) {
    showtip(el)
  },
  updated(el, binding) {
    showtip(el)
  },
  inserted: (el) => {
    showtip(el) // 可以获取到ajax数据的DOM元素，即真实的宽度
  },
}

function showtip(el) {
  console.log(el.querySelector('.ellipse-text').offsetWidth,el.parentNode.offsetWidth);
  console.log(8888, el.querySelector('.ellipse-text') &&
  el.querySelector('.ellipse-text').offsetWidth < el.parentNode.parentNode.offsetWidth);
  // 如果没有超出宽度，即子<父 则移除tooltip
  if (
    el.querySelector('.ellipse-text') &&
    el.querySelector('.ellipse-text').offsetWidth < el.parentNode.parentNode.offsetWidth
  ) {
    const copyEl = el.parentNode.parentNode // 获取到目标节点的父节点
    console.log(copyEl)
    const copySpan = el.querySelector('.ellipse-text') // 获取到目标节点的子节点，即纯粹的span标签文案
    el.parentNode.removeChild(el) // 移除带有el-tooltip组件的节点
    copyEl.appendChild(copySpan) // 将纯粹的span标签文案整体追加到目标节点的父节点
  }
}
