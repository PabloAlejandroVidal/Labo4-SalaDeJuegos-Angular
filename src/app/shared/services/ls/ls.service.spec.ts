import { TestBed } from '@angular/core/testing';

import { LsService } from './ls.service';

describe('LsService', () => {
  let service: LsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
