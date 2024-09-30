import { NzFormatEmitEvent } from 'ng-zorro-antd/tree';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HelpService, HelpTypeService } from '@api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-help-layout',
  templateUrl: './help-layout.component.html',
  styleUrls: ['./help-layout.component.less']
})
export class HelpLayoutComponent implements OnInit {
  constructor(
    private helpService: HelpService,
    private helpTypeService: HelpTypeService,
    private ts: TranslateService,
    private router: Router
  ) {
    this.ts.onLangChange.subscribe(() => {
      this.router.navigateByUrl(`/help/type`);
    });
  }

  types = [];

  async ngOnInit() {
    const data: any[] = await this.helpTypeService.getHelpTypes();
    data.forEach(t => {
      const type = {
        title: t.type_name,
        key: t.type_id
      };
      this.types = [...this.types, type];
    });
  }

  expand(event: Required<NzFormatEmitEvent>) {
    const node = event.node;
    if (node && node.getChildren().length === 0 && node.isExpanded) {
      const params = {
        type: node.key
      };
      this.helpService.getHelps(params).then(res => {
        if (res) {
          const helps = [];
          res.forEach(h => {
            const help = {
              title: h.title,
              key: h.help_id,
              isLeaf: true
            };
            helps.push(help);
          });
          node.addChildren(helps);
        } else {
          const help = {
            title: 'empty',
            key: '#',
            selectable: false,
            disabled: true,
            isLeaf: true
          };
          node.addChildren([help]);
        }
      });
    }
  }

  click(event: Required<NzFormatEmitEvent>): void {
    if (event.node.isLeaf) {
      if (event.node.key !== '#') {
        this.router.navigateByUrl(`/help/detail/${event.node.key}`);
        return;
      }
    } else {
      this.expand(event);
    }
  }
}
