<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="border-style-bottom">
          <TreeBtns :filter-btn="treeBtnInfo.btnList" :title="treeBtnInfo.title" />
          <div class="leftPageFilter">
            <NewPageFilter
                v-model:query="filterLeftInfo.query"
                :filter-list="filterLeftInfo.list"
            >
              <template #filter-accountBookName>
                <el-input
                    v-model="filterLeftInfo.query.accountBookName"
                    style="width: 100%"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择核算账簿"
                >
                  <template #append>
                    <el-icon @click="selectAccountBook('')"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
            </NewPageFilter>
          </div>
        </div>
        <div class="left-container-header border-style-bottom">
          <el-input
            v-model="treeInfo.name"
            :clearable="true"
            placeholder="请输入编码/名称"
            suffix-icon="Search"
            class="show-placeholder flex"
            @keyup.enter="handleSearch"
          ></el-input>
        </div>
        <div class="left-container-main main-flex">
          <el-tree
            ref="menuTree"
            :data="treeInfo.data"
            highlight-current
            :props="treeInfo.defaultProps"
            node-key="id"
            :default-expand-all="true"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
          />
        </div>
      </div>
      <div class="right-container">
        <div class="filter-wrapper">
          <NewPageFilter
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.list"
            :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-debitSubject>
              <el-input
                v-model="filterInfo.query.debitSubject"
                style="width: 100%"
                class="not-mongolia"
                type="input"
                placeholder="请选择借方科目"
              >
                <template #append>
                  <el-icon @click="selectDebitSubject"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-creditSubject>
              <el-input
                v-model="filterInfo.query.creditSubject"
                style="width: 100%"
                class="not-mongolia"
                type="input"
                placeholder="请选择贷方科目"
              >
                <template #append>
                  <el-icon @click="selectCreditSubject"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        <table-container
          :refresh="tableInfo.refresh"
          :init-curpage="tableInfo.initCurpage"
          v-model:data="tableInfo.data"
          :api="tableInfo.api"
          :query="filterInfo.copyQuery"
          :tabIndex="true"
          :pager="false"
          :field-list="tableInfo.fieldList"
          :handle="tableInfo.handle"
          @handleEvent="tableHandler"
        >
        </table-container>
      </div>
      <add-edit
        v-if="addInfo.visible"
        v-model:visible="addInfo.visible"
        :title="addInfo.title"
        :id="addInfo.id"
        :params="addInfo.params"
        :table-row="addInfo.tableRow"
        @callback="handleCallBack"
      ></add-edit>
    </div>
    <PageDialog
        v-model:visible="copyInfo.visible"
        :title="copyInfo.title"
        :width="copyInfo.width"
    >
      <pageTable
          :table-data="copyInfo.tableData"
          :field-list="copyInfo.fieldList"
          :data="copyInfo.data"
          :tabIndex="true"
          :checkBox="false"
          :pager="false"
      />
    </PageDialog>
    <select-data ref="selectorRef" />
  </div>
</template>

<script setup name="relationship">
import { getCurrentInstance, onMounted, ref, watch } from "vue";
import cloneDeep from "lodash/cloneDeep";
import { useUpload } from "@/hooks/useUpload";
import { useStorage } from "@vueuse/core";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import {cashFlowItemsTreeList, exportTemplateExcel} from "@/api/base";
import { useSelectData } from "@/hooks/useSelectData";
import {
  cashflowRelationCopyToOrg,
  cashflowRelationDelete,
  cashflowRelationGetbyId,
  cashflowRelationList
} from "@/api/ledger/relationship";
const AddEdit = defineAsyncComponent(() => import("./addEdit"));

const setting = useStorage("setting", {}, sessionStorage);

const { proxy } = getCurrentInstance();
const API = {
  tree: cashFlowItemsTreeList,
  list: cashflowRelationList,
  copy: cashflowRelationCopyToOrg,
  detail: cashflowRelationGetbyId,
  delete: cashflowRelationDelete,
  export: null,
  download: exportTemplateExcel,
};

const { downloadTemplate } = useUpload(
  API,
  "现金流量关系导入模板",
);

const { uploadExcelBtns, uploadTest, uploadLog } = useUploadExcel({
  PERMISSION_CODE: "relationship",
  type: "260205",
  action: "/ga/cashflowRelation/importExcel",
});

const { selectorInfo, selectorRef } = useSelectData();

const userInfo = proxy.$store.state.systemConfig?.userLoginConfig
const filterLeftInfo = ref({
  query: {
    accbookId: '',
    accountBookName: '',
  },
  copyQuery: {},
  list: [
    {label: "核算账簿", value: "accountBookName", required: true, slot: true },
  ],
})

const states = ref({
  row: null,
});

const filterInfo = ref({
  query: {},
  copyQuery: {},
  list: [
    { label: "借方科目", value: "debitSubject", slot: true },
    { label: "贷方科目", value: "creditSubject", slot: true },
  ],
  filterbtn: [
    { type: "button", label: "查询", btType: "primary", event: () => getList() },
    { type: "button", label: "重置", event: () => reset() },
  ],
  btnList: [
    {
      type: "button",
      label: "新增",
      show: proxy.$permission("relationship:add"),
      event: () => openAddEdit(),
      disabled: () => { return !(filterLeftInfo.value.query.accbookId && states.value.row?.id && states.value.row?.children?.length === 0) }
    },
    {
      type: "button",
      label: "删除",
      show: proxy.$permission("relationship:delete"),
      event: () => deleteData(),
    },
    {
      type: "button",
      label: "复制到其他账簿",
      show: proxy.$permission("relationship:copy"),
      event: () => selectAccountBook('copy'),
      disabled: () => { return !filterLeftInfo.value.query.accbookId }
    },
    {
      type: "button",
      label: "复制详情",
      show: proxy.$permission("relationship:copyDetail"),
      event: () => copyDetail(),
    },
    {
      type: "dropdown",
      label: "导入",
      show:
          proxy.$permission("relationship:export") ||
          proxy.$permission("relationship:download") ||
          proxy.$permission("relationship:import"),
      children: [
        {
          type: "button",
          label: "下载导入模板",
          command: "download",
          show: proxy.$permission("relationship:download"),
        },
        ...uploadExcelBtns,
      ],
      event: (command) => {
        switch (command) {
          case "download":
            downloadTemplate("现金流量关系导入模板", "relationship:download")
            break;
          case "import":
            uploadTest();
            break;
          case "importLog":
            uploadLog();
            break;
        }
      }
    },
  ],
});

const tableInfo = ref({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: "借方科目", value: "debitSubject" },
    { label: "辅助核算", value: "debitAssName" },
    { label: "贷方科目", value: "creditSubject" },
    { label: "辅助核算", value: "creditAssName" },
    { label: "创建人", value: "createUserName" },
    { label: "创建日期", value: "createDate" },
  ],
  data: [],
  summaryFieldList: [],
  handle: {
    fixed: "right",
    label: "操作",
    width: "120",
    btList: [
      {
        label: "编辑",
        show: proxy.$permission("relationship:update"),
        event: (row) => openAddEdit(row),
      },
      {
        label: "删除",
        show: proxy.$permission("relationship:delete"),
        event: (row) => deleteData(row),
      },
    ],
  },
  sectionRows: [],
});

const addInfo = ref({
  visible: false,
  title: "",
  id: "",
  tableRow: {},
  params: {},
});

const copyInfo = ref({
  visible: false,
  title: '复制详情',
  data: [],
  fieldList: [
    { label: '本方账簿', value: 'fromAccbookName' },
    { label: '复制内容', value: 'typeValue' },
    { label: '目的账簿', value: 'toAccbookName' },
    { label: '摘要', value: 'explanation' },
    { label: '说明', value: 'copyResult' },
  ],
})

const menuTree = ref();

const treeInfo = ref({
  defaultProps: {
    children: "children",
    label: (data, node) => {
      return data.code ? `${data.code} ${data.name}` : data.name;
    },
  },
  name: "",
  expandOnClickNode: false,
  defaultExpandAll: true,
  current: null,
  filterText: "",
  data: [
    {
      id: "-2",
      code: "",
      name: "现金流量项目",
      children: [],
    },
  ],
});

const treeBtnInfo = ref({
  title: "现金流量项目",
  btnList: [],
});

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  let deleteBtn = btns.find(btn => btn.label === '删除')
  deleteBtn.disabled = !rows.length
}, { immediate: true })

onMounted(() => {
  if(userInfo) {
    filterLeftInfo.value.query.accbookId = userInfo.accbookId
    filterLeftInfo.value.query.accountBookName = userInfo.accbookName
    queryTree()
  }
});

function queryTree() {
  tableInfo.value.data = []
  API.tree( filterLeftInfo.value.query, 'relationship:list').then((res) => {
    treeInfo.value.data[0].children = res?.data || [];
  });
}

async function getList() {
  if(!states.value.row?.id) {
    return proxy.$message.warning("请选择现金流量项目");
  }
  filterInfo.value.copyQuery = cloneDeep({
    accbookId: filterLeftInfo.value.query.accbookId,
    cashflowItemId: states.value.row?.id,
    accDirection: filterInfo.value.query.debitSubject ? '1' : filterInfo.value.query.creditSubject ? '0' : '',
    accasoaOriginalId: filterInfo.value.query.debitSubjectId || filterInfo.value.query.creditSubjectId || ''
  });
  const { data } = await API.list(filterInfo.value.copyQuery)
  tableInfo.value.data = data && data.map(it => {
    return {
      ...it,
      debitSubject: it.accDirection === '1' ? it.accasoaName : '',
      debitAssName: it.accDirection === '1' ? it.assValue : '',
      creditSubject: it.accDirection === '0' ? it.accasoaName : '',
      creditAssName: it.accDirection === '0' ? it.assValue : '',
    }
  })
  tableInfo.value.refresh = Math.random();
}

function reset() {
  filterInfo.value.query = {};
  getList();
}

function handleSearch() {
  menuTree.value.filter(treeInfo.value.name);
}

function filterNode(value, data) {
  const NAME = data.name + data.code + "";
  return NAME.includes(value);
}

function handleNodeClick(data) {
  getNodeData(data);
}

function getNodeData(node) {
  if (!node || node.id === "-2") return (states.value.row = null);
  states.value.row = node;
  getList();
}

function openAddEdit(row) {
  if (!states.value.row?.id) {
    return proxy.$message.warning("请选择现金流量项目");
  }
  addInfo.value.id = row ? row.id : '';
  addInfo.value.tableRow = row || {};
  addInfo.value.params = {
    ...filterLeftInfo.value.query,
    cashflowItemId: states.value.row?.id,
  };
  addInfo.value.title = row ? "编辑现金流量关系" : "新增现金流量关系";
  addInfo.value.visible = true;
}

function deleteData(row) {
  const ids = row ? [row.id] : tableInfo.value.sectionRows.filter((it) => it.id !== null).map((it) => it.id);
  if (ids.length === 0) {
    return proxy.$message.warning("请勾选数据");
  }
  const confirmText = ids.length > 1 ? `确定删除选中的${ids.length}条数据吗？` : "删除后将改变数据,是否继续?";
  proxy
    .$confirm(confirmText, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
    .then(() => {
      API.delete(ids,'relationship:delete').then(({ code }) => {
        if (code === 200) {
          proxy.$message.success("删除成功");
          getList();
        }
      });
    });
}

function tableHandler(eventName, raw) {
  if (eventName === "tableCheck") {
    tableInfo.value.sectionRows = raw;
  }
}

function selectAccountBook(make) {
  selectorInfo.type = "accountingBook";
  selectorInfo.query = {};
  selectorInfo.showCheckbox = !!make
  selectorInfo.defaultSelected = filterLeftInfo.value.query.accbookId;
  selectorInfo.callback = (data) => {
    if(!make) {
      states.value.row = ''
      filterLeftInfo.value.query.accbookId = data?.id;
      filterLeftInfo.value.query.accountBookName = Object.keys(data || {}).length !== 0 ? `${data.code} ${data.name}` : '';
      if(!data || Object.keys(data).length === 0) {
        treeInfo.value.data[0].children = []
        tableInfo.value.data = []
        return;
      }
      queryTree()
    } else {
      if(Object.keys(data).length === 0) return
      handleCopy(data)
    }
  };
  selectorInfo.visible = true;
}

async function handleCopy(rows) {
  const { code } = await API.copy({
    accbookIds: rows.map(it => it.id),
    sourceId: filterLeftInfo.value.query.accbookId
  }, 'relationship:copy')
  if(code === 200) {
    proxy.$message.success("复制成功");
  }
}

function copyDetail() {
  selectorInfo.type = "copyDetail";
  selectorInfo.query = {type: '2'};
  selectorInfo.visible = true;
}

function selectDebitSubject() {
  selectorInfo.type = "Account";
  if(!filterLeftInfo.value.query.accbookId) return proxy.$message.warning("请选择核算账簿");
  selectorInfo.defaultSelected = filterInfo.value.query.debitSubjectId ? filterInfo.value.query.debitSubjectId.split(',') : '';
  selectorInfo.showCheckbox = true;
  selectorInfo.query = {
    accbookId: filterLeftInfo.value.query.accbookId,
    isLastversion: true,
  };
  selectorInfo.callback = (data) => {
    data = Object.keys(data).length === 0 ? [] : data
    const checkBoxs = data?.filter(it => it.id) || []
    filterInfo.value.query.debitSubjectId = checkBoxs?.map(it => it.originalId).join(',');
    filterInfo.value.query.debitSubject = checkBoxs?.map(it => `${it?.code} ${it?.name}`).join(',');
    filterInfo.value.query.creditSubjectId = '';
    filterInfo.value.query.creditSubject = '';
  };
  selectorInfo.visible = true;
}

function selectCreditSubject() {
  selectorInfo.type = "Account";
  if(!filterLeftInfo.value.query.accbookId) return proxy.$message.warning("请选择核算账簿");
  selectorInfo.defaultSelected = filterInfo.value.query.creditSubjectId ? filterInfo.value.query.creditSubjectId.split(',') : '';
  selectorInfo.showCheckbox = true;
  selectorInfo.query = {
    accbookId: filterLeftInfo.value.query.accbookId,
    isLastversion: true,
  };
  selectorInfo.callback = (data) => {
    data = Object.keys(data).length === 0 ? [] : data
    const checkBoxs = data?.filter(it => it.id) || []
    filterInfo.value.query.creditSubjectId = checkBoxs?.map(it => it.originalId).join(',');
    filterInfo.value.query.creditSubject = checkBoxs?.map(it => `${it?.code} ${it?.name}`).join(',');
    filterInfo.value.query.debitSubjectId = '';
    filterInfo.value.query.debitSubject = '';
  };
  selectorInfo.visible = true;
}

function handleCallBack(val) {
  addInfo.value.visible = false;
  if (val) {
    getList();
  }
}
</script>

<style lang="scss" scoped>
  .leftPageFilter {
    margin-top: 12px;
  }
</style>
