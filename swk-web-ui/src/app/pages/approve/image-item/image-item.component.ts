import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-item',
  templateUrl: './image-item.component.html',
  styleUrls: ['./image-item.component.less']
})
export class ImageItemComponent implements OnInit {
  @Input() item: any;
  constructor() {}

  ngOnInit(): void {}
}
