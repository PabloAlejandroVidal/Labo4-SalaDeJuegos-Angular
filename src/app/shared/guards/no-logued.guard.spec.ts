import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { noLoguedGuard } from './no-logued.guard';

describe('noLoguedGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => noLoguedGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
