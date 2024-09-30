import { MarkdownService } from 'ngx-markdown';

import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HelpService } from '@api';

@Component({
  selector: 'app-help-detail',
  templateUrl: './help-detail.component.html',
  styleUrls: ['./help-detail.component.less']
})
export class HelpDetailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private help: HelpService,
    private markdownService: MarkdownService,
    private elementRef: ElementRef<HTMLElement>
  ) {}

  article;
  headings: Element[] = [];

  show = false;

  ngOnInit() {
    this.markdownService.renderer.heading = (text: string, level: number) => {
      const uuid = this.genUUID(6);
      return `
        <h${level} id="header${uuid}">
          ${text}
        </h${level}>
      `;
    };

    const id = this.route.snapshot.paramMap.get('id');

    this.help.getHelpByID(id).then((data: any) => {
      if (data) {
        this.article = data;
        this.show = true;
      }
    });
  }

  /**
   * 生成随机的 UUID
   */
  genUUID(randomLength) {
    return Number(Math.random().toString().substr(3, randomLength) + Date.now())
      .toString(36)
      .substring(0, 6);
  }

  onReady(): void {
    setTimeout(() => {
      this.setHeadings();
    }, 10);
  }

  private setHeadings(): void {
    const headings: Element[] = [];
    this.elementRef.nativeElement.querySelectorAll('h2').forEach(x => headings.push(x));
    this.headings = headings;
  }

  getHref(h: HTMLElement) {
    const id = h.id;
    return `#${id}`;
  }

  getName(h: HTMLElement) {
    return h.innerText;
  }

  goto(h: HTMLElement) {
    window.location.hash = h.id;
  }
}
