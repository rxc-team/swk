import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { HelpFormComponent } from './help-form.component';
import { FileService } from '@api';
import { I18NService } from '@core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class HelpFormGuardGuard implements CanDeactivate<HelpFormComponent> {
  constructor(private file: FileService, private message: NzMessageService, private i18n: I18NService) {}
  canDeactivate(
    component: HelpFormComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (component.save) {
      // 保存更改时,删除minio服务器中不需要的图片
      component.delImgs.forEach(f => {
        this.file.deletePublicHeaderFile(f.response.url);
      });
    } else {
      // 不保存更改时,删除minio服务器中不需要的图片
      component.canceldel.forEach(f => {
        this.file.deletePublicHeaderFile(f.response.url);
      });
    }
    return true;
  }
}
