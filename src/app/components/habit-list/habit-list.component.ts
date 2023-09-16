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
    this.setDateUI();
    this.getHabits();
    this.eventQueueService.on(AppEventType.HabitListUpdated).subscribe(() => this.getHabits());
    this.eventQueueService.on(AppEventType.HabitStreakListUpdated).subscribe(() => this.getHabitStreaks());
  }

  public getHabits() {
    this.habitRepoService.getHabits().then((result) => {
      if (result) {
        result = result.filter((habit) => !habit.IsArchived);
        this.habits = this.habitLogicService.habitsForDate(result, this.dateToView)
        this.getHabitStreaks();
      }
    });
  }

  public getHabitStreaks() {
    for (let habit of this.habits) {
      this.habitRepoService.getHabitStreaksByHabit(habit.HabitSID).then((result) => {
        var activeStreak = this.habitLogicService.getActiveStreakByHabit(result, this.dateToView);
        if (activeStreak) {
          this.habitStreaks[habit.HabitSID] = activeStreak;
        }
        else {
          this.habitStreaks[habit.HabitSID] = undefined;
        }
      });
    }
  }

  public setDateUI() {
    document.getElementById("dateLabel")!.innerText = this.dateToView.toLocaleDateString('en-us', {month:"short", weekday:"short", day:"2-digit"});
    (document.getElementById("tomorrowButton") as any).disabled = this.habitLogicService.isDateToday(this.dateToView);
  }

  public changeDate(nextDate: boolean) {
    var dateChange = nextDate ? 1 : -1;
    this.dateToView.setDate(this.dateToView.getDate() + dateChange);
    this.setDateUI();
    this.getHabits();
    this.getHabitStreaks();
  }

  public habitChecked(event: any, habit: Habit) {
    this.habitRepoService.getHabitStreaksByHabit(habit.HabitSID).then((result) => {
      if (!result) result = [];
      var markedStreaks = this.habitLogicService.markStreakForDate(result, this.dateToView, event.detail.checked, this.habitRepoService.getNewHabitStreak(habit, this.dateToView));

      this.habitRepoService.saveHabitStreaks(markedStreaks);
    });
  }

}
