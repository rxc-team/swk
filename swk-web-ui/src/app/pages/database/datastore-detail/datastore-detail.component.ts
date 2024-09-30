/*
 * @Description: 台账数据详细控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-06-17 17:08:24
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2021-02-23 14:01:49
 */
import { CompactType, DisplayGrid, GridsterConfig, GridsterItem, GridType } from 'angular-gridster2';
import { endOfMonth, format } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { forkJoin } from 'rxjs';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService, DatabaseService, DatastoreService, GroupService, ItemService, UserService } from '@api';
import { I18NService, TokenStorageService } from '@core';

@Component({
  selector: 'app-datastore-detail',
  templateUrl: './datastore-detail.component.html',
  styleUrls: ['./datastore-detail.component.less']
})
export class DatastoreDetailComponent implements OnInit, OnDestroy {
  // 构造函数
  constructor(
    private message: NzMessageService,
    private itemService: ItemService,
    private datastore: DatastoreService,
    private appService: AppService,
    private db: DatabaseService,
    private tokenService: TokenStorageService,
    private route: ActivatedRoute,
    private userService: UserService,
    private gs: GroupService,
    private modal: NzModalService,
    private i18n: I18NService,
    private router: Router
  ) { }

  // 数据定义
  // 动态数据
  listData: Array<GridsterItem> = [];
  // 固定系统信息
  footerItems: any[] = [];
  // 固定检查信息
  checkItems: any[] = [];
  checkImages: any[] = [];
  historyData: any[] = [];
  // 履历信息
  total = 0;
  checkHistoryData: any[] = [];
  // 履历信息
  checkTotal = 0;

  // 图片窗口标题
  title = '';
  // 图片窗口的图片路径
  imageUrl = '';
  // 图片窗口的图片名称
  imageName = '';
  // 所有者用户组信息
  userGroups: any[] = [];
  // 动态部分设置信息
  options: GridsterConfig;
  datastoreApiKey = '';

  // 显示履历详细窗口
  showHistory = false;
  // 履历详细
  historyDetail = {};
  // 是否能够盘点
  canCheck = false;
  // 关联台账
  lookupDatastoresInfos: any[] = [];
  // 所有字段
  fields = [];
  workflows = [];
  status = '1';
  // 合同到期判断flg
  hasExpire = false;
  // 情报变更债务变更判断flg
  canChange = false;
  // 中途解约判断flg
  canTerminate = false;
  // 契约是否能删除,如果契约发送了变更就不能删除
  canDelete = true;
  // 是否為非常規租賃
  notNormalLease = false;

  // 共通数据
  userList = [];
  change: 0;

  height = 350;

  selectNodes: NzTreeNodeOptions[] = [];
  accessKey = '';
  visible = false;
  loadfinished = false;

  confirmModal: NzModalRef;

  // 盘点类型集合
  checkTypes = [
    {
      label: 'common.text.visuallycheck',
      value: 'Visual'
    },
    {
      label: 'common.text.imagecheck',
      value: 'Image'
    },
    {
      label: 'common.text.barcodecheck',
      value: 'Scan'
    }
  ];

  /**
   * @description: 画面初期化处理
   */
  ngOnInit() {
    this.options = {
      displayGrid: DisplayGrid.OnDragAndResize,
      gridType: GridType.VerticalFixed,
      compactType: CompactType.None,
      mobileBreakpoint: 640,
      keepFixedHeightInMobile: true,
      fixedRowHeight: 32,
      minCols: 1,
      maxCols: 4,
      minRows: 10,
      maxRows: 500,
      margin: 8,
      pushItems: true,
      draggable: {
        enabled: false
      },
      resizable: {
        enabled: false
      }
    };

    this.init();
  }

  /**
   * @description: 画面event事件，画面初始化
   */
  async init() {
    /*  await this.datastore.getDatastoreByID(this.route.snapshot.paramMap.get('d_id')).then((data: any) => {
       if (data) {
         this.datastoreApiKey = data.api_key;
       }
     }); */

    this.route.data.subscribe((data: { detailData: any }) => {
      this.userGroups = data.detailData.userGroups;
      this.historyData = data.detailData.historys;
      this.total = data.detailData.total;
      this.checkHistoryData = data.detailData.checkHistorys;
      this.checkTotal = data.detailData.checkTotal;
      /* this.canCheck = data.detailData.canCheck; */
      if (localStorage.getItem("canCheck") == 'true') {
        this.canCheck = true
      } else {
        this.canCheck = false
      }
      this.fields = data.detailData.fields;
      this.lookupDatastoresInfos = data.detailData.lookupDatastoresInfos;
      this.title = data.detailData.title;
      this.checkItems = data.detailData.checkItems;
      this.footerItems = data.detailData.footerItems;
      this.checkImages = data.detailData.checkImages;
      this.listData = data.detailData.listData;
      this.workflows = data.detailData.workflows;
      this.userList = data.detailData.users;
      this.change = data.detailData.change;
      this.height = data.detailData.height;
      this.status = data.detailData.status;
      /* this.datastoreApiKey = data.detailData.apiKey; */
      this.datastoreApiKey = localStorage.getItem("apiKey")
      const owners: string[] = data.detailData.owners;
      if (owners && owners.length > 0) {
        this.accessKey = owners[0];
      }
    });

    /* const userId = this.tokenService.getUserId();
    forkJoin([this.gs.getGroups(), this.userService.getUserByID({ type: '0', user_id: userId })])
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const groupsData: any[] = data[0];
          const userData = data[1];
          if (groupsData) {
            const nowUserGroup = groupsData.find(g => g.group_id === userData.group);
            const treeData = this.setSelectTreeData(groupsData);
            this.checkDisabled(treeData, nowUserGroup.access_key);
            this.selectNodes = treeData;
          } else {
            this.selectNodes = [];
          }
        }
      })
      .finally(() => {
        this.loadfinished = true;
      }); */

    /* if (this.datastoreApiKey === 'keiyakudaicho') {
      let handleMonth = '';
      const us = this.tokenService.getUser();
      const currentApp = us.current_app;
      const db = us.customer_id;
      await this.appService.getAppByID(currentApp, db).then(res => {
        if (res && res.configs.syori_ym) {
          handleMonth = format(new Date(res.configs.syori_ym), 'yyyy-MM');
        } else {
          handleMonth = '';
        }
      });

      this.listData.forEach(item => {
        if (item.field_id === 'leaseexpireymd') {
          // リース満了予定年月日time
          const expireTime = new Date(item.value).getTime();
          // 处理月
          const syoriDate = new Date(handleMonth);
          // 处理月末日
          const lastDate = endOfMonth(syoriDate);
          // 处理月末日time
          const lastHandleDTime = lastDate.getTime();
          // リース満了判断
          if (expireTime <= lastHandleDTime) {
            this.hasExpire = false;
          } else {
            this.hasExpire = true;
          }

          // 处理月初前time
          const firstHandleDTime = lastDate.getTime();
          // リース満了相关项可变更否判断
          if (expireTime > firstHandleDTime) {
            this.canChange = false;
            this.canTerminate = false;
          } else {
            this.canTerminate = true;
            this.canChange = false;
          }
        }
        // 能否删除判断
        if (item.field_id === 'henkouymd') {
          if (item.value) {
            this.canDelete = false;
          }
        }
        // 租賃類型判斷
        if (item.field_id === 'lease_type') {
          const sts: string = item.value;
          if (sts && !sts.includes('normal_lease')) {
            this.notNormalLease = true;
          }
        }
      });
    } */
  }

  checkDisabled(nodes: NzTreeNodeOptions[], key: string) {
    if (!nodes) {
      return;
    }
    nodes.forEach(n => {
      if (n.key === key) {
        return;
      } else {
        n.disabled = true;
        this.checkDisabled(n.children, key);
      }
    });
  }

  setSelectTreeData(source) {
    // 对源数据深度克隆
    const cloneData = JSON.parse(JSON.stringify(source));
    // 循环所有项，并添加children属性
    return cloneData.filter(father => {
      // 返回每一项的子级数组
      const branchArr = cloneData.filter(child => father.group_id === child.parent_group_id);
      if (branchArr.length === 0) {
        father.isLeaf = true;
        father.title = this.i18n.translateLang(father.group_name);
        father.key = father.access_key;
        father.icon = 'anticon anticon-user';
      } else {
        father.title = this.i18n.translateLang(father.group_name);
        father.key = father.access_key;
      }

      // 给父级添加一个children属性，并赋值
      // tslint:disable-next-line: no-unused-expression
      branchArr.length > 0 ? (father.children = branchArr) : '';
      // 返回第一层
      return father.parent_group_id === 'root';
    });
  }

  /**
   * @description: 拷贝新规数据
   */
  add() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const itemId = this.route.snapshot.paramMap.get('i_id');
    const url = `/datastores/${datastoreId}/items/${itemId}/copy`;
    this.router.navigate([url]);
  }

  /**
   * @description: 更新数据
   */
  update(param: { wfId?: string; action?: string }) {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const itemId = this.route.snapshot.paramMap.get('i_id');
    if (param.wfId) {
      const approval = `/datastores/${datastoreId}/items/${itemId}/update`;
      this.router.navigate([approval], { queryParams: { wf_id: param.wfId } });
      return;
    }

    if (param.action) {
      const url = `/lease/datastores/${datastoreId}/items/${itemId}/update`;
      this.router.navigate([url], { queryParams: { action: param.action } });
    } else {
      const url = `/datastores/${datastoreId}/items/${itemId}/update`;
      this.router.navigate([url], { queryParams: { action: param.action } });
    }
  }

  /**
   * @description: 删除数据
   */
  delete() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const itemId = this.route.snapshot.paramMap.get('i_id');

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.dataDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.dataDelContent')}`,
      nzOnOk: () =>
        this.itemService.delete(datastoreId, itemId).then(async res => {
          this.message.success(this.i18n.translateLang('common.message.success.S_003'));
          const url = `/datastores/${datastoreId}/list`;
          this.router.navigate([url]);
        })
    });
  }

  // 显示履历详细
  showHistoryModal(change) {
    this.historyDetail = change;
    this.showHistory = true;
  }

  // 隐藏履历窗口
  hideHistoryModal() {
    this.showHistory = false;
  }

  show() {
    const userId = this.tokenService.getUserId();
    forkJoin([this.gs.getGroups(), this.userService.getUserByID({ type: '0', user_id: userId })])
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const groupsData: any[] = data[0];
          const userData = data[1];
          if (groupsData) {
            const nowUserGroup = groupsData.find(g => g.group_id === userData.group);
            const treeData = this.setSelectTreeData(groupsData);
            this.checkDisabled(treeData, nowUserGroup.access_key);
            this.selectNodes = treeData;
          } else {
            this.selectNodes = [];
          }
        }
      })
      .finally(() => {
        this.loadfinished = true;
      });
    this.visible = true;
  }

  showTypeName(v: string) {
    return this.checkTypes.find(c => c.value === v).label;
  }

  // 画面迁移到关联数据的详细数据页面
  async toDetail(datastoreId: string, fieldId: string, value: string) {
    const result = value.split(' : ');

    const conditions = {
      field_id: fieldId,
      field_type: 'lookup',
      operator: '=',
      search_value: result[0],
      is_dynamic: true,
      condition_type: ''
    };
    const params = {
      condition_list: [conditions],
      condition_type: 'and',
      page_index: 1,
      page_size: 1
    };

    await this.db.getItems(datastoreId, params).then((data: any) => {
      if (data && data.items_list) {
        const item = data.items_list[0];
        this.router.navigate([`/datastores/${datastoreId}/items/${item.item_id}`]);
      }
    });
  }

  // 设置权限
  setAccess() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const itemId = this.route.snapshot.paramMap.get('i_id');
    this.itemService.changeItemOwner(itemId, datastoreId, this.accessKey).then(data => {
      this.message.success(this.i18n.translateLang('common.message.success.S_002'));
    });
    this.visible = false;
  }
  /**
   * @description: 画面销毁处理
   */
  ngOnDestroy() { }

  // #endregion
}
