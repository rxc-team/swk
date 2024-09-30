import { format } from 'date-fns';
import { editor } from 'monaco-editor';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { Observable } from 'rxjs';

import { Component, Input, OnInit } from '@angular/core';
import { ScriptService } from '@api';
import { ConsoleService, TokenStorageService } from '@core';
import { Select } from '@ngxs/store';

@Component({
  selector: 'app-app-script',
  templateUrl: './app-script.component.html',
  styleUrls: ['./app-script.component.less']
})
export class AppScriptComponent implements OnInit {
  @Input() scriptId = '';
  @Input() data = '{}';
  @Input() script = `async function run() {
    /* Use connect method to connect to the server */
    await client.connect();
    /* use db */
    const db = client.db("test1");
    /* query */
    const result = await db.collection("apps").find({}).toArray();
    /* result */
    return result;
}`;

  dataEditorOptions = {
    theme: 'vs',
    readOnly: true,
    language: 'json',
    lineNumbers: 'on',
    automaticLayout: true,
    copyWithSyntaxHighlighting: true,
    minimap: {
      enabled: true
    }
  };
  editorOptions = {
    theme: 'vs',
    readOnly: true,
    language: 'javascript',
    lineNumbers: 'on',
    automaticLayout: true,
    copyWithSyntaxHighlighting: true,
    minimap: {
      enabled: true
    }
  };

  // 编辑器实例
  dataEditor?: editor.ICodeEditor;
  editor?: editor.ICodeEditor;

  logs = [];

  constructor(
    private nzConfigService: NzConfigService,
    private sc: ScriptService,
    private tokenService: TokenStorageService,
    private consoleService: ConsoleService
  ) {}

  ngOnInit(): void {
    const uid = this.tokenService.getUserId();
    this.consoleService.connect(uid);

    this.consoleService.onMessage().subscribe((data: string) => {
      this.logs.push({
        time: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        script: this.script,
        type: 'log',
        log: JSON.stringify(data)
      });
    });
    this.consoleService.onError().subscribe((data: string) => {
      this.logs.push({
        time: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        script: this.script,
        type: 'error',
        log: JSON.stringify(data)
      });
    });
  }

  // 编辑器初始化
  onDataEditorInit(e: editor.ICodeEditor): void {
    this.dataEditor = e;
  }
  // 编辑器初始化
  onEditorInit(e: editor.ICodeEditor): void {
    this.editor = e;

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

  run() {
    this.sc
      .run({
        script_id: this.scriptId,
        data: JSON.parse(this.data),
        script: this.script
      })
      .then(() => {});
  }
}
