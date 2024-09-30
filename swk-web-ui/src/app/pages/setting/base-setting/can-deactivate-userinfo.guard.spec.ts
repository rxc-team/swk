import { TestBed } from '@angular/core/testing';

import { CanDeactivateUserinfoGuard } from './can-deactivate-userinfo.guard';

describe('CanDeactivateUserinfoGuard', () => {
  let guard: CanDeactivateUserinfoGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CanDeactivateUserinfoGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
