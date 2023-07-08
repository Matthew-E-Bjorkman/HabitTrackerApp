import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { MockDataService } from 'src/app/mock-data/mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  mockDataService!: MockDataService;

  constructor(public platform: Platform, public httpClient: HttpClient) { 
    this.mockDataService = new MockDataService(httpClient);
  }

  public async getHabits() {
    return this.mockDataService.getData().habitList;
  }
}
