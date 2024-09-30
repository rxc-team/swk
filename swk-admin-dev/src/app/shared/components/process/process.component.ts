import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.less']
})
export class ProcessComponent implements OnInit {
  @Input() percent = 0;
  @Input() loaded = 0;
  @Input() total = 0;
  constructor() {}

  ngOnInit(): void {}
}
