import { TestBed } from '@angular/core/testing';

import { HabitLogicService } from './habit-logic.service';

describe('HabitLogicService', () => {
  let service: HabitLogicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HabitLogicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
