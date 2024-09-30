import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { QuestionService } from '@api';

@Injectable({
  providedIn: 'root'
})
export class QuestionDetailResolverService implements Resolve<any> {
  constructor(private questionService: QuestionService) {}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const questionID = route.paramMap.get('question_id');
    let data: any;
    if (questionID) {
      await this.questionService.getQuestionByID(questionID).then((res: any) => {
        if (res) {
          data = res;
        }
      });
    }
    return data;
  }
}
