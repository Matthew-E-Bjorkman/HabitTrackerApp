import { Injectable } from '@angular/core';
import { LocalNotifications, Schedule } from '@capacitor/local-notifications';
import { HabitFrequencyCategory } from 'src/app/shared/data-classes/data-enums';
import { Habit, HabitReminder, HabitStreak } from 'src/app/shared/data-classes/data-objects';

@Injectable({
  providedIn: 'root'
})
export class HabitLogicService {
  constructor() { }

  public habitsForDate(habits: Habit[], dateToView: Date): Habit[] {
    var habitsToInclude : Habit[] = [];
    for (let habit of habits) {
      switch (habit.FrequencyCategory) {
        case HabitFrequencyCategory.Daily:
          habitsToInclude.push(habit);
          break;
        case HabitFrequencyCategory.Weekly:
          if (habit.FrequencyCategoryValues.includes(dateToView.getDay() - 1)) //Offset 1 for indexing
            habitsToInclude.push(habit);
          break;
        case HabitFrequencyCategory.Monthly:
          if (habit.FrequencyCategoryValues.includes(dateToView.getDate() - 1)) //Offset 1 for indexing
            habitsToInclude.push(habit);
          break;
      }
    }
    return habitsToInclude;
  }

  public markStreakForDate(habitStreaks: HabitStreak[], dateToCheck: Date, markAsCompleted: boolean, newHabitStreak: HabitStreak) : HabitStreak[] {
    //The habit was checked
    if (markAsCompleted) {
      var existingStreakBefore : HabitStreak | undefined = this.getStreakBeforeDate(habitStreaks, dateToCheck);
      var existingStreakAfter : HabitStreak | undefined = this.getStreakAfterDate(habitStreaks, dateToCheck);

      if (existingStreakBefore && existingStreakAfter) { //Merge the streaks 
        existingStreakBefore.EndDate = existingStreakAfter.EndDate;
        existingStreakBefore.StreakCount = existingStreakBefore.StreakCount + existingStreakAfter.StreakCount + 1;

        habitStreaks.splice(habitStreaks.indexOf(existingStreakAfter), 1);
      } else if (existingStreakBefore) { //Extend the streak forwards
        existingStreakBefore.EndDate = dateToCheck;
        existingStreakBefore.StreakCount++;
      } else if (existingStreakAfter) { //Extend the streak backwards
        existingStreakAfter.StartDate = dateToCheck;
        existingStreakAfter.StreakCount++;
      } else {
        habitStreaks.push(newHabitStreak);
      }
    }
    else {
      //The habit was unchecked
      var streak : HabitStreak | undefined = this.getStreakForDate(habitStreaks, dateToCheck)!;
      if (this.isSameDate(streak.StartDate, dateToCheck)) {
        streak.StartDate.setDate(streak.StartDate.getDate() + 1);
        streak.StreakCount--;
      } else if (this.isSameDate(streak.EndDate, dateToCheck)) {
        streak.EndDate.setDate(streak.EndDate.getDate() - 1);
        streak.StreakCount--;
      } 
      else {
        var originalStreak : number = streak.StreakCount;

        newHabitStreak.EndDate = new Date(streak.EndDate);
        newHabitStreak.StartDate = new Date(streak.StartDate);
        newHabitStreak.StartDate.setDate(dateToCheck.getDate() + 1);

        streak.EndDate.setDate(dateToCheck.getDate() - 1);
        streak.StartDate;
        streak.StreakCount = Math.abs(this.daysBetween(streak.StartDate, streak.EndDate) + 1);
        
        newHabitStreak.StreakCount = originalStreak - streak.StreakCount - 1;

        habitStreaks.push(newHabitStreak);
      }
    }

    return habitStreaks ?? [];
  }

  private getStreakBeforeDate(habitStreaks : HabitStreak[], dateToCheck : Date) : HabitStreak | undefined{
    var date = new Date(dateToCheck);
    date.setDate(dateToCheck.getDate() - 1);
    return this.getStreakForDate(habitStreaks, date);
  }

  private getStreakAfterDate(habitStreaks : HabitStreak[], dateToCheck : Date) : HabitStreak | undefined{
    var date = new Date(dateToCheck);
    date.setDate(dateToCheck.getDate() + 1);
    return this.getStreakForDate(habitStreaks, date);
  }

  private getStreakForDate(habitStreaks : HabitStreak[], dateToCheck : Date) : HabitStreak | undefined {
    if (!habitStreaks) return undefined;

    for (let streak of habitStreaks) {
      if (streak.StartDate <= dateToCheck && streak.EndDate >= dateToCheck) {
        return streak;
      }
    }
    return undefined;
  }

  private daysBetween(first : any, second : any) {        
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
  }

  public getTodayDate() : Date {
    var todayFull = new Date();
    return new Date(todayFull.getFullYear(), todayFull.getMonth(), todayFull.getDate());
  }

  public getActiveStreakByHabit(habitStreaks: HabitStreak[], dateToView: Date) : HabitStreak | undefined {
    if (!habitStreaks || habitStreaks.length == 0) {
      return undefined;
    }

    var activeStreak = habitStreaks.find(streak => streak.StartDate <= dateToView && streak.EndDate >= dateToView);

    return activeStreak;
  }

  public isDateToday(date: Date) {
    return this.isSameDate(date, this.getTodayDate());
  }

  public isSameDate(date1: Date, date2: Date) : boolean {
    return date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();
  }

  public checkAndScheduleReminders(habits: Habit[]) {
    LocalNotifications.getPending().then((result) => {
      for (let habit of habits) {
        for (let reminder of habit.Reminders) {
          if (!result || !result.notifications.find((notification) => {
            return notification.id === reminder.NotificationSID
          })) 
          {
            this.scheduleReminder(reminder, habit);
          }
        }
      }
    });
  }

  public scheduleReminder(reminder: HabitReminder, habit: Habit) {
    var scheduleBody! : Schedule;
    const now = new Date();
    const notificationDate = new Date(reminder.ReminderTime.substring(0, reminder.ReminderTime.length-1));
    notificationDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());

    if (notificationDate <= now) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }

    if (habit.FrequencyCategory == HabitFrequencyCategory.Daily) {
      scheduleBody = {
        at: notificationDate,
        every: 'day',
        allowWhileIdle: true
      }
    }
    else {
      return; //TODO
    }

    LocalNotifications.schedule({
      notifications: [{
        id: reminder.NotificationSID,
        body: `Time to complete habit: ${habit.Name}`,
        title: habit.Name,
        schedule: scheduleBody
      }]
    });
  }

  public cancelReminder(reminder: HabitReminder) {
    LocalNotifications.cancel({
      notifications:[
        {id:reminder.NotificationSID}
      ]
    });
  }
}
