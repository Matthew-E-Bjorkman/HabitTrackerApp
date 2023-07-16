import { TestBed } from '@angular/core/testing';

import { SystemDataService } from './system-data.service';

describe('SystemDataService', () => {
  let service: SystemDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
