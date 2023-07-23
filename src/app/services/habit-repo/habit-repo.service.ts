import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Habit, HabitStreak } from 'src/app/shared/data-classes/data-objects';
import { EventQueueService } from '../event-queue/event-queue.service';
import { AppEvent, AppEventType } from 'src/app/shared/events';
import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class HabitRepoService {
  storageInstantiated: boolean = false;

  constructor(public platform: Platform, public storage: Storage, private eventQueueService: EventQueueService) { }

  public async init() {
    this.storage = await this.storage.create();
  }

  public refreshHabitLists() {
    this.eventQueueService.dispatch(new AppEvent(AppEventType.HabitListUpdated, null));
  }

  public saveHabit(habit: Habit) {
    this.getHabits().then((result : Habit[]) => {
      if (!result) {
        result = [];
      }

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

    if (habits.length == 0) {
      return;
    }

    this.storage.set('habits', habits).then(() => {
      this.eventQueueService.dispatch(new AppEvent(AppEventType.HabitListUpdated, null));
    });
  }

  public async getHabits() {
    if (!this.storageInstantiated) {
      await this.init();
    }

    return this.storage.get('habits');
  }

  public deleteHabit(habit: Habit) {
    this.getHabits().then((result) => {
      if (!result) {
        this.eventQueueService.dispatch(new AppEvent(AppEventType.HabitListUpdated, null));
        return;
      }

      var index = result.indexOf(habit);
      result.splice(index, 1);

      if (result.length > 0) {
        this.saveHabits(result);
      }
      else {
        this.storage.remove('habits');
        this.eventQueueService.dispatch(new AppEvent(AppEventType.HabitListUpdated, null));
      }
    });
  }

  public getNewHabit() : Habit {
    var habit = new Habit();
    habit.HabitSID = uuid();
    habit.Icon = 'checkmark-circle-outline';
    return habit;
  }

  public getNewHabitStreak(habit: Habit) : HabitStreak {
    var habitStreak = new HabitStreak();
    habitStreak.HabitSID = habit.HabitSID;
    habitStreak.HabitStreakSID = uuid();
    return habitStreak;
  }

  public saveHabitStreak(habitStreak: HabitStreak) {
    this.getHabitStreaksByHabit(habitStreak.HabitSID).then((result : HabitStreak[]) => {
      if (!result) {
        result = [];
      }

      var existingHabitStreak = result.find(x => x.HabitStreakSID === habitStreak.HabitStreakSID);

      if (existingHabitStreak) {
        var index = result.indexOf(existingHabitStreak);
        result[index] = habitStreak;
      }
      else {
        result.push(habitStreak);
      }
      
      this.saveHabitStreaks(result);
    });
  }

  public async saveHabitStreaks(habitStreaks: HabitStreak[]) {
    if (!this.storageInstantiated) {
      await this.init();
    }

    if (habitStreaks.length == 0) {
      return;
    }

    this.storage.set(`habit_streaks_${habitStreaks[0].HabitSID}`, habitStreaks).then(() => {
      this.eventQueueService.dispatch(new AppEvent(AppEventType.HabitStreakListUpdated, habitStreaks[0].HabitSID));
    });
  }

  public async getHabitStreaksByHabit(habitSID: string) : Promise<HabitStreak[]> {
    if (!this.storageInstantiated) {
      await this.init();
    }

    return this.storage.get(`habit_streaks_${habitSID}`);
  }

  public deleteHabitStreak(habitStreak: HabitStreak) {
    this.getHabitStreaksByHabit(habitStreak.HabitSID).then((result) => {
      if (!result) {
        this.eventQueueService.dispatch(new AppEvent(AppEventType.HabitStreakListUpdated, habitStreak.HabitSID));
        return;
      }

      var index = result.indexOf(habitStreak);
      result.splice(index, 1);

      if (result.length > 0) {
        this.saveHabitStreaks(result);
      }
      else {
        this.storage.remove(`habit_streaks_${habitStreak.HabitSID}`);
        this.eventQueueService.dispatch(new AppEvent(AppEventType.HabitStreakListUpdated, habitStreak.HabitSID));
      }
    });
  }
}
