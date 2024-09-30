import { Observable } from 'rxjs';

import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@api';
import { RouteStrategyService, TokenStorageService } from '@core';
import { Select, Store } from '@ngxs/store';
import { ClearMessage } from '@store';

@Component({
  selector: 'app-header-profile',
  templateUrl: './header-profile.component.html',
  styleUrls: ['./header-profile.component.less']
})
export class HeaderProfileComponent implements OnInit {
  @Input() isSmall = false;

  userInfo: any = {};

  constructor(private tokenService: TokenStorageService) {}
  ngOnInit(): void {
    this.userInfo = this.tokenService.getUser();

    this.tokenService.getUserInfo().subscribe(data => {
      if (data) {
        this.userInfo = data;
      }
    });
  }

  logout() {
    this.tokenService.signOut();
  }
}
