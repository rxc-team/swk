import { GridsterModule } from 'angular-gridster2';
import { QRCodeModule } from 'angularx-qrcode';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzAnchorModule } from 'ng-zorro-antd/anchor';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
// ng-zorro
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMentionModule } from 'ng-zorro-antd/mention';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { InputTrimModule } from 'ng2-trim-directive';

import { CommonModule } from '@angular/common';
// angular框架类库
import { NgModule } from '@angular/core';
/*
 * @Description: shared module管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-17 12:42:08
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-09-23 11:08:21
 */
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
// 第三方类库
import { TranslateModule } from '@ngx-translate/core';

import { AccessDirective } from './access/access.directive';
import { ChartComponent } from './components/chart/chart.component';
import { AreaChartComponent } from './components/chart/chart/area-chart/area-chart.component';
import { BarChartComponent } from './components/chart/chart/bar-chart/bar-chart.component';
import { ColumnChartComponent } from './components/chart/chart/column-chart/column-chart.component';
import { HistogramChartComponent } from './components/chart/chart/histogram-chart/histogram-chart.component';
import { LineChartComponent } from './components/chart/chart/line-chart/line-chart.component';
import { PieChartComponent } from './components/chart/chart/pie-chart/pie-chart.component';
import { PointChartComponent } from './components/chart/chart/point-chart/point-chart.component';
import { RadarChartComponent } from './components/chart/chart/radar-chart/radar-chart.component';
import { HttpSpinComponent } from './components/http-spin/http-spin.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { DebounceClickDirective } from './input/debounce-click.directive';
import { DisableControlDirective } from './input/disable-control';
import { DisableTimePickerDirective } from './input/disable-time-picker.directive';
import { SelectDirective } from './input/select.directive';
import { DatastorePipe } from './pipe/datastore/datastore.pipe';
import { DateFormatPipe } from './pipe/date/date-format.pipe';
import { DistancePipe } from './pipe/distance/distance.pipe';
import { FieldPipe } from './pipe/field/field.pipe';
import { FileSizePipe } from './pipe/file/file-size.pipe';
import { GroupAccessPipe } from './pipe/group/group.pipe';
import { LengthPipe } from './pipe/length/length.pipe';
import { NodePipe } from './pipe/node/node.pipe';
import { JsonPipe } from './pipe/object/object.pipe';
import { OptionPipe } from './pipe/option/option.pipe';
import { RolePipe } from './pipe/role/role.pipe';
import { SearchPipe } from './pipe/search/search.pipe';
import { UserPipe } from './pipe/user/user.pipe';
import { HtmlPipe } from './pipe/html/html.pipe';

const ANTMODULES = [
  NzResizableModule,
  NzIconModule,
  NzButtonModule,
  NzGridModule,
  NzLayoutModule,
  NzSpaceModule,
  NzAffixModule,
  NzBreadCrumbModule,
  NzDropDownModule,
  NzMenuModule,
  NzPageHeaderModule,
  NzPaginationModule,
  NzStepsModule,
  NzAutocompleteModule,
  NzCascaderModule,
  NzCheckboxModule,
  NzDatePickerModule,
  NzFormModule,
  NzInputModule,
  NzInputNumberModule,
  NzMentionModule,
  NzRadioModule,
  NzRateModule,
  NzSelectModule,
  NzSliderModule,
  NzSwitchModule,
  NzTimePickerModule,
  NzTransferModule,
  NzTreeSelectModule,
  NzUploadModule,
  NzAvatarModule,
  NzBadgeModule,
  NzCalendarModule,
  NzCardModule,
  NzCarouselModule,
  NzCollapseModule,
  NzCommentModule,
  NzDescriptionsModule,
  NzEmptyModule,
  NzListModule,
  NzPopoverModule,
  NzStatisticModule,
  NzTableModule,
  NzTabsModule,
  NzTagModule,
  NzTimelineModule,
  NzToolTipModule,
  NzTreeModule,
  NzAlertModule,
  NzDrawerModule,
  NzMessageModule,
  NzModalModule,
  NzNotificationModule,
  NzPopconfirmModule,
  NzProgressModule,
  NzResultModule,
  NzSkeletonModule,
  NzSpinModule,
  NzAnchorModule,
  NzBackTopModule,
  NzImageModule,
  NzDividerModule
];

const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(key => antDesignIcons[key]);

const THIRDMODULES = [...ANTMODULES, GridsterModule, QRCodeModule, InputTrimModule, FlexLayoutModule];

const COMPONENTS = [
  HttpSpinComponent,
  SpinnerComponent,
  ChartComponent,
  LineChartComponent,
  AreaChartComponent,
  BarChartComponent,
  PieChartComponent,
  ColumnChartComponent,
  PointChartComponent,
  RadarChartComponent,
  HistogramChartComponent
];
const DIRECTIVES = [AccessDirective, DisableControlDirective, SelectDirective, DebounceClickDirective, DisableTimePickerDirective];
const PIPES = [
  FileSizePipe,
  GroupAccessPipe,
  DateFormatPipe,
  UserPipe,
  OptionPipe,
  DatastorePipe,
  JsonPipe,
  RolePipe,
  SearchPipe,
  FieldPipe,
  LengthPipe,
  NodePipe,
  DistancePipe,
  HtmlPipe
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
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
