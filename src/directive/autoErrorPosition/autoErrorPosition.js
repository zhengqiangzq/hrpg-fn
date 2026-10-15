export default {
  mounted(el) {
    adjustAllErrors(el)

    const observer = new MutationObserver(() => {
      adjustAllErrors(el)
    })
    observer.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    })
    el._autoErrorPositionObserver = observer

    // 新增：监听窗口尺寸变化
    el._resizeHandler = () => adjustAllErrors(el)
    window.addEventListener('resize', el._resizeHandler)
  },
  updated(el) {
    adjustAllErrors(el)
  },
  unmounted(el) {
    if (el._autoErrorPositionObserver) {
      el._autoErrorPositionObserver.disconnect()
      delete el._autoErrorPositionObserver
    }
    // 新增：移除 resize 监听，防止内存泄漏
    if (el._resizeHandler) {
      window.removeEventListener('resize', el._resizeHandler)
      delete el._resizeHandler
    }
  },
}

function adjustAllErrors(container) {
  const errorEls = container.querySelectorAll('.el-form-item__error')
  errorEls.forEach(adjustErrorPosition)
}

function adjustErrorPosition(errorEl) {
  if (!errorEl.textContent || !errorEl.textContent.trim()) {
    return
  }

  const computedStyle = getComputedStyle(errorEl)
  const lineHeight = parseFloat(computedStyle.lineHeight)
  if (!lineHeight || isNaN(lineHeight)) return

  // 关键修复：临时设为 static 以获取真实的 scrollHeight
  const originalPosition = errorEl.style.position
  errorEl.style.position = 'static'
  
  const threshold = lineHeight * 1.2
  const isMultiLine = errorEl.scrollHeight > threshold

  // 根据真实高度决定最终 position
  errorEl.style.position = isMultiLine ? 'static' : 'absolute'
}
