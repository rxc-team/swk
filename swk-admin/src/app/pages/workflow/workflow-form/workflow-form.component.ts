import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { forkJoin, Observable, Observer } from 'rxjs';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
    ApproveService, DatastoreService, FieldService, GroupService, Node, Request, RoleService,
    UserService, ValidationService, Workflow, WorkflowService
} from '@api';
import { I18NService } from '@core';
import { NfValidators } from '@shared';

@Component({
  selector: 'app-workflow-form',
  templateUrl: './workflow-form.component.html',
  styleUrls: ['./workflow-form.component.less']
})
export class WorkflowFormComponent implements OnInit {
  form: FormGroup;
  nodeForm: FormGroup;
  fields = [];
  datastores = [];
  roleName: string;
  currentNode = 1;
  isSmall = false;
  showNode = false;
  status = 'add';
  selectNodes: NzTreeNodeOptions[] = [];
  nodeSelectNodes: NzTreeNodeOptions[] = [];
  groups = [];
  users = [];
  roles = [];
  actions = [];
  nmActions = [
    {
      action: 'insert',
      name: 'page.workflow.actionCreate',
      disabled: false
    },
    {
      action: 'update',
      name: 'page.workflow.actionUpdate',
      disabled: false
    },
    {
      action: 'delete',
      name: 'page.workflow.actionDelete',
      disabled: false
    }
  ];
  ctActions = [
    {
      action: 'insert',
      name: 'page.workflow.actionCreate',
      disabled: false
    },
    {
      action: 'debt-change',
      name: 'page.workflow.actionDebtChange',
      disabled: false
    },
    {
      action: 'info-change',
      name: 'page.workflow.actionInfoChange',
      disabled: false
    },
    {
      action: 'midway-cancel',
      name: 'page.workflow.actionMidwayCancel',
      disabled: false
    },
    {
      action: 'contract-expire',
      name: 'page.workflow.actionContractExpire',
      disabled: false
    },
    {
      action: 'delete',
      name: 'page.workflow.actionDelete',
      disabled: false
    }
  ];

  cols = [
    {
      title: 'page.workflow.no',
      width: '60px'
    },
    {
      title: 'page.workflow.assigne',
      width: '150px'
    },
    {
      title: 'page.workflow.approveType',
      width: '100px'
    },
    {
      title: 'page.workflow.operate'
    }
  ];

  constructor(
    private ws: WorkflowService,
    private aps: ApproveService,
    private ds: DatastoreService,
    private fs: FieldService,
    private rs: RoleService,
    private us: UserService,
    private gs: GroupService,
    private local: Location,
    private event: NgEventBus,
    private route: ActivatedRoute,
    private i18n: I18NService,
    private validation: ValidationService,
    private message: NzMessageService,
    private bs: NzBreakpointService
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
  }

  async ngOnInit(): Promise<void> {
    this.form = new FormGroup({
      wfName: new FormControl(null, [Validators.required], [this.workflowNameAsyncValidator]),
      menuName: new FormControl(null, [Validators.required], [this.menuNameAsyncValidator]),
      isValid: new FormControl(null, []),
      acceptOrDismiss: new FormControl(null, []),
      workflowType: new FormControl(null, [Validators.required]),
      groupId: new FormControl(null, [Validators.required]),
      params: new FormGroup({
        datastore: new FormControl(null, [Validators.required]),
        action: new FormControl(null, [Validators.required]),
        fields: new FormControl(null, [])
      }),
      nodes: new FormControl([], [Validators.required])
    });
    this.nodeForm = new FormGroup({
      nodeType: new FormControl('1', [Validators.required]),
      actType: new FormControl('', [Validators.required]),
      role: new FormControl('', [Validators.required]),
      nodeGroupId: new FormControl('', []),
      users: new FormControl([], [])
    });

    const jobs = [this.rs.getRoles(), this.us.getUsers(), this.gs.getGroups(), this.ds.getDatastores()];

    await forkJoin(jobs)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const rolesData = data[0];
          const usersData = data[1];
          const groupsData = data[2];
          const dsData = data[3];

          if (rolesData) {
            this.roles = rolesData;
          } else {
            this.roles = [];
          }
          if (usersData) {
            this.users = usersData;
          } else {
            this.users = [];
          }
          if (dsData) {
            this.datastores = dsData;
          } else {
            this.datastores = [];
          }

          if (groupsData) {
            this.selectNodes = this.setSelectTreeData(groupsData);
            this.groups = groupsData;
            this.nodeSelectNodes = this.setSelectTreeData(groupsData);
          } else {
            this.selectNodes = [];
            this.groups = [];
            this.nodeSelectNodes = [];
          }
        }
      });

    const wfId = this.route.snapshot.paramMap.get('wf_id');
    if (wfId) {
      this.status = 'edit';
      this.ws.getWorkflowByID(wfId).then(async (data: any) => {
        if (data) {
          const workflow = data.workflow;
          const nodes = data.nodes;

          this.form.get('wfName').setValue(this.i18n.translateLang(workflow.wf_name));
          this.form.get('menuName').setValue(this.i18n.translateLang(workflow.menu_name));
          this.form.get('isValid').setValue(workflow.is_valid);
          this.form.get('acceptOrDismiss').setValue(workflow.accept_or_dismiss);
          this.form.get('workflowType').setValue(workflow.workflow_type);
          this.form.get('params.fields').setValue(workflow.params.fields);
          this.form.get('groupId').setValue(workflow.group_id);
          this.form.get('params.datastore').setValue(workflow.params.datastore);
          await this.datastoreChange();
          this.form.get('params.action').setValue(workflow.params.action);

          this.currentNode = nodes.length + 1;
          this.form.get('nodes').setValue(nodes);
        }
      });
    }
  }

  /**
   * @description: 流程名唯一性检查
   */
  workflowNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const wfId = this.route.snapshot.paramMap.get('wf_id');
      this.validation.validationUnique('workflows', control.value, { change_id: wfId }).then((has: boolean) => {
        if (has) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  /**
   * @description: 菜单名唯一性检查
   */
  menuNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const wfId = this.route.snapshot.paramMap.get('wf_id');
      this.validation.validationUnique('workflows', control.value, { prefix: 'menu', change_id: wfId }).then((has: boolean) => {
        if (has) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  async datastoreChange() {
    const ds = this.form.get('params.datastore').value;
    const group = this.form.get('groupId').value;
    const wfId = this.route.snapshot.paramMap.get('wf_id');

    if (ds && group) {
      this.form.get('params.action').setValue('');

      const datastore = this.datastores.find(d => d.datastore_id === ds);
      if (datastore) {
        this.setActions(datastore.api_key);
      }
      await this.fs.getFields(ds).then((data: any[]) => {
        if (data) {
          this.fields = data.filter(f => f.field_type !== 'function' && f.field_type !== 'autonum' && !f.as_title);
          const fs: string = this.form.get('params.fields').value;
          if (fs) {
            const fList = fs.split(',');
            if (fList.length > 0) {
              this.fields.forEach(f => {
                const field = fList.find(fd => fd === f.field_id);
                if (field) {
                  f.checked = true;
                }
              });
            }
          }
        } else {
          this.fields = [];
        }
      });
      await this.ws.getWorkflows({ group: group, datastore: ds }).then((data: any[]) => {
        if (data) {
          data.forEach(f => {
            const at = f.params['action'];
            if (at === 'update' && f.wf_id !== wfId) {
              const fields: string = f.params['fields'];
              if (fields) {
                const fieldList = fields.split(',');
                fieldList.forEach(fd => {
                  const fs = this.fields.find(af => af.field_id === fd);
                  if (fs) {
                    fs.disabled = true;
                  }
                });
              } else {
                const action = this.actions.find(a => a.action === at);
                if (action) {
                  action.disabled = true;
                }
              }
            } else {
              const action = this.actions.find(a => a.action === at);
              if (action) {
                action.disabled = true;
              }
            }
          });

          const selectedFileds = this.fields.filter(f => f.disabled === true);
          if (selectedFileds.length === this.fields.length) {
            data.forEach(f => {
              const at = f.params['action'];
              if (at === 'update' && f.wf_id !== wfId) {
                const action = this.actions.find(a => a.action === at);
                if (action) {
                  action.disabled = true;
                }
              }
            });
          }
        } else {
          this.actions.forEach(a => (a.disabled = false));
        }
      });
    }

    if (group) {
      this.setParentAble(this.nodeSelectNodes, group);
    }
  }

  setActions(apiKey: string) {
    if (apiKey === 'keiyakudaicho') {
      this.actions = this.ctActions;
      return;
    }
    if (apiKey === 'paymentStatus') {
      this.actions = [];
      return;
    }
    if (apiKey === 'repayment') {
      this.actions = [];
      return;
    }
    if (apiKey === 'paymentInterest') {
      this.actions = [];
      return;
    }

    this.actions = this.nmActions;
  }

  fieldChange(v: string[]) {
    this.form.get('params.fields').setValue(v.join(','));
  }

  async validChange() {
    if (this.form.get('isValid').value) {
      let hasError = false;
      const wfId = this.route.snapshot.paramMap.get('wf_id');
      await this.aps.getItems({ wf_id: wfId, status: '1' }).then((data: any) => {
        if (data && data.total && data.total > 0) {
          hasError = true;
        }
      });

      if (hasError) {
        this.message.warning(this.i18n.translateLang('common.message.warning.W_015'));
        return;
      } else {
        this.form.get('isValid').setValue(false);
      }
    } else {
      this.form.get('isValid').setValue(true);
    }
  }

  async submit(value: any) {
    const wf: Workflow = {
      wf_name: this.form.get('wfName').value,
      menu_name: this.form.get('menuName').value,
      is_valid: this.form.get('isValid').value,
      accept_or_dismiss: this.form.get('acceptOrDismiss').value,
      group_id: this.form.get('groupId').value,
      workflow_type: this.form.get('workflowType').value,
      params: this.form.get('params').value
    };

    if (wf.params.fields) {
      const ds = this.datastores.find(d => d.datastore_id === wf.params.datastore);

      if (ds && ds.relations) {
        const selectFields = wf.params.fields.split(',');
        let exist = 0;

        for (let i = 0; i < ds.relations.length; i++) {
          const rat = ds.relations[i];
          let matched = 0;
          const fields: string[] = Object.values(rat.fields);
          selectFields.forEach(f => {
            for (let j = 0; j < fields.length; j++) {
              const element = fields[j];

              if (f === element) {
                matched++;
              }
            }
          });

          if (matched === fields.length) {
            exist = 0;
            break;
          }

          if (matched > 0 && matched !== fields.length) {
            exist++;
          }
        }

        if (exist > 0) {
          this.message.info('当前选择的字段中，有关联关系的字段没有全部选中');
          return;
        }
      }
    }

    const nodes: any[] = this.form.get('nodes').value;
    nodes[nodes.length - 1].next_node = '0';

    if (this.status === 'add') {
      const param: Request = {
        workflow: wf,
        nodes: this.form.get('nodes').value
      };
      this.ws.createWorkflow(param).then(() => {
        this.message.success(this.i18n.translateLang('common.message.success.S_001'));
        this.event.cast('workflow:refresh');
        this.local.back();
      });
    } else {
      const wfId = this.route.snapshot.paramMap.get('wf_id');
      wf.is_valid = wf.is_valid ? 'true' : 'false';
      wf.accept_or_dismiss = wf.accept_or_dismiss ? 'true' : 'false';
      this.ws.updateWorkflow(wfId, wf).then(() => {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        this.event.cast('workflow:refresh');
        this.local.back();
      });
    }
  }

  addNode(value: any) {
    const prev = this.currentNode === 1 ? 0 : this.currentNode - 1;
    const next = this.currentNode + 1;

    const assignees = [];
    const role = this.nodeForm.get('role').value;
    assignees.push(`r_${role}`);
    const users = this.nodeForm.get('users').value;
    if (users) {
      users.forEach((u: string) => {
        assignees.push(`u_${u}`);
      });
    }

    const node: Node = {
      node_id: this.currentNode.toString(),
      node_name: `${this.roleName}`,
      wf_id: '',
      node_type: value.nodeType,
      next_node: next.toString(),
      prev_node: prev.toString(),
      assignees: assignees,
      node_group_id: value.nodeGroupId,
      act_type: value.actType
    };

    this.currentNode++;

    const nodes = this.form.get('nodes').value;

    this.form.get('nodes').setValue([...nodes, node]);
    this.nodeForm.get('actType').reset();
    this.nodeForm.get('role').reset();
    this.nodeForm.get('users').reset();
    this.nodeForm.get('nodeGroupId').reset();
    this.showNode = false;
  }

  deleteNode(nodeId: string) {
    let nodes: Node[] = this.form.get('nodes').value;
    nodes = nodes.filter(n => n.node_id !== nodeId);
    nodes.forEach((n, i) => {
      const node = i + 1;
      n.node_id = `${node}`;
      n.next_node = `${node + 1}`;
      if (i === 0) {
        n.prev_node = '0';
      } else {
        n.prev_node = `${node - 1}`;
      }
    });

    this.currentNode = nodes.length + 1;
    this.form.get('nodes').setValue([...nodes]);
  }

  drop(event: CdkDragDrop<any[]>): void {
    const nodes = this.form.get('nodes').value;
    moveItemInArray(nodes, event.previousIndex, event.currentIndex);
    nodes.forEach((n, i) => {
      const node = i + 1;
      n.node_id = `${node}`;
      n.next_node = `${node + 1}`;
      if (i === 0) {
        n.prev_node = '0';
      } else {
        n.prev_node = `${node - 1}`;
      }
    });

    this.currentNode = nodes.length + 1;
  }

  reset() {
    this.form.reset();
  }

  back() {
    this.local.back();
  }

  roleChange(id: string) {
    const role = this.roles.find(r => r.role_id === id);
    if (role) {
      this.roleName = role.role_name;
    }
  }

  setSelectTreeData(source) {
    // 对源数据深度克隆
    const cloneData: any[] = JSON.parse(JSON.stringify(source));

    // 循环所有项，并添加children属性
    return cloneData.filter(father => {
      // 返回每一项的子级数组
      const branchArr = cloneData.filter(child => father.group_id === child.parent_group_id);
      if (branchArr.length === 0) {
        father.isLeaf = true;
        father.title = this.i18n.translateLang(father.group_name);
        father.key = father.group_id;
        father.icon = 'anticon anticon-user';
      } else {
        father.title = this.i18n.translateLang(father.group_name);
        father.key = father.group_id;
      }

      // 给父级添加一个children属性，并赋值
      // tslint:disable-next-line: no-unused-expression
      branchArr.length > 0 ? (father.children = branchArr) : '';
      // 返回第一层
      return father.parent_group_id === 'root';
    });
  }

  /**
   * @description: 递归判断是否选中
   */
  checkDisabled(nodes: NzTreeNodeOptions[], selects: string[], datastore: string) {
    if (!nodes) {
      return selects;
    }
    nodes.forEach(n => {
      const wfMap = n.workflow;
      if (wfMap && wfMap[datastore]) {
        const wf = wfMap[datastore];
        // 当新规、更新、删除，都有的时候，该选项和子选项都不能选择
        if (wf.insert && wf.update && wf.delete) {
          n.disabled = true;
          selects.push(n.parent_group_id);
          this.setDisabled(n.children);
          // 当新规、更新、删除，其中一个有值的时候，只能选择当前选项
        } else if (wf.insert || wf.others || wf.update || wf.delete) {
          selects.push(n.parent_group_id);
          this.setDisabled(n.children);
        } else {
          this.checkDisabled(n.children, selects, datastore);
        }
      } else {
        this.checkDisabled(n.children, selects, datastore);
      }
    });
    return selects;
  }

  setParentDisabled(nodes: NzTreeNodeOptions[], key: string) {
    if (!nodes || key === 'root') {
      return;
    }
    nodes.forEach(n => {
      if (n.key === key) {
        n.disabled = true;
        this.setParentDisabled(this.selectNodes, n.parent_group_id);
      } else {
        this.setParentDisabled(n.children, key);
      }
    });
  }

  /**
   * @description: 递归设置上级可选
   */
  setParentAble(nodes: NzTreeNodeOptions[], key: string) {
    if (key) {
      this.setDisabled(nodes);
    }
    this.setParentAbled(this.nodeSelectNodes, key);
  }

  setParentAbled(nodes: NzTreeNodeOptions[], key: string) {
    if (!nodes) {
      return;
    }

    const ids: string[] = [];
    ids.push(key);
    let current = this.groups.find(g => g.group_id === key);
    while (current && current.parent_group_id) {
      ids.push(current.parent_group_id);
      current = this.groups.find(g => g.group_id === current.parent_group_id);
    }

    this.setAbled(nodes, ids);
  }

  setAbled(nodes: NzTreeNodeOptions[], keys: string[]) {
    if (!nodes) {
      return;
    }
    nodes.forEach(n => {
      if (keys.includes(n.key)) {
        n.disabled = false;
        this.setAbled(n.children, keys);
      } else {
        this.setAbled(n.children, keys);
      }
    });
  }

  /**
   * @description: 递归设置是否选中
   */
  setDisabled(nodes: NzTreeNodeOptions[]) {
    if (!nodes) {
      return;
    }
    nodes.forEach(n => {
      n.disabled = true;
      this.setDisabled(n.children);
    });
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
