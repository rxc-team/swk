import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { FileService } from '@api';
import { I18NService } from '@core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { SettingComponent } from './setting.component';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateGuard implements CanDeactivate<SettingComponent> {
  constructor(private file: FileService, private message: NzMessageService, private i18n: I18NService) {}
  canDeactivate(
    component: SettingComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (component.save) {
      // 保存更改,若有变化则删除原始文件
      if (component.initLogo && component.logo !== component.initLogo) {
        this.file.deletePublicHeaderFile(component.initLogo).then((res: any) => {});
      }
    } else {
      // 不保存更改,若有变化则删除当前不需要保存的LOGO文件
      if (component.logo && component.logo !== component.initLogo) {
        this.file.deletePublicHeaderFile(component.logo).then((res: any) => {});
      }
    }
    return true;
  }
}
