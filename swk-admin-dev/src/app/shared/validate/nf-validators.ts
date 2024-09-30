import { AbstractControl, ValidationErrors } from '@angular/forms';

import {
  isBlank,
  isDate,
  isDecimal,
  isDomain,
  isEmpty,
  isFullAlpha,
  isFullAlphaNumber,
  isFullNumber,
  isFutureDate,
  isHalfAlpha,
  isHalfAlphaNumber,
  isHalfNumber,
  isIdCard,
  isInt,
  isMobile,
  isNumber,
  isSpecialChar,
  isUrl,
  validateDate,
  validateNumber,
  validatePassword,
  validSpecialChar,
  validName
} from './validate';

/** 一套日常验证器 */
export class NfValidators {
  /** 是否为数字 */
  static num(control: AbstractControl): ValidationErrors | null {
    return isNumber(control.value) ? null : { num: true };
  }

  /** 是否为整数 */
  static int(control: AbstractControl): ValidationErrors | null {
    return isInt(control.value) ? null : { int: true };
  }

  /** 是否为小数 */
  static decimal(control: AbstractControl): ValidationErrors | null {
    return isDecimal(control.value) ? null : { decimal: true };
  }

  /** 是否为身份证 */
  static idCard(control: AbstractControl): ValidationErrors | null {
    return isIdCard(control.value) ? null : { idCard: true };
  }

  /** 是否为手机号 */
  static mobile(control: AbstractControl): ValidationErrors | null {
    return isMobile(control.value) ? null : { mobile: true };
  }
  /** 是否URL地址 */
  static url(control: AbstractControl): ValidationErrors | null {
    return isUrl(control.value) ? null : { url: true };
  }
  /** 是否半角英字 */
  static halfAlpha(control: AbstractControl): ValidationErrors | null {
    return isHalfAlpha(control.value) ? null : { halfAlpha: true };
  }
  /** 是否半角数字 */
  static halfNumber(control: AbstractControl): ValidationErrors | null {
    return isHalfNumber(control.value) ? null : { halfNumber: true };
  }
  /** 是否半角英数字 */
  static halfAlphaNumber(control: AbstractControl): ValidationErrors | null {
    return isHalfAlphaNumber(control.value) ? null : { halfAlphaNumber: true };
  }
  /** 是否全角英字 */
  static fullAlpha(control: AbstractControl): ValidationErrors | null {
    return isFullAlpha(control.value) ? null : { fullAlpha: true };
  }
  /** 是否全角数字 */
  static fullNumber(control: AbstractControl): ValidationErrors | null {
    return isFullNumber(control.value) ? null : { fullNumber: true };
  }
  /** 是否全角英数字 */
  static fullAlphaNumber(control: AbstractControl): ValidationErrors | null {
    return isFullAlphaNumber(control.value) ? null : { fullAlphaNumber: true };
  }
  /** 是否合法日期 */
  static date(control: AbstractControl): ValidationErrors | null {
    return isDate(control.value) ? null : { date: true };
  }
  /** 是否是属于将来的日期 */
  static futureDate(control: AbstractControl): ValidationErrors | null {
    return isFutureDate(control.value) ? null : { futureDate: true };
  }
  /** 是否为空字符串（空指的是trim掉空格） */
  static empty(control: AbstractControl): ValidationErrors | null {
    return isEmpty(control.value) ? null : { empty: true };
  }
  /** 是否为空白字符串（空白字符串指代空格键按下形成的字符串） */
  static blank(control: AbstractControl): ValidationErrors | null {
    return isBlank(control.value) ? null : { blank: true };
  }
  /** 是否结束数字大于等于开始数字 */
  static validateNumber(start: AbstractControl, end: AbstractControl): ValidationErrors | null {
    return validateNumber(start.value, end.value) ? null : { validateNumber: true };
  }
  /** 是否结束日期大于等于开始日期 */
  static validateDate(start: AbstractControl, end: AbstractControl): ValidationErrors | null {
    return validateDate(start.value, end.value) ? null : { validateDate: true };
  }

  /** 验证密码（密码至少8位，且必须包含数字大小写字母以及特殊字符(如%￥#&等)） */
  static password(control: AbstractControl): ValidationErrors | null {
    return validatePassword(control.value) ? null : { password: true };
  }

  /** 是否包含特殊字符 */
  static specialChar(control: AbstractControl): ValidationErrors | null {
    return isSpecialChar(control.value) ? { special: true } : null;
  }

  /** 是否是合法的域名） */
  static domain(control: AbstractControl): ValidationErrors | null {
    return isDomain(control.value) ? null : { domain: true };
  }
  /** 是否是合法的特殊字符） */
  static validSpecial(control: AbstractControl): ValidationErrors | null {
    return validSpecialChar(control.value) ? null : { validSpecial: { value: control.value } };
  }
  /** 是否为有效名称 */
  static validName(control: AbstractControl): ValidationErrors | null {
    return validName(control.value) ? null : { validName: { value: control.value } };
  }
}
