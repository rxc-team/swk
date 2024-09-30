import { NgEventBus } from 'ng-event-bus';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DatastoreService, ItemService } from '@api';
import { I18NService, PrintService } from '@core';

@Component({
  selector: 'app-print-view',
  templateUrl: './print-view.component.html',
  styleUrls: ['./print-view.component.less']
})
export class PrintViewComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private printerService: PrintService,
    private itemService: ItemService,
    private datastoreService: DatastoreService,
    private route: ActivatedRoute,
    private modal: NzModalService,
    private message: NzMessageService,
    private event: NgEventBus
  ) {
    this.form = this.fb.group({
      pritnType: ['label', [Validators.required]]
    });

    this.printSubscription = this.event
      .on('print:complete')
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(data => {
        if (data) {
          if (PrintViewComponent.comfireOpen) {
            return;
          }
          PrintViewComponent.comfireOpen = true;
          this.modal.confirm({
            nzTitle: `${this.i18n.translateLang('common.message.confirm.printTitle')}`,
            nzContent: `${this.i18n.translateLang('common.message.confirm.printContent')}`,
            nzOnOk: async () => {
              const datastoreId = this.route.snapshot.paramMap.get('d_id');
              const items = this.dataSet.map(i => i.item_id);
              await this.itemService.print(datastoreId, items).then(() => {
                this.message.success(this.i18n.translateLang('common.message.success.S_002'));
              });
              this.visible = false;
              PrintViewComponent.comfireOpen = false;
            },
            nzOnCancel: () => {
              this.visible = false;
              PrintViewComponent.comfireOpen = false;
            }
          });
        }
      });
  }

  private static comfireOpen = false;

  @Input() pages = [];
  @Input() dataSet = [];
  @Input() fields = [];
  @Input() qrFields = [];
  @Input() qrConnector = '#';
  @Input() showText = false;

  visible = false;
  printShow = false;
  printSubscription;
  form: FormGroup;

  field1 = '';
  field2 = '';
  field3 = '';
  label1 = '';
  label2 = '';
  label3 = '';

  title = 'Print';

  ngOnDestroy(): void {
    if (this.printSubscription) {
      this.printSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.title = this.i18n.translateLang('route.databaseListTitle');
  }

  qr(items: any) {
    const result = [];

    if (!this.qrFields || this.qrFields.length === 0) {
      return 'noSet';
    }

    this.qrFields.forEach(v => {
      if (v == "sys_dami") {
        result.push(",");
      } else {
        const it = items[v].value;
        if (it) {
          result.push(it);
        }
      }
    });

    if (result.length > 0) {
      return result.join(this.qrConnector);
    }

    return '';
  }

  mmConvertPx(value: number) {
    const dpi = 96; // css为基础打印
    const ins = value / 25.4;
    const px = ins * dpi;
    return Math.ceil(px);
  }

  fieldChange(id: string, type: number) {
    const f = this.fields.find(d => d.field_id === id);
    if (f) {
      switch (type) {
        case 1:
          this.form.get('label1').setValue(this.i18n.translateLang(f.field_name));
          break;
        case 2:
          this.form.get('label2').setValue(this.i18n.translateLang(f.field_name));
          break;
        case 3:
          this.form.get('label3').setValue(this.i18n.translateLang(f.field_name));
          break;

        default:
          break;
      }
    }
  }

  show() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    // 获取台账情报
    this.datastoreService.getDatastoreByID(datastoreId).then((data: any) => {
      if (data) {
        this.field1 = data.print_field1;
        const printField1 = this.fields.find(f => f.field_id === this.field1);
        if (printField1) {
          this.label1 = this.i18n.translateLang(printField1.field_name);
        }
        this.field2 = data.print_field2;
        const printField2 = this.fields.find(f => f.field_id === this.field2);
        if (printField2) {
          this.label2 = this.i18n.translateLang(printField2.field_name);
        }
        this.field3 = data.print_field3;
        const printField3 = this.fields.find(f => f.field_id === this.field3);
        if (printField3) {
          this.label3 = this.i18n.translateLang(printField3.field_name);
        }
        this.qrFields = data.scan_fields || [];
        this.qrConnector = data.scan_fields_connector;
      }
    });
    this.visible = true;
  }

  printLabel() {
    this.printerService.print(this.title, 'print-section', 'label');
  }

  printA410() {
    this.printerService.print(this.title, 'print-section-a4-10', 'a4');
  }
}
