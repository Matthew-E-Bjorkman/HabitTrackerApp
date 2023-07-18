import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Habit } from 'src/app/shared/data-classes/data-objects';
import { EventQueueService } from '../event-queue/event-queue.service';
import { AppEvent, AppEventType } from 'src/app/shared/events';
import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  storageInstantiated: boolean = false;

  constructor(public platform: Platform, public storage: Storage, private eventQueueService: EventQueueService) { }

  public async init() {
    this.storage = await this.storage.create();
  }

  public saveHabit(habit: Habit) {
    this.getHabits((result) => {
      var existingHabit = result.find(x => x.HabitSID === habit.HabitSID);

      if (existingHabit) {
        var index = result.indexOf(existingHabit);
        result[index] = habit;
      }
      else {
        result.push(habit);
      }
      
      this.saveHabits(result);
    });
  }

  public async saveHabits(habits: Habit[]) {
    if (!this.storageInstantiated) {
      await this.init();
    }

    this.storage?.set('habits', habits);
    this.eventQueueService.dispatch(new AppEvent(AppEventType.HabitListUpdated, null))
  }

  public async getHabits(callback: (param: Habit[]) => void) {
    if (!this.storageInstantiated) {
      await this.init();
    }

    this.storage?.get('habits').then((data) => {
      if (data == null) {
        var habitList: Habit[] = [];
        callback(habitList);
      }
      else {
        callback(data);
      }
    })
  }

  public deleteHabit(habit: Habit) {
    this.getHabits((result) => {
      var index = result.indexOf(habit);
      result.splice(index, 1);
      this.saveHabits(result);
    });
  }

  public getNewHabit() : Habit {
    var habit = new Habit();
    habit.HabitSID = uuid();
    habit.Icon = 'checkmark-circle-outline';
    return habit;
  }
}
