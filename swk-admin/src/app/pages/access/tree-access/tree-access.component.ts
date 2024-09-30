import { NzTreeFlatDataSource, NzTreeFlattener } from 'ng-zorro-antd/tree-view';

import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
    AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges
} from '@angular/core';

interface TreeNode {
  group_id: string;
  access_key: string;
  group_name: string;
  disabled?: boolean;
  canFind?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  children?: TreeNode[];
}

interface FlatNode {
  expandable: boolean;
  group_id: string;
  access_key: string;
  group_name: string;
  level: number;
  canFind?: boolean;
  canChange?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  disabled: boolean;
}

@Component({
  selector: 'app-tree-access',
  templateUrl: './tree-access.component.html',
  styleUrls: ['./tree-access.component.less']
})
export class TreeAccessComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() data: TreeNode[] = [];

  @Output()
  dataChange: EventEmitter<FlatNode[]> = new EventEmitter();

  private transformer = (node: TreeNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.group_name === node.group_name
        ? existingNode
        : {
            expandable: !!node.children && node.children.length > 0,
            group_name: node.group_name,
            group_id: node.group_id,
            access_key: node.access_key,
            level,
            canFind: !!node.canFind,
            canUpdate: !!node.canUpdate,
            canDelete: !!node.canDelete,
            disabled: !!node.disabled
          };

    if (node.canFind) {
      this.checklistSelection.select(flatNode);
    }
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  // tslint:disable-next-line: member-ordering
  flatNodeMap = new Map<FlatNode, TreeNode>();
  // tslint:disable-next-line: member-ordering
  nestedNodeMap = new Map<TreeNode, FlatNode>();
  // tslint:disable-next-line: member-ordering
  checklistSelection = new SelectionModel<FlatNode>(true);
  // tslint:disable-next-line: member-ordering
  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );
  // tslint:disable-next-line: member-ordering
  treeFlattener = new NzTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );
  // tslint:disable-next-line: member-ordering
  dataSource = new NzTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() {}

  /**
   * @description: 传入参数变更处理
   */
  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource.setData(this.data);

    this.flatNodeMap.forEach((_, node) => {
      if (node.expandable) {
        this.itemSelectionCheck(node);
      }
    });

    this.treeControl.expandAll();
  }

  /**
   * @description: 画面检查变更处理
   */
  ngAfterViewInit(): void {
    this.treeControl.expandAll();
  }

  /**
   * @description: 画面初始化处理
   */
  ngOnInit(): void {
    this.dataSource.setData(this.data);
  }

  /**
   * @description: 判断是否有孩子节点
   */
  hasChild = (_: number, node: FlatNode) => node.expandable;

  /**
   * @description:  叶子节点的选择事件
   */
  leafItemSelectionToggle(node: FlatNode): void {
    this.checklistSelection.toggle(node);
    node.canFind = this.checklistSelection.isSelected(node);
    if (!this.checklistSelection.isSelected(node)) {
      node.canUpdate = false;
      node.canDelete = false;
    }

    this.dataChange.emit(this.treeControl.dataNodes.filter(n => n.canFind));
  }

  /**
   * @description: 节点的选择事件
   */
  itemSelectionToggle(node: FlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    node.canFind = this.checklistSelection.isSelected(node);

    if (!this.checklistSelection.isSelected(node)) {
      node.canUpdate = false;
      node.canDelete = false;
    }

    descendants.forEach(child => {
      this.checklistSelection.isSelected(child);
      child.canFind = this.checklistSelection.isSelected(child);
      child.canChange = this.checklistSelection.isSelected(child);
      if (!this.checklistSelection.isSelected(child)) {
        child.canUpdate = false;
        child.canDelete = false;
      }
    });

    this.dataChange.emit(this.treeControl.dataNodes.filter(n => n.canFind));
  }

  /**
   * @description: 节点的检查事件
   */
  itemSelectionCheck(node: FlatNode): void {
    const descendants = this.treeControl.getDescendants(node);
    node.canFind ? this.checklistSelection.select(...descendants) : this.checklistSelection.deselect(...descendants);

    descendants.forEach(child => {
      child.canChange = this.checklistSelection.isSelected(child);
    });
  }

  /**
   * @description:  更新选项的变更事件
   */
  canUpdateToggle(node: FlatNode) {
    node.canUpdate = !node.canUpdate;
    this.dataChange.emit(this.treeControl.dataNodes.filter(n => n.canFind));
  }

  /**
   * @description: 删除选项的变更事件
   */
  canDeleteToggle(node: FlatNode) {
    node.canDelete = !node.canDelete;
    this.dataChange.emit(this.treeControl.dataNodes.filter(n => n.canFind));
  }
}
