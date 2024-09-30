import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { QuestionAddComponent } from './question-add/question-add.component';
import { QuestionDetailResolverService } from './question-form/question-detail-resolver.service';
import { QuestionFormComponent } from './question-form/question-form.component';
import { QuestionListComponent } from './question-list/question-list.component';
import { CandeactiveQuestionAddGuard } from './question-add/candeactive-question-add.guard';

// 角色路由
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        component: QuestionListComponent,
        data: {
          title: 'route.questionListTitle',
          breadcrumb: 'route.questionListTitle'
        }
      },
      {
        path: 'add',
        component: QuestionAddComponent,
        data: {
          title: 'route.questionAddTitle',
          canBack: true,
          breadcrumb: 'route.questionAddTitle'
        },
        canDeactivate: [CandeactiveQuestionAddGuard]
      },
      {
        path: 'edit/:question_id',
        resolve: {
          question: QuestionDetailResolverService
        },
        runGuardsAndResolvers: 'always',
        component: QuestionFormComponent,
        data: {
          title: 'route.questionEditTitle',
          canBack: true,
          breadcrumb: 'route.questionEditTitle'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuestionRoutingModule {}
