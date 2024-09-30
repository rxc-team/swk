/*
 * @Author: RXC 呉見華
 * @Date: 2020-01-14 15:57:39
 * @LastEditTime : 2020-01-16 13:22:46
 * @LastEditors  : RXC 呉見華
 */
import { Component, Input, OnInit } from '@angular/core';
import { SpinnerService } from '@core';

@Component({
  selector: 'app-spinner',
  templateUrl: 'spinner.component.html',
  styleUrls: ['spinner.component.less']
})
export class SpinnerComponent implements OnInit {
  @Input() tip = 'Loading...';
  @Input() bgColor = '#fff';
  @Input() fullScreen = true;
  @Input() zIndex = 9999;
  @Input() name = 'global';

  public show = false;

  constructor(private spinner: SpinnerService) { }

  ngOnInit(): void {
    const self = this;
    this.spinner.getLoding().subscribe(data => {
      if (self.name === data.name) {
        if (data.loading) {
          setTimeout(() => {
            self.show = data.loading;
          }, 0);
        } else {
          setTimeout(() => {
            self.show = data.loading;
          }, 500);
        }
      }
    });
  }
}
