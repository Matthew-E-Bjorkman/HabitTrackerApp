import { TestBed } from '@angular/core/testing';

import { HabitRepoService } from './habit-repo.service';

describe('HabitRepoService', () => {
  let service: HabitRepoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HabitRepoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
