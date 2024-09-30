import { TestBed } from '@angular/core/testing';

import { HttpSpinService } from './http-spin.service';

describe('HttpSpinService', () => {
  let service: HttpSpinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpSpinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
