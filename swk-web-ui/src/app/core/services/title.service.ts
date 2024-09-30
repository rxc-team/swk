import { Inject, Injectable, Injector } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { I18NService } from '../i18n/i18n.service';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  // 前缀
  private _preffix = 'FAST';
  // 后缀
  private _suffix = '';
  // 分隔符
  private _separator = ' - ';

  /** 设置默认标题名 */
  default = `Not Page Name`;

  // 应用程序的Title分隔符
  constructor(private title: Title, private injector: Injector, private i18n: I18NService) {}

  /** 设置前缀 */
  set preffix(v: string) {
    this._preffix = v;
  }

  /** 设置后缀 */
  set suffix(v: string) {
    this._suffix = v;
  }

  /** 设置分隔符 */
  set separator(v: string) {
    this._separator = v;
  }

  /** 通过路由data获取title */
  private getByRoute(): string {
    let next = this.injector.get(ActivatedRoute);
    while (next.firstChild) {
      next = next.firstChild;
    }
    const data = (next.snapshot && next.snapshot.data) || {};

    if (data.title) {
      return this.i18n.translateLang(data.title);
    }

    return this.default;
  }

  /**
   * 设置标题
   *
   * 1.设置传入参数为标题，按照[前缀+分隔符+标题+分隔符+后缀]的方式
   *
   * 2.在传入参数空的场合，自动获取当前路由的data.title数据
   *
   * 3.在1、2均未取到数据的情况下，设置为默认数据[Not Page Name]
   *
   */
  setTitle(title?: string): void {
    // 判断参数是否为空
    if (!title) {
      // 1.在空的场合，自动获取当前路由的data.title数据
      // 2.在1未取到数据的情况下，设置为默认数据[Not Page Name]
      title = this.getByRoute() || this.default;
    }

    // 组合title，按照[前缀+分隔符+标题+分隔符+后缀]的方式。
    const titles = [];
    if (this._preffix) {
      titles.push(this._preffix);
    }
    titles.push(title);
    if (this._suffix) {
      titles.push(this._suffix);
    }

    // 通过angular提供的title服务，设置title标题。
    this.title.setTitle(titles.join(this._separator));
  }

  /**
   * 获取标题
   *
   * 默认获取title全部内容。
   *
   * 在参数为flase是分割数据，仅获取title部分内容
   *
   */
  getTitle(full: boolean = true): string {
    // 默认返回全部标题
    if (full) {
      return this.title.getTitle();
    }
    // 获取标题
    const titles = this.title.getTitle();
    // 判断是否为空
    if (titles) {
      // 按照分隔符切割标题
      const titleArr = titles.split(this._separator);
      // 判断是否符合设置的规则
      if (titleArr.length === 3 && titleArr[0] === this._preffix && titleArr[2] === this._suffix) {
        // 符后规则场合，返回标题
        return titleArr[1];
      } else {
        // 不符合场合，输出提示log，返回全部标题
        console.log('The title is not according to the standard format, it cannot be split');
        return titles;
      }
    } else {
      // 空的场合，返回空字符。
      return '';
    }
  }
}
