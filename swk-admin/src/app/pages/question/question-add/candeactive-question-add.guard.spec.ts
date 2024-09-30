import { TestBed } from '@angular/core/testing';

import { CandeactiveQuestionAddGuard } from './candeactive-question-add.guard';

describe('CandeactiveQuestionAddGuard', () => {
  let guard: CandeactiveQuestionAddGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CandeactiveQuestionAddGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
