import { TestBed } from '@angular/core/testing';

import { Proveedor3ClimaService } from '../proveedoresServices/proveedor3-clima.service';

describe('Proveedor3ClimaService', () => {
  let service: Proveedor3ClimaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Proveedor3ClimaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
