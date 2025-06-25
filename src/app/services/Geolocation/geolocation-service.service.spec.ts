import { TestBed } from '@angular/core/testing';

import { GeolocationServiceService } from './geolocation-service.service';

describe('GeolocationServiceService', () => {
  let service: GeolocationServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeolocationServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
