import { TestBed } from '@angular/core/testing';

import { DatabaseResolverService } from './database-resolver.service';

describe('DatabaseResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DatabaseResolverService = TestBed.get(DatabaseResolverService);
    expect(service).toBeTruthy();
  });
});
