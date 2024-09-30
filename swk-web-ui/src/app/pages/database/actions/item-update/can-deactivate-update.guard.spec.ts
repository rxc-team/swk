import { TestBed } from '@angular/core/testing';

import { CanDeactivateUpdateGuard } from './can-deactivate-update.guard';

describe('CanDeactivateUpdateGuard', () => {
  let guard: CanDeactivateUpdateGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CanDeactivateUpdateGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
