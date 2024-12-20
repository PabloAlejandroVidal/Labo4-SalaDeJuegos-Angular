import { TestBed } from '@angular/core/testing';

import { ConectaCuatroService } from './conecta-cuatro.service';

describe('ConectaCuatroService', () => {
  let service: ConectaCuatroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConectaCuatroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
