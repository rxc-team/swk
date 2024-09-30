import * as _ from 'lodash';
import { forkJoin } from 'rxjs';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { AllowService, DatastoreService, FieldService, FolderService, ReportService, RoleService } from '@api';

export interface SelectItem {
  key: string;
  name: string;
  checked: boolean;
  is_fixed?: boolean;
}
export interface SelectItems {
  key: string;
  name: Map<string, string>;
  checked: boolean;
  is_fixed?: boolean;
}

export interface Action {
  fields: SelectItem[];
  groupMap: Map<string, SelectItems[]>;
}

export interface Permission {
  permission_type: string;
  action_type: string;
  actions: Map<string, Action>;
}

@Injectable({
  providedIn: 'root'
})
export class RoleResolverService implements Resolve<any> {
  constructor(
    private db: DatastoreService,
    private report: ReportService,
    private field: FieldService,
    private folder: FolderService,
    private as: AllowService,
    private role: RoleService
  ) {}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const id = route.paramMap.get('id');

    const dsPermission: Permission = {
      permission_type: 'app',
      action_type: 'datastore',
      actions: new Map()
    };
    const rpPermission: Permission = {
      permission_type: 'app',
      action_type: 'report',
      actions: new Map()
    };
    const docPermission: Permission = {
      permission_type: 'common',
      action_type: 'folder',
      actions: new Map()
    };

    let datastores = [];
    let reports = [];
    let folders = [];
    let allows = [];
    let roleInfo: any;
    let dsActions: any[] = [];
    let rpActions: any[] = [];
    let docAtions: any[] = [];
    const fields: Map<string, string[]> = new Map();

    if (id) {
      const fullJobs = [
        this.db.getDatastores(),
        this.report.getReports(),
        this.folder.getFolders(),
        this.role.getRoleByID(id),
        this.as.getAllows(),
        this.role.getRoleActions(id, { permission_type: 'app', action_type: 'datastore' }),
        this.role.getRoleActions(id, { permission_type: 'app', action_type: 'report' }),
        this.role.getRoleActions(id, { permission_type: 'common', action_type: 'folder' })
      ];
      await forkJoin(fullJobs)
        .toPromise()
        .then((data: any[]) => {
          if (data) {
            const dsData = data[0];
            const rpData = data[1];
            const fdData = data[2];
            const roleData = data[3];
            const allowData = data[4];
            const dsActionData = data[5];
            const rpActionData = data[6];
            const docActionData = data[7];

            datastores = dsData ? dsData : [];
            reports = rpData ? rpData : [];
            folders = fdData ? fdData : [];
            allows = allowData ? allowData : [];
            dsActions = dsActionData ? dsActionData : [];
            rpActions = rpActionData ? rpActionData : [];
            docAtions = docActionData ? docActionData : [];

            roleInfo = roleData;
          }
        });

      const fJobs = datastores.map(ds => {
        return this.field.getFields(ds.datastore_id);
      });

      // 设置台账字段显示
      await forkJoin(fJobs)
        .toPromise()
        .then((data: any[]) => {
          if (data) {
            datastores.forEach((ds, index) => {
              const allFields = data[index];

              if (allFields) {
                fields.set(ds.datastore_id, allFields);
              } else {
                fields.set(ds.datastore_id, []);
              }
            });
          }
        });

      dsPermission.actions = this.setPermission('datastore', dsActions, {
        allows: allows,
        datastores: datastores,
        fields: fields
      });
      rpPermission.actions = this.setPermission('report', rpActions, {
        allows: allows,
        reports: reports
      });
      docPermission.actions = this.setPermission('folder', docAtions, {
        allows: allows,
        folders: folders
      });

      return { datastores, reports, folders, roleInfo, dsPermission, rpPermission, docPermission };
    }

    const jobs = [this.db.getDatastores(), this.report.getReports(), this.folder.getFolders(), this.as.getAllows()];

    await forkJoin(jobs)
      .toPromise()
      .then(async (data: any[]) => {
        if (data) {
          const dsData = data[0];
          const rpData = data[1];
          const fdData = data[2];
          const allowData = data[3];

          datastores = dsData ? dsData : [];
          reports = rpData ? rpData : [];
          folders = fdData ? fdData : [];
          allows = allowData ? allowData : [];
        }
      });

    const fdJobs = datastores.map(ds => {
      return this.field.getFields(ds.datastore_id);
    });

    // 设置台账字段显示
    await forkJoin(fdJobs)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          datastores.forEach((ds, index) => {
            const allFields = data[index];

            if (allFields) {
              fields.set(ds.datastore_id, allFields);
            } else {
              fields.set(ds.datastore_id, []);
            }
          });
        }
      });

    dsPermission.actions = this.setPermission('datastore', dsActions, {
      allows: allows,
      datastores: datastores,
      fields: fields
    });
    rpPermission.actions = this.setPermission('report', rpActions, {
      allows: allows,
      reports: reports
    });
    docPermission.actions = this.setPermission('folder', docAtions, {
      allows: allows,
      folders: folders
    });

    return { datastores, reports, folders, dsPermission, rpPermission, docPermission };
  }

  setPermission(
    allowType: string,
    actionList: Array<{
      object_id: string;
      fields: string[];
      action_map: Object;
    }>,
    params: {
      allows: any[];
      datastores?: any[];
      reports?: any[];
      folders?: any[];
      fields?: Map<string, any[]>;
    }
  ) {
    if (allowType === 'datastore') {
      const actions: Map<string, Action> = new Map();

      params.datastores.forEach(async ds => {
        const action: Action = {
          fields: [],
          groupMap: new Map()
        };

        const oldAction = actionList.find(a => a.object_id === ds.datastore_id);
        if (oldAction) {
          // 设置字段
          const data = params.fields.get(ds.datastore_id);
          const fields = oldAction.fields;
          if (fields && fields.length > 0) {
            // 原来有字段的场合
            if (data) {
              const selectFields: SelectItem[] = [];
              data.forEach(f => {
                const fo = fields.find(fl => fl === f.field_id);
                selectFields.push({
                  key: f.field_id,
                  name: f.field_name,
                  checked: fo ? true : f.is_fixed,
                  is_fixed: f.is_fixed
                });
              });

              action.fields = selectFields;
            } else {
              action.fields = [];
            }
          } else {
            // 原来没有字段的场合
            if (data) {
              const selectFields: SelectItem[] = [];
              data.forEach(f => {
                selectFields.push({
                  key: f.field_id,
                  name: f.field_name,
                  checked: f.is_fixed ? true : false,
                  is_fixed: f.is_fixed
                });
              });

              action.fields = selectFields;
            } else {
              action.fields = [];
            }
          }

          // 设置权限
          const objType = this.getDatastoreType(ds.api_key, ds.can_check);
          const allow = params.allows.find(a => a.allow_type === allowType && a.object_type === objType);
          if (allow) {
            const actList = _.sortBy(allow.actions, 'group_key');

            const groupMap: Map<string, SelectItems[]> = new Map();

            actList.forEach(a => {
              let checked = false;
              if (oldAction.action_map && oldAction.action_map.hasOwnProperty(a.api_key)) {
                checked = oldAction.action_map[a.api_key];
              }

              if (groupMap.has(a.group_key)) {
                const as = groupMap.get(a.group_key);
                as.push({
                  key: a.api_key,
                  name: JSON.parse(a.action_name),
                  checked: checked
                });
              } else {
                groupMap.set(a.group_key, [
                  {
                    key: a.api_key,
                    name: JSON.parse(a.action_name),
                    checked: checked
                  }
                ]);
              }
            });
            action.groupMap = groupMap;
          }
        } else {
          const data = params.fields.get(ds.datastore_id);
          if (data) {
            const selectFields: SelectItem[] = [];
            data.forEach(f => {
              selectFields.push({
                key: f.field_id,
                name: f.field_name,
                checked: f.is_fixed ? true : false,
                is_fixed: f.is_fixed
              });
            });

            action.fields = selectFields;
          } else {
            action.fields = [];
          }

          const objType = this.getDatastoreType(ds.api_key, ds.can_check);
          const allow = params.allows.find(a => a.allow_type === allowType && a.object_type === objType);
          if (allow) {
            const actList = _.sortBy(allow.actions, 'group_key');

            const groupMap: Map<string, SelectItems[]> = new Map();

            actList.forEach(a => {
              if (groupMap.has(a.group_key)) {
                const as = groupMap.get(a.group_key);
                as.push({
                  key: a.api_key,
                  name: JSON.parse(a.action_name),
                  checked: false
                });
              } else {
                groupMap.set(a.group_key, [
                  {
                    key: a.api_key,
                    name: JSON.parse(a.action_name),
                    checked: false
                  }
                ]);
              }
            });

            action.groupMap = groupMap;
          }
        }

        actions.set(ds.datastore_id, action);
      });

      return actions;
    }
    if (allowType === 'report') {
      const actions: Map<string, Action> = new Map();

      params.reports.forEach(async rp => {
        const action: Action = {
          fields: [],
          groupMap: new Map()
        };

        const objType = 'report';
        const allow = params.allows.find(a => a.allow_type === allowType && a.object_type === objType);
        if (allow) {
          const actList = _.sortBy(allow.actions, 'group_key');

          const groupMap: Map<string, SelectItems[]> = new Map();

          const oldAction = actionList.find(a => a.object_id === rp.report_id);
          if (oldAction) {
            actList.forEach(a => {
              let checked = false;
              if (oldAction.action_map && oldAction.action_map.hasOwnProperty(a.api_key)) {
                checked = oldAction.action_map[a.api_key];
              }
              if (groupMap.has(a.group_key)) {
                const as = groupMap.get(a.group_key);
                as.push({
                  key: a.api_key,
                  name: JSON.parse(a.action_name),
                  checked: checked
                });
              } else {
                groupMap.set(a.group_key, [
                  {
                    key: a.api_key,
                    name: JSON.parse(a.action_name),
                    checked: checked
                  }
                ]);
              }
            });
          } else {
            actList.forEach(a => {
              if (groupMap.has(a.group_key)) {
                const as = groupMap.get(a.group_key);
                as.push({
                  key: a.api_key,
                  name: JSON.parse(a.action_name),
                  checked: false
                });
              } else {
                groupMap.set(a.group_key, [
                  {
                    key: a.api_key,
                    name: JSON.parse(a.action_name),
                    checked: false
                  }
                ]);
              }
            });
          }

          action.groupMap = groupMap;
        }
        actions.set(rp.report_id, action);
      });

      return actions;
    }
    if (allowType === 'folder') {
      const actions: Map<string, Action> = new Map();

      params.folders.forEach(async fo => {
        const action: Action = {
          fields: [],
          groupMap: new Map()
        };

        const objType = 'folder';
        const allow = params.allows.find(a => a.allow_type === allowType && a.object_type === objType);

        if (allow) {
          const actList = _.sortBy(allow.actions, 'group_key');

          const groupMap: Map<string, SelectItems[]> = new Map();

          const oldAction = actionList.find(a => a.object_id === fo.folder_id);
          if (oldAction) {
            actList.forEach(a => {
              let checked = false;
              if (oldAction.action_map && oldAction.action_map.hasOwnProperty(a.api_key)) {
                checked = oldAction.action_map[a.api_key];
              }
              if (groupMap.has(a.group_key)) {
                const as = groupMap.get(a.group_key);
                as.push({
                  key: a.api_key,
                  name: JSON.parse(a.action_name),
                  checked: checked
                });
              } else {
                groupMap.set(a.group_key, [
                  {
                    key: a.api_key,
                    name: JSON.parse(a.action_name),
                    checked: checked
                  }
                ]);
              }
            });
          } else {
            actList.forEach(a => {
              if (groupMap.has(a.group_key)) {
                const as = groupMap.get(a.group_key);
                as.push({
                  key: a.api_key,
                  name: JSON.parse(a.action_name),
                  checked: false
                });
              } else {
                groupMap.set(a.group_key, [
                  {
                    key: a.api_key,
                    name: JSON.parse(a.action_name),
                    checked: false
                  }
                ]);
              }
            });
          }

          action.groupMap = groupMap;
        }

        actions.set(fo.folder_id, action);
      });

      return actions;
    }
  }

  getDatastoreType(apiKey: string, canCheck: boolean) {
    if (canCheck) {
      return 'check';
    }
    if (apiKey === 'keiyakudaicho') {
      return 'lease';
    }
    if (apiKey === 'paymentStatus' || apiKey === 'repayment' || apiKey === 'paymentInterest' || apiKey === 'rireki') {
      return 'lease_relation';
    }
    if (apiKey === 'shiwake') {
      return 'journal';
    }

    return 'base';
  }
}
