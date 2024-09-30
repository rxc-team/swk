/*
 * @Description: 主题画面控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-04-26 13:47:42
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-07-13 16:24:18
 */
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { Observable } from 'rxjs';

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ThemeService } from '@core';
import { Select } from '@ngxs/store';
import { ThemeInfoState } from '@store';

@Component({
  selector: 'app-theme-picker',
  templateUrl: 'theme-picker.component.html',
  styleUrls: ['theme-picker.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemePickerComponent {
  @Input() nxShowText = false;
  // 全局类型
  themes: any[];

  isSmall = false;

  constructor(public themeService: ThemeService, public bs: NzBreakpointService) {
    this.themes = themeService.themes;
    bs.subscribe({
      xs: '480px',
      sm: '768px',
      md: '992px',
      lg: '1200px',
      xl: '1600px',
      xxl: '1600px'
    }).subscribe(data => {
      if (data === 'sm' || data === 'xs') {
        this.isSmall = true;
      } else {
        this.isSmall = false;
      }
    });
  }
  // Select 当前的主题名称
  @Select(ThemeInfoState.getThemeName) currentThemeName$: Observable<string>;

  isVisible = false;
  /**
   * @description: 改变主题
   */
  async changeTheme(name: string) {
    this.themeService.changeTheme(name);
  }

  /**
   * @description: 显示模态窗口
   */
  showModal(): void {
    this.isVisible = true;
  }
  /**
   * @description: 取消选择
   */
  handleCancel(): void {
    this.isVisible = false;
  }
}
