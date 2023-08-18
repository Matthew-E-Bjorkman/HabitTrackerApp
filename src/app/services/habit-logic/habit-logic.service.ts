import { Injectable } from '@angular/core';
import { HabitFrequencyCategory } from 'src/app/shared/data-classes/data-enums';
import { Habit, HabitStreak } from 'src/app/shared/data-classes/data-objects';
import { v4 as uuid } from 'uuid';

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

  public markStreakForDate(habitStreaks: HabitStreak[], dateToCheck: Date, markAsCompleted: boolean) : HabitStreak[] {
    //The habit was checked
    if (markAsCompleted) {
      var existingStreakBefore : HabitStreak | undefined = this.getStreakBeforeDate(habitStreaks, dateToCheck);
      var existingStreakAfter : HabitStreak | undefined = this.getStreakAfterDate(habitStreaks, dateToCheck);

      if (existingStreakBefore && existingStreakAfter) { //Merge the streaks 
        existingStreakBefore.EndDate = existingStreakAfter.EndDate;
        existingStreakBefore.StreakCount = existingStreakBefore.StreakCount + existingStreakAfter.StreakCount + 1;

        habitStreaks.splice(habitStreaks.indexOf(existingStreakAfter));
      } else if (existingStreakBefore) { //Extend the streak forwards
        existingStreakBefore.EndDate = dateToCheck;
        existingStreakBefore.StreakCount++;
      } else if (existingStreakAfter) { //Extend the streak backwards
        existingStreakAfter.StartDate = dateToCheck;
        existingStreakAfter.StreakCount++;
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

        var streakAfter : HabitStreak = new HabitStreak();
        streakAfter.HabitSID = streak.HabitSID;
        streakAfter.HabitStreakSID = uuid();
        streakAfter.EndDate = new Date(streak.EndDate);
        streakAfter.StartDate = new Date(streak.StartDate);
        streakAfter.StartDate.setDate(dateToCheck.getDate() + 1);

        streak.EndDate.setDate(dateToCheck.getDate() - 1);
        streak.StartDate;
        streak.StreakCount = Math.abs(this.daysBetween(streak.StartDate, streak.EndDate) + 1);
        
        streakAfter.StreakCount = originalStreak - streak.StreakCount - 1;

        habitStreaks.push(streakAfter);
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

  private getYesterdayDate() : Date {
    var todayFull = new Date();
    return new Date(todayFull.getFullYear(), todayFull.getMonth(), todayFull.getDate() - 1);
  }

  public isSameDate(date1: Date, date2: Date) : boolean {
    return date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();
  }
}
