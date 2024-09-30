import { Pipe, PipeTransform } from '@angular/core';
import { I18NService } from '@core';

@Pipe({
  name: 'logger'
})
export class LoggerPipe implements PipeTransform {
  constructor(private i18n: I18NService) {}

  transform(value: string, params: Object): string {
    const langKey = `common.message.logger.${value}`;
    const interpolateParams: Object = {};
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const element: string = params[key];
        if (element.startsWith('{{')) {
          const ky = element.replace('{{', '').replace('}}', '');
          interpolateParams[key] = this.i18n.translateLang(ky);
        } else {
          interpolateParams[key] = element;
        }
      }
    }
    return this.i18n.translateLang(langKey, interpolateParams);
  }
}
