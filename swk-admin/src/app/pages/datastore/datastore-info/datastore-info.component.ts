import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatastoreService, FieldService, MappingService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-datastore-info',
  templateUrl: './datastore-info.component.html',
  styleUrls: ['./datastore-info.component.less']
})
export class DatastoreInfoComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ds: DatastoreService,
    private fs: FieldService,
    private modal: NzModalService,
    private ms: MappingService,
    private i18n: I18NService,
    private message: NzMessageService
  ) {}

  datastoreInfo: any = {};
  fields: any[] = [];

  confirmModal: NzModalRef;

  ngOnInit() {
    this.init();
  }

  async init() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    await this.ds.getDatastoreByID(datastoreId).then((data: any) => {
      if (data) {
        this.datastoreInfo = data;
      } else {
        this.datastoreInfo = {};
      }
    });
    await this.fs.getFields(datastoreId, { invalidatedIn: 'true' }).then((data: any[]) => {
      if (data) {
        this.fields = data;
      } else {
        this.fields = [];
      }
    });
  }

  fowardToFieldListPage() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const url = `datastores/${datastoreId}/field/list`;
    this.router.navigate([url]);
  }

  fowardToDatastoreSettingPage() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const url = `datastores/${datastoreId}/setting`;
    this.router.navigate([url]);
  }

  fowardToMappingAddPage() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const url = `datastores/${datastoreId}/mapping/add`;
    this.router.navigate([url]);
  }
  fowardToFieldSettingPage(id: string) {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const edit = `/datastores/${datastoreId}/field/${id}/edit`;
    this.router.navigate([edit]);
  }
  fowardToMappingSettingPage(mappingId: string) {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const url = `datastores/${datastoreId}/mapping/${mappingId}/setting`;
    this.router.navigate([url]);
  }
  fowardToImportPage() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const url = `datastores/${datastoreId}/import`;
    this.router.navigate([url]);
  }

  deleteMapping(mappingId: string) {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.selMappingDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.selMappingDelContent')}`,
      nzOnOk: () => {
        this.ms.deleteMapping(datastoreId, mappingId).then(() => {
          this.message.success(this.i18n.translateLang('common.message.success.S_003'));
          this.init();
        });
      }
    });
  }
}
