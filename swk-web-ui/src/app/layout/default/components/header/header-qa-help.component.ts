import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-qa-help',
  template: `
    <span class="menu" style="width: 41px" nz-dropdown [nzDropdownMenu]="menu" nzTrigger="click" nzPlacement="bottomRight">
      <i nz-icon nzType="question-circle"></i>
    </span>
    <nz-dropdown-menu #menu="nzDropdownMenu">
      <ul nz-menu [nzMode]="'inline'">
        <li nz-menu-item style="width: 100px">
          <span (click)="tabs('/help/type')">
            <i nz-icon nzType="read" nzTheme="outline"></i>
            <span>{{ 'header.title.help' | translate }}</span>
          </span>
        </li>
        <li nz-menu-item style="width: 100px">
          <span (click)="tabs('/question/list')">
            <i nz-icon nzType="question-circle" nzTheme="outline"></i>
            <span>{{ 'header.title.question' | translate }}</span>
          </span>
        </li>
      </ul>
    </nz-dropdown-menu>
  `,
  styleUrls: ['header-qa-help.component.less']
})
export class HeaderQaHelpComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  /**
   * @description: 导航到某一路径
   * @param string 路径
   */
  tabs(path: string) {
    if (path === '') {
      return;
    }
    this.router.navigate([path]);
  }
}
