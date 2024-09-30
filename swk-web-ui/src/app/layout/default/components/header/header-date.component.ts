import { format } from 'date-fns';
import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';

import { Component, OnInit } from '@angular/core';
import { AppService } from '@api';
import { TokenStorageService } from '@core';

@Component({
  selector: 'app-header-date',
  templateUrl: './header-date.component.html'
})
export class HeaderDateComponent implements OnInit {
  // 盘点开始日付
  isSmall = false;
  checkStartDate: string;
  constructor(
    private tokenService: TokenStorageService,
    private appService: AppService,
    private eventBus: NgEventBus,
    private bs: NzBreakpointService
  ) {
    bs.subscribe({
      xs: '480px',
      sm: '768px',
      md: '992px',
      lg: '1200px',
      xl: '1600px',
      xxl: '1600px'
    }).subscribe(data => {
      if (data === 'xs' || data === 'sm' || data === 'md') {
        this.isSmall = true;
      } else {
        this.isSmall = false;
      }
    });

    eventBus.on('change:app').subscribe(() => {
      this.init();
    });
  }

  ngOnInit() {
    this.init();
  }

  async init() {
    const us = this.tokenService.getUser();
    const currentApp = us.current_app;
    const db = us.customer_id;
    await this.appService.getAppByID(currentApp, db).then(res => {
      if (res && res.configs.check_start_date) {
        this.checkStartDate = format(new Date(res.configs.check_start_date), 'yyyy-MM-dd');
      } else {
        this.checkStartDate = '';
      }
    });
  }
}
