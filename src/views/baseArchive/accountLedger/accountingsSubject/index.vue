<template>
  <div class="app-container">
    <div
      v-show="!modifyInfo.visible && !detailInfo.visible"
      class="app-container-flex"
    >
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
          <TreeBtns :title="treeBtnInfo.title" />
        </div>
        <div class="left-container-header border-style-bottom show-placeholder">
          <!-- 树搜索框 -->
          <el-input
            v-model="treeFilter.query.keyword"
            style="flex: 1"
            :clearable="true"
            placeholder="请输入编码/名称"
            class="show-placeholder"
            @keyup.enter.native="treeSearch"
          >
            <template #suffix>
              <i
                class="el-icon-search"
                @click="treeSearch"
                style="display: flex; align-items: center"
                ><el-icon><Search /></el-icon
              ></i>
            </template>
          </el-input>
        </div>
        <!-- 树结构 -->
        <div class="left-container-main main-flex">
          <el-tree
            ref="treeRef"
            :data="treeInfo.treeData"
            highlight-current
            :props="treeInfo.defaultProps"
            :filter-node-method="filterNode"
            node-key="id"
            :default-expand-all="true"
            :expand-on-click-node="true"
            @node-click="handleNodeClick"
          >
            <template #default="{ data }">
              <span class="custom-tree-node">
                <span>{{ data.code }}</span>
                <span class="ml8">{{ data.name }}</span>
              </span>
            </template>
          </el-tree>
        </div>
      </div>
      <div class="right-container">
        <div class="filter-wrapper">
          <NewPageFilter
            v-model:query="filterInfo.query.queryMap"
            :query-more-json="true"
            :filter-list="filterInfo.searchList"
            :filter-btn="filterInfo.searchBtn"
            :clear-type="clearType"
            :slip-select-request="slipSelectRequest"
            :list-type-info="listTypeInfo"
          >
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <NewPageFilter :filter-btn="filterInfo.btnList"> </NewPageFilter>
          <div class="display-flex">
            <el-button @click="preferenceInfo.visible = true"
              >偏好设置</el-button
            >
          </div>
        </div>
        <table-container
          ref="table"
          :refresh="tableInfo.refresh"
          :init-curpage="tableInfo.initCurpage"
          v-model:data="tableInfo.data"
          :api="tableInfo.api"
          :tab-index="true"
          :check-box="true"
          :pager="false"
          v-model:query="filterInfo.query"
          :field-list="tableInfo.fieldList"
          :handle="tableInfo.handle"
          @handleEvent="handleEvent"
          btnCode="accountingsSubject:list"
        >
          <template v-slot:col-code="scope">
            <span
              v-if="scope.row.code"
              class="slip-edit"
              @click="showDetail(scope.row)"
            >
              {{ scope.row.code }}
            </span>
            <span v-else>
              {{ "-" }}
            </span>
          </template>
        </table-container>
      </div>
    </div>
    <Modify
      v-if="modifyInfo.visible"
      v-model:visible="modifyInfo.visible"
      :id="modifyInfo.id"
      :title="modifyInfo.title"
      :type="modifyInfo.type"
      :node="currentNode"
      @returnModify="returnModify"
    />
    <!-- 明细信息 -->
    <Detail
      v-if="detailInfo.visible"
      v-model:visible="detailInfo.visible"
      :id="detailInfo.id"
      :node="currentNode"
      @returnBack="getList"
    />
    <SetPreference
      v-if="preferenceInfo.visible"
      v-model:visible="preferenceInfo.visible"
      :search-list="filterInfo.searchList"
      :field-list="tableInfo.fieldList"
      :customizeUserVO="filterInfo.query.customizeUserVO"
      :groupLevelShow="false"
      @callback="setPreferenceCallback"
    />
    <UploadExcel
      v-if="uploadExcelInfo.visible"
      v-model:showDialog="uploadExcelInfo.visible"
      type="260201"
      btnCode="accountingsSubject:import"
      action="/base/accasoa/importExcel"
    ></UploadExcel>
    <UploadLog
      v-if="uploadLogInfo.visible"
      v-model:showDialog="uploadLogInfo.visible"
      :query="uploadLogInfo.query"
    ></UploadLog>
    <SelectAllocationOrg
      v-if="selectAllocationOrgInfo.visible"
      v-model:query="selectAllocationOrgInfo.query"
      v-model:show-dialog="selectAllocationOrgInfo.visible"
      title="选择组织"
      :saveEmpty="true"
      :checkStrictly="true"
      :check-box="true"
      :highlightCurrent="true"
      :showAllocationPlan="false"
      @callback="selectAllocationOrgInfoCallBack"
    ></SelectAllocationOrg>
    <SelectAllocationOrgDetails
      v-if="selectAllocationOrgDetailInfo.visible"
      v-model:query="selectAllocationOrgDetailInfo.query"
      v-model:show-dialog="selectAllocationOrgDetailInfo.visible"
      :allocationApi="accasoaDistribute"
      :cancelApi="cancelAccasoaDistribute"
      :loids="selectAllocationOrgDetailInfo.loids"
      @reset="getList"
    ></SelectAllocationOrgDetails>
    <SelectData ref="selectorRef" />
    <!-- 方案查询弹窗 1（凭证查询） -->
    <PlanSearch
      v-if="planSearchVisible"
      v-model:visible="planSearchVisible"
      :fieldOverrides="fieldOverrides"
      :defaultValue="planSearchDefaultValue"
      @search="handlePlanSearch"
    >
      <template #accassitem="slotScope">
        <AuxiliaryAccounting
          ref="auxAccountingRef"
          :modelValue="slotScope.modelValue"
          @update:modelValue="slotScope['onUpdate:modelValue']"
          :fieldList="auxFieldList"
        />
      </template>
    </PlanSearch>
  </div>
</template>

<script setup name="accountingsSubject">
import {
  accasoaCustomizeListAll,
  accasoaDel,
  accasoaEnable,
  accasoaDisable,
  accasoaVersionDel,
  accasoaExportExcel,
  accasoaBatchSetAssist,
  exportTemplateExcel,
  getCustomizeSetting,
  updateUserCustomize,
  accsystemList,
  accasoaDistribute,
  cancelAccasoaDistribute,
  acctypeList,
} from "@/api/base";
import { useSelectData } from "@/hooks/useSelectData";
import { useHighlightRow } from "@/hooks/useHighlightRow";
const SelectAllocationOrgDetails = defineAsyncComponent(
  () => import("@/components/SelectAllocationOrg/details"),
);
const Modify = defineAsyncComponent(() => import("./modify"));
const Detail = defineAsyncComponent(() => import("./detail"));
const { proxy } = getCurrentInstance();
const { selectorInfo, selectorRef } = useSelectData();
const { setHighlightRow } = useHighlightRow();
const uploadExcelInfo = ref({
  visible: false,
});
const uploadLogInfo = ref({
  visible: false,
  query: {
    type: "260201",
  },
});
// 树过滤信息
const treeFilter = ref({
  query: {
    keyword: "",
  },
});
const treeBtnInfo = ref({
  title: "科目表",
});
// 树结构信息
const treeRef = ref();
const treeInfo = ref({
  data: [],
  nodeKey: "id",
  checked: [],
  treeData: [
    {
      id: "-2",
      name: "科目表",
      code: "",
      accchartList: [],
    },
  ],
  defaultProps: {
    children: "accchartList",
    label: "name",
  },
});
// 过滤相关配置
const filterInfo = ref({
  copyQueryMap: {},
  query: {
    customizeUserVO: {},
    queryParams: {
      accchartId: ''
    },
    queryMap: {},
    planDetailList: [],
  },
  searchList: [],
  searchBtn: [
    { type: "button", label: "查询", event: () => search(true) },
    { type: "button", label: "方案查询", event: planSearch },
    { type: "button", label: "重置", event: () => clearSearch(true) },
  ],
  btnList: [
    {
      type: "button",
      label: "新增",
      event: () => openModify({ title: "新增会计科目" }),
      show: proxy.$permission("accountingsSubject:add"),
      disabled: () => {
        return !currentNode.value.id;
      },
    },
    {
      type: "button",
      label: "分配",
      event: () => allocation(),
      show: proxy.$permission("accountingsSubject:allocation"),
      disabled: () => allocationDisabled(),
    },
    {
      type: "button",
      label: "取消全部分配",
      show: proxy.$permission("accountingsSubject:cancellAllocation"),
      event: cancellAllocation,
      disabled: () => allocationDisabled(),
    },
    {
      type: "button",
      label: "删除",
      event: () => remove(),
      show: proxy.$permission("accountingsSubject:delete"),
      disabled: () => {
        // 非当前组织批次禁用
        return !proxy.$fn.isCurrentOrgBatch(tableInfo.value.selections);
      },
    },
    {
      type: "button",
      label: "批量设置辅助核算",
      event: () => batchSetting(),
      show: proxy.$permission("accountingsSubject:batchSetting"),
      disabled: () => {
        // 非当前组织批次禁用
        return !proxy.$fn.isCurrentOrgBatch(tableInfo.value.selections);
      },
    },
    {
      type: "dropdown",
      label: "启停用",
      show:
        proxy.$permission("accountingsSubject:enable") ||
        proxy.$permission("accountingsSubject:disable"),
      disabled: () => {
        const selections = tableInfo.value.selections;
        if (!selections.length) return true;
        return !proxy.$fn.isCurrentOrgBatch(selections);
      },
      event: (command) => {
        if (command === "enable") handleEnable();
        else if (command === "disable") handleDisable();
      },
      children: [
        {
          label: "启用",
          command: "enable",
          show: proxy.$permission("accountingsSubject:enable"),
          disabled: () => {
            const selections = tableInfo.value.selections;
            if (!selections.length) return true;
            if (!proxy.$fn.isCurrentOrgBatch(selections)) return true;
            return selections.some((item) => item.status === "1");
          },
        },
        {
          label: "停用",
          command: "disable",
          show: proxy.$permission("accountingsSubject:disable"),
          disabled: () => {
            const selections = tableInfo.value.selections;
            if (!selections.length) return true;
            if (!proxy.$fn.isCurrentOrgBatch(selections)) return true;
            return selections.some((item) => item.status !== "1");
          },
        },
      ],
    },
    {
      type: "dropdown",
      label: "导入/导出",
      show:
        proxy.$permission("accountingsSubject:export") ||
        proxy.$permission("accountingsSubject:importTemp") ||
        proxy.$permission("accountingsSubject:import"),
      children: [
        {
          label: "导出",
          command: "export",
          show: proxy.$permission("accountingsSubject:export"),
        },
        {
          label: "下载导入模板",
          command: "importTemp",
          show: proxy.$permission("accountingsSubject:importTemp"),
        },
        {
          label: "导入",
          command: "import",
          show: proxy.$permission("accountingsSubject:import"),
        },
        {
          label: "导入日志",
          command: "importLog",
          show: proxy.$permission("accountingsSubject:import"),
        },
      ],
      event: (command) => {
        switch (command) {
          case "export":
            exportExcel();
            break;
          case "importTemp":
            exportTemptate();
            break;
          case "import":
            uploadTest();
            break;
          case "importLog":
            uploadLog();
            break;
        }
      },
    },
  ],
});
// 表格信息
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  selections: [],
  data: [],
  api: null,
  query: {},
  fieldList: [],
  handle: {
    fixed: "right",
    label: "操作",
    width: "120",
    btList: [
      {
        label: "停用",
        event: handleDisable,
        show: proxy.$permission("accountingsSubject:disable"),
        ifRender: (row) => {
          return proxy.$fn.isCurrentOrg(row) && row.status === "1";
        },
      },
      {
        label: "编辑",
        event: (row) =>
          openModify({ title: "修改会计科目", id: row.id, type: "update" }),
        show: proxy.$permission("accountingsSubject:update"),
        ifRender: (row) => {
          return proxy.$fn.isCurrentOrg(row);
        },
      },
      {
        label: "启用",
        event: handleEnable,
        show: proxy.$permission("accountingsSubject:enable"),
        ifRender: (row) => {
          return proxy.$fn.isCurrentOrg(row) && row.status !== "1";
        },
      },
      {
        label: "分配",
        event: allocation,
        show: proxy.$permission("accountingsSubject:allocation"),
        ifRender: (row) => {
          return proxy.$fn.isCurrentOrg(row) && row.controlType === "2";
        },
      },
      {
        label: "分配详情",
        event: allocationDetail,
        show: proxy.$permission("accountingsSubject:allocationDetail"),
        ifRender: (row) => {
          return proxy.$fn.isCurrentOrg(row) && row.controlType === "2";
        },
      },
      {
        label: "复制",
        event: (row) =>
          openModify({ title: "新增会计科目", id: row.id, type: "copy" }),
        show: proxy.$permission("accountingsSubject:copy"),
      },
      {
        label: "科目版本化",
        event: (row) =>
          openModify({ title: "科目版本化", id: row.id, type: "versioning" }),
        show: proxy.$permission("accountingsSubject:versioning"),
        ifRender: (row) => {
          return proxy.$fn.isCurrentOrg(row);
        },
      },
      {
        label: "版本详情",
        event: versioningDetail,
        show: proxy.$permission("accountingsSubject:versioningDetail"),
      },
      {
        label: "删除",
        event: remove,
        popconfirmText: "删除后将改变数据,是否继续？",
        show: proxy.$permission("accountingsSubject:delete"),
        ifRender: (row) => {
          return proxy.$fn.isCurrentOrg(row);
        },
      },
    ],
  },
});
const listTypeInfo = ref({
  accTypeIdList: [],
});
// 点击树节点
const currentNode = ref({});
const modifyInfo = ref({
  visible: false,
  title: "",
  id: "",
  type: "",
});
const detailInfo = ref({
  visible: false,
  id: "",
});
const preferenceInfo = ref({
  visible: false,
});
const clearType = ref(true);
const slipSelectRequest = ref(true);
const selectAllocationOrgInfo = ref({
  visible: false,
  saveEmpty: true,
  query: {
    includePeer: "1",
  },
  checkedKey: {},
  loids: [],
});
const selectAllocationOrgDetailInfo = ref({
  visible: false,
  query: {
    dataType: "accasoa",
    loid: "-2",
  },
  loids: [],
});
// 方案查询弹窗状态
const planSearchVisible = ref(false);
const auxAccountingRef = ref(null);
const auxFieldList = ref([
  { label: "辅助核算项", value: "accassitemId", type: "slot" },
  {
    label: "是否可为空",
    value: "isEmpty",
    type: "select-model",
    code: 'yes_or_no',
    align: "center",
  },
  {
    label: "是否可选非末级",
    value: "isNontail",
    type: "select-model",
    code: 'yes_or_no',
    align: "center",
  },
]);
const planSearchDefaultValue = ref({});
const fieldOverrides = computed(() => ({
  accTypeId: {
    slipProps: {
      api: acctypeList,
      query: { accsystemId: currentNode.value.accsystemId },
      keyField: "name",
      valueField: "id",
    },
  },
}))

onMounted(() => {
  fetchArchiveTypes();
  setData();
});
function getAccTypeIdList() {
  acctypeList({ accsystemId: currentNode.value.accsystemId }).then((resp) => {
    if (resp && resp.success) {
      listTypeInfo.value.accTypeIdList = resp.data.map((ele) => {
        return {
          key: ele.name,
          value: ele.id,
        };
      });
    }
  });
}
function setData() {
  let obj = {
    code: {
      label: "科目编码",
      value: "code",
      type: "slot",
      componentType: "input",
      show: false,
      hidden: true,
    },
    statusValue: {
      label: "状态",
      value: "statusValue",
      asValue: "status",
      componentType: "select-model",
      code: "enabled_type",
      show: false,
      hidden: true,
    },
    accTypeName: {
      label: "科目类型",
      value: "accTypeName",
      componentType: "select",
      list: "accTypeIdList",
      show: false,
      hidden: true,
    },
  };
  tableInfo.value.fieldList = Object.values({
    ...proxy.$fn.deepClone(proxy.$fieldfList.FieldList),
    ...proxy.$fn.deepClone(obj),
  });
  filterInfo.value.searchList = Object.values({
    ...proxy.$fn.deepClone(proxy.$fieldfList.FieldList),
    ...proxy.$fn.deepClone(obj),
  });
  getCustomize();
}
function getCustomize(_slipSelectRequest = true) {
  let param = {
    tableKey: `fnNewAccasoaList-com.slip.fn.base.domain.vo.AccasoaVO`,
  };
  getCustomizeSetting(param).then((res) => {
    if (res && res.success) {
      let data = res.data;
      filterInfo.value.query.customizeUserVO = data;
      tableInfo.value.fieldList = proxy.$fn.setFieldList(
        tableInfo.value.fieldList,
        data.detail,
      );
      let searchInfo = proxy.$fn.setSearchList(
        filterInfo.value.searchList,
        data.detail,
      );
      filterInfo.value.query.queryMap = {
        ...filterInfo.value.query.queryMap,
        ...searchInfo.queryMap,
      };
      filterInfo.value.searchList = searchInfo.searchList;
      filterInfo.value.copyQueryMap = proxy.$fn.deepClone(
        filterInfo.value.query.queryMap,
      );
      slipSelectRequest.value = _slipSelectRequest;
      tableInfo.value.api = accasoaCustomizeListAll;
    }
  });
}
async function setPreferenceCallback(obj) {
  updateUserCustomize(obj.customizeUserVO).then((res) => {
    if (res && res.success) {
      getCustomize(!slipSelectRequest.value);
    }
  });
}
// 获取列表
function getList() {
  tableInfo.value.refresh = Math.random();
}
// 查询
function search(isBtnEvent) {
  if (!currentNode.value.id) {
    proxy.$message.warning("请选择科目表");
    return;
  }
  if(isBtnEvent) {
    filterInfo.value.query.planDetailList = []
  }
  tableInfo.value.initCurpage = Math.random();
  tableInfo.value.refresh = Math.random();
}
function planSearch() {
  if (!currentNode.value.id) {
    proxy.$message.warning("请选择科目表");
    return;
  }
  planSearchDefaultValue.value = setDefaultValue();
  planSearchVisible.value = true;
}
// 将 planDetailList 数组转为 PlanSearch 的 defaultValue 对象格式，用于弹窗回显
function setDefaultValue() {
  const list = filterInfo.value.query.planDetailList;
  if (!list || !list.length) return {};
  const obj = {};
  list.forEach((item) => {
    if (item.fieldName) {
      obj[item.fieldName] = item.value;
    }
  });
  console.log(23232323)
  console.log(obj)
  return obj;
}
/** 方案查询 1 — 确认后从组件 ref 取数据 */
function handlePlanSearch(queryMap) {
  planSearchVisible.value = false;
  filterInfo.value.query.planDetailList = queryMap;
  search();
}
// 清除查询
function clearSearch() {
  clearType.value = !clearType.value;
  filterInfo.value.query.queryMap = proxy.$fn.deepClone(
    filterInfo.value.copyQueryMap,
  );
  filterInfo.value.query.planDetailList = [];
  search(true);
}
function returnModify() {
  if (modifyInfo.value.id) {
    getList();
  } else {
    search();
  }
}
// 表格事件
function handleEvent(event, data) {
  switch (event) {
    case "tableClickRow":
      tableInfo.value.selections = data;
      break;
    case "tableCheck":
      tableInfo.value.selections = data;
      break;
  }
}
function openModify({ title, id = "", type = "" } = {}) {
  setHighlightRow(id)
  modifyInfo.value.title = title;
  modifyInfo.value.id = id;
  modifyInfo.value.type = type;
  modifyInfo.value.visible = true;
  console.log(modifyInfo.value);
}
//展示明细
function showDetail(row) {
  setHighlightRow(row.id)
  detailInfo.value.id = row.id;
  detailInfo.value.visible = true;
}
//版本详情
function versioningDetail(row) {
  selectorInfo.type = "versioningDetail";
  selectorInfo.query = { originalId: row.originalId };
  selectorInfo.handle = {
    fixed: "right",
    label: "操作",
    width: "150",
    btList: [
      {
        label: "详情",
        event: (versionRow) => {
          selectorInfo.visible = false;
          showDetail(versionRow);
        },
        show: true,
      },
      {
        label: "删除版本",
        event: (versionRow, { refresh }) => {
          accasoaVersionDel(versionRow.id).then((res) => {
            if (res && res.success) {
              proxy.$message.success("删除成功");
              refresh();
              getList();
            }
          });
        },
        show: true,
        ifRender: (row, index, data) => {
          const total = data.length;
          return proxy.$fn.isCurrentOrg(row) && total !== 1 && index === total - 1;
        },
        popconfirmText: "确认删除该版本吗？",
      },
    ],
  };
  selectorInfo.visible = true;
}
function remove(row) {
  const ids = getIds(row);
  if (row?.id) {
    accasoaDel(ids, "accountingsSubject:delete").then((res) => {
      if (res && res.success) {
        proxy.$message.success("删除成功");
        getList();
      }
    });
    return;
  }
  proxy
    .$confirm("是否确认删除?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
    .then(() => {
      accasoaDel(ids, "accountingsSubject:delete").then((resp) => {
        if (resp && resp.success) {
          proxy.$message.success("删除成功");
          getList();
        }
      });
    });
}
// 启用
function handleEnable(row) {
  const ids = getIds(row);
  accasoaEnable(ids, "accountingsSubject:enable").then((resp) => {
    if (resp && resp.success) {
      proxy.$message.success("启用成功");
      getList();
    }
  });
}
// 停用
function handleDisable(row) {
  const ids = getIds(row);
  accasoaDisable(ids, "accountingsSubject:disable").then((resp) => {
    if (resp && resp.success) {
      proxy.$message.success("停用成功");
      getList();
    }
  });
}
function uploadTest() {
  uploadExcelInfo.value.visible = true;
}
function uploadLog() {
  uploadLogInfo.value.visible = true;
}
function exportExcel() {
  let params = {
    ...filterInfo.value.query,
    page: false,
  };
  accasoaExportExcel(params, "accountingsSubject:export").then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp);
    }
  });
}
function exportTemptate() {
  let fileName = "会计科目导入模板";
  exportTemplateExcel(fileName).then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res);
    }
  });
}
function getIds(row) {
  if (row && row.id) {
    return [row.id];
  } else {
    return tableInfo.value.selections.map((value) => value.id);
  }
}
function getLoids(row) {
  if (row && row.loid) {
    return [row.loid];
  } else {
    return tableInfo.value.selections.map((value) => value.loid);
  }
}
// 获取树数据
async function fetchArchiveTypes() {
  let result = await accsystemList({
    withAccchart: true,
  });
  if (result.data && result.data.length > 0) {
    treeInfo.value.treeData = [
      {
        ...treeInfo.value.treeData[0],
        accchartList: result.data,
      },
    ];
  }
}
function treeSearch() {
  treeRef.value.filter(treeFilter.value.query.keyword);
}
function filterNode(value, data) {
  if (!value) return true;
  return (
    data.name.includes(value) || data.code.includes(value) || data.id === "-2"
  );
}
async function handleNodeClick(data, node) {
  console.log("handleNodeClick", data, node);
  // 仅第三级节点（科目表）可点击加载数据
  if (data.id && data.id != "-2" && node.level === 3) {
    currentNode.value = {
      ...data,
      codeRule: node.parent.data.codeRule,
      accsystemId: node.parent.data.id,
    };
    filterInfo.value.query.queryParams.accchartId = data.id;
    filterInfo.value.query.planDetailList = [];
    getAccTypeIdList();
    getList();
  } else {
    currentNode.value = {};
    tableInfo.value.data = [];
  }
}
function cancellAllocation() {
  let params = {
    loids: [],
  };
  proxy
    .$confirm("请确认是否取消全部分配?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
    .then(() => {
      params.loids = getLoids();
      cancelAccasoaDistribute(params).then((res) => {
        if (res && res.success) {
          proxy.$message.success({
            message: "操作成功",
            duration: 3000,
            showClose: true,
          });
          getList();
        }
      });
    });
}
function allocationDetail(row) {
  selectAllocationOrgDetailInfo.value.visible = true;
  selectAllocationOrgDetailInfo.value.loids = getLoids(row);
  selectAllocationOrgDetailInfo.value.query.loid = row.loid;
}
function allocation(row) {
  const ids = getLoids(row);
  selectAllocationOrgInfo.value.loids = ids;
  selectAllocationOrgInfo.value.visible = true;
}
function selectAllocationOrgInfoCallBack(allNodes) {
  let params = {
    loids: selectAllocationOrgInfo.value.loids,
    orgList: [],
  };
  if (allNodes && allNodes.length) {
    allNodes.map((item) => {
      params.orgList.push({
        ...item,
        children: [],
      });
    });
  }
  accasoaDistribute(params).then((res) => {
    if (res && res.success) {
      proxy.$message.success({
        message: "操作成功",
        duration: 3000,
        showClose: true,
      });
      getList();
    }
  });
}
function allocationDisabled() {
  // 1. 非当前组织批次禁用
  const isNotCurrentOrgBatch = !proxy.$fn.isCurrentOrgBatch(
    tableInfo.value.selections,
  );
  // 2. 选中项中包含"分配型"禁用
  const hasAllocationType = tableInfo.value.selections.some(
    (item) => item.controlType !== "2",
  );
  return isNotCurrentOrgBatch || hasAllocationType;
}
// 批量设置辅助核算
function batchSetting() {
  const ids = getIds();
  selectorInfo.type = "adjunctAccountOtherItem";
  selectorInfo.query = {};
  selectorInfo.callback = (rows) => {
    if (rows && rows.length) {
      const params = {
        accasoaIds: ids,
        accassList: rows.map((row) => ({
          accassitemId: row.id,
          isBalanceDirectionCtrl: row.isBalanceDirectionCtrl,
          isEmpty: row.isEmpty,
          isNontail: row.isNontail,
        })),
      };
      accasoaBatchSetAssist(params, "accountingsSubject:batchSetting").then(
        (resp) => {
          if (resp && resp.success) {
            proxy.$message.success("批量设置辅助核算成功");
            getList();
          }
        },
      );
    }
  };
  selectorInfo.visible = true;
}
</script>

<style lang="scss" scoped></style>
