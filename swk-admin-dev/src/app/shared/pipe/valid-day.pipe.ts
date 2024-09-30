import { differenceInCalendarDays, format, parse } from 'date-fns';

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'validDay'
})
export class ValidDayPipe implements PipeTransform {
  transform(time: string, endTime?: string): any {
    if (endTime) {
      const startDate = parse(time, 'yyyy-MM-dd', new Date());
      const endDate = parse(endTime, 'yyyy-MM-dd', new Date());
      return differenceInCalendarDays(endDate, startDate);
    }

    const nowDate = parse(format(new Date(), 'yyyy-MM-dd'), 'yyyy-MM-dd', new Date()).getTime();
    const date = parse(time, 'yyyy-MM-dd', new Date()).getTime();
    return nowDate > date;
  }
}
