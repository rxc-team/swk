import { isAfter, isBefore, isDate as date } from 'date-fns';

/** 是否为特殊字符 */
export function isSpecialChar(value: string): boolean {
  return /[!|[\]{\}]/g.test(value);
}

/** 是否为有效的域名 */
export function isDomain(value: string): boolean {
  return /^(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i.test(value);
}

/** 是否为有效密码 */
export function validatePassword(value: string): boolean {
  return /^(?=.*[A-Z])(?=.*[a-z])(?=.*[1-9])(?=.*[\W]).{8,}$/.test(value);
}

/** 是否为数字 */
export function isNumber(value: string | number): boolean {
  return /^((-?\d+\.\d+)|(-?\d+)|(-?\.\d+))$/.test(value.toString());
}

/** 是否为整数 */
export function isInt(value: string | number): boolean {
  // tslint:disable-next-line:triple-equals
  return isNumber(value) && parseInt(value.toString(), 10) == value;
}

/** 是否为小数 */
export function isDecimal(value: string | number): boolean {
  return isNumber(value) && !isInt(value);
}

/** 是否为身份证 */
export function isIdCard(value: string): boolean {
  return /(^\d{15}$)|(^\d{17}([0-9]|X)$)/i.test(value);
}

/** 是否为手机号 */
export function isMobile(value: string): boolean {
  return /^(0|\+?86|17951)?(13[0-9]|15[0-9]|17[0678]|18[0-9]|14[57])[0-9]{8}$/.test(value);
}

/** 是否URL地址 */
export function isUrl(url: string): boolean {
  if (url) {
    // tslint:disable-next-line: max-line-length
    return /[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%*=~_|]{0}|[\/]|[\*]$/g.test(url);
  }
  return true;
}

/** 是否半角英字 */
export function isHalfAlpha(value: string): boolean {
  return /^[a-zA-Z]*$/.test(value);
}

/** 是否半角数字 */
export function isHalfNumber(value: string): boolean {
  return /^[0-9]*$/.test(value);
}

/** 是否半角英数字 */
export function isHalfAlphaNumber(value: string): boolean {
  return /^[0-9a-zA-Z]*$/.test(value);
}
/** 是否全角英字 */
export function isFullAlpha(value: string): boolean {
  return /^[\uFF21-\uFF3A|\uFF41-\uFF5A]*$/.test(value);
}

/** 是否全角数字 */
export function isFullNumber(value: string): boolean {
  return /^[\uFF10-\uFF19]*$/.test(value);
}

/** 是否全角英数字 */
export function isFullAlphaNumber(value: string): boolean {
  return /^[\uFF10-\uFF19|\uFF21-\uFF3A|\uFF41-\uFF5A]*$/.test(value);
}

/** 是否合法日期 */
export function isDate(value: string): boolean {
  return date(new Date(value));
}

/** 是否是属于将来的日期 */
export function isFutureDate(value: string): boolean {
  return isDate(value) && isAfter(new Date(value), new Date());
}

/** 是否为空字符串（空指的是trim掉空格） */
export function isEmpty(value: string): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

/** 是否为空白字符串（空白字符串指代空格键按下形成的字符串） */
export function isBlank(value: string): boolean {
  return value === ' ' || value === '　';
}

/** 是否结束数字大于等于开始数字 */
export function validateNumber(start: string | number, end: string | number): boolean {
  if (typeof start === 'string') {
    start = Number(start);
  }
  if (typeof end === 'string') {
    end = Number(end);
  }

  return end > start;
}

/** 是否结束日期大于等于开始日期 */
export function validateDate(start: string, end: string): boolean {
  if (isDate(start) && isDate(end)) {
    return isBefore(new Date(start), new Date(end));
  }
  return false;
}
