import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { HabitRepoService } from 'src/app/services/habit-repo/habit-repo.service';
import { CommonModule } from '@angular/common';
import { Habit, HabitStreak } from 'src/app/shared/data-classes/data-objects';
import { EventQueueService } from 'src/app/services/event-queue/event-queue.service';
import { AppEventType } from 'src/app/shared/events';
import { HabitLogicService } from 'src/app/services/habit-logic/habit-logic.service';

@Component({
  selector: 'app-habit-list',
  templateUrl: './habit-list.component.html',
  styleUrls: ['./habit-list.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HabitListComponent implements OnInit {
  habits!: Habit[];
  habitStreaks: {[habitSid: string]: HabitStreak | undefined} = {};

  constructor(public habitRepoService: HabitRepoService, public habitLogicService: HabitLogicService, private eventQueueService: EventQueueService) { }

  ngOnInit(): void {
    this.getHabits();
    this.eventQueueService.on(AppEventType.HabitListUpdated).subscribe(() => this.getHabits());
  }

  public getHabits() {
    this.habitRepoService.getHabits().then((result) => {
      this.habits = result ?? [];
      this.getHabitStreaks();
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
    newStreak.IsActive = true;
    newStreak.StartDate = date;
    newStreak.EndDate = date;
    newStreak.StreakCount = 1;
    this.habitRepoService.saveHabitStreak(newStreak);
  }
}
