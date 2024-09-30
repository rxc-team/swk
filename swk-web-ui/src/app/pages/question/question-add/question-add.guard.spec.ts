import { TestBed } from '@angular/core/testing';

import { QuestionAddGuard } from './question-add.guard';

describe('QuestionAddGuard', () => {
  let guard: QuestionAddGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(QuestionAddGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
