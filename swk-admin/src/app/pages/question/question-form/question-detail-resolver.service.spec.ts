import { TestBed } from '@angular/core/testing';

import { QuestionDetailResolverService } from './question-detail-resolver.service';

describe('QuestionDetailResolverService', () => {
  let service: QuestionDetailResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestionDetailResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
