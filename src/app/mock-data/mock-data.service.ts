import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  data: MockDataContainer = new MockDataContainer();

  constructor(private http: HttpClient) { 
    this.loadMockData();
  }

  public loadMockData() {
    return this.http.get('./assets/mockdata/habits.json')
      .subscribe((result: any) => {
            this.data.habitList = result;
      })
  }

  public getData() {
      return this.data;
  }
}
export class MockDataContainer {
  "habitList": HabitDataList;
}
export class HabitDataList {
  "habits": HabitDataItem[];
}
export class HabitDataItem {
  "habitName": string;
}
