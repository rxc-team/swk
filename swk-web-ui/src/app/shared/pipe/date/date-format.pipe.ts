import { format } from 'date-fns';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';

import { Pipe, PipeTransform } from '@angular/core';
import { TokenStorageService } from '@core';

dayjs.extend(utc);
dayjs.extend(timezone);

// tslint:disable-next-line: use-pipe-transform-interface
@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {
  constructor(private tokenService: TokenStorageService) { }

  transform(value: string, fs?: string): string {
    const tz = this.tokenService.getUserTimeZone();
    if (value && !value.startsWith('0001')) {
      if (value.endsWith('+0000 UTC')) {
        try {
          const date = dayjs(value).tz(tz);
          if (fs == 'yyyy-MM-dd HH:mm:ss') {
            const result = date.format('YYYY/MM/DD HH:mm:ss')
            return result;
          } else {
            const result = date.format('YYYY/MM/DD')
            return result;
          }
        } catch (error) {
          return '';
        }
      } else {
        value = `${value.substring(0, 19)}.000 +0000 UTC`;
        try {
          const date = dayjs(value).tz(tz);
          if (fs == 'yyyy-MM-dd HH:mm:ss') {
            const result = date.format('YYYY/MM/DD HH:mm:ss')
            return result;
          } else {
            const result = date.format('YYYY/MM/DD')
            return result;
          }
        } catch (error) {
          return '';
        }
      }
    }
    return '';
  }
}
