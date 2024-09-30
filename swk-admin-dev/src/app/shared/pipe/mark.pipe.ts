import * as hljs from 'highlight.js';
import * as Marked from 'marked';

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mark'
})
export class MarkPipe implements PipeTransform {
  transform(value: string): string {
    Marked.setOptions({
      renderer: new Marked.Renderer(),
      highlight: function (code) {
        return hljs.highlightAuto(code).value;
      }
    });
    return Marked(value);
  }
}
