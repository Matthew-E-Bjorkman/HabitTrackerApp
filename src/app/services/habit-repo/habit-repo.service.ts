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
    this.storageInstantiated = true;
  }

  public refreshHabitLists() {
    this.eventQueueService.dispatch(new AppEvent(AppEventType.HabitListUpdated, null));
  }

  public saveHabit(habit: Habit) {
    this.saveObject(habit, 'habits', 'HabitSID', new AppEvent(AppEventType.HabitListUpdated, null));
  }

  public async getHabits() : Promise<Habit[]> {
    return this.getObjects<Habit>('habits');
  }

  public deleteHabit(habit: Habit) : void {
    this.deleteObject(habit, 'habits', 'HabitSID', new AppEvent(AppEventType.HabitListUpdated, null));
  }

  public getNewHabit() : Habit {
    var habit = new Habit();
    habit.HabitSID = uuid();
    habit.Icon = 'checkmark-circle-outline';
    return habit;
  }

  public saveHabitStreak(habitStreak: HabitStreak) {
    this.saveObject(habitStreak, `habit_streaks_${habitStreak.HabitSID}`, 'HabitSID', new AppEvent(AppEventType.HabitStreakListUpdated, habitStreak.HabitSID));
  }

  public async getHabitStreaksByHabit(habitSID: string) : Promise<HabitStreak[]> {
    return this.getObjects<HabitStreak>(`habit_streaks_${habitSID}`);
  }

  public deleteHabitStreak(habitStreak: HabitStreak) {
    this.deleteObject(habitStreak, `habit_streaks_${habitStreak.HabitSID}`, 'HabitSID', new AppEvent(AppEventType.HabitStreakListUpdated, habitStreak.HabitSID));
  }

  public getNewHabitStreak(habit: Habit) : HabitStreak {
    var habitStreak = new HabitStreak();
    habitStreak.HabitSID = habit.HabitSID;
    habitStreak.HabitStreakSID = uuid();
    return habitStreak;
  }

  private saveObject<T>(object: T, storageKey: string, objectKey: string, emitEvent: AppEvent<string | null>) {
    this.getObjects<T>(storageKey).then((result : T[]) => {
      if (!result) {
        result = [];
      }

      var existingObjectInList = result.find(x => Object.getOwnPropertyDescriptor(x, objectKey)?.value === Object.getOwnPropertyDescriptor(object, objectKey)?.value);

      if (existingObjectInList) {
        var index = result.indexOf(existingObjectInList);
        result[index] = object;
      }
      else {
        result.push(object);
      }
      
      this.saveObjects<T>(result, storageKey, emitEvent);
    });
  }

  private async saveObjects<T>(objects: T[], storageKey: string, emitEvent: AppEvent<string | null>) {
    if (!this.storageInstantiated) {
      await this.init();
    }

    if (objects.length == 0) {
      return;
    }

    this.storage.set(storageKey, objects).then(() => {
      this.eventQueueService.dispatch(emitEvent);
    });
  }

  private async getObjects<T>(storageKey: string) : Promise<T[]> {
    if (!this.storageInstantiated) {
      await this.init();
    }

    return this.storage.get(storageKey);
  }

  private deleteObject<T>(object: T, storageKey: string, objectKey: string, emitEvent: AppEvent<string | null>) {
    this.getObjects<T>(storageKey).then((result : T[]) => {
      if (!result) {
        this.eventQueueService.dispatch(emitEvent);
        return;
      }

      var index = result.indexOf(object);
      result.splice(index, 1);

      if (result.length > 0) {
        this.saveObjects(result, storageKey, emitEvent);
      }
      else {
        this.storage.remove(storageKey);
        this.eventQueueService.dispatch(emitEvent);
      }
    });
  }
}
