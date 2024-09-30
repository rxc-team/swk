import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { HelpTypeFormComponent } from './help-type-form.component';
import { FileService } from '@api';
import { I18NService } from '@core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class HelpTypeGuardGuard implements CanDeactivate<HelpTypeFormComponent> {
  constructor(private file: FileService, private message: NzMessageService, private i18n: I18NService) {}
  canDeactivate(
    component: HelpTypeFormComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (component.save) {
      // 保存更改时,若有变化则删除初始化时的LOGO文件
      if (component.initicon && component.icon !== component.initicon) {
        this.file.deletePublicHeaderFile(component.initicon);
      }
    } else {
      // 不保存更改时,若有变化则删除当前不需要保存的LOGO文件
      if (component.icon && component.icon !== component.initicon) {
        this.file.deletePublicHeaderFile(component.icon);
      }
    }
    return true;
  }
}
