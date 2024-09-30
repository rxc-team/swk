import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { FileService } from '@api';
import { CommonService, I18NService } from '@core';

import { ItemCopyComponent } from './item-copy.component';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateCopyGuard implements CanDeactivate<ItemCopyComponent> {
  constructor(private file: FileService, private common: CommonService, private message: NzMessageService, private i18n: I18NService) {}
  canDeactivate(component: ItemCopyComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    let karakbn = true;
    for (const key in component.ots) {
      if (Object.prototype.hasOwnProperty.call(component.ots, key)) {
        karakbn = false;
        // 文件项初期状态值
        const oldfs = component.ots[key];
        // 文件项末期状态值
        const newfs = component.nts[key];
        // 保存更改,则以现在状态为基准删除原始文件
        if (component.save) {
          // 原始文件存在(原始文件不存在则不需要删除)
          if (oldfs.length > 0) {
            oldfs.forEach(of => {
              let isNeed = true;
              // 当前值存在,则判断原始文件是否为当前值,若为则保留否则删除
              if (newfs.length > 0) {
                const taget = newfs.filter(nf => nf === of);
                isNeed = taget.length > 0;
              } else {
                // 当前值为空,则删除所有原始文件
                isNeed = false;
              }
              if (!isNeed) {
                // 删除原始文件
                this.file.deletePublicDataFile(of).then((res: any) => {});
              }
            });
          }
        } else {
          // 不保存更改,则以初期状态为基准删除当前不需保存的文件(当前不需保存的文件不存在则不需要删除)
          if (newfs.length > 0) {
            newfs.forEach(nf => {
              let isNeed = true;
              // 原始文件存在,则判断当前值是否为原始文件,若为则保留否则删除
              if (oldfs.length > 0) {
                const taget = oldfs.filter(of => of === nf);
                isNeed = taget.length > 0;
              } else {
                // 原始文件为空,则删除所有当前不需保存的文件
                isNeed = false;
              }
              if (!isNeed) {
                // 删除原始文件
                this.file.deletePublicDataFile(nf).then((res: any) => {});
              }
            });
          }
        }
      }
    }

    // 啥操作没有取消拷贝新规则删除拷贝文件
    if (karakbn) {
      if (!component.save) {
        for (const key in component.fileUrlMap) {
          if (Object.prototype.hasOwnProperty.call(component.fileUrlMap, key)) {
            const element = component.fileUrlMap[key];
            // 删除文件
            this.file.deletePublicDataFile(element).then((res: any) => {});
          }
        }
      }
    }
    return true;
  }
}
