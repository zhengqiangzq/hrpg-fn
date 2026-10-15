

// 数字 -> 千分位 (保留两位小数)
export function verifyNumberComma(value) {
    if (value === null || value === undefined || value === "") return "";
    const num = Number(String(value).replace(/[,=]/g, ""));
    if (Number.isNaN(num)) return "";
    const parts = num.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}


// 数字 -> 千分位
export function commThousandth(value) {
    if (value === null || value === undefined) return "";
    const str = String(value.replaceAll('=', ''));
    if (str === "") return "";
    const hasTrailingDot = str.endsWith(".");
    const body = hasTrailingDot ? str.slice(0, -1) : str;
    const dotIndex = body.indexOf(".");
    let intPart = dotIndex === -1 ? body : body.slice(0, dotIndex);
    const decPart = dotIndex === -1 ? "" : body.slice(dotIndex + 1);
    // 只保留整数部分的数字与负号
    intPart = intPart.replace(/[^\d-]/g, "");
    const sign = intPart.startsWith("-") ? "-" : "";
    const digits = intPart.replace(/-/g, "");
    let result = sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (dotIndex !== -1) result += "." + decPart;
    if (hasTrailingDot) result += ".";
    return result;
}


