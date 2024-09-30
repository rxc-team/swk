import { TestBed } from '@angular/core/testing';

import { HelpFormGuardGuard } from './help-form-guard.guard';

describe('HelpFormGuardGuard', () => {
  let guard: HelpFormGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(HelpFormGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
