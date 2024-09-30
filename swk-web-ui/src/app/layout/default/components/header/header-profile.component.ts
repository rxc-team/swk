import { Component, Input, OnInit } from '@angular/core';
import { TokenStorageService } from '@core';

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
