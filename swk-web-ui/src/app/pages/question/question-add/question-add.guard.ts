import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { FileService } from '@api';
import { I18NService } from '@core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { QuestionAddComponent } from './question-add.component';

@Injectable({
  providedIn: 'root'
})
export class QuestionAddGuard implements CanDeactivate<QuestionAddComponent> {
  constructor(private file: FileService, private message: NzMessageService, private i18n: I18NService) {}
  canDeactivate(
    component: QuestionAddComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!component.save) {
      // 当用户取消或回退时，删除minio中上传的图片
      component.fileList.forEach(f => {
        this.file.deletePublicHeaderFile(f.response.url);
      });
    }
    return true;
  }
}
