import { computed } from 'vue'
import { useStore } from 'vuex'

/**
 * 跨页面行高亮 Hook
 *
 * 场景：从列表页点击编辑跳转到编辑页，保存返回后高亮刚才编辑的那一行。
 * 替代原来分散在各页面中的 sessionStorage.getItem/setItem('storeRowId') 模式。
 *
 * **tableRowClassName 已内置在 TableContainer 组件中**，所有使用 TableContainer 的页面
 * 自动获得行高亮能力，无需手动传递 :row-class-name。
 *
 * 页面只需在编辑/新增操作时调用 setHighlightRow：
 *   const { setHighlightRow } = useHighlightRow()
 *   setHighlightRow(row.id)  // 点击编辑时记录行ID
 *
 * 如果需要手动绑定（比如直接用 el-table），可从 hook 中取出 tableRowClassName：
 *   <el-table :row-class-name="tableRowClassName" />
 */
export function useHighlightRow() {
  const store = useStore()

  const highlightRowId = computed(() => store.state.app.highlightRowId)

  /** 设置需要高亮的行ID */
  function setHighlightRow(id) {
    store.dispatch('app/setHighlightRowId', id)
  }

  /** 清除高亮 */
  function clearHighlightRow() {
    store.dispatch('app/setHighlightRowId', '')
  }

  /** 直接用于 el-table 的 :row-class-name 属性 */
  function tableRowClassName({ row }) {
    const rowId = store.state.app.highlightRowId
    return rowId && row.id === rowId ? 'check-row' : ''
  }

  return {
    highlightRowId,
    setHighlightRow,
    clearHighlightRow,
    tableRowClassName,
  }
}
