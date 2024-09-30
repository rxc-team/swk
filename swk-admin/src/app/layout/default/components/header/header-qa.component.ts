import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header-qa',
  template: `
    <a style="color: inherit" routerLink="/question/list">
      <span class="menu" style="width: 41px" nz-tooltip nzTooltipPlacement="bottom" [nzTooltipTitle]="'header.title.question' | translate">
        <i nz-icon nzType="question-circle" nzTheme="outline"></i>
      </span>
    </a>
  `,
  styleUrls: ['./header-qa.component.less']
})
export class HeaderQaComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
