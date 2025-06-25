import { TestBed } from '@angular/core/testing';

import { Proveedor2ClimaService } from '../proveedoresServices/proveedor2-clima.service';

describe('Proveedor2ClimaService', () => {
  let service: Proveedor2ClimaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Proveedor2ClimaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
