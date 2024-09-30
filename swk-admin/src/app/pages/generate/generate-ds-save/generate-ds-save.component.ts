import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GenService } from '@api';

import { Option } from '../components/generate-option-setting/generate-option-setting.component';
import { Field } from '../generate-attr-set/generate-attr-set.component';
import { StepService } from '../step.service';

@Component({
  selector: 'app-generate-ds-save',
  templateUrl: './generate-ds-save.component.html',
  styleUrls: ['./generate-ds-save.component.less']
})
export class GenerateDsSaveComponent implements OnInit {
  ds;
  fieldList: Field[] = [];
  constructor(private gs: GenService, private sts: StepService, private router: Router) {}

  async ngOnInit() {
    const data = await this.gs.getConfig();
    if (data) {
      this.ds = data.datastore_name;
      this.fieldList = data.fields.filter(f => f.can_change && !f.is_empty_line);
    }
  }

  async clear() {
    await this.gs.complete();
    this.router.navigate(['generate']);
  }

  pre() {
    this.sts.pre();
  }

  async next() {
    await this.gs.createDatabase();
    this.sts.next();
  }
}
