import { Injectable } from '@angular/core';

/**
 * 主题管理类
 * 实现方式：
 * 1、创建一个特殊的带有插槽的[link]标签。
 * 2、通过设置[link]标签的[href]属性，来设置主题对应的样式文件。
 * 特点（html文件中导入css一样使用）：
 * 1、可轻松实现全局多主题更换（统一插槽）；
 * 2、可实现局部主题更换，仅需要更换插槽名称即可（多插槽）。
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeManager {
  /**
   * 设置样式
   *
   * 通过特殊的NameKey和主题对应的css文件路径，设置样式[link]的[href]属性。
   */
  setStyle(key: string, href: string) {
    getLinkElementForKey(key).setAttribute('href', href);
  }

  /**
   * 删除样式
   *
   * 通过特殊的NameKey,删除对应的[link]标签即可。
   */
  removeStyle(key: string) {
    const existingLinkElement = getExistingLinkElementByKey(key);
    if (existingLinkElement) {
      document.head.removeChild(existingLinkElement);
    }
  }
}

/** 获取link标签 */
function getLinkElementForKey(key: string) {
  return getExistingLinkElementByKey(key) || createLinkElementWithKey(key);
}
/** 判断link标签是否存在 */
function getExistingLinkElementByKey(key: string) {
  return document.head.querySelector(`link[rel="stylesheet"].${getClassNameForKey(key)}`);
}
/** 创建link标签 */
function createLinkElementWithKey(key: string) {
  const linkEl = document.createElement('link');
  linkEl.setAttribute('rel', 'stylesheet');
  linkEl.classList.add(getClassNameForKey(key));
  document.head.appendChild(linkEl);
  return linkEl;
}

/** 拼写插槽 */
function getClassNameForKey(key: string) {
  return `ng-fast-${key}`;
}
