import { GridsterItem } from 'angular-gridster2';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import {
  CheckHistoryService,
  DatabaseService,
  DatastoreService,
  FieldService,
  GroupService,
  HistoryService,
  OptionService,
  UserService,
  WorkflowService
} from '@api';
import { I18NService } from '@core';

@Injectable({
  providedIn: 'root'
})
export class DetailResolverService implements Resolve<any> {
  constructor(
    private gs: GroupService,
    private hs: HistoryService,
    private cs: CheckHistoryService,
    private ds: DatastoreService,
    private us: UserService,
    private os: OptionService,
    private fs: FieldService,
    private wf: WorkflowService,
    private dbs: DatabaseService,
    private i18n: I18NService
  ) { }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const datastoreId = route.paramMap.get('d_id');
    const itemId = route.paramMap.get('i_id');
    const change = new Date().getTime();

    const params = {
      datastoreId: datastoreId,
      itemId: itemId,
      pageIndex: 1,
      pageSize: 5
    };

    const jobs = [
      /* this.gs.getGroups(), */
      /* this.hs.getLastHistories({ datastoreId: datastoreId, itemId: itemId }), */
      /* this.ds.getDatastoreByID(datastoreId), */
      this.fs.getFields(datastoreId),
      this.dbs.getItem(datastoreId, itemId),
      /* this.wf.getUserWorkflows(datastoreId, 'update'), */
      /* this.us.getUsers({ invalid: 'true' }),
      this.cs.getHistories(params), */
      this.ds.getDatastores(),
    ];

    let users = [];
    let userGroups = [];
    let historys = [];
    let checkHistorys = [];
    let total = 0;
    let checkTotal = 0;
    let canCheck = false;
    let fields = [];
    let lookupDatastoresInfos = [];
    let title = '';
    let checkItems = [];
    let footerItems = [];
    let owners = [];
    let checkImages = [];
    let listData = [];
    let height = 350;
    let workflows = [];
    let status = '1';
    let apiKey = '';

    await forkJoin(jobs)
      .toPromise()
      .then(async (data: any[]) => {
        if (data) {
          /* const userGroupsData = data[0]; */
          /* const historyData = data[0]; */
          /* const datastoreData = data[0]; */
          const fieldsData = data[0];
          const itemsData = data[1];
          /* const workflowsData = data[4]; */
          /* const usersData = data[4];
          const checkData = data[5]; */
          const dsListData = data[2];

          /* if (userGroupsData) {
            userGroups = userGroupsData;
          } else {
            userGroups = [];
          } */

          /* if (historyData && historyData.total !== 0) {
            historys = historyData.history_list;
            total = historyData.total;
          } else {
            historys = [];
            total = 0;
          } */

          /* if (datastoreData) {
            apiKey = datastoreData.api_key
            if (datastoreData.can_check) {
              canCheck = datastoreData.can_check;
            } else {
              canCheck = false;
            }
          } else {
            canCheck = false;
          } */
          if (fieldsData) {
            fields = fieldsData;
          } else {
            fields = [];
          }

          let items = [];
          if (itemsData) {
            items = itemsData.items;
            title = itemsData.item_id;
            status = itemsData.status;

            // 中途解约等按钮活性制御编辑
            /* if (datastoreData && datastoreData.api_key === 'keiyakudaicho') { */
            if (localStorage.getItem("apiKey") === 'keiyakudaicho') {
              const sts: string = itemsData.items.status;
              if (sts && !sts.includes('normal')) {
                status = '3';
              }
            }

            footerItems = [];
            checkItems = [];

            // 设置底部系统固定信息
            footerItems.push({ type: 'user', name: 'common.text.createdBy', value: itemsData.created_by });
            footerItems.push({ type: 'date', name: 'common.text.createAt', value: itemsData.created_at });
            footerItems.push({ type: 'user', name: 'common.text.updatedBy', value: itemsData.updated_by });
            footerItems.push({ type: 'date', name: 'common.text.updateAt', value: itemsData.updated_at });
            footerItems.push({ type: 'group', name: 'page.datastore.groups', value: itemsData.owners });
            footerItems.push({ type: 'date', name: 'common.text.labelTime', value: itemsData.label_time });
            owners = itemsData.owners;
            // 设置中间部分检查人员信息
            if (itemsData.checked_by) {
              // 盘点方法编辑
              let checkType = '';
              // 目视
              if (itemsData.check_type === 'Visual') {
                checkType = 'common.text.visuallycheck';
              }
              // 图片
              if (itemsData.check_type === 'Image') {
                checkType = 'common.text.imagecheck';
              }
              // 条码
              if (itemsData.check_type === 'Scan') {
                checkType = 'common.text.barcodecheck';
              }
              // 盘点情报编辑
              checkItems.push({ type: 'user', name: 'common.text.checkedBy', value: itemsData.checked_by });
              checkItems.push({ type: 'date', name: 'common.text.checkedAt', value: itemsData.checked_at });
              checkItems.push({ type: 'way', name: 'common.text.checkType', value: checkType });
            } else {
              // 盘点情报清空
              checkItems.push({ type: 'user', name: 'common.text.checkedBy', value: '' });
              checkItems.push({ type: 'date', name: 'common.text.checkedAt', value: '' });
              checkItems.push({ type: 'way', name: 'common.text.checkType', value: '' });
            }

            // 盘点状态编辑
            let checkStatus = '';
            // 图片
            if (itemsData.check_status === '0') {
              checkStatus = 'common.text.checkWait';
            }
            // 条码
            if (itemsData.check_status === '1') {
              checkStatus = 'common.text.checkOver';
            }

            checkItems.push({ type: 'check', name: 'common.text.checkStatus', value: checkStatus });

            // 设置中间部分检查图片信息
            checkImages = itemsData.images;

            const itemMap = itemsData.items;

            if (dsListData) {
              lookupDatastoresInfos = [];

              dsListData.forEach(ds => {
                if (ds.relations) {
                  ds.relations.forEach(rat => {
                    if (rat.datastore_id === datastoreId) {
                      const conditions: any[] = [];

                      for (const key in rat.fields) {
                        if (Object.prototype.hasOwnProperty.call(rat.fields, key)) {
                          const fs = rat.fields[key];
                          const condition = {
                            field_id: fs,
                            field_type: 'lookup',
                            operator: '=',
                            search_value: itemMap[key].toString(),
                            is_dynamic: true
                          };
                          conditions.push(condition);
                        }
                      }

                      lookupDatastoresInfos.push({
                        datastore_id: ds.datastore_id,
                        conditions: conditions,
                        condition_type: 'and'
                      });
                    }
                  });
                }
              });
            }
          } else {
            lookupDatastoresInfos = [];
          }

          /* if (workflowsData) {
            workflows = workflowsData.filter(f => f.params['fields']);
          } else {
            workflows = [];
          } */

          // 设置中间动态部分数据
          const dataList = this.setItems(fields, items, datastoreId);
          listData = dataList.list;
          height = dataList.height;

          /* if (usersData) {
            const userList: Array<SelectItem> = [];
            usersData.forEach(user => {
              userList.push({ label: user.user_name, value: user.user_id, icon: user.avatar });
            });
            users = userList;
          } else {
            users = [];
          }

          if (checkData && checkData.total > 0) {
            checkHistorys = checkData.histories.map(hs => {
              let history = {};
              history = hs;
              let user = users.find(us => us.value === hs.checked_by);
              history['checked_by'] = user.label;
              return history;
            });
            checkTotal = checkData.total;
          } else {
            checkHistorys = [];
            checkTotal = 0;
          } */
        }
      });

    return {
      userGroups,
      historys,
      total,
      checkHistorys,
      checkTotal,
      //canCheck,
      fields,
      lookupDatastoresInfos,
      title,
      checkItems,
      footerItems,
      owners,
      checkImages,
      listData,
      workflows,
      status,
      users,
      height,
      change,
      //apiKey
    };
  }

  /**
   * @description: 数组去重
   */
  distinct(arr) {
    arr = _.sortBy(arr, 'datastore_id');
    const result = [arr[0]];
    for (let i = 1, len = arr.length; i < len; i++) {
      // tslint:disable-next-line:no-unused-expression
      arr[i].datastore_id !== arr[i - 1].datastore_id && result.push(arr[i]);
    }
    return result;
  }

  /**
   * @description: 设置中间动态部分数据
   */
  setItems(fields: any[], items: any[], datastoreId: string) {
    const listData = [];
    let height = 0;
    if (fields) {
      fields.forEach(f => {
        let exist = false;
        for (const key in items) {
          if (key === f.field_id) {
            let value;

            switch (f.field_type) {
              case 'file':
                value = [];
                if (items[key]) {
                  items[key].forEach((file: { url: string; name: string }) => {
                    value.push({
                      url: file.url,
                      name: file.name
                    });
                  });
                }
                break;

              case 'date':
                value = items[key] === '0001-01-01' ? '' : items[key];
                break;
              case 'autonum':
                value = items[key];
                break;
              default:
                value = items[key];
                break;
            }

            const it: GridsterItem = {
              cols: f.cols ? f.cols : 1,
              rows: f.rows ? f.rows : 1,
              y: f.y ? f.y : 0,
              x: f.x ? f.x : 0,
              field_id: key,
              is_required: f.is_required,
              app_id: f.lookup_app_id,
              datastore_id: datastoreId,
              lookup_datastore_id: f.lookup_datastore_id,
              lookup_field_id: f.lookup_field_id,
              type: f.return_type || f.field_type,
              as_title: f.as_title,
              display_order: f.display_order,
              image: f.is_image,
              name: f.field_name,
              value: value
            };

            listData.push(it);
            exist = true;
          }
        }
        if (!exist) {
          let value;
          switch (f.field_type) {
            case 'text':
            case 'textarea':
            case 'number':
            case 'autonum':
              value = '';
              break;
            case 'date':
              value = null;
              break;
            case 'time':
              value = null;
              break;
            case 'user':
            case 'file':
              value = [];
              break;
            case 'switch':
              value = false;
              break;
            case 'options':
              value = null;
              break;
            default:
              value = '';
              break;
          }

          const it: GridsterItem = {
            cols: f.cols ? f.cols : 1,
            rows: f.rows ? f.rows : 1,
            y: f.y ? f.y : 0,
            x: f.x ? f.x : 0,
            is_required: f.is_required,
            field_id: f.field_id,
            app_id: f.lookup_app_id,
            datastore_id: datastoreId,
            lookup_datastore_id: f.lookup_datastore_id,
            lookup_field_id: f.lookup_field_id,
            type: f.return_type || f.field_type,
            name: f.field_name,
            as_title: f.as_title,
            display_order: f.display_order,
            image: f.is_image,
            value: value
          };
          listData.push(it);
        }
        const line = (f.rows + f.y) * 40;
        if (line > height) {
          height = line;
        }
      });
    }

    return { height, list: _.orderBy(listData, ['display_order'], ['asc']) };
  }
}
