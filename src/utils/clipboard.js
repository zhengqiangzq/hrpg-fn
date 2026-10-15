
import Clipboard from 'clipboard'
import { ElMessage } from 'element-plus'
function clipboardSuccess() {
  ElMessage.success('Copy successfully')
}

function clipboardError() {
  ElMessage.error('Copy failed')
}

export function clipboard(text, event) {
  const clipboard = new Clipboard(event.target, {
    text: () => text
  })
  clipboard.on('success', () => {
    clipboardSuccess()
    clipboard.destroy()
  })
  clipboard.on('error', () => {
    clipboardError()
    clipboard.destroy()
  })
  clipboard.onClick(event)
}
