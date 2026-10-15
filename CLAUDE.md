# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在此仓库中工作时提供项目指引。

---

## 项目概述

本项目是 **HRP 综合运营管理系统** 中的 **新财务系统（SPD 财务）** 微前端子应用，基于 Vue 3 + Vite 构建，通过 **Wujie（无界）** 微前端框架嵌入主应用运行。系统编码为 `/fnNew`，生产环境部署在 `/fnNew/` 路径下。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3（Composition API + `<script setup>` SFC） |
| 构建工具 | Vite 5 |
| 状态管理 | Vuex 4 |
| UI 组件库 | Element Plus 2.2 |
| CSS 方案 | SCSS/Sass + Element Plus 主题变量 |
| HTTP 请求 | Axios |
| 路由 | Vue Router 4（history 模式） |
| 国际化 | vue-i18n 9（中/英） |
| 图标 | @element-plus/icons-vue + vite-plugin-svg-icons（SVG 雪碧图） |
| 工具库 | lodash-es, @vueuse/core, crypto-js, file-saver, xlsx, qs 等 |
| 微前端 | Wujie（通过 `window.__POWERED_BY_WUJIE__` 标识子应用环境） |

## 常用命令

```bash
# 本地开发（端口 8091）
npm run dev

# 生产构建
npm run build:prod

# 预发布构建
npm run build:stage

# 预览构建结果
npm run preview
```

项目未配置 ESLint/Prettier 等代码检查工具，未配置单元测试。

---

## 目录结构

```
hrpg_fn_web_new/
├── nginx/                         # Nginx 配置
│   └── default.conf
├── public/                        # 静态资源（favicon.ico）
├── vite/                          # Vite 构建插件
│   └── plugins/
│       ├── index.js               # 插件集合入口
│       ├── auto-import.js         # 自动导入配置
│       ├── compression.js         # Gzip/Brotli 压缩
│       ├── setup-extend.js        # Vue setup 扩展（组件 name 属性）
│       └── svg-icon.js            # SVG 雪碧图插件
├── src/
│   ├── api/                       # 接口层
│   │   ├── base.js                # 基础服务接口（用户、部门、仓库、字典、上传、打印等）
│   │   ├── system.js              # 系统相关接口
│   │   ├── cashFlowItems.js       # 现金流量项目接口
│   │   └── demo.js                # 示例接口
│   ├── assets/                    # 静态资源
│   │   ├── 401_images/            # 401 页面图片
│   │   ├── 404_images/            # 404 页面图片
│   │   ├── icon/                  # iconfont 字体图标
│   │   ├── image/                 # 图片资源
│   │   └── js/                    # 第三方 JS（如 Lodop 打印插件）
│   ├── common/                    # 公共 JS 工具
│   │   ├── js/
│   │   │   ├── base.js            # 基础工具函数（页面跳转、日期限制、下拉数据转换等）
│   │   │   ├── validate.js        # 表单校验规则
│   │   │   ├── print.js           # 打印相关工具
│   │   │   ├── prototype.js       # 原型方法挂载
│   │   │   ├── commonJson.js      # 公共 JSON 数据
│   │   │   └── fieldfList.js      # 字段列表配置
│   │   └── menuCode.js            # 菜单 code 映射（跨组织场景）
│   ├── components/                # 公共组件（自动全局注册）
│   │   ├── ModelRadio/            # 单选模型
│   │   ├── ModelTips/             # 模型提示
│   │   ├── NewUpload/             # 文件上传（含图库和表格图片上传）
│   │   ├── PageDialog/            # 通用弹窗表单
│   │   ├── Pagination/            # 分页组件
│   │   ├── PopoverPrint/          # 打印弹出确认
│   │   ├── SelectModel/           # 模型选择器
│   │   ├── SelectMultiple/        # 多选组件
│   │   ├── SlipSelect/            # 滑动选择
│   │   ├── Tooltip/               # 提示组件
│   │   └── index.js               # 全局组件自动注册（import.meta.glob）
│   ├── directive/                 # 自定义指令
│   │   ├── index.js               # 指令注册入口
│   │   ├── permission/hasPermi.js # v-hasPermi 按钮权限控制
│   │   ├── tooltip/showtip.js     # v-showtip 提示
│   │   ├── addFirstClass/         # v-addFirstFilterClass
│   │   └── setBtnPrimary/         # v-setBtnPrimary
│   ├── hooks/                     # 组合式函数
│   │   ├── useDictionary.js       # 字典数据 Hook（选项转换、默认值、回显等）
│   │   └── useSystemSetting.js    # 系统设置 Hook（医院 ID/名称）
│   ├── icons/                     # SVG 图标
│   │   └── svg/                   # SVG 源文件（404、bug、chart、excel 等）
│   ├── lang/                      # 国际化
│   │   ├── index.js               # i18n 实例创建（zh/en，从 Cookie 读取语言）
│   │   ├── CH.js                  # 中文语言包
│   │   └── EN.js                  # 英文语言包
│   ├── layout/                    # 布局组件
│   │   ├── index.vue              # 主布局（适配桌面/移动端、Wujie 环境）
│   │   └── components/
│   │       ├── AppMain.vue        # 主内容区（`<router-view>` + `<keep-alive>`）
│   │       ├── iframe.js          # iframe 菜单缓存管理
│   │       └── index.js           # 导出
│   ├── mixins/                    # 全局混入
│   │   ├── pageMixin.js           # 页面通用混入
│   │   ├── detailPageViewMixin.js # 详情页混入
│   │   └── tableLoadMoreMixins.js # 表格滚动加载混入
│   ├── router/
│   │   └── index.js               # 路由配置（静态路由 + 动态路由注入）
│   ├── store/                     # Vuex 状态管理
│   │   ├── index.js               # Vuex 实例创建 + 模块注册
│   │   ├── getters.js             # 全局 Getter
│   │   └── modules/
│   │       ├── app.js             # 侧边栏状态、设备类型、尺寸、表格高度等
│   │       ├── user.js            # Token + 用户信息
│   │       ├── permission.js      # 动态路由生成 + 权限码 + 字典 + 系统配置
│   │       ├── settings.js        # 主题、菜单状态、屏幕尺寸等 UI 设置
│   │       ├── tabsView.js        # 标签页管理（visitedViews / cachedViews）
│   │       ├── handle.js          # 流程操作按钮权重映射
│   │       ├── template.js        # 报表/iframe 模板
│   │       └── upload.js          # 上传文件列表状态
│   ├── style/                     # 样式文件（通过 @import 引入）
│   ├── utils/                     # 工具函数
│   │   ├── request.js             # Axios 实例（请求/响应拦截、错误处理、文件下载）
│   │   ├── auth.js                # Token 存取（Cookie + localStorage）
│   │   ├── flowable.js            # 流程表单组件异步注册
│   │   ├── sign.js                # 签名工具
│   │   ├── slp.js                 # blob 校验等通用工具
│   │   ├── validate.js            # 表单校验规则
│   │   ├── commonDicts.js         # 公共字典/配置（上传类型、消息类型等）
│   │   ├── treeDataHandler.js     # 树形数据处理
│   │   ├── exportUtil.js          # 导出工具
│   │   ├── onlyofficeUtil.js      # OnlyOffice 工具
│   │   ├── error-log.js           # 错误日志
│   │   ├── errorCode.js           # 错误码映射
│   │   ├── get-page-title.js      # 页面标题获取
│   │   ├── clipboard.js           # 剪贴板
│   │   ├── scroll-to.js           # 滚动工具
│   │   └── aes-util.js            # AES 加解密
│   ├── views/                     # 页面视图
│   │   ├── error/                 # 401、404 错误页
│   │   ├── redirect/              # 重定向页
│   │   ├── demo/                  # 示例页
│   │   ├── task/flowDetails/      # 流程申请/待办/已办详情
│   │   ├── archiveSystem/         # 档案系统（科目体系、会计账簿、档案分类）
│   │   └── baseArchive/           # 基础档案（会计账簿-现金流量项目、科目体系）
│   ├── App.vue                    # 根组件
│   ├── main.js                    # 应用入口
│   ├── permission.js              # 路由守卫（Token 校验、动态路由、权限码获取）
│   └── settings.js                # 应用配置（标题、标签页、固定头部等开关）
├── .env.development               # 开发环境变量
├── .env.production                # 生产环境变量
├── vite.config.js                 # Vite 构建配置
├── index.html                     # HTML 入口
└── package.json
```

---

## 微前端架构

### 子应用定位

本项目是 Wujie 微前端体系中的 **SPD 财务子应用**（系统编码 `/fnNew`），由主应用（`hrpg_micro_main_web`）通过 Wujie 容器加载运行。

### 子应用运行模式

- 判断 `window.__POWERED_BY_WUJIE__` 来区分独立运行和嵌入运行
- 嵌入运行时：
  - 数据来源优先级：主应用通过 Wujie props 传入 `dictMap`，子应用优先从 props 获取
  - 路由/权限数据从 `localStorage('routeStore')` 读取（主应用登录后写入）
  - 退出登录/Token 失效时通过总线通知主应用：`window.$wujie?.bus.$emit('microAppLogout')`
  - 跨页面跳转通知主应用路由变更：`window.$wujie?.bus.$emit('subMicroAppRouteChange', {...})`
- 独立运行时：直接跳转 `/login`

### 数据加载流程

1. 主应用登录后，将菜单树写入 `localStorage('routeStore')` → `allSystemMenuMap['/fnNew']`
2. 子应用路由守卫从 `localStorage` 读取菜单树，通过 `filterAsyncRoutes()` 递归生成 Vue Router 动态路由
3. 权限码从 IndexedDB（`localforage`）读取 `systemResourceInfo`
4. 字典从 props 或 IndexedDB（`dictMap`）读取
5. 系统配置从 IndexedDB（`systemInfo`）读取

---

## 路由规范

### 路由模式

`createWebHistory()` — history 模式，无 hash。生产环境基础路径为 `/fnNew/`（via vite `base`）。

### 路由结构

```js
// 静态路由
constantRoutes = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: 'flow/myApplyDetails', ... },     // 申请详情
      { path: 'flow/myPendingDetails/:name', ... },  // 待办详情
      { path: 'flow/myFinishedDetails/:name', ... }, // 已办详情
    ]
  },
  { path: '/redirect/:path(.*)', ... },   // 重定向
  { path: '/404', ... },                   // 404
  { path: '/401', ... },                   // 401
  { path: '/:catchAll(.*)', ... },         // 兜底 → 404
]
```

### 动态路由生成

`src/store/modules/permission.js` 中的 `generateRoutes` action：
1. 从 `localStorage('routeStore').allSystemMenuMap['/fnNew']` 获取菜单树
2. 过滤掉 `code === 'app'` 和 `code === 'pda'` 的菜单
3. 通过 `filterAsyncRoutes()` 递归转换，使用 `import.meta.glob('../../views/**/*.vue')` 匹配组件
4. 动态注入 `router.addRoute()`

### 路由守卫核心逻辑（`src/permission.js`）

1. **白名单放行**：`/login`、`/oa`
2. **Token 校验**：无 token → 触发退出流程（Wujie 环境通知主应用，独立环境跳转登录页）
3. **首次加载**：`addRoutes.length === 0` 时触发 `generateRoutes` 生成动态路由
4. **跨组织检测**：URL 中包含 `businessOrgId` + `businessGroupId` 时，请求跨组织的权限码、字典和系统配置
5. **重定向处理**：`/redirect/` 路径直接放行
6. **进度条**：使用 NProgress 显示路由切换进度

---

## 状态管理

使用 Vuex 4，模块化管理。状态数据主要存储在外部（`localStorage`/`localforage`），由主应用注入，子应用 Store 主要用于运行时状态。

### Store 模块清单

| 模块 | namespaced | 核心职责 |
|------|-----------|---------|
| `app` | ✅ | 侧边栏开关、设备类型、Element Plus 尺寸、表格高度变化触发、接口防重复 |
| `user` | ✅ | Token（从 Cookie/localStorage 读取）、用户信息、物资资源权限类型 |
| `permission` | ✅ | 动态路由生成、按钮权限码集合、字典数据 `dict`、系统配置 `systemConfig`、菜单数据 |
| `settings` | ✅ | 主题类型、菜单展开状态、屏幕尺寸、页面跳转目标 `toPage`、未读消息数 |
| `tabsView` | ✅ | 标签页管理（`visitedViews` / `cachedViews`）、keep-alive 缓存控制 |
| `handle` | ✅ | 流程操作按钮权重映射（提交=100, 审批=85, ...） |
| `template` | ✅ | 报表 iframe URL、iframe 名称列表、iframe 刷新状态 |
| `upload` | ✅ | 上传文件列表状态 |

### 关键数据流

- **`dict`**（permission 模块）：全局字典映射，优先从 Wujie props 获取，否则从 IndexedDB（`localforage`）恢复
- **`permissionCodes`**（permission 模块）：用户按钮权限码集合，从 IndexedDB（`systemResourceInfo`）获取
- **`systemConfig`**（permission 模块）：系统配置（精度策略、条码类型、WebSocket 地址等），从 IndexedDB 或接口获取
- **`token`**（user 模块）：从 `localStorage('userInfoStore')` 或 Cookie 中读取

---

## 接口层规范

### Axios 实例（`src/utils/request.js`）

- **baseURL**：`VITE_APP_BASE_API`（开发环境 `/api`，生产环境 `/api/fnNew`）
- **请求拦截**：
  - 自动显示全局 Loading（可通过 `notShowLoading` 配置关闭）
  - 自动附加请求头：`x-auth-token`、`Authorization`、`systemName`、`systemCode`、`routeCode`、`Business-Org-Id`、`Business-Group-Id`、`btnCode`
  - 支持 `noTimeout` 配置取消超时
- **响应拦截**：
  - `code === 800`：Token 失效，Wujie 环境通知主应用登出，独立环境跳转登录页
  - `code !== 200` 或 `success === false`：弹错误提示
  - `msgType === 'messageBox'`：弹确认框
  - 支持 `responseType: 'blob'` 的自动 JSON 解析和文件下载处理
  - 支持 `isBasicHost` 标记的基础服务响应标准化处理
- **超时时间**：300 秒（`300000ms`）

### 接口调用方式

直接使用 `request` 实例调用：

```js
import request from '@/utils/request'

// GET 请求
const res = await request({
  url: '/basic/base/users/page',
  method: 'get',
  params: { pageNo: 1 },
})

// POST 请求（带按钮权限）
const res = await request({
  url: '/baseSetting/cashFlowItems',
  method: 'post',
  data: { name: 'xxx' },
  btnCode: 'cashFlowItems:add',
})

// 文件下载
import { download } from '@/utils/request'
download('/file/download', params, 'filename.xlsx')

// 隐藏 Loading
const res = await request({
  url: '/resourceInfo/codes',
  method: 'get',
  notShowLoading: true,
})

// 基础服务请求（自动标准化响应格式）
const res = await request({
  url: '/basic/department/queryPage',
  method: 'post',
  data: {},
  isBasicHost: true,
})
```

**请求配置项**：
| 参数 | 说明 |
|------|------|
| `notShowLoading` | 隐藏全局 Loading |
| `isBasicHost` | 标记为基础服务请求，自动标准化响应格式 |
| `btnCode` | 请求对应的按钮权限码 |
| `noTimeout` | 取消请求超时限制 |
| `Content-Type` | 自定义 Content-Type（默认 `application/json;charset=utf-8`） |
| `responseType` | 响应类型（如 `blob`） |

---

## 组件规范

### 全局组件自动注册

`src/components/index.js` 使用 `import.meta.glob('./*/index.vue', { eager: true })` 自动扫描并注册所有组件，无需手动 import 和注册。组件名自动转换（如 `PageDialog`、`SlipSelect`）。

### 公共组件

| 组件 | 用途 | 关键 Props/特性 |
|------|------|-----------|
| `PageDialog` | 通用弹窗表单 | — |
| `NewUpload` | 文件上传（含图库模式 `eleGallery`、表格图片上传 `tableUploadImg`） | — |
| `Pagination` | 分页组件 | — |
| `PopoverPrint` | 打印确认弹窗 | — |
| `SelectModel` | 模型选择器 | — |
| `SelectMultiple` | 多选组件 | — |
| `SlipSelect` | 滑动选择 | — |
| `ModelRadio` | 单选模型 | — |
| `ModelTips` | 模型提示 | — |
| `Tooltip` | 提示组件 | — |

### 自定义指令

| 指令 | 用途 |
|------|------|
| `v-hasPermi` | 按钮权限控制（无权限时移除 DOM） |
| `v-showtip` | 文本溢出提示 |
| `v-addFirstFilterClass` | 自动添加筛选类名 |
| `v-setBtnPrimary` | 设置按钮主样式 |

### 流程表单组件

`src/utils/flowable.js` 通过 `defineAsyncComponent` 注册流程审批中动态回显的表单组件（如 `systemSetupModify`、`systemSetupDetail`），确保审批详情页可以渲染对应的业务表单。

---

## 环境变量

| 变量名 | 说明 | 开发环境值 | 生产环境值 |
|--------|------|-----------|-----------|
| `VITE_APP_SYSCODE` | 系统编码 | `/fnNew` | `/fnNew` |
| `VITE_APP_TITLE` | 页面标题 | 新财务系统 | 新财务系统 |
| `VITE_APP_ENV` | 环境标识 | `development` | `production` |
| `VITE_APP_BASE_API` | API 基础路径 | `/api` | `/api/fnNew` |
| `VITE_APP_BASIC_API` | 基础服务 API 路径 | `/api/basic` | `/api/basic` |
| `VITE_BUILD_COMPRESS` | 构建压缩方式 | `gzip` | `gzip,brotli` |
| `VITE_APP_UREPORT_URL` | 报表服务地址 | `http://172.16.11.183:9005/basic` | — |
| `VITE_APP_DOCUMENTAPI` | Office API JS 地址 | `http://172.16.11.138:8990/.../api.js` | `/web-apps/apps/api/documents/api.js` |
| `VITE_APP_DOCUMENTBASEURL` | 文档编辑 API 地址 | `http://172.16.11.138:9100/api` | — |
| `VITE_APP_FILE_URL` | 文件服务器地址 | `http://172.16.11.232:9005/minioServer` | `/minioServer` |
| `VITE_APP_EXCLUDE_DEMO` | 是否排除 demo 目录 | `false` | `false` |

## 路径别名

| 别名 | 路径 |
|------|------|
| `@` | `src/` |
| `~` | 项目根目录 |

---

## 构建与部署

- **构建基础路径**：开发环境 `''`（空），生产环境 `/fnNew/`
- **产物输出**：JS → `assets/js/[name]-[hash].js`，CSS → `assets/[ext]/[name]-[hash].[ext]`
- **代码分割**（manualChunks）：
  - `vue-core`：Vue 全家桶 + Element Plus + 核心依赖
  - `common-utils`：qs、js-cookie、nprogress、crypto-js
  - `special-libs`：clipboard、v-viewer、sortablejs、file-saver 等功能库
- **压缩**：开发环境 gzip，生产环境 gzip + brotli
- **CSS**：使用 lightningcss 压缩，SCSS 预处理
- **生产环境优化**：移除 `console` 和 `debugger`，关闭 sourcemap
- **代理**（开发环境）：
  - `/api/basic` → `http://10.60.20.161:8881`
  - `/api` → `http://10.60.20.161:7310`
  - `/ureport` → `http://172.16.11.138:9005`

---

## 业务模块说明

| 模块 | 路径 | 说明 |
|------|------|------|
| 流程详情 | `/task/flowDetails` | 流程申请/待办/已办的统一详情页，通过 `flowable.js` 动态加载表单组件 |
| 档案系统-科目体系 | `/archiveSystem/systemSetup` | 科目体系的增删改查、详情查看 |
| 档案系统-会计账簿 | `/archiveSystem/accountBook` | 会计账簿管理 |
| 档案系统-档案分类 | `/archiveSystem/archiveCategory` | 档案分类管理 |
| 基础档案-现金流量项目 | `/baseArchive/accountLedger/accountingBook/cashFlowItems` | 现金流量项目的增删改停启用 |
| 基础档案-科目体系 | `/baseArchive/accountLedger/subjectSystem` | 科目体系管理 |
| 示例页面 | `/demo` | 开发示例，生产环境可排除 |

---

## 重要约定与注意事项

### Wujie 子应用约束

- **数据来源**：菜单、权限码、字典等核心数据由主应用统一管理和注入，子应用通过 `localStorage` 和 `localforage`（IndexedDB）读取，**不要直接调用主应用的菜单/权限接口**
- **登出通知**：Token 失效时必须通过 `window.$wujie?.bus.$emit('microAppLogout')` 通知主应用
- **路由变更**：跨模块跳转时通过 `window.$wujie?.bus.$emit('subMicroAppRouteChange', {...})` 通知主应用同步路由
- **跨组织**：URL 中存在 `businessOrgId` + `businessGroupId` 时需请求跨组织数据

### 请求配置约定

- 每个业务请求**必须**传入 `btnCode` 参数用于按钮权限控制
- 基础服务接口（`/basic/` 前缀）需设置 `isBasicHost: true`
- 文件下载使用 `request.js` 导出的 `download()` 函数

### 组件开发约定

- 公共组件放入 `src/components/` 目录，会自动全局注册
- 表单校验规则统一在 `src/common/js/validate.js` 维护
- 字典使用通过 `useDictionary` Hook，避免重复请求
- 流程中的业务表单组件需在 `src/utils/flowable.js` 中注册
