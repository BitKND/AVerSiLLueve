import { TestBed } from '@angular/core/testing';

import { GeolocationService } from './geolocation-service.service';

describe('GeolocationServiceService', () => {
  let service: GeolocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeolocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
