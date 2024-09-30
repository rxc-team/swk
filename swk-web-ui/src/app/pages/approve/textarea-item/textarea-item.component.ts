import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-textarea-item',
  templateUrl: './textarea-item.component.html',
  styleUrls: ['./textarea-item.component.less']
})
export class TextareaItemComponent implements OnInit {
  @Input() item: any;

  constructor() {}

  ngOnInit(): void {}
}
