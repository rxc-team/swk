import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header-help',
  template: `
    <a style="color: inherit" routerLink="/help/type">
      <span class="menu" style="width: 41px" nz-tooltip nzTooltipPlacement="bottom" [nzTooltipTitle]="'header.title.help' | translate">
        <i nz-icon nzType="read" nzTheme="outline"></i>
      </span>
    </a>
  `,
  styleUrls: ['./header-help.component.less']
})
export class HeaderHelpComponent implements OnInit {
  constructor() { }

  ngOnInit(): void { }
}
