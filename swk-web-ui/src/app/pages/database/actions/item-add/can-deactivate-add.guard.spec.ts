import { TestBed } from '@angular/core/testing';

import { CanDeactivateAddGuard } from './can-deactivate-add.guard';

describe('CanDeactivateAddGuard', () => {
  let guard: CanDeactivateAddGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CanDeactivateAddGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
