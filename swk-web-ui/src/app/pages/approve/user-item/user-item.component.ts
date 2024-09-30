import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.less']
})
export class UserItemComponent implements OnInit {
  @Input() item: any;

  constructor() {}

  ngOnInit(): void {}
}
