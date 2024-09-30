import { TestBed } from '@angular/core/testing';

import { CanDeactivateUserGuard } from './can-deactivate-user.guard';

describe('CanDeactivateUserGuard', () => {
  let guard: CanDeactivateUserGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CanDeactivateUserGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
