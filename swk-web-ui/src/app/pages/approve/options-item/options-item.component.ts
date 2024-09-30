import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-options-item',
  templateUrl: './options-item.component.html',
  styleUrls: ['./options-item.component.less']
})
export class OptionsItemComponent implements OnInit {
  @Input() item: any;

  constructor() {}

  ngOnInit(): void {}
}
