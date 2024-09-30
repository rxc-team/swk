/*
 * @Descripttion:
 * @Author: Rxc 陳平
 * @Date: 2020-06-22 10:46:01
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-09-22 16:19:59
 */
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { QuestionAddComponent } from './question-add/question-add.component';
import { QuestionFormComponent } from './question-form/question-form.component';
import { QuestionListComponent } from './question-list/question-list.component';
import { QuestionRoutingModule } from './question-routing.module';

@NgModule({
  declarations: [QuestionListComponent, QuestionFormComponent, QuestionAddComponent],
  imports: [SharedModule, QuestionRoutingModule]
})
export class QuestionModule {}
