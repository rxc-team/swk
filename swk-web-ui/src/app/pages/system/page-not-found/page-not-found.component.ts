import { Component } from '@angular/core';
import { I18NService } from '@core';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.less']
})
export class PageNotFoundComponent {
  _img = 'assets/images/svgs/page-not-found.svg';
  _title = '404';
  _desc = this.i18n.translateLang('page.message.message404');

  constructor(private i18n: I18NService) {}
}
