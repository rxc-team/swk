import { TestBed } from '@angular/core/testing';

import { CanDeactivateCopyGuard } from './can-deactivate-copy.guard';

describe('CanDeactivateCopyGuard', () => {
  let guard: CanDeactivateCopyGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CanDeactivateCopyGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
