import { Component, Input } from '@angular/core';
import { HttpSpinService } from '@core';

@Component({
  selector: 'app-http-spin',
  templateUrl: './http-spin.component.html',
  styleUrls: ['./http-spin.component.less']
})
export class HttpSpinComponent {
  @Input() tip = 'Loading...';
  bgColor = '#fff';
  fullScreen = true;

  public show = false;

  constructor(private spinner: HttpSpinService) {
    this.spinner.showSpinner.subscribe(this.showSpinner.bind(this));
  }

  showSpinner = (state: boolean): void => {
    this.show = state;
  };
}
