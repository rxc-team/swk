import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}

  transform(value: string, key: string): SafeHtml {
    const redSpan = `<span style="color:orangered">${key}</span>`;
    const result = value.replace(key, redSpan);
    return this.sanitized.bypassSecurityTrustHtml(result);
  }
}
