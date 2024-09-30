import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService, DatastoreService, ValidationService } from '@api';

@Component({
  selector: 'app-mapping-download',
  templateUrl: './mapping-download.component.html',
  styleUrls: ['./mapping-download.component.less']
})
export class MappingDownloadComponent implements OnInit {
  constructor(private route: ActivatedRoute, private ds: DatastoreService) {}
  @Input() conditionParam = {
    condition_list: [],
    condition_type: 'and'
  };
  @Input() showText = false;

  datastoreId = '';
  mappings: any[] = [];
  appId = '';
  uploading = false;
  selectMapping: any = {};
  visible = false;
  change = 0;
  // 只下载最后一次变更履历
  checkLast = false;

  /**
   * @description: 初期化
   */
  ngOnInit() {
    this.init();
  }
  /**
   * @description: 动态更新条件
   */
  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.conditionParam = changes['conditionParam'].currentValue;
  }

  /**
   * @description: 映射导入画面显示/隐藏
   */
  show() {
    this.visible = true;
  }

  /**
   * @description: 映射情报初始化
   */
  async init() {
    this.datastoreId = this.route.snapshot.paramMap.get('d_id');
    await this.ds.getDatastoreByID(this.datastoreId).then((data: any) => {
      if (data) {
        this.appId = data.app_id;
        this.mappings = data.mappings;
      } else {
        this.mappings = [];
      }
    });
  }

  /**
   * @description: 选中台账映射
   */
  select(item: any) {
    this.selectMapping = item;
  }

  /**
   * @description: 通过mapping下载履历
   */
  downloadByMapping() {
    // TODO
  }
}
