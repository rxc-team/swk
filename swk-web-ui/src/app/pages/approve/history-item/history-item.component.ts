import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-history-item',
  templateUrl: './history-item.component.html',
  styleUrls: ['./history-item.component.less']
})
export class HistoryItemComponent implements OnInit {
  @Input() item: any;
  @Input() fields: any[];
  @Input() userList: any[];

  constructor() {}

  ngOnInit(): void {}
}
