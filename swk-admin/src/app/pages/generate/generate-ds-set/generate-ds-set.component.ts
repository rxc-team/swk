import { Observable, Observer } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatastoreService, GenService, ValidationService } from '@api';
import { I18NService } from '@core';

import { StepService } from '../step.service';

@Component({
  selector: 'app-generate-ds-set',
  templateUrl: './generate-ds-set.component.html',
  styleUrls: ['./generate-ds-set.component.less']
})
export class GenerateDsSetComponent implements OnInit {
  datastoreList = [];

  form: FormGroup;

  constructor(
    private ds: DatastoreService,
    private fb: FormBuilder,
    private router: Router,
    private sts: StepService,
    private gs: GenService,
    private vs: ValidationService,
    private i18n: I18NService
  ) {}

  async ngOnInit() {
    this.form = this.fb.group({
      datastore: ['', []],
      datastoreName: ['', [Validators.required], [this.datastoreNameAsyncValidator]],
      apiKey: ['', [Validators.required, Validators.pattern('^[a-z0-9A-Z_]+[a-z0-9A-Z_]{0,49}')], [this.datastoreIDAsyncValidator]],
      canCheck: [false, []]
    });

    this.setDefaultApiKey();

    await this.ds.getDatastores().then(data => {
      if (data) {
        this.datastoreList = data;
      } else {
        this.datastoreList = [];
      }
    });

    this.gs.getConfig().then(data => {
      if (data && data.datastore_id) {
        this.form.get('datastore').setValue(data.datastore_id);
        this.form.get('datastoreName').setValue(data.datastore_name);
        this.form.get('apiKey').setValue(data.api_key);
        this.form.get('canCheck').setValue(data.can_check);
        this.form.get('datastore').disable();
        this.form.get('datastoreName').disable();
        this.form.get('apiKey').disable();
        this.form.get('canCheck').disable();
      }
    });
  }

  dsChange(d) {
    if (d) {
      const datastore = this.datastoreList.find(ds => ds.datastore_id === d);
      this.form.get('datastoreName').setValue(this.i18n.translateLang(datastore.datastore_name));
      this.form.get('apiKey').setValue(datastore.api_key);
      this.form.get('canCheck').setValue(datastore.can_check);
      this.form.get('datastoreName').disable();
      this.form.get('apiKey').disable();
      this.form.get('canCheck').disable();
    } else {
      this.form.get('datastoreName').setValue('');
      this.form.get('apiKey').setValue('datastore_' + this.genUUID(3));
      this.form.get('canCheck').setValue(false);
      this.form.get('datastoreName').enable();
      this.form.get('apiKey').enable();
      this.form.get('canCheck').enable();
    }
  }

  async save() {}

  /**
   * @description: 台账名称唯一性检查
   */
  datastoreNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      this.vs.validationUnique('datastores', control.value).then((id: string) => {
        if (!id) {
          observer.next(null);
        } else {
          observer.next({ error: true, duplicated: true });
        }
        observer.complete();
      });
    });

  /**
   * @description: 台账apiKey唯一性检查
   */
  datastoreIDAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      this.ds.datastoreIDAsyncValidator({ apiKey: control.value }).then((datastores: boolean) => {
        if (!datastores) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  /**
   * @description: 生成默认APP-KEY,提供参考
   */
  setDefaultApiKey() {
    this.form.controls.apiKey.setValue('datastore_' + this.genUUID(3));
    this.form.controls.apiKey.markAsTouched();
  }

  /**
   * 生成随机的 UUID
   */
  genUUID(randomLength) {
    return Number(Math.random().toString().substr(3, randomLength) + Date.now())
      .toString(36)
      .substring(0, 3);
  }

  async clear() {
    await this.gs.complete();
    this.router.navigate(['generate']);
  }

  pre() {
    this.sts.pre();
  }

  async next() {
    const param = {
      datastore_id: this.form.get('datastore').value,
      datastore_name: this.form.get('datastoreName').value,
      api_key: this.form.get('apiKey').value,
      can_check: this.form.get('canCheck').value.toString()
    };

    await this.gs.setDatabase(param);

    this.sts.next();
  }
}
