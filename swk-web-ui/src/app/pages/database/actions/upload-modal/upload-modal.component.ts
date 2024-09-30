import { NzModalService } from 'ng-zorro-antd/modal';

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';

import { UploadImageComponent } from '../upload-image/upload-image.component';
import { UploadInventoryComponent } from '../upload-inventory/upload-inventory.component';
import { UploadViewComponent } from '../upload-view/upload-view.component';

@Component({
  selector: 'app-upload-modal',
  templateUrl: './upload-modal.component.html',
  styleUrls: ['./upload-modal.component.less']
})
export class UploadModalComponent implements OnInit {
  // 台账字段
  @Input() fields: any[] = [];
  @Input() showText = false;

  visible = false;

  gridStyle = {
    height: '200px',
    'line-height': '100px',
    textAlign: 'center'
  };

  constructor(private modal: NzModalService, private i18n: I18NService, private route: ActivatedRoute) {}

  ngOnInit(): void {}

  onCancel() {
    this.visible = false;
  }

  show() {
    this.visible = true;
  }

  imageUpload() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    this.visible = false;
    // 获取APP选项
    const modalSel = this.modal.create({
      nzTitle: this.i18n.translateLang('page.datastore.selectfile'),
      nzMaskClosable: false,
      nzWidth: 800,
      nzClosable: false,
      nzComponentParams: {
        fields: this.fields,
        datastoreId: datastoreId
      },
      nzContent: UploadImageComponent,
      nzFooter: [
        {
          label: this.i18n.translateLang('common.button.cancel'),
          onClick: instance => {
            instance.fileSelectCancel();
            modalSel.close();
          }
        },
        {
          label: this.i18n.translateLang('common.button.uploadfile'),
          disabled: instance => instance.csvFileList.length === 0 || instance.zipFileList.length === 0,
          onClick: instance => {
            instance.uploadWithFile();
            modalSel.close();
          }
        }
      ]
    });
  }

  csvUpload() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    this.visible = false;
    // 获取APP选项
    const modalSel = this.modal.create({
      nzTitle: this.i18n.translateLang('page.datastore.fileUpload'),
      nzMaskClosable: false,
      nzWidth: 800,
      nzClosable: false,
      nzComponentParams: {
        fields: this.fields,
        datastoreId: datastoreId
      },
      nzContent: UploadViewComponent,
      nzFooter: [
        {
          label: this.i18n.translateLang('common.button.cancel'),
          onClick: instance => {
            instance.onCancel();
            modalSel.close();
          }
        },
        {
          label: this.i18n.translateLang('common.button.uploadfile'),
          disabled: instance => instance.fileList.length === 0,
          onClick: instance => {
            instance.handleUpload();
            modalSel.close();
          }
        }
      ]
    });
  }

  checkUpload() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    this.visible = false;
    // 获取APP选项
    const modalSel = this.modal.create({
      nzTitle: this.i18n.translateLang('page.datastore.fileUpload'),
      nzMaskClosable: false,
      nzClosable: false,
      nzComponentParams: {
        keyFields: this.fields,
        datastoreId: datastoreId
      },
      nzContent: UploadInventoryComponent,
      nzFooter: [
        {
          label: this.i18n.translateLang('common.button.cancel'),
          onClick: instance => {
            instance.onCancel();
            modalSel.close();
          }
        },
        {
          label: this.i18n.translateLang('common.button.uploadfile'),
          disabled: instance => instance.fileList.length === 0 || instance.mainKeys.length === 0 || instance.checkedBy === '',
          onClick: instance => {
            instance.handleUpload();
            modalSel.close();
          }
        }
      ]
    });
  }
}
