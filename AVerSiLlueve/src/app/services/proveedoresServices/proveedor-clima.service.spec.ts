import { TestBed } from '@angular/core/testing';

import { ProveedorClimaService } from './proveedor-clima.service';

describe('ProveedorClimaService', () => {
  let service: ProveedorClimaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProveedorClimaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
