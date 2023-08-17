import { Component, OnInit } from '@angular/core';
import { IonLabel, IonicModule } from '@ionic/angular';
import { HabitRepoService } from 'src/app/services/habit-repo/habit-repo.service';
import { CommonModule } from '@angular/common';
import { Habit, HabitStreak } from 'src/app/shared/data-classes/data-objects';
import { EventQueueService } from 'src/app/services/event-queue/event-queue.service';
import { AppEventType } from 'src/app/shared/events';
import { HabitLogicService } from 'src/app/services/habit-logic/habit-logic.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-habit-list',
  templateUrl: './habit-list.component.html',
  styleUrls: ['./habit-list.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HabitListComponent implements OnInit {
  dateToView!: Date;
  habits!: Habit[];
  habitStreaks: {[habitSid: string]: HabitStreak | undefined} = {};

  constructor(public habitRepoService: HabitRepoService, public habitLogicService: HabitLogicService, private eventQueueService: EventQueueService) { }

  ngOnInit(): void {
    this.dateToView = this.habitLogicService.getTodayDate();
    this.setDateLabel();
    this.getHabits();
    this.eventQueueService.on(AppEventType.HabitListUpdated).subscribe(() => this.getHabits());
    this.eventQueueService.on(AppEventType.HabitStreakListUpdated).subscribe(() => this.getHabitStreaks());
  }

  public getHabits() {
    this.habitRepoService.getHabits().then((result) => {
      if (result) {
        this.habits = this.habitLogicService.habitsForDate(result, this.dateToView)
        this.getHabitStreaks();
      }
    });
  }

  public getHabitStreaks() {
    for (let habit of this.habits) {
      this.habitRepoService.getHabitStreaksByHabit(habit.HabitSID).then((result) => {
        var activeStreak = this.habitLogicService.getActiveStreakByHabit(result);
        if (activeStreak && this.habitLogicService.isDateToday(activeStreak.EndDate)) {
          this.habitStreaks[habit.HabitSID] = activeStreak;
        }
        else {
          this.habitStreaks[habit.HabitSID] = undefined;
        }
      });
    }
  }

  public setDateLabel() {
    document.getElementById("dateLabel")!.innerText = this.dateToView.toLocaleDateString('en-us', {month:"short", weekday:"short", day:"2-digit"});
  }

  public changeDate(nextDate: boolean) {
    var dateChange = nextDate ? 1 : -1;
    this.dateToView.setDate(this.dateToView.getDate() + dateChange);
    this.setDateLabel();
    this.getHabits();
  }

  public habitChecked(event: any, habit: Habit) {
    this.habitRepoService.getHabitStreaksByHabit(habit.HabitSID).then((result) => {
      var markedStreak = this.habitLogicService.markStreakForToday(result, event.detail.checked);

      if (markedStreak && markedStreak.StreakCount > 0) {
        this.habitRepoService.saveHabitStreak(markedStreak);
      }
      else if (markedStreak) {
        this.habitRepoService.deleteHabitStreak(markedStreak);
      }
      else {
        this.saveNewHabitStreak(habit, this.habitLogicService.getTodayDate());
      }
    });
  }

  public saveNewHabitStreak(habit: Habit, date: Date) {
    var newStreak = this.habitRepoService.getNewHabitStreak(habit);
    newStreak.StartDate = date;
    newStreak.EndDate = date;
    newStreak.StreakCount = 1;
    this.habitRepoService.saveHabitStreak(newStreak);
  }
}
