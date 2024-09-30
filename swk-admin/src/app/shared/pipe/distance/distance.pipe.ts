import { formatDistance } from 'date-fns';
import { enUS, ja, zhCN } from 'date-fns/locale';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';

import { Pipe, PipeTransform } from '@angular/core';
import { TokenStorageService } from '@core';

dayjs.extend(utc);
dayjs.extend(timezone);

@Pipe({
  name: 'distance'
})
export class DistancePipe implements PipeTransform {
  constructor(private tokenService: TokenStorageService) {}
  transform(value: string): string {
    const user = this.tokenService.getUser();
    try {
      const language = user.language;
      let locale = ja;
      switch (language) {
        case 'ja-JP':
          locale = ja;
          break;
        case 'zh-CN':
          locale = zhCN;
          break;
        case 'en-US':
          locale = enUS;
          break;
        default:
          locale = ja;
          break;
      }
      const tz = user.timezone;
      const date = dayjs(value).tz(tz);
      const result = formatDistance(date.toDate(), new Date(), {
        addSuffix: true,
        locale: locale
      });
      return result;
    } catch (error) {
      return '';
    }
  }
}
