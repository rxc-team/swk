/**
 * 字符串格式化
 * ```
 * format('this is ${name}', { name: 'nf' })
 * // output: this is nf
 * ```
 */
export function objFormat(str: string, params: {}): string {
  return (str || '').replace(/\${([^}]+)}/g, (work: string, key: string) => (params || {})[key] || '');
}

/**
 * 字符串格式化
 * ```
 * format('this is {0}', 'rx')
 * // output: this is rx
 * ```
 */
export function strFormat(str: string, ...params: string[]): string {
  let res: string;
  if (params instanceof Array) {
    for (let index = 0; index < params.length; index++) {
      const p = params[index];
      str = (str || '').replace(new RegExp('\\{' + index + '\\}', 'g'), p);
    }
    res = str;
  } else {
    return str;
  }

  return res;
}
