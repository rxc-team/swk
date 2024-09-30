import { TestBed } from '@angular/core/testing';

import { ReportResolverService } from './report-resolver.service';

describe('ReportResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReportResolverService = TestBed.get(ReportResolverService);
    expect(service).toBeTruthy();
  });
});
