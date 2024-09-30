import { NzModalService } from 'ng-zorro-antd/modal';

import { Component, Input, OnInit } from '@angular/core';
import { DatastoreService } from '@api';
import { I18NService } from '@core';

import { FuncParamComponent } from '../func-param/func-param.component';

interface Option {
  name?: string;
  func?: string;
  tip?: string;
  params?: Param[];
}

interface Param {
  name?: string;
  data_type?: string;
  value?: string;
}

@Component({
  selector: 'app-func-gen',
  templateUrl: './func-gen.component.html',
  styleUrls: ['./func-gen.component.less']
})
export class FuncGenComponent implements OnInit {
  @Input() datastoreId;

  // 函数配置
  options: Map<string, Option[]> = new Map();

  typeList = [
    { label: 'page.datastore.formula.funcArithmeticExpression', value: 'arithmetic' },
    { label: 'page.datastore.formula.funcBooleanExpression', value: 'boolean' },
    { label: 'page.datastore.formula.funcComparisonExpression', value: 'comparison' },
    { label: 'page.datastore.formula.funcConditionalExpression', value: 'conditional' },
    { label: 'page.datastore.formula.funcDateExpression', value: 'date' },
    { label: 'page.datastore.formula.funcStringExpression', value: 'string' },
    { label: 'page.datastore.formula.funcTypeExpression', value: 'type' }
  ];

  gridStyle = {
    width: '25%',
    textAlign: 'center'
  };

  // 参数画面控制
  isSetParam = false;
  // 当前选择的函数类型
  selectType = 'arithmetic';
  // 当前选择的函数
  select: Option;

  constructor(private modal: NzModalService, private ds: DatastoreService, private i18n: I18NService) {}
  // 初始化
  ngOnInit(): void {
    this.options.set('arithmetic', [
      {
        name: 'ADD',
        func: '"$add":["a","b"]',
        tip: 'page.datastore.formula.funcAdd',
        params: [
          {
            data_type: 'number',
            name: 'a',
            value: ''
          },
          {
            data_type: 'number',
            name: 'b',
            value: ''
          }
        ]
      },
      {
        name: 'SUBTRACT',
        func: '"$subtract":["a","b"]',
        tip: 'page.datastore.formula.funcSubtract',
        params: [
          {
            data_type: 'number',
            name: 'a',
            value: ''
          },
          {
            data_type: 'number',
            name: 'b',
            value: ''
          }
        ]
      },
      {
        name: 'MULTIPLY',
        func: '"$multiply":["a","b"]',
        tip: 'page.datastore.formula.funcMultiply',
        params: [
          {
            data_type: 'number',
            name: 'a',
            value: ''
          },
          {
            data_type: 'number',
            name: 'b',
            value: ''
          }
        ]
      },
      {
        name: 'DIVIDE',
        func: '"$divide":["a","b"]',
        tip: 'page.datastore.formula.funcDivide',
        params: [
          {
            data_type: 'number',
            name: 'a',
            value: ''
          },
          {
            data_type: 'number',
            name: 'b',
            value: ''
          }
        ]
      }
    ]);
    this.options.set('boolean', [
      {
        name: 'AND',
        func: '"$and":["a","b"]',
        tip: 'page.datastore.formula.funcAnd',
        params: [
          {
            data_type: 'any',
            name: 'a',
            value: ''
          },
          {
            data_type: 'any',
            name: 'b',
            value: ''
          }
        ]
      },
      {
        name: 'OR',
        func: '"$or":["a","b"]',
        tip: 'page.datastore.formula.funcOr',
        params: [
          {
            data_type: 'any',
            name: 'a',
            value: ''
          },
          {
            data_type: 'any',
            name: 'b',
            value: ''
          }
        ]
      },
      {
        name: 'NOT',
        func: '"$not":["a"]',
        tip: 'page.datastore.formula.funcNot',
        params: [
          {
            data_type: 'any',
            name: 'a',
            value: ''
          }
        ]
      }
    ]);
    this.options.set('comparison', [
      {
        name: 'EQ',
        func: '"$eq":["a","b"]',
        tip: 'page.datastore.formula.funcEq',
        params: [
          {
            data_type: 'any',
            name: 'a',
            value: ''
          },
          {
            data_type: 'any',
            name: 'b',
            value: ''
          }
        ]
      },
      {
        name: 'GT',
        func: '"$gt":["a","b"]',
        tip: 'page.datastore.formula.funcGt',
        params: [
          {
            data_type: 'any',
            name: 'a',
            value: ''
          },
          {
            data_type: 'any',
            name: 'b',
            value: ''
          }
        ]
      },
      {
        name: 'GTE',
        func: '"$gte":["a","b"]',
        tip: 'page.datastore.formula.funcGte',
        params: [
          {
            data_type: 'any',
            name: 'a',
            value: ''
          },
          {
            data_type: 'any',
            name: 'b',
            value: ''
          }
        ]
      },
      {
        name: 'LT',
        func: '"$lt":["a","b"]',
        tip: 'page.datastore.formula.funcLt',
        params: [
          {
            data_type: 'any',
            name: 'a',
            value: ''
          },
          {
            data_type: 'any',
            name: 'b',
            value: ''
          }
        ]
      },
      {
        name: 'LTE',
        func: '"$lte":["a","b"]',
        tip: 'page.datastore.formula.funcLte',
        params: [
          {
            data_type: 'any',
            name: 'a',
            value: ''
          },
          {
            data_type: 'any',
            name: 'b',
            value: ''
          }
        ]
      },
      {
        name: 'NE',
        func: '"$ne":["a","b"]',
        tip: 'page.datastore.formula.funcNe',
        params: [
          {
            data_type: 'any',
            name: 'a',
            value: ''
          },
          {
            data_type: 'any',
            name: 'b',
            value: ''
          }
        ]
      }
    ]);
    this.options.set('conditional', [
      {
        name: 'COND',
        func: '"$cond":{"if":"a","then":"b","else":"c"}',
        tip: 'page.datastore.formula.funcCond',
        params: [
          {
            data_type: 'any',
            name: 'a',
            value: ''
          },
          {
            data_type: 'any',
            name: 'b',
            value: ''
          },
          {
            data_type: 'any',
            name: 'c',
            value: ''
          }
        ]
      },
      {
        name: 'IFNULL',
        func: '"$ifNull":["a","b"]',
        tip: 'page.datastore.formula.funcIfNull',
        params: [
          {
            data_type: 'any',
            name: 'a',
            value: ''
          },
          {
            data_type: 'any',
            name: 'b',
            value: ''
          }
        ]
      }
    ]);
    this.options.set('date', [
      {
        name: 'DATETOSTRING',
        func: '"$dateToString":{"date":"d","format":"f","timezone":"z","onNull":"n"}',
        tip: 'page.datastore.formula.funcDateToString',
        params: [
          {
            data_type: 'date',
            name: 'd',
            value: ''
          },
          {
            data_type: 'text',
            name: 'f',
            value: ''
          },
          {
            data_type: 'text',
            name: 'z',
            value: ''
          },
          {
            data_type: 'text',
            name: 'n',
            value: ''
          }
        ]
      },
      {
        name: 'MONTH',
        func: '"$month":{"date":"a","timezone":"b"}',
        tip: 'page.datastore.formula.funcMonth',
        params: [
          {
            data_type: 'date',
            name: 'a',
            value: ''
          },
          {
            data_type: 'text',
            name: 'b',
            value: ''
          }
        ]
      },
      {
        name: 'YEAR',
        func: '"$year":{"date":"a","timezone":"b"}',
        tip: 'page.datastore.formula.funcYear',
        params: [
          {
            data_type: 'date',
            name: 'a',
            value: ''
          },
          {
            data_type: 'text',
            name: 'b',
            value: ''
          }
        ]
      }
    ]);
    this.options.set('string', [
      {
        name: 'CONCAT',
        func: '"$concat":["a","b"]',
        tip: 'page.datastore.formula.funcConcat',
        params: [
          {
            data_type: 'text',
            name: 'a',
            value: ''
          },
          {
            data_type: 'text',
            name: 'b',
            value: ''
          }
        ]
      }
    ]);
    this.options.set('type', [
      {
        name: 'TODOUBLE',
        func: '"$toDouble":"a"',
        tip: 'page.datastore.formula.funcToDouble',
        params: [
          {
            data_type: 'any',
            name: 'a',
            value: ''
          }
        ]
      },
      {
        name: 'TOSTRING',
        func: '"$toString":"a"',
        tip: 'page.datastore.formula.funcToString',
        params: [
          {
            data_type: 'any',
            name: 'a',
            value: ''
          }
        ]
      }
    ]);

    this.select = this.deepClone(this.options.get('arithmetic')[0]);
    this.isSetParam = false;
  }
  // 深度克隆
  deepClone(data) {
    return JSON.parse(JSON.stringify(data));
  }
  // 显示字段选择器
  showParamModal(param?: any): void {
    const modal = this.modal.create({
      nzTitle: this.i18n.translateLang('page.datastore.formula.paramTitle'),
      nzContent: FuncParamComponent,
      nzComponentParams: {
        datastoreId: this.datastoreId,
        selectParam: param
      },
      nzFooter: [
        {
          label: this.i18n.translateLang('common.button.ok'),
          onClick: async componentInstance => {
            if (!componentInstance.selectField) {
              modal.close();
              return;
            }
            const ds = componentInstance.selectDs.datastore_id;
            const field_id = componentInstance.selectField.field_id;
            const fds = componentInstance.selectField.datastore_id;
            // 如果当前字段是本台账的字段
            if (ds === fds) {
              const fs = `$items.${field_id}.value`;
              if (componentInstance.selectParam) {
                const pa = this.select.params.find(p => p.name === componentInstance.selectParam.name);
                if (pa) {
                  pa.value = fs;
                }
              }
              modal.close();
              return;
            }
            const linked = componentInstance.selectField.linked;
            const field = `$${linked}.items.${field_id}.value`;
            if (componentInstance.selectParam) {
              const pa = this.select.params.find(p => p.name === componentInstance.selectParam.name);
              if (pa) {
                pa.value = field;
              }
            }
            modal.close();
            return;
          }
        }
      ]
    });
  }
}
