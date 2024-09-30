import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-file-item',
  templateUrl: './file-item.component.html',
  styleUrls: ['./file-item.component.less']
})
export class FileItemComponent implements OnInit {
  @Input() item: any;

  constructor() {}

  ngOnInit(): void {}
}
