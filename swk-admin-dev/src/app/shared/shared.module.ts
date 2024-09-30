import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzPipesModule } from 'ng-zorro-antd/pipes';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { InputTrimModule } from 'ng2-trim-directive';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { TranslateModule } from '@ngx-translate/core';

import { ChartComponent } from './components/chart/chart.component';
import { HttpSpinComponent } from './components/http-spin/http-spin.component';
import { ProcessComponent } from './components/process/process.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { DebounceClickDirective } from './directives/debounce-click.directive';
import { DateFormatPipe } from './pipe/date-format.pipe';
import { DistancePipe } from './pipe/distance.pipe';
import { LoggerPipe } from './pipe/logger.pipe';
import { MarkPipe } from './pipe/mark.pipe';
import { UserPipe } from './pipe/user.pipe';
import { ValidDayPipe } from './pipe/valid-day.pipe';
import { HtmlPipe } from './pipe/html.pipe';

const THIRDMODULES = [InputTrimModule, NzPipesModule, NzNotificationModule, NzMessageModule, NzProgressModule, NzSpinModule];
const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(key => antDesignIcons[key]);

// #region your コンポーネント & directives
const COMPONENTS = [SpinnerComponent, ChartComponent, ProcessComponent, HttpSpinComponent];
const DIRECTIVES = [DebounceClickDirective];
const PIPES = [DateFormatPipe, DistancePipe, ValidDayPipe, LoggerPipe, MarkPipe, UserPipe, HtmlPipe];
// #endregion

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    NzIconModule.forRoot(icons),
    // third libs
    ...THIRDMODULES
  ],
  declarations: [
    // your components
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // i18n
    TranslateModule,
    // third libs
    ...THIRDMODULES,
    // your components
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES
  ]
})
export class SharedModule {}
