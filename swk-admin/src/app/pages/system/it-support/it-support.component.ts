import { Component, OnInit } from '@angular/core';
import { SystemService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-it-support',
  templateUrl: './it-support.component.html',
  styleUrls: ['./it-support.component.less']
})
export class ItSupportComponent implements OnInit {
  constructor(private i18n: I18NService, private system: SystemService) {}

  _img = 'assets/images/svgs/it-support.svg';
  _title = this.i18n.translateLang('common.message.itSupportTitle');
  _period = '';
  _desc = this.i18n.translateLang('common.message.itSupportDesc');

  /**
   * @description: 画面初期化処理
   */
  ngOnInit(): void {
    this.system.getInfo().then((data: any) => {
      if (data) {
        if (data.maint_summary && data.maint_period && data.maint_remark) {
          this._title = data.maint_summary;
          this._period = data.maint_period;
          this._desc = data.maint_remark;
        }
      }
    });
  }
}
