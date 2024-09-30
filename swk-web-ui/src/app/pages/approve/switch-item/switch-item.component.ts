import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-switch-item',
  templateUrl: './switch-item.component.html',
  styleUrls: ['./switch-item.component.less']
})
export class SwitchItemComponent implements OnInit {
  @Input() item: any;

  constructor() {}

  ngOnInit(): void {}
}
