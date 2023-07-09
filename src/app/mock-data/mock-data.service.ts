import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HabitList } from '../shared/data-classes/data-containers';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  initialized: boolean = false;
  data: MockDataContainer = new MockDataContainer();

  constructor(private http: HttpClient) { }

  public loadMockData(callback: (param: MockDataContainer) => void) {
    return this.http.get('./assets/mockdata/habits.json')
      .subscribe((result: any) => {
            this.data.habitList = result;
            this.initialized = true;
            callback(this.data);
      })
  }

  public getData(callback: (param: MockDataContainer) => void) {
      //give the service a chance to initialize
      if (!this.initialized) {
        this.loadMockData(callback);
      }
      else {
        callback(this.data);
      }
  }
}
export class MockDataContainer {
  "habitList": HabitList;
}

