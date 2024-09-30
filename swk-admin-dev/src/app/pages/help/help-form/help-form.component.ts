import { editor } from 'monaco-editor';
import { NgEventBus } from 'ng-event-bus';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { MarkdownService } from 'ngx-markdown';
import { Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FileService, HelpService, HelpTypeService } from '@api';
import { I18NService, TokenStorageService } from '@core';

@Component({
  selector: 'app-help-form',
  templateUrl: './help-form.component.html',
  styleUrls: ['./help-form.component.less']
})
export class HelpFormComponent implements OnInit, AfterViewInit {
  headings: Element[] = [];

  constructor(
    private i18n: I18NService,
    private helpTypeService: HelpTypeService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private helpService: HelpService,
    private fb: FormBuilder,
    private location: Location,
    private tokenService: TokenStorageService,
    private nzConfigService: NzConfigService,
    private event: NgEventBus,
    private bs: NzBreakpointService,
    private markdownService: MarkdownService,
    private elementRef: ElementRef<HTMLElement>,
    private file: FileService
  ) {
    bs.subscribe({
      xs: '480px',
      sm: '768px',
      md: '992px',
      lg: '1200px',
      xl: '1600px',
      xxl: '1600px'
    }).subscribe(data => {
      if (data === 'sm' || data === 'xs') {
        this.isSmall = true;
      } else {
        this.isSmall = false;
      }
    });
    this.helpForm = this.fb.group({
      helpTitle: [null, [Validators.required], [this.helpNameAsyncValidator]],
      helpType: ['', [Validators.required]],
      langCD: ['', [Validators.required]],
      tag: ['', []]
    });

    this.markdownService.renderer.heading = (text: string, level: number) => {
      const uuid = this.genUUID(6);
      return `
        <h${level} id="header${uuid}">
          ${text}
        </h${level}>
      `;
    };
  }

  editorOptions = {
    theme: 'vs',
    language: 'markdown',
    automaticLayout: true,
    copyWithSyntaxHighlighting: true,
    minimap: {
      enabled: false
    }
  };

  // 编辑器实例
  editor?: editor.ICodeEditor;
  isSmall = false;
  isVisible = false;
  code = '';
  isShowView = true;
  fileList = [];
  displayFileList = [];
  width = 100;
  height = 100;
  // 表单数据
  helpForm: FormGroup;

  // 判断迁移元用，默认是添加
  status = 'add';

  langList = this.langs();
  typeList = [];
  tags = [];
  inputVisible = false;
  canceldel = [];
  cancelFileList = [];
  delImgs = [];
  imgs = [];
  save = false;
  @ViewChild('inputElement', { static: false }) inputElement?: ElementRef;

  tableStr = `
  | A        | B    |  C  |
  | --------   | -----:   | :----: |
  | aa        | $1      |   5    |
  | bb        | $1      |   6    |
  | cc        | $1      |   7    |
  `;

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    const helpID = this.route.snapshot.paramMap.get('id');
    if (helpID) {
      this.status = 'edit';
      this.getHelpInfo(helpID);
    } else {
      this.helpForm.get('langCD').setValue(this.langList[0].code);
      this.setTypeList();
    }
  }

  /**
   * @description: 帮助情报取得
   */
  getHelpInfo(helpId: string) {
    this.helpService.getHelpByID(helpId).then(res => {
      if (res) {
        this.helpForm.controls.helpTitle.setValue(res.title);
        this.tags = res.tags ? res.tags : [];
        this.helpForm.get('langCD').setValue(res.lang_cd);
        this.code = res.content;
        this.helpForm.get('helpType').setValue(res.type);
        this.displayFileList = [];
        if (res.images) {
          res.images.forEach(f => {
            const file = {
              response: {
                url: f
              },
              checked: false
            };
            this.displayFileList.push(file);
            this.cancelFileList.push(file);
          });
        }
      }
    });
  }

  /**
   * @description: 获取当前语言列表
   */
  langs() {
    return this.i18n.getLangs();
  }

  /**
   * @description: 获取当前帮助类型列表
   */
  setTypeList() {
    const parms = {
      lang_cd: this.helpForm.get('langCD').value
    };
    this.helpTypeService.getTypes(parms).then((res: any[]) => {
      const helpType = this.helpForm.get('helpType').value;
      if (res) {
        this.typeList = res; // 根据当前选择语言设置对应语言的类别列表
        const type = this.typeList.find(t => t.type_id === helpType); // 该文章所属类别是否在列表中，找不到就设为空
        if (!type) {
          this.helpForm.get('helpType').setValue('');
        }
      } else {
        this.typeList = [];
        this.helpForm.get('helpType').setValue('');
      }
    });
  }

  // 编辑器初始化
  onEditorInit(e: editor.ICodeEditor): void {
    this.editor = e;
    this.editor.updateOptions({
      lineNumbers: 'off',
      automaticLayout: true,
      padding: { top: 0, bottom: 0 },
      wordWrap: 'on',
      wordWrapColumn: 100,
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

  taggleView() {
    this.isShowView = !this.isShowView;
    this.editor.layout();
  }

  insert(str: string, pt: number) {
    const position = this.editor.getPosition();
    this.editor.executeEdits('', [
      {
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column + pt
        },
        text: str
      }
    ]);

    this.editor.setSelection({
      startLineNumber: position.lineNumber,
      startColumn: position.column + pt,
      endLineNumber: position.lineNumber,
      endColumn: position.column + pt
    });
    this.editor.focus();
  }
  /**
   * @description: 上传文件
   */
  handleChange({ file, fileList }): void {
    const status = file.status;
    if (status !== 'uploading') {
    }
    // 文件上传成功后设置url
    if (status === 'done') {
      this.displayFileList.push(file);
      this.canceldel.push(file);
      this.fileList = [];
    } else if (status === 'error') {
      // this.message.error(this.i18n.translateLang('common.message.error.E_006'));
    }
  }

  // 显示已上传的图片选择框
  showModal(): void {
    this.height = 100;
    this.width = 100;
    this.displayFileList.forEach(f => (f.checked = false));
    this.isVisible = true;
  }

  // 从minio中删除选中图片
  deleteImg(): void {
    this.delImgs = [];
    this.imgs = [];
    this.displayFileList.forEach(f => {
      if (f.checked) {
        this.delImgs.push(f);
      } else {
        this.imgs.push(f);
      }
    });
    this.displayFileList = this.imgs;
  }

  // 选择了已上传的图片后点击确认加入到文档中
  handleOk(): void {
    this.displayFileList.forEach(f => {
      if (f.checked) {
        const url = f.response.url;
        const img = `<img src="${url}" width="${this.width}" height="${this.height}" style="border:1px solid" />`;
        this.insert(img, img.length);
      }
      if (this.delImgs.length === 0) {
        this.imgs = this.displayFileList;
      } else {
        this.displayFileList = this.imgs;
      }
    });
    this.isVisible = false;
  }
  // 图片选择框点击取消
  handleCancel(): void {
    this.isVisible = false;
    // 点击取消时重置图片状态
    this.canceldel.forEach(d => {
      this.file.deletePublicHeaderFile(d.response.url);
    });
    if (this.status === 'edit') {
      this.displayFileList = this.cancelFileList;
      this.imgs = this.cancelFileList;
      this.delImgs = this.canceldel;
    } else {
      this.imgs = [];
      this.displayFileList = [];
      this.delImgs = this.canceldel;
    }
  }
  // 提交添加或修改
  submit() {
    // 要保存的图片集
    const imgs = [];
    if (this.canceldel.length === 0) {
      if (this.delImgs.length > 0) {
        this.imgs.forEach(i => {
          imgs.push(i.response.url);
        });
      } else {
        this.cancelFileList.forEach(c => {
          imgs.push(c.response.url);
        });
      }
      this.displayFileList = this.imgs;
    } else {
      if (this.delImgs.length === 0) {
        this.displayFileList.forEach(c => {
          imgs.push(c.response.url);
        });
      } else {
        this.imgs.forEach(i => {
          imgs.push(i.response.url);
        });
      }
    }
    const params = {
      title: this.helpForm.controls.helpTitle.value,
      type: this.helpForm.controls.helpType.value,
      content: this.code,
      images: imgs,
      tags: this.tags,
      lang_cd: this.helpForm.controls.langCD.value
    };

    const helpID = this.route.snapshot.paramMap.get('id');
    if (helpID) {
      this.helpService.updateHelp(helpID, params).then(async () => {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        this.event.cast('help:refresh');
        this.save = true;
        this.location.back();
      });
    } else {
      this.helpService.creatHelp(params).then(async () => {
        this.message.success(this.i18n.translateLang('common.message.success.S_001'));
        this.event.cast('help:refresh');
        this.save = true;
        this.location.back();
      });
    }
  }

  // 重置表单
  reset(): void {
    this.code = '';
    this.tags = [];
    this.helpForm.reset();
    this.displayFileList.forEach(f => {
      this.file.deletePublicHeaderFile(f.response.url);
    });
    this.displayFileList = [];
  }
  // 取消添加或修改返回
  cancel() {
    if ((this.status = 'edit')) {
      // 点击取消时重置图片状态
      this.displayFileList = this.cancelFileList;
    } else {
      this.displayFileList.forEach(f => {
        this.file.deletePublicHeaderFile(f.response.url);
      });
      this.displayFileList = [];
    }
    this.location.back();
  }
  // 点击去掉当前tag 把tags数组中当前tag值删除
  handleClose(removedTag: {}): void {
    this.tags = this.tags.filter(tag => tag !== removedTag);
  }
  // 如果当前添加的tag长度过长取前十五位
  sliceTagName(tag: string): string {
    const isLongTag = tag.length > 15;
    return isLongTag ? `${tag.slice(0, 15)}...` : tag;
  }
  // 显示input框添加新的tag
  showInput(): void {
    this.inputVisible = true;
    setTimeout(() => {
      this.inputElement?.nativeElement.focus();
    }, 10);
  }
  // input框输入新的tag值后判断当前tags数组中是否存在后添加进tags数组中，并不显示input框
  handleInputConfirm(): void {
    const tag = this.helpForm.controls.tag.value;
    if (tag && this.tags.indexOf(tag) === -1) {
      this.tags = [...this.tags, tag];
    }
    this.helpForm.controls.tag.setValue('');
    this.inputVisible = false;
  }

  /**
   * @description: 帮助文章名称唯一性检查
   */
  helpNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const helpID = this.route.snapshot.paramMap.get('id');
      this.helpService.helpNameAsyncValidator(helpID, control.value).then((help: boolean) => {
        if (!help) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  /**
   * 生成随机的 UUID
   */
  genUUID(randomLength) {
    return Number(Math.random().toString().substr(3, randomLength) + Date.now())
      .toString(36)
      .substring(0, 6);
  }

  onReady(): void {
    setTimeout(() => {
      this.setHeadings();
    }, 10);
  }

  private setHeadings(): void {
    const headings: Element[] = [];
    this.elementRef.nativeElement.querySelectorAll('h2').forEach(x => headings.push(x));
    this.headings = headings;
  }

  getHref(h: HTMLElement) {
    const id = h.id;
    return `#${id}`;
  }

  getName(h: HTMLElement) {
    return h.innerText;
  }
}
