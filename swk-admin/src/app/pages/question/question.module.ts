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
