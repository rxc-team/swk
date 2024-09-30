import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { FileService } from '@api';
import { I18NService } from '@core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BaseSettingComponent } from './base-setting.component';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateUserGuard implements CanDeactivate<BaseSettingComponent> {
  constructor(private file: FileService, private message: NzMessageService, private i18n: I18NService) {}
  canDeactivate(component: BaseSettingComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    if (component.save) {
      // 保存更改,若有变化则删除原始文件
      if (component.initavatar && component.avatar !== component.initavatar) {
        this.file.deletePublicHeaderFile(component.initavatar);
      }
    } else {
      // 不保存更改,若有变化则删除当前不需要保存的LOGO文件
      if (component.avatar && component.avatar !== component.initavatar) {
        this.file.deletePublicHeaderFile(component.avatar);
      }
    }
    return true;
  }
}
