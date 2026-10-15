## 自定义报表

### 自定义报表目前分为两种：（url 路径类型）

- /spd/reportPreview
- /spdBase/baseReportPreview

### 名称：

```
1、 /spd/reportPreview：spd 自定义报表
2、 /spdBase/baseReportPreview：非 spd 自定义报表
```

### 类型：

```
1、/spd/reportPreview (属于 spd): 自定义查询条件，通过=>自定义表格配置 来配置查询条件
2、/spdBase/baseReportPreview(属于 spdBase)：在设计报表的时候通过=>查询表单设计器 来配置查询条件
```

### 使用范围：

```
1、/spd/reportPreview :所有 spd 子系统自定义查询统计页面
2、/spdBase/baseReportPreview：人资系统（或者其他非 spd 子系统）--人事分析报表统计
```

### 基本参数说明：（公共参数）

```
_u：表报名称 例子：_u=slip-表报名称.ureport.xml
_i：是否分页 例子：_i=1 （有_i 参数表示分页）
_r: 分页预览需要带上_r=1 参数 例子：_r=1
extend：是否拉伸全屏 例子：extend=1（有 extend 参数表示需要拉伸）
```

### 注意事项：

```
1、spd 自定义报表配置菜单是子应用名称选择=>spd 服务
2、非 spd 自定义报表配置菜单是子应用名称选择=>spd 基础服务
3、配置菜单需要保证/spd/reportPreview/**_或者/spdBase/baseReportPreview/_**后面下级菜单不重复
4、非 spd 自定义表报配置查询如果是下拉多选时，添加参数需要将数据类型选为 List 类型
```

### spd 自定义报表自定义报表：url 配置说明

```
例子：http://localhost:8081/microApp/spd/reportPreview/dataQuery/assetStore?extend=1&defaultTimeKey=storeTime&requireKey=storeTimeGreater,storeTimeLesser,increaseType&fiscalType=2&deptAuth=all&depotAuth=all&supplierAuth=all&fieldListCode=typeValue:stutus1,typeValue:type1

1、extend=1 拉伸铺满报表（默认不拉伸）
2、defaultTimeKey=storeTime 设置默认日期，会自动匹配拼接 Greater（开始）和 Lesser（结束）字段，并设置默认日期为当月一号至当天
3、requireKey=storeTimeGreater,storeTimeLesser,increaseType 必填校验，多个用逗号分隔，查询校验提示（时间段日期需要添加 Greater 或者 Lesser）
4、deptAuth=all 部门（获取所有部门权限） 不传默认带权限
5、depotAuth=all 仓库（获取所有仓库权限） 不传默认带权限
6、supplierAuth=all 供应商（获取所有供应商权限） 不传默认带权限
7、fiscalType=2 或者 fiscalType=1 （查询会计区间） 资产-2，物资-1
8、fieldListCode proxy.$fieldfList.FieldList 字典 code 替换，例子：typeValue:stutus1,typeValue:type1
9、\_i=1 有\_i 参数会分页 (控制是否有分页)
10、pages=1 有 pages 参数会有分页（控制是否有=>50 页/条），查询和导入导出会带 curPage 和 pageSize 参数 (需要配合报表 sql 分页参数使用)
```

### 查询表单设计器

#### 自定义弹窗支持组件

#### 注意事项

- http://116.63.62.154:9201 配置需要替换为上线环境地址

```
http://116.63.62.154:9201/#/report/modules/selectUser 选择用户
http://116.63.62.154:9201/#/report/modules/selectDept 选择部门
http://116.63.62.154:9201/#/report/modules/selectFiscalPeriod 选择会计期间
```
