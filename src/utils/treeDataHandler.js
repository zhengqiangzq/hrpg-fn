/**
 * data: 循环的数据
 * isDep：是否深拷贝，不影响原数组
 * typeName：类型字段：人员，部门，医院
 * showCode：医院显示的 tree 是否显示 code
 */
export function disposeData(data, isDep, typeName = 'itype', showCode = false) {
  const result = []
  data.forEach((v) => {
    // 医院
    if (v[typeName] === 1 || !v[typeName]) {
      const vi = v
      result.push({
        ...vi,
        name: showCode ? `${vi.companyCode} ${vi.companyName}` : vi.companyName,
        children: [
          ...disposeData(
            vi.childrenHospitalDTO || [],
            isDep,
            typeName,
            showCode
          ),
          ...disposeData(
            vi.childrenDepartmentDTO || [],
            isDep,
            typeName,
            showCode
          ),
        ],
      })
    }
    // 部门
    else if (v[typeName] === 2) {
      const vi = v
      result.push({
        ...vi,
        name: showCode ? `${vi.code} ${vi.name}` : vi.name,
        children: [
          ...disposeData(vi.staffDTOList || [], isDep, typeName, showCode),
          ...disposeData(vi.children || [], isDep, typeName, showCode),
        ],
      })
    }
    // 人员
    else {
      // 排除人员 isDep
      if (isDep) {
        const vi = v
        result.push({
          ...vi,
          name: vi.name,
          [typeName]: 3,
        })
      }
    }
  })
  return result
}

export function disposePostData(data) {
  const result = []
  data.forEach((v) => {
    // 医院
    const vi = v
    if (vi.itype === 1) {
      result.push({
        ...vi,
        name: vi.companyName,
        children: [
          ...disposePostData(vi.childrenHospitalDTO || []),
          ...disposePostData(vi.childrenPositionSequenceDTO || []),
        ],
      })
    } else {
      const vi = v
      result.push({
        ...vi,
        name: vi.sequenceName,
      })
    }
  })
  return result
}

function isHospital(data) {
  return data.itype === 1 || !data.itype // 当只查询医院的时候，没有itype
}
function depOrStaff(data) {
  return data.itype === 2
}

export function disposeDataNew(data, isDep = false, showCode = false) {
  const result = []
  data.forEach((v) => {
    // 医院
    if (isHospital(v)) {
      result.push({
        ...v,
        name: showCode ? `${v.companyCode} ${v.companyName}` : v.companyName,
        children: [
          ...disposeDataNew(v.childrenHospitalDTO || [], isDep, showCode),
          ...disposeDataNew(v.childrenDepartmentDTO || [], isDep, showCode),
        ],
      })
    }
    // 部门
    if (!isHospital(v) && depOrStaff(v)) {
      result.push({
        ...v,
        name: showCode ? `${v.code} ${v.name}` : v.name,
        children: [
          ...disposeDataNew(v.staffDTOList || [], isDep, showCode),
          ...disposeDataNew(v.children || [], isDep, showCode),
        ],
      })
    }
    if (!isHospital(v) && !depOrStaff(v)) {
      // 排除人员 isDep
      if (isDep) {
        result.push({
          ...v,
          name: v.name,
        })
      }
    }
  })
  return result
}
