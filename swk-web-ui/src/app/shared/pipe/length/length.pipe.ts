import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'length'
})
export class LengthPipe implements PipeTransform {
  transform(value: object): number {
    return Object.getOwnPropertyNames(value).length;
  }
}
