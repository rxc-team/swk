import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-text-item',
  templateUrl: './text-item.component.html',
  styleUrls: ['./text-item.component.less']
})
export class TextItemComponent implements OnInit {
  @Input() item: any;
  constructor() {}

  ngOnInit(): void {}
}
