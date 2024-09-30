import { editor, languages } from 'monaco-editor';
import { NgEventBus } from 'ng-event-bus';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, Observable } from 'rxjs';

import {
    ChangeDetectionStrategy, Component, forwardRef, Input, OnDestroy, OnInit
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DatastoreService, FieldService } from '@api';
import { I18NService, TokenStorageService } from '@core';
import { Select } from '@ngxs/store';

import { FuncGenComponent } from '../func-gen/func-gen.component';
import { FuncParamComponent } from '../func-param/func-param.component';

@Component({
  selector: 'app-func-editor',
  templateUrl: './func-editor.component.html',
  styleUrls: ['./func-editor.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FuncEditorComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FuncEditorComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() apiKey: string;
  @Input() returnType: string;
  @Input() readOnly: boolean;

  verifyError: string;
  verifyErrorParam: Object;

  constructor(
    private ds: DatastoreService,
    private fs: FieldService,
    private modal: NzModalService,
    private router: ActivatedRoute,
    private tokenService: TokenStorageService,
    private nzConfigService: NzConfigService,
    private eventBus: NgEventBus,
    private i18n: I18NService
  ) {}

  @Input() isSmall = false;
  // 组件对应的 “ ngModel ”
  value = '';
  // 组件对应的 “ disabled ”
  isDisabled: boolean;
  // 改变值回调
  onChangeListener: Function;
  // 交互回调
  onTouchedListener: Function;
  // 编辑器设置
  editorOptions = {
    theme: 'vs',
    language: 'json'
  };
  checkStatus = new BehaviorSubject<string>('wait');
  // 编辑器实例
  editor?: editor.ICodeEditor;
  // 验证公式是否合法
  check() {
    if (!this.value.trim()) {
      this.onChange('');
      this.eventBus.cast('func:verify', {
        result: false,
        error: 'requiredInput',
        params: {}
      });
      this.verifyError = `common.validator.requiredInput`;
      this.verifyErrorParam = {};
      this.checkStatus.next('required');
      return;
    }
    const datastoreId = this.router.snapshot.paramMap.get('d_id');
    this.fs.verifyFunc({ return_type: this.returnType, formula: this.value, datastore_id: datastoreId }).then(data => {
      if (data && data.result) {
        this.verifyError = '';
        this.verifyErrorParam = {};
        this.checkStatus.next('success');
      } else {
        this.verifyError = `${data.error}`;
        this.verifyErrorParam = data.params;
        this.checkStatus.next('error');
      }
      this.eventBus.cast('func:verify', data);
    });
  }
  // 编辑器初始化
  onEditorInit(e: editor.ICodeEditor): void {
    this.editor = e;
    this.editor.updateOptions({
      lineNumbers: 'on',
      automaticLayout: true,
      padding: { top: 0, bottom: 0 },
      wordWrap: 'on',
      wordWrapColumn: 100,
      formatOnPaste: true,
      formatOnType: true,
      readOnly: this.readOnly,
      minimap: { enabled: false }
    });

    this.tokenService.getUserInfo().subscribe((u: any) => {
      const defaultEditorOption = this.nzConfigService.getConfigForComponent('codeEditor')?.defaultEditorOption || {};
      this.nzConfigService.set('codeEditor', {
        defaultEditorOption: {
          ...defaultEditorOption,
          theme: u.theme === 'dark' ? 'vs-dark' : 'vs'
        }
      });
    });
  }

  // 显示公式生成器
  showFuncModal(): void {
    const datastoreId = this.router.snapshot.paramMap.get('d_id');
    const modal = this.modal.create({
      nzTitle: this.i18n.translateLang('page.datastore.formula.funcGenTitle'),
      nzContent: FuncGenComponent,
      nzWidth: 800,
      nzComponentParams: {
        datastoreId: datastoreId
      },
      nzFooter: [
        {
          label: this.i18n.translateLang('common.button.setParam'),
          disabled: componentInstance => componentInstance.isSetParam,
          onClick: componentInstance => {
            componentInstance.isSetParam = true;
          }
        },
        {
          label: this.i18n.translateLang('common.button.reselect'),
          disabled: componentInstance => !componentInstance.isSetParam,
          onClick: componentInstance => {
            componentInstance.isSetParam = false;
            componentInstance.select = componentInstance.deepClone(componentInstance.options[0]);
          }
        },
        {
          label: this.i18n.translateLang('common.button.ok'),
          type: 'primary',
          disabled: componentInstance => !componentInstance.isSetParam,
          onClick: componentInstance => {
            let func = componentInstance.select.func;
            componentInstance.select.params.forEach(p => {
              if (p.value) {
                const reg = new RegExp(`(.*)${p.name}`);
                func = func.replace(reg, '$1' + p.value);
              }
            });
            this.insert(func);
            modal.close();
          }
        }
      ]
    });
  }

  // 显示字段选择器
  showParamModal(): void {
    const datastoreId = this.router.snapshot.paramMap.get('d_id');
    const modal = this.modal.create({
      nzTitle: this.i18n.translateLang('page.datastore.formula.paramTitle'),
      nzContent: FuncParamComponent,
      nzComponentParams: {
        datastoreId: datastoreId,
        selectParam: null
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
              this.insert(fs);
              modal.close();
              return;
            }

            const linked = componentInstance.selectField.linked;
            const field = `$${linked}.items.${field_id}.value`;
            this.insert(field);
            modal.close();
            return;
          }
        }
      ]
    });
  }

  // 插入数据到编辑器
  insert(str: string) {
    const position = this.editor.getPosition();
    const selection = this.editor.getSelection();
    // 没有选择的时候
    if (selection.startColumn === selection.endColumn) {
      this.editor.executeEdits('', [
        {
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          },
          text: str
        }
      ]);
    } else {
      this.editor.executeEdits('', [
        {
          range: {
            startLineNumber: position.lineNumber,
            startColumn: selection.startColumn,
            endLineNumber: position.lineNumber,
            endColumn: selection.endColumn
          },
          text: str
        }
      ]);
    }

    this.editor.setSelection({
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endLineNumber: position.lineNumber,
      endColumn: position.column + str.length
    });
    this.value = this.editor.getValue();
    this.onChange(this.value);
    this.editor.getAction('editor.action.formatDocument').run();
    this.editor.focus();
  }

  writeValue(obj: any): void {
    this.value = obj; // form中给你设置了obj值，根据obj，去更新组件/UI
  }
  registerOnChange(fn: any): void {
    this.onChangeListener = fn; // 保存这个函数
  }
  registerOnTouched(fn: any): void {
    this.onTouchedListener = fn; // 保存这个函数
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  propagateChange = (_: any) => {};

  ngOnInit() {
    setTimeout(() => {
      if (this.value) {
        this.eventBus.cast('func:verify', {
          result: true
        });
        this.checkStatus.next('success');
      } else {
        this.value = '{\n\t\n}\n';
        this.insert(this.value);
        this.editor.focus();
      }
    }, 500);
  }

  ngOnDestroy(): void {
    this.checkStatus.unsubscribe();
  }

  /**
   * 自定义当组件发生改变时，会调用的方法
   */
  onChange(payload) {
    this.value = payload;
    this.onChangeListener(payload); // 告诉form，你的表单值改变成了payload
    this.onTouchedListener(); // 告诉form，你的表单有交互发生
    this.eventBus.cast('func:verify', null);
    this.checkStatus.next('wait');
  }
}
