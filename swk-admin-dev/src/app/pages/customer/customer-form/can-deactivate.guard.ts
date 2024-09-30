import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { FileService } from '@api';
import { I18NService } from '@core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { CustomerFormComponent } from './customer-form.component';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateGuard implements CanDeactivate<CustomerFormComponent> {
  constructor(private file: FileService, private message: NzMessageService, private i18n: I18NService) {}
  canDeactivate(
    component: CustomerFormComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (component.save) {
      // 保存更改时,若有变化则删除初始化时的LOGO文件
      if (component.initLogo && component.logo !== component.initLogo) {
        this.file.deletePublicHeaderFile(component.initLogo);
      }
    } else {
      // 不保存更改时,若有变化则删除当前不需要保存的LOGO文件
      if (component.logo && component.logo !== component.initLogo) {
        this.file.deletePublicHeaderFile(component.logo);
      }
    }
    // LOGO文件没有变化的场合无论保存否都不必处理
    // console.log(route.paramMap.get('id'));
    // console.log(state.url);
    return true;
  }
}
