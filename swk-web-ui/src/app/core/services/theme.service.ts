import { BehaviorSubject, Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetTheme } from '@store';

export interface Theme {
  label: string;
  name: string;
  icon: string;
  isDark: boolean;
}

const THEME_KEY = 'theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeList: Theme[] = [
    { label: '默认', name: 'default', icon: 'bulb', isDark: false },
    { label: '紧凑', name: 'compact', icon: 'bulb', isDark: false },
    { label: '暗黑', name: 'dark', icon: 'bulb', isDark: true }
  ];

  private defaultTheme: Theme = {
    label: '默认',
    name: 'default',
    icon: 'bulb',
    isDark: false
  };

  private currentTheme = 'default';

  private theme: BehaviorSubject<Theme> = new BehaviorSubject<Theme>(this.defaultTheme);

  constructor(private store: Store) {
    const theme = this.getTheme();
    if (theme) {
      this.changeTheme(theme, true);
    } else {
      this.changeTheme('default', true);
    }
  }

  get themes(): Theme[] {
    return this.themeList;
  }

  get theme$(): Observable<Theme> {
    return this.theme.asObservable();
  }

  changeTheme(theme: string, isFirst: boolean = false): void {
    const th = this.themeList.find(t => t.name === theme);
    if (th) {
      this.currentTheme = th.name;
      this.saveTheme(th.name);
      this.theme.next(th);
      this.loadTheme(isFirst);
      this.store.dispatch(new SetTheme({ name: th.name, mode: th.isDark ? 'dark' : 'light', isDefault: false }));
      return;
    }
    this.currentTheme = this.defaultTheme.name;
    this.saveTheme(this.defaultTheme.name);
    this.theme.next(this.defaultTheme);
    this.loadTheme(isFirst);
    this.store.dispatch(
      new SetTheme({ name: this.defaultTheme.name, mode: this.defaultTheme.isDark ? 'dark' : 'light', isDefault: false })
    );
  }

  saveTheme(theme: string) {
    localStorage.setItem(THEME_KEY, theme);
  }

  getTheme(): string {
    return localStorage.getItem(THEME_KEY) || this.defaultTheme.name;
  }

  /**
   * 加载主题
   * @param firstLoad 是否是第一次加载
   * @returns 返回
   */
  loadTheme(firstLoad = true): void {
    const theme = this.currentTheme;
    if (firstLoad) {
      document.documentElement.classList.add(theme);
    }
    this.loadCss(`${theme}.css`, theme).then(e => {
      if (!firstLoad) {
        document.documentElement.classList.add(theme);
      }
      // 删除除了当前主题的所有主题
      const themes = this.themeList.filter(t => t.name !== this.currentTheme);
      themes.forEach(t => {
        this.removeUnusedTheme(t.name);
      });
    });
  }

  /**
   * loadCss 加载css样式
   * @param href 样式主题名称
   * @param id link的ID
   * @returns 可观察的加载结果
   */
  private loadCss(href: string, id: string): Promise<Event> {
    return new Promise((resolve, reject) => {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = href;
      style.id = id;
      style.onload = resolve;
      style.onerror = reject;
      document.head.append(style);
    });
  }

  /**
   * 删除没有使用的主题
   * @param theme 主题类型
   */
  private removeUnusedTheme(theme: string): void {
    document.documentElement.classList.remove(theme);
    const removedThemeStyle = document.getElementById(theme);
    if (removedThemeStyle) {
      document.head.removeChild(removedThemeStyle);
    }
  }
}
