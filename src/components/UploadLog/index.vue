<template>
    <page-dialog :title="dialogInfo.title" v-model:visible="shows" :width="dialogInfo.width">
        <!-- 条件栏 -->
        <new-page-filter v-model:query="filterInfo.query" :filter-list="filterInfo.list" :filter-btn="filterInfo.searchBtn">
            <template v-slot:filter-operateUserName>
                <el-input v-model="operateUserName" type="input" :disabled="true" class="not-mongolia"
                    placeholder="请选择人员">
                    <template #append>
                        <el-icon @click="openUserList">
                            <Search />
                        </el-icon>
                    </template>
                </el-input>
            </template>
        </new-page-filter>
        <dialog-table :refresh="tableInfo.refresh" :init-curpage="tableInfo.initCurpage" v-model:data="tableInfo.data"
            :api="tableInfo.api" :listen-height="false" v-model:query="filterInfo.query"
            :field-list="tableInfo.fieldList" :handle="tableInfo.handle" :highlight-row="highlightRow"
            :check-box="checkBox">
            <template v-slot:col-sourceName="scope">
                <span v-if="scope.row.sourceName" class="slip-edit" @click="download(scope.row, 'sourceFile', scope.row.sourceName)">{{ scope.row.sourceName
                    }}</span>
                <span v-else>-</span>
            </template>
            <template v-slot:col-resultName="scope">
                <span v-if="scope.row.resultName" class="slip-edit" @click="download(scope.row, 'resultFile', scope.row.resultName)">{{ scope.row.resultName
                    }}</span>
                <span v-else>-</span>
            </template>
        </dialog-table>
    </page-dialog>
    <SelectData ref="selectorRef" />
</template>

<script setup>
import { getExcelImportRecordPage, excelImportRecordResume, excelImportRecordInterrupt, delExcelImportRecord, exportExcel } from '@/api/base.js'
import { useSelectData } from "@/hooks/useSelectData"
const emits = defineEmits()
const { proxy } = getCurrentInstance()
const props = defineProps({
    highlightRow: {
        type: Boolean,
        default: false,
    },
    checkBox: {
        type: Boolean,
        default: false,
    },
    api: {
        type: Function,
        default: getExcelImportRecordPage,
    },
    showDialog: {
        type: Boolean,
    },
    query: {
        type: Object,
        default: function () {
            return {}
        },
    },

})
// 过滤相关配置
const filterInfo = ref({
    query: {
        sort: 'create_time desc',
        ...props.query,
    },
    list: [
        {
            componentType: 'input',
            label: '任务号',
            value: 'orderNoLike',
            event: search,
        },
        {
            componentType: 'select-model',
            label: '导入方式',
            value: 'syncType',
            code: 'excel_sync_type',
            event: search,
        },
        {
            componentType: 'select-model',
            label: '导入策略',
            value: 'importType',
            code: 'excel_import_type',
            event: search,
        },
        {
            componentType: 'select-model',
            label: '状态',
            value: 'status',
            code: 'excel_import_record_status',
            event: search,
        },
        {
            slot: true,
            label: '操作人',
            value: 'operateUserName',
            showLabel: true
        },
    ],
    searchBtn: [
        { type: 'button', label: '查询', event: search },
        { type: 'button', label: '重置', event: rest },
    ]
})
const operateUserName = ref('')
// 表格相关
const tableInfo = ref({
    refresh: 1,
    initCurpage: 1,
    data: [],
    api: undefined,
    fieldList: [
        { label: '业务类型', value: 'typeValue' },
        { label: '任务号', value: 'orderNo' },
        { label: '导入方式', value: 'syncTypeValue' },
        { label: '导入策略', value: 'importTypeValue' },
        { label: '状态', value: 'statusValue' },
        { label: '开始时间', value: 'startTime' },
        { label: '结束时间', value: 'endTime' },
        { label: '总条数', value: 'totalRecord' },
        { label: '成功条数', value: 'successRecord' },
        { label: '失败条数', value: 'errorRecord' },
        { label: '操作人', value: 'operateUserName' },
        { label: '导入源文件', value: 'sourceName', type: 'slot' },
        { label: '导入结果文件', value: 'resultName', type: 'slot' },
    ],
    handle: {
        fixed: 'right',
        label: '操作',
        width: '100',
        btList: [
            {
                label: '中止',
                event: stop,
                show: true,
                ifRender: (row) => {
                    return row.syncType === '2' && row.status === '1'
                }
            },
            {
                label: '继续',
                event: initiate,
                show: true,
                ifRender: (row) => {
                    return row.syncType === '2' && row.status === '2'
                }
            },
            {
                label: '删除',
                event: remove,
                show: true,
                ifRender: (row) => {
                    return row.status === '3' || row.status === '2'
                }
            },
        ]
    }
})
const { selectorInfo, selectorRef } = useSelectData()
// 弹窗相关
const dialogInfo = ref({
    title: '导入日志',
    width: '90%'
})
const shows = computed({
    get() {
        return props.showDialog
    },
    set(newValue) {
        emits('update:showDialog', newValue) // 更新父组件shows
    },
})
// 获取列表
function getList() {
    tableInfo.value.api = props.api
    tableInfo.value.refresh = Math.random()
}
function search() {
    tableInfo.value.api = props.api
    tableInfo.value.initCurpage = Math.random()
    tableInfo.value.refresh = Math.random()
}
function rest() {
    filterInfo.value.query = {
        sort: 'create_time desc',
        ...props.query,
    }
    operateUserName.value = "";
    search()
}
function openUserList() {
    selectorInfo.type = 'user';
    selectorInfo.callback = selectUserCallBack;
    selectorInfo.visible = true;
}
function selectUserCallBack(row) {
    if (row && row.id) {
        filterInfo.value.query["operateUser"] = row.id;
        operateUserName.value = row.name;
    } else {
        filterInfo.value.query["operateUser"] = "";
        operateUserName.value = "";
    }
}
function stop(row) {
    excelImportRecordInterrupt(row.id).then(res => {
        if (res && res.success) {
            search()
        }
    })
}
function initiate(row) {
    excelImportRecordResume(row.id).then(res => {
        if (res && res.success) {
            search()
        }
    })
}
function remove(row) {
    proxy
        .$confirm('删除后将改变数据,是否继续？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        })
        .then(() => {
            delExcelImportRecord([row.id]).then((res) => {
                if (res && res.success) {
                    search()
                }
            })
        })
}
function download(row, str, name) { 
    exportExcel({fileName: row[str]}).then(res => {
        if(res){
            if(name.includes('.')){
               let arr = name.split('.')
               name = arr[0] 
            }
            proxy.$fn.parseExcel(res, name)
        }
    })
}
onMounted(() => {
    proxy.$nextTick(() => {
        getList()
    })
})
</script>

<style scoped lang="scss"></style>