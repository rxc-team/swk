import { ChangeDetectionStrategy, Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { I18NService, TokenStorageService } from '@core';

@Component({
  selector: 'app-cron-editor',
  templateUrl: './cron-editor.component.html',
  styleUrls: ['./cron-editor.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CronEditorComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CronEditorComponent implements ControlValueAccessor, OnInit {
  @Input() isSmall = false;

  value; // 组件对应的 “ ngModel ”
  onChangeListener; // 改变值回调
  onTouchedListener; // 交互回调

  style = {
    display: 'block',
    height: '40px',
    lineHeight: '40px'
  };

  isOpen = false;

  frequency = 'day';

  time = new Date('2020/01/01 00:00');

  monthDays = Array<string>(31);
  monthWeeks = Array<string>(5);

  weeks = [
    { label: this.i18n.translateLang('page.schedule.monday'), value: '1', checked: false },
    { label: this.i18n.translateLang('page.schedule.tuesday'), value: '2', checked: false },
    { label: this.i18n.translateLang('page.schedule.wednesday'), value: '3', checked: false },
    { label: this.i18n.translateLang('page.schedule.thursday'), value: '4', checked: false },
    { label: this.i18n.translateLang('page.schedule.friday'), value: '5', checked: false },
    { label: this.i18n.translateLang('page.schedule.saturday'), value: '6', checked: false },
    { label: this.i18n.translateLang('page.schedule.sunday'), value: '0', checked: false }
  ];

  // 第n天
  monthDay = '1';
  timeZone = 'Asia/Tokyo';

  constructor(private i18n: I18NService, private tokenService: TokenStorageService) {}
  ngOnInit(): void {
    this.parserCron(this.value);
    this.timeZone = this.tokenService.getUserTimeZone();
  }

  parserCron(spec: string) {
    if (spec) {
      const crons = spec.split(' ');
      const minutes = crons[1];
      const hour = crons[2];
      const dayOfMonth = crons[3];
      const day = crons[4];
      const weekOfMonth = crons[5];

      this.time = new Date(`${hour.padStart(2, '0')}:${minutes.padStart(2, '0')}`);

      if (dayOfMonth === '*' && day === '*' && weekOfMonth === '?') {
        this.frequency = 'day';
        return;
      }

      if (dayOfMonth === '?' && day === '*') {
        const wks = weekOfMonth.split(',');
        const weekTips = wks.map(w => this.weeks.find(s => s.value === w)).map(v => v.label);

        this.frequency = 'week';
        this.weeks = weekTips;
        return;
      }

      if (weekOfMonth === '?' && day === '*') {
        this.frequency = 'month';
        this.monthDay = dayOfMonth;
        return;
      }
    }
  }

  propagateChange = (_: any) => {};

  change() {
    const minutes = this.time.getMinutes();
    const hours = this.time.getHours();
    switch (this.frequency) {
      case 'day':
        this.value = `TZ=${this.timeZone} ${minutes} ${hours} * * ?`;
        break;
      case 'week':
        const weeks = this.weeks.filter(w => w.checked).map(v => v.value);
        if (weeks.length > 0) {
          this.value = `TZ=${this.timeZone} ${minutes} ${hours} ? * ${weeks.join(',')}`;
        }
        break;
      case 'month':
        this.value = `TZ=${this.timeZone} ${minutes} ${hours} ${this.monthDay} * ?`;
        break;
      default:
        break;
    }
    this.onChange(this.value);
    this.isOpen = false;
  }

  writeValue(obj: any): void {
    this.value = obj; // form中给你设置了obj值，根据obj，去更新组件/UI
  }

  registerOnChange(fn: any): void {
    this.onChangeListener = fn; // 保存这个函数
  }

  registerOnTouched(fn: any): void {
    this.onTouchedListener = fn; // 保存这个函数
  }

  /**
   * 自定义当组件发生改变时，会调用的方法
   */
  onChange(payload) {
    this.value = payload;
    this.onChangeListener(payload); // 告诉form，你的表单值改变成了payload
    this.onTouchedListener(); // 告诉form，你的表单有交互发生
  }
}
