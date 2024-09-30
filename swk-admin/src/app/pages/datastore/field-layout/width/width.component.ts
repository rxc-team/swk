import { NzMessageService } from 'ng-zorro-antd/message';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FieldService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-width',
  templateUrl: './width.component.html',
  styleUrls: ['./width.component.less']
})
export class WidthComponent implements OnInit {
  // 字段数据
  fields: any[] = [];
  constructor(public field: FieldService, private route: ActivatedRoute, private message: NzMessageService, private i18n: I18NService) {}

  ngOnInit() {
    this.getFieldInfo();
  }

  /**
   * @description: 获取database数据
   */
  async getFieldInfo() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    // 调用服务获取字段
    await this.field.getFields(datastoreId).then((data: any[]) => {
      if (data) {
        this.fields = data.filter(f => !f.as_title);
      }
    });
  }

  /**
   * @description: 保存处理
   */
  async save() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    await Promise.all(
      this.fields.map(async (field, index) => {
        return this.field.updateField(field.field_id, {
          datastore_id: datastoreId,
          is_display_setting: 'true',
          display_order: (index + 1).toString(),
          width: field.width.toString()
        });
      })
    ).then(data => {
      this.message.success(this.i18n.translateLang('common.message.success.S_002'));
    });
    this.getFieldInfo();
  }

  /**
   * @description: 宽度变更
   */
  onResize({ width, height, mouseEvent }: NzResizeEvent, id: number, fieldId: string): void {
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();
    cancelAnimationFrame(id);
    const wh = Math.round(width);
    id = requestAnimationFrame(() => {
      const f = this.fields.find(fs => fs.field_id === fieldId);
      f.width = wh;
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.fields, event.previousIndex, event.currentIndex);
  }
}
