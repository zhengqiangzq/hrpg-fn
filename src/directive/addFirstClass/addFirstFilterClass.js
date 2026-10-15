/**
 * v-showtip 溢出显示
 * Copyright (c) 2022 slp
 */
import { nextTick } from 'vue';

export default {
  mounted(el, binding, vnode) {
    addFirstFilterClass(el)
  },
  updated(el, binding) {
    addFirstFilterClass(el)
  },
  inserted: (el) => {
    addFirstFilterClass(el)
  },
}
function addFirstFilterClass(el) {
  nextTick(() => {
    const filterWrapperEls = document.querySelectorAll('.filter-wrapper')
    Array.from(filterWrapperEls).forEach((wrapper, index) => {
      // 获取父容器
      const parent = wrapper.parentNode
      // 检查当前 wrapper 是否在 display: none 的盒子内
      let current = parent
      let isHidden = false
      // 向上遍历 DOM 树，检查是否有祖先元素是隐藏状态
      while (current && current !== document.body) {
        if (window.getComputedStyle(current).display === 'none') {
          isHidden = true
          break
        }
        current = current.parentNode
      }
      if (isHidden) return // 如果在隐藏区域，则跳过
      // 判断同级是否有 titleTab 类名的元素
      const siblings = Array.from(parent.children)
      const hasTitleTab = siblings.some(
        (sibling) =>
          sibling !== wrapper && sibling.classList.contains('titleTab')
      )
      // 如果满足条件，第一个元素，则添加类名
      if (hasTitleTab && index === 0) {
        wrapper.classList.add('first-filter-wrapper')
      }
    })
  })
}
