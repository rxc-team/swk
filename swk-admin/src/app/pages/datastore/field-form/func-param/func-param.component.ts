import { format } from 'date-fns';
import * as _ from 'lodash';

import { Component, Input, OnInit } from '@angular/core';
import { DatastoreService, FieldService } from '@api';

@Component({
  selector: 'app-func-param',
  templateUrl: './func-param.component.html',
  styleUrls: ['./func-param.component.less']
})
export class FuncParamComponent implements OnInit {
  @Input() datastoreId: string;
  @Input() selectParam: any;
  // 选择的台账
  selectDs: any;
  // 选择的字段
  selectField: any;
  // 台账一览
  datastoreList: any[] = [];
  // 字段一览
  fieldList: any[] = [];

  constructor(private ds: DatastoreService, private fs: FieldService) {}
  // 初始化处理
  ngOnInit() {
    this.init();
  }

  // 初始化
  async init() {
    this.fieldList = [];
    await this.ds.getDatastoreByID(this.datastoreId).then(data => {
      if (data) {
        // 限制只能是当前台账的数据
        this.datastoreList = [data];
        this.selectDs = data;
      }
    });
    await this.fs.getFields(this.selectDs.datastore_id).then((data: any[]) => {
      if (data) {
        this.fieldList = data.filter(d => d.field_type !== 'file' && d.field_type !== 'user' && d.field_type !== 'function');

        if (this.selectParam) {
          if (this.selectParam.data_type === 'any') {
            this.fieldList = _.sortBy(this.fieldList, 'created_at');
            return;
          }

          this.fieldList.forEach(d => {
            if (d.field_type !== this.selectParam.data_type) {
              d.disabled = true;
            }
          });
        }

        this.fieldList = _.sortBy(this.fieldList, 'created_at');
      }
    });
    this.buildTree();
  }
  // 生成子字段
  buildTree() {
    if (this.selectDs.relations) {
      this.selectDs.relations.forEach(async rat => {
        const ds = await this.ds.getDatastoreByID(rat.datastore_id);

        const f = {
          field_id: rat.relation_id,
          field_name: ds.datastore_name,
          child: [],
          created_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        };

        await this.fs.getFields(rat.datastore_id).then(data => {
          if (data) {
            f.child = data.filter(d => d.field_type !== 'file' && d.field_type !== 'user' && d.field_type !== 'function');

            f.child.forEach(fs => {
              if (this.selectParam) {
                if (this.selectParam.data_type !== 'any') {
                  if (fs.field_type !== this.selectParam.data_type) {
                    fs.disabled = true;
                  }
                }
              }

              fs.linked = f.field_id;
            });

            f.child = _.sortBy(f.child, 'created_at');
          } else {
            f.child = [];
          }
        });

        this.fieldList = [f, ...this.fieldList];
      });
    }
  }
}
