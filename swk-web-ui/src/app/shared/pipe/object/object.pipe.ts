import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'object'
})
export class JsonPipe implements PipeTransform {
  transform(value: string): any {
    if (value) {
      return JSON.parse(value);
    }

    return '';
  }
}
