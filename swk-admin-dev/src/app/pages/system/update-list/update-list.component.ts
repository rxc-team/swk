import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Component, OnInit } from '@angular/core';
import { ScriptService } from '@api';
import { I18NService } from '@core';

import { AppScriptComponent } from '../app-script/app-script.component';

@Component({
  selector: 'app-update-list',
  templateUrl: './update-list.component.html',
  styleUrls: ['./update-list.component.less']
})
export class UpdateListComponent implements OnInit {
  data = [];

  constructor(private ss: ScriptService, private message: NzMessageService, private i18n: I18NService, private modal: NzModalService) {}

  ngOnInit(): void {
    this.ss.getScriptList().then(data => {
      if (data) {
        this.data = data;
      } else {
        this.data = [];
      }
    });
  }

  run(id: string) {
    this.ss.execScript(id).then(data => {
      sessionStorage.setItem(id, 'true');

      this.message.success(this.i18n.translateLang('common.message.success.S_002'));
    });
  }

  disabled(id) {
    return sessionStorage.getItem(id) === 'true';
  }

  open(sc: any) {
    const modal: NzModalRef = this.modal.create({
      nzTitle: 'Mongo Script',
      nzContent: AppScriptComponent,
      nzWidth: '1200px',
      nzMask: true,
      nzMaskClosable: false,
      nzComponentParams: {
        scriptId: sc.script_id,
        data: sc.script_data,
        script: sc.script_func
      },
      nzFooter: null,
      nzOnCancel: componentInstance => {
        // componentInstance.exist();
        modal.close();
      }
    });
  }
}
