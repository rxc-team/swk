import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// 装饰器
@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private url = 'question/questions';

  constructor(private http: HttpClient) {}

  /**
   * @description: 获取所有提问问题
   * @return: 请求的结果
   */
  getQuestions(param?: { title?: string; domain?: string; type?: string; function?: string; status?: string }): Promise<any> {
    if (!param) {
      return this.http
        .get(this.url, {
          headers: {
            token: 'true'
          }
        })
        .toPromise();
    }

    const params = {};
    if (param.title) {
      params['title'] = param.title;
    }
    if (param.domain) {
      params['domain'] = param.domain;
    }
    if (param.type) {
      params['type'] = param.type;
    }

    if (param.function) {
      params['function'] = param.function;
    }
    if (param.status) {
      params['status'] = param.status;
    }
    return this.http
      .get(this.url, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 问题标题唯一性检查
   * @return: 请求的结果
   */
  titleNameAsyncValidator(questionTitle: string): Promise<any> {
    const params = {};
    params['title'] = questionTitle;
    return this.http
      .post(`validation/questiontitle`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 用问题ID获取单个问题
   * @return: 请求的结果
   */
  getQuestionByID(id: string): Promise<any> {
    return this.http
      .get(`${this.url}/${id}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 新建问题
   * @param any 问题
   * @return: 请求的结果
   */
  creatQuestion(params: any): Promise<any> {
    return this.http
      .post(this.url, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 更新问题
   * @param any 问题
   * @param string 问题ID
   * @return: 请求的结果
   */
  updateQuestion(id: string, params): Promise<any> {
    return this.http
      .put(`${this.url}/${id}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
