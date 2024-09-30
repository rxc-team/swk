import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-item-view',
  templateUrl: './item-view.component.html',
  styleUrls: ['./item-view.component.less']
})
export class ItemViewComponent implements OnInit, OnChanges {
  @Input() type: string;
  @Input() value: string;
  @Input() label: string;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.setValue();
  }

  ngOnInit(): void {
    this.setValue();
  }

  setValue() {
    if (this.type === 'user') {
      if (this.value) {
        this.value = JSON.parse(this.value).join(',');
      }
    }
  }
}
