import { Injectable } from '@angular/core';
import { HabitStreak } from 'src/app/shared/data-classes/data-objects';

@Injectable({
  providedIn: 'root'
})
export class HabitLogicService {

  constructor() { }

  public markStreakForToday(habitStreaks: HabitStreak[], markAsCompleted: boolean) : HabitStreak | undefined {
    var activeStreak = this.getActiveStreakByHabit(habitStreaks);

    //The streak exists, today hasn't been marked, and we're marking today
    if (activeStreak && markAsCompleted && this.isDateYesterday(activeStreak.EndDate)){
      activeStreak.EndDate = this.getTodayDate();
      activeStreak.StreakCount++;
    }
    //The streak exists, today has been marked, and we're unmarking today
    else if (activeStreak && !markAsCompleted && this.isDateToday(activeStreak.EndDate))
    {
      activeStreak.EndDate = this.getYesterdayDate();
      activeStreak.StreakCount--;
    }

    return activeStreak;
  }

  public getTodayDate() : Date {
    var todayFull = new Date();
    return new Date(todayFull.getFullYear(), todayFull.getMonth(), todayFull.getDate());
  }

  public getActiveStreakByHabit(habitStreaks: HabitStreak[]) : HabitStreak | undefined {
    if (!habitStreaks || habitStreaks.length == 0) {
      return undefined;
    }

    var today = this.getTodayDate();
    var yesterday = this.getYesterdayDate();
    var activeStreak = habitStreaks.find(streak => this.isSameDate(streak.EndDate, today) || this.isSameDate(streak.EndDate, yesterday));

    return activeStreak;
  }

  public isDateToday(date: Date) {
    return this.isSameDate(date, this.getTodayDate());
  }

  private isDateYesterday(date: Date) {
    return this.isSameDate(date, this.getYesterdayDate());
  }

  private getYesterdayDate() : Date {
    var todayFull = new Date();
    return new Date(todayFull.getFullYear(), todayFull.getMonth(), todayFull.getDate() - 1);
  }

  private isSameDate(date1: Date, date2: Date) : boolean {
    return date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();
  }
}
