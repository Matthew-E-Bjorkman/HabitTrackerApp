import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Habit, HabitReminder, HabitStreak } from 'src/app/shared/data-classes/data-objects';
import { EventQueueService } from '../event-queue/event-queue.service';
import { AppEvent, AppEventType } from 'src/app/shared/events';
import { v4 as uuid } from 'uuid';
import { HabitFrequencyCategory, HabitType } from 'src/app/shared/data-classes/data-enums';

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

  //Habit
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
    this.getHabitStreaksByHabit(habit.HabitSID).then((result) => {
      if (result) {
        this.storage.remove(`habit_streaks_${habit.HabitSID}`);
        this.eventQueueService.dispatch(new AppEvent(AppEventType.HabitStreakListUpdated, habit.HabitSID));
      }

      this.deleteObject(habit, 'habits', 'HabitSID', new AppEvent(AppEventType.HabitListUpdated, null));
    }); 
  }

  public getNewHabit() : Habit {
    var habit = new Habit();
    habit.HabitSID = uuid();
    habit.Icon = 'checkmark-circle-outline';
    habit.FrequencyCategory = HabitFrequencyCategory.Daily;
    habit.Type = HabitType.Chores;
    habit.Reminders = [];
    return habit;
  }

  //HabitStreak
  public saveHabitStreak(habitStreak: HabitStreak) {
    this.saveObject(habitStreak, `habit_streaks_${habitStreak.HabitSID}`, 'HabitStreakSID', new AppEvent(AppEventType.HabitStreakListUpdated, habitStreak.HabitSID));
  }

  public saveHabitStreaks(habitStreaks: HabitStreak[]) {
    this.saveObjects(habitStreaks, `habit_streaks_${habitStreaks[0].HabitSID}`, new AppEvent(AppEventType.HabitStreakListUpdated, habitStreaks[0].HabitSID));
  }

  public async getHabitStreaksByHabit(habitSID: string) : Promise<HabitStreak[]> {
    return this.getObjects<HabitStreak>(`habit_streaks_${habitSID}`);
  }

  public deleteHabitStreak(habitStreak: HabitStreak) {
    this.deleteObject(habitStreak, `habit_streaks_${habitStreak.HabitSID}`, 'HabitStreakSID', new AppEvent(AppEventType.HabitStreakListUpdated, habitStreak.HabitSID));
  }

  public getNewHabitStreak(habit: Habit, startingDate : Date) : HabitStreak {
    var habitStreak = new HabitStreak();
    habitStreak.HabitSID = habit.HabitSID;
    habitStreak.HabitStreakSID = uuid();
    habitStreak.StreakCount = 1;
    habitStreak.StartDate = startingDate;
    habitStreak.EndDate = startingDate;
    return habitStreak;
  }

  //HabitReminder
  public getNewHabitReminder(habit: Habit) : HabitReminder {
    var habitReminder = new HabitReminder();
    habitReminder.HabitSID = habit.HabitSID;
    habitReminder.HabitReminderSID = uuid();
    habitReminder.NotificationSIDs = [];
    habitReminder.ReminderTime = '1900-01-01T00:00:00.000Z';
    return habitReminder;
  }

  //Generic
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

    this.storage.set(storageKey, objects).then((result) => {
      this.eventQueueService.dispatch(emitEvent);
    }).catch((error) => console.error(error));
  }

  private async getObjects<T>(storageKey: string) : Promise<T[]> {
    if (!this.storageInstantiated) {
      await this.init();
    }

    return this.storage.get(storageKey).catch((error) => console.error(error));
  }

  private deleteObject<T>(object: T, storageKey: string, objectKey: string, emitEvent: AppEvent<string | null>) {
    this.getObjects<T>(storageKey).then((result : T[]) => {
      if (!result) {
        this.eventQueueService.dispatch(emitEvent);
        return;
      }

      var existingObjectInList = result.find(x => Object.getOwnPropertyDescriptor(x, objectKey)?.value === Object.getOwnPropertyDescriptor(object, objectKey)?.value);

      if (existingObjectInList) {
        var index = result.indexOf(existingObjectInList);
        result.splice(index, 1);
      }

      if (result.length > 0) {
        this.saveObjects(result, storageKey, emitEvent);
      }
      else {
        this.storage.remove(storageKey).catch((error) => console.error(error));
        this.eventQueueService.dispatch(emitEvent);
      }
    });
  }

  
}
