import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { FileService } from '@api';
import { I18NService } from '@core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { BaseSettingComponent } from './base-setting.component';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateUserinfoGuard implements CanDeactivate<BaseSettingComponent> {
  constructor(private file: FileService, private i18n: I18NService, private message: NzMessageService) {}
  canDeactivate(
    component: BaseSettingComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (component.save) {
      // 保存更改,若有变化则删除原始文件
      if (component.initavatar && component.avatar !== component.initavatar) {
        this.file.deletePublicHeaderFile(component.initavatar).then((res: any) => {});
      }
    } else {
      // 不保存更改,若有变化则删除当前不需要保存的LOGO文件
      if (component.avatar && component.avatar !== component.initavatar) {
        this.file.deletePublicHeaderFile(component.avatar).then((res: any) => {});
      }
    }
    return true;
  }
}
