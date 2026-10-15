import {useStore} from "vuex";
import {getCurrentInstance, reactive} from "vue";
import {exportTemplateExcel} from "@/api/base";
export function useUpload(apis = { export: null, download: null }, templateName) {
    const API = apis
    const TEMPLATE_NAME = templateName
    const { proxy } = getCurrentInstance()
// 下载模板
    function downloadTemplate(name, btnCode) {
        const api = API.download ?? exportTemplateExcel
        api(TEMPLATE_NAME, btnCode).then((res) => {
            if (res) {
                proxy.$fn.parseExcel(res, `${name || TEMPLATE_NAME}.xlsx`)
            }
        })
    }

// 导出数据
    function exportData(query = {}, btnCode) {
        API.export(query, btnCode).then((resp) => {
            if (resp) {
                proxy.$fn.parseExcel(resp)
            }
        })
    }
    return {
        downloadTemplate,
        exportData
    }
}
