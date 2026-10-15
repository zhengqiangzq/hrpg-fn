
export const bottomFromFieldList = [
    { label: "财务合计差额", value: "financialDebitDiff", type: "input" },
    { label: "财务借方合计", value: "financialDebitTotal", type: "input" },
    { label: "财务贷方合计", value: "financialCreditTotal", type: "input" },
    { label: "科目余额", value: "accountBalance", type: "input" },
    { label: "预算合计差额", value: "budgetDebitDiff", type: "input" },
    { label: "预算借方合计", value: "budgetDebitTotal", type: "input" },
    { label: "预算贷方合计", value: "budgetCreditTotal", type: "input" },
    { label: "凭证备注", value: "remark", type: "input" },
    { label: "差异分析", value: "diffAnalysis", type: "input", width: "50%" },
    { label: "现金流量", value: "cashFlow", type: "input", width: "50%" },
    { label: "核算信息", value: "accountingInfo", type: "input", width: "50%" },
    { label: "辅助信息", value: "auxiliaryInfo", type: "input", width: "50%" },
    { label: "记账人", value: "bookkeeper", type: "input" },
    { label: "审核人", value: "reviewer", type: "input" },
    { label: "签字人", value: "signer", type: "input" },
    { label: "制单人", value: "preparer", type: "input" },
]

export const rightBtn = [
    { code: 'InsertLine', name: '插行' },
    { code: 'delLine', name: '删行' },
    { code: 'copyLine', name: '复制行' },
    { code: 'pasteLine', name: '粘贴行' },
    { code: 'addSummary', name: '新增常用摘要' },
    { code: 'showBudget', name: '显示/隐藏预算' },
    { code: 'showColumn', name: '显示/隐藏下方栏目' },
    { code: 'accountBalance', name: '科目余额' },
    {
        code: 'subsidiaryLedger',
        name: '辅助明细账',
        children: [
            { code: 'clearFilter', name: '部门明细账' },
            { code: 'filterSelect', name: '供应商明细账' }
        ]
    },
]

export const rightBudBtn = [
    { code: 'InsertLine', name: '插行' },
    { code: 'delLine', name: '删行' },
    { code: 'copyLine', name: '复制行' },
    { code: 'pasteLine', name: '粘贴行' },
    { code: 'accountBalance', name: '科目余额' },
    {
        code: 'subsidiaryLedger',
        name: '辅助明细账',
        children: [
            { code: 'clearFilter', name: '部门明细账' },
            { code: 'filterSelect', name: '供应商明细账' }
        ]
    },
]
