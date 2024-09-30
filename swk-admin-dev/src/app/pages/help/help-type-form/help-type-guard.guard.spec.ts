import { TestBed } from '@angular/core/testing';

import { HelpTypeGuardGuard } from './help-type-guard.guard';

describe('HelpTypeGuardGuard', () => {
  let guard: HelpTypeGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(HelpTypeGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
