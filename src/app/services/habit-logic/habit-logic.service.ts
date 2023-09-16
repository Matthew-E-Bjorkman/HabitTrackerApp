import { Injectable } from '@angular/core';
import { LocalNotifications, Schedule } from '@capacitor/local-notifications';
import { HabitFrequencyCategory } from 'src/app/shared/data-classes/data-enums';
import { Habit, HabitReminder, HabitStreak } from 'src/app/shared/data-classes/data-objects';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class HabitLogicService {
  constructor(private platform: Platform) { }

  private dayOfWeekAsString(dayIndex: number) {
    return ["Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dayIndex] || '';
  }

  private dayOfMonthAsString(dayIndex: number) {
    return ["1st","2nd","3rd","4th","5th","6th","7th","8th","9th","10th","11th","12th","13th","14th","15th","16th","17th","18th","19th","20th","21st","22nd","23rd","24th","25th","26th","27th","28th","29th","30th","31st"][dayIndex] || '';
  }

  public habitsForDate(habits: Habit[], dateToView: Date): Habit[] {
    var habitsToInclude : Habit[] = [];
    for (let habit of habits) {
      switch (habit.FrequencyCategory) {
        case HabitFrequencyCategory.Daily:
          habitsToInclude.push(habit);
          break;
        case HabitFrequencyCategory.Weekly:
          var weekday = this.dayOfWeekAsString(dateToView.getDay());
          if (habit.FrequencyCategoryValues.includes(weekday)) 
            habitsToInclude.push(habit);
          break;
        case HabitFrequencyCategory.Monthly:
          var monthDay = this.dayOfMonthAsString(dateToView.getDate() - 1);
          if (habit.FrequencyCategoryValues.includes(monthDay))
            habitsToInclude.push(habit);
          break;
      }
    }
    return habitsToInclude;
  }

  public markStreakForDate(habit: Habit, habitStreaks: HabitStreak[], dateToCheck: Date, markAsCompleted: boolean, newHabitStreak: HabitStreak) : HabitStreak[] {
    //The habit was checked
    if (markAsCompleted) {
      var existingStreakBefore : HabitStreak | undefined = this.getStreakBeforeDate(habitStreaks, dateToCheck, habit);
      var existingStreakAfter : HabitStreak | undefined = this.getStreakAfterDate(habitStreaks, dateToCheck, habit);

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

        var date = new Date(dateToCheck);
        do {
          date.setDate(date.getDate() + 1);
        }
        while (this.habitsForDate([habit], date).length == 0);
        newHabitStreak.StartDate.setFullYear(date.getFullYear());
        newHabitStreak.StartDate.setMonth(date.getMonth());
        newHabitStreak.StartDate.setDate(date.getDate());

        date = new Date(dateToCheck);
        do {
          date.setDate(date.getDate() - 1);
        }
        while (this.habitsForDate([habit], date).length == 0);
        streak.EndDate.setFullYear(date.getFullYear());
        streak.EndDate.setMonth(date.getMonth());
        streak.EndDate.setDate(date.getDate());
        streak.StartDate;
        streak.StreakCount = Math.abs(this.daysBetween(streak.StartDate, streak.EndDate) + 1);
        
        newHabitStreak.StreakCount = originalStreak - streak.StreakCount - 1;

        habitStreaks.push(newHabitStreak);
      }
    }

    return habitStreaks ?? [];
  }

  private getStreakBeforeDate(habitStreaks : HabitStreak[], dateToCheck : Date, habit : Habit) : HabitStreak | undefined{
    var date = new Date(dateToCheck);
    do {
      date.setDate(date.getDate() - 1);
    }
    while (this.habitsForDate([habit], date).length == 0);

    return this.getStreakForDate(habitStreaks, date);
  }

  private getStreakAfterDate(habitStreaks : HabitStreak[], dateToCheck : Date, habit : Habit) : HabitStreak | undefined{
    var date = new Date(dateToCheck);
    do {
      date.setDate(date.getDate() + 1);
    }
    while (this.habitsForDate([habit], date).length == 0);

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

  public async scheduleReminder(reminder: HabitReminder, habit: Habit) {
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

    //Notifs are only for android
    if (this.platform.is("android")) {
      var permissions = await LocalNotifications.checkPermissions();
      switch (permissions.display) {
        case 'prompt':
        case 'prompt-with-rationale':
          var result = await LocalNotifications.requestPermissions();
          if (result.display != 'granted'){
            return;
          }
          break;
        case 'denied':
          return;
        case 'granted':
          break;
      }
    }
    else {
      return;
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

  public exportHabitsToCSV(habits: Habit[]) {
    var headers = {
      "HabitSID": "HabitSID",
      "Icon": "Icon",
      "FrequencyCategory": "FrequencyCategory",
      "Type": "Type",
      "Reminders": "Reminders",
      "Name": "Name",
      "FrequencyCategoryValues": "FrequencyCategoryValues",
      "IsArchived": "IsArchived"
    };

    var csv = this.convertToCSV(headers, habits);

    var exportedFilename = 'habits.csv';

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", exportedFilename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }

  public exportHabitStreaksToCSV(habitStreaks: HabitStreak[]) {
    var headers = {
      "HabitSID": "HabitSID",
      "HabitStreakSID": "HabitStreakSID",
      "StreakCount": "StreakCount",
      "StartDate": "StartDate",
      "EndDate": "EndDate"
    };
    
    var csv = this.convertToCSV(headers, habitStreaks);

    var exportedFilename = 'habitStreaks.csv';

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", exportedFilename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }

  private convertToCSV(headers: any, objArray: any[]) {
    var str = '';

    var line = '';
    for (var headerIndex in headers) {
      if (line != '') line += ','
      var propVal = headers[headerIndex];
      line += propVal;
    }

    str += line + '\r\n';

    for (var i = 0; i < objArray.length; i++) {
        if (!objArray[i]) continue;

        line = '';
        for (var index in objArray[i]) {
            if (line != '') line += ','
            var propVal = objArray[i][index];
            var propValText = typeof propVal == 'object' ? JSON.stringify(propVal).replace(/,/g,';') : propVal;
            line += propValText;
        }

        str += line + '\r\n';
    }

    return str;
  }
}
